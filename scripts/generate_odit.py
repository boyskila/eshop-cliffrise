#!/usr/bin/env python3
"""
Generate Bulgarian NRA e-shop audit (ODIT) XML file from Stripe transactions.

Usage:
    python -m pip install -r requirements.txt
    python -m pip install -U -r requirements.txt
    python3 generate_odit.py 2026-03
    python3 generate_odit.py 03                    # defaults to current year
    python3 generate_odit.py                       # defaults to previous month
"""

import os
import sys
import calendar
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import stripe
from dotenv import load_dotenv

# ─── Configuration (from February XML) ─────────────────────
EIK = '200511527'
E_SHOP_N = 'F0006586'
DOMAIN = 'cliffrise.com'
E_SHOP_TYPE = '1'
PROC_ID = 'IE3206488LH'
VAT_RATE = 0
BG_TZ = ZoneInfo('Europe/Sofia')


# ─── Helpers ────────────────────────────────────────────────
def init():
    load_dotenv()

    key = os.environ.get('STRIPE_SECRET_KEY')
    if not key:
        sys.exit('Set STRIPE_SECRET_KEY env var.')
    stripe.api_key = key


def parse_month():
    """Parse YYYY-MM or MM from CLI args, default to previous month."""
    now = datetime.now()
    if len(sys.argv) < 2:
        if now.month == 1:
            return now.year - 1, 12
        return now.year, now.month - 1

    arg = sys.argv[1].strip()
    if '-' in arg:
        parts = arg.split('-')
        return int(parts[0]), int(parts[1])

    m = int(arg)
    if 1 <= m <= 12:
        return now.year, m

    sys.exit(f'Invalid month: {arg}. Use YYYY-MM or MM.')


def sg(obj, key, default=None):
    """Safe getattr for Stripe objects (SDK v15+)."""
    try:
        v = getattr(obj, key)
        return v if v is not None else default
    except (AttributeError, KeyError):
        return default


def collect(list_obj):
    return list(list_obj.auto_paging_iter())


def local_date(unix_ts):
    return (datetime.fromtimestamp(unix_ts, tz=timezone.utc)
            .astimezone(BG_TZ).strftime('%Y-%m-%d'))


def r2(n):
    """Round to 2 decimal places using ROUND_HALF_UP (standard math rounding).
    Bulgarian VAT rounding requires this, not Python's default banker's rounding."""
    return float(Decimal(str(n)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def fmt(n):
    return f'{n:.2f}'


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))


def make_article(name, qty, gross_per_unit_cents, has_tax):
    """Build an article dict from gross per-unit amount in cents.

    Per the XSD schema:
      art_price = unit price, excl VAT          (Единична цена без ДДС)
      art_vat   = TOTAL VAT for all units       (ДДС – обща сума)
      art_sum   = TOTAL amount with VAT          (Обща сума с ДДС)

    Computed as:
      per_unit_vat = round(art_price * rate / 100, 2)
      art_vat      = per_unit_vat * qty
      art_sum      = (art_price + per_unit_vat) * qty

    This ensures art_sum = art_price * qty + art_vat exactly (no rounding gap).
    """
    gross = gross_per_unit_cents / 100

    if has_tax:
        net = r2(gross / (1 + VAT_RATE / 100))
        per_unit_vat = r2(net * VAT_RATE / 100)
    else:
        net = gross
        per_unit_vat = 0.0

    return {
        'name': name,
        'qty': qty,
        'price': net,                          # per-unit net (excl VAT)
        'vat_rate': VAT_RATE if has_tax else 0,
        'vat': r2(per_unit_vat * qty),         # TOTAL VAT for all units
        'sum': r2((net + per_unit_vat) * qty), # TOTAL amount with VAT
    }


# ─── Product cache ──────────────────────────────────────────
_product_cache = {}


def get_product(ref):
    if not isinstance(ref, str):
        _product_cache[ref.id] = ref
        return ref
    if ref not in _product_cache:
        _product_cache[ref] = stripe.Product.retrieve(ref)
    return _product_cache[ref]


# ─── Invoice lookup via receipt_number ──────────────────────
def build_invoice_map(start_ts, end_ts):
    buf = 14 * 86400
    all_invoices = collect(stripe.Invoice.list(
        created={'gte': start_ts - buf, 'lt': end_ts + buf},
        status='paid',
        limit=100))

    receipt_map = {}
    for inv in all_invoices:
        d = inv.to_dict()
        rn = d.get('receipt_number')
        if rn:
            receipt_map[rn] = inv.id

    return receipt_map


def find_invoice_id(charge, receipt_to_inv):
    rn = charge.to_dict().get('receipt_number')
    if rn:
        inv_id = receipt_to_inv.get(rn)
        if inv_id:
            return inv_id

    inv = sg(charge, 'invoice')
    if inv:
        return inv if isinstance(inv, str) else sg(inv, 'id')

    return None


# ─── Order data extraction ──────────────────────────────────
def from_invoice(inv_id):
    """Extract per-unit articles from a Stripe invoice.

    For lines with Stripe Tax: uses taxes[].taxable_amount as the
    post-discount net, then derives per-unit price and computes VAT.

    For lines without tax: uses line.amount as gross per-unit (VAT
    will be extracted later by apply_inclusive_vat).
    """
    inv = stripe.Invoice.retrieve(inv_id)
    inv_d = inv.to_dict()
    lines = collect(inv.lines)

    articles = []
    for ln in lines:
        ld = ln.to_dict()
        name = ld.get('description', '') or 'Item'
        qty = ld.get('quantity', 1) or 1

        taxes = ld.get('taxes') or []
        tax_cents = sum(t.get('amount', 0) for t in taxes)

        if tax_cents > 0 and taxes:
            # Post-discount net total for this line
            net_total = taxes[0].get('taxable_amount', ld.get('amount', 0) - tax_cents)
            # Gross per unit = (net + tax) / qty
            gross_per_unit = round((net_total + tax_cents) / qty)
            articles.append(make_article(name, qty, gross_per_unit, has_tax=True))
        else:
            # Fallback: older tax_amounts field
            tax_amounts = ld.get('tax_amounts') or []
            old_tax = sum(ta.get('amount', 0) for ta in tax_amounts)

            if old_tax > 0:
                ln_amount = ld.get('amount', 0)
                gross_per_unit = round(ln_amount / qty)
                articles.append(make_article(name, qty, gross_per_unit, has_tax=True))
            else:
                # No tax info — store gross, apply_inclusive_vat will handle
                ln_amount = ld.get('amount', 0)
                gross_per_unit = round(ln_amount / qty)
                articles.append(make_article(name, qty, gross_per_unit, has_tax=False))

    inv_total = (inv_d.get('total', 0) or 0) / 100
    return articles, inv_total


def from_checkout(charge):
    """Extract per-unit articles from a Checkout Session.

    Uses amount_total (post-discount) per unit as the gross price.
    Discounts are absorbed into the price (ord_disc=0).
    Shipping is added as a separate line item.
    """
    pi_id = sg(charge, 'payment_intent')
    if pi_id and not isinstance(pi_id, str):
        pi_id = sg(pi_id, 'id')
    if not pi_id:
        return None

    sessions = stripe.checkout.Session.list(payment_intent=pi_id, limit=1)
    if not sessions.data:
        return None

    session = sessions.data[0]
    try:
        items = collect(stripe.checkout.Session.list_line_items(
            session.id, limit=100, expand=['data.price.product']))
    except Exception:
        items = collect(stripe.checkout.Session.list_line_items(
            session.id, limit=100))

    sd = session.to_dict() if hasattr(session, 'to_dict') else {}
    td = sd.get('total_details') or {}
    sess_tax = td.get('amount_tax', 0) or 0

    articles = []
    for it in items:
        itd = it.to_dict() if hasattr(it, 'to_dict') else {}
        total_item = itd.get('amount_total', 0) or 0
        tax = itd.get('amount_tax', 0) or 0
        qty = itd.get('quantity', 1) or 1

        name = itd.get('description', '')
        if not name:
            price_d = itd.get('price') or {}
            prod_ref = price_d.get('product')
            if prod_ref:
                try:
                    name = sg(get_product(prod_ref), 'name', '')
                except Exception:
                    pass
        if not name:
            name = 'Item'

        # Gross per unit from final amount (post-discount)
        gross_per_unit = round(total_item / qty)
        has_tax = tax > 0 or sess_tax > 0
        articles.append(make_article(name, qty, gross_per_unit, has_tax=has_tax))

    # Shipping as separate line item
    shipping_cost = sd.get('shipping_cost') or {}
    ship_total = shipping_cost.get('amount_total', 0) or 0
    if ship_total > 0:
        ship_tax = shipping_cost.get('amount_tax', 0) or 0
        has_ship_tax = ship_tax > 0 or sess_tax > 0
        articles.append(make_article('Shipping', 1, ship_total, has_tax=has_ship_tax))

    return articles, charge.amount / 100


def from_charge(charge):
    """Fallback: single line item from the charge itself."""
    cd = charge.to_dict() if hasattr(charge, 'to_dict') else {}
    name = cd.get('description', '') or f'Payment {charge.id}'

    # No tax info — store gross, apply_inclusive_vat will handle
    return [make_article(name, 1, charge.amount, has_tax=False)], charge.amount / 100


def normalize_stripe_id(value):
    if not value:
        return None
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return value.get('id')
    return getattr(value, 'id', None)


def refund_to_dict(refund):
    return refund.to_dict() if hasattr(refund, 'to_dict') else refund


def collect_month_refunds(start_ts, end_ts, charges):
    """Collect refunds by date, then supplement from each month's charge.

    Stripe's global refund list is the primary source, but charge-level refunds
    are a useful backstop for API-version/account differences.
    """
    refunds_by_id = {}

    def add_refund(refund):
        rd = refund_to_dict(refund)
        refund_id = rd.get('id') or sg(refund, 'id')
        created = rd.get('created') or sg(refund, 'created')

        if not refund_id or not created:
            return
        if created < start_ts or created >= end_ts:
            return

        refunds_by_id[refund_id] = refund

    for refund in collect(
        stripe.Refund.list(created={'gte': start_ts, 'lt': end_ts}, limit=100)
    ):
        add_refund(refund)

    for charge in charges:
        try:
            charge_refunds = collect(stripe.Refund.list(charge=charge.id, limit=100))
        except Exception as e:
            print(f'  !! could not fetch refunds for {charge.id}: {e}')
            continue

        for refund in charge_refunds:
            add_refund(refund)

    return sorted(
        refunds_by_id.values(),
        key=lambda refund: refund_to_dict(refund).get('created') or sg(refund, 'created') or 0,
    )


def apply_inclusive_vat(articles):
    """For articles without tax, extract 20% inclusive VAT from the gross price.

    All cafeato.com prices are tax-inclusive. When Stripe Tax isn't applied,
    amounts still contain 20% VAT — it just isn't separated.
    """
    for a in articles:
        if a['vat'] == 0 and a['price'] > 0:
            gross = a['price']  # currently gross per-unit (no tax was extracted)
            net = r2(gross / (1 + VAT_RATE / 100))
            per_unit_vat = r2(net * VAT_RATE / 100)
            qty = a['qty']
            a['price'] = net
            a['vat'] = r2(per_unit_vat * qty)          # TOTAL VAT
            a['vat_rate'] = VAT_RATE
            a['sum'] = r2((net + per_unit_vat) * qty)  # TOTAL with VAT


# ─── XML builder ────────────────────────────────────────────
def build_xml(year, month, orders, refund_items):
    today = datetime.now().strftime('%Y-%m-%d')
    p = [
        '<?xml version="1.0" encoding="windows-1251"?>',
        '<audit>',
        f'    <eik>{EIK}</eik>',
        f'    <e_shop_n>{E_SHOP_N}</e_shop_n>',
        f'    <domain_name>{DOMAIN}</domain_name>',
        f'    <creation_date>{today}</creation_date>',
        f'    <mon>{month:02d}</mon>',
        f'    <god>{year}</god>',
        f'    <e_shop_type>{E_SHOP_TYPE}</e_shop_type>',
        '    <order>',
    ]

    for o in orders:
        p.append('        <orderenum>')
        p.append(f'            <ord_n>{esc(o["id"])}</ord_n>')
        p.append(f'            <ord_d>{o["date"]}</ord_d>')
        p.append('            <art>')
        for a in o['articles']:
            p.append('                <artenum>')
            p.append(f'                    <art_name>{esc(a["name"])}</art_name>')
            p.append(f'                    <art_quant>{a["qty"]}</art_quant>')
            p.append(f'                    <art_price>{fmt(a["price"])}</art_price>')
            p.append(f'                    <art_vat_rate>{a["vat_rate"]}</art_vat_rate>')
            p.append(f'                    <art_vat>{fmt(a["vat"])}</art_vat>')
            p.append(f'                    <art_sum>{fmt(a["sum"])}</art_sum>')
            p.append('                </artenum>')
        p.append('            </art>')
        p.append(f'            <ord_total1>{fmt(o["subtotal"])}</ord_total1>')
        p.append(f'            <ord_disc>{fmt(o["discount"])}</ord_disc>')
        p.append(f'            <ord_vat>{fmt(o["vat"])}</ord_vat>')
        p.append(f'            <ord_total2>{fmt(o["total"])}</ord_total2>')
        p.append('            <paym>4</paym>')
        p.append(f'            <trans_n>{esc(o["pi"])}</trans_n>')
        p.append(f'            <proc_id>{PROC_ID}</proc_id>')
        p.append('        </orderenum>')

    p.append('    </order>')

    # ── Refunds section (per XSD: r_ord → rorder → r_total) ──
    r_count = len(refund_items)
    r_total = r2(sum(r['amount'] for r in refund_items))
    p.append(f'    <r_ord>{r_count}</r_ord>')

    p.append('    <rorder>')
    if refund_items:
        for r in refund_items:
            p.append('        <rorderenum>')
            p.append(f'            <r_ord_n>{esc(r["ord_n"])}</r_ord_n>')
            p.append(f'            <r_amount>{fmt(r["amount"])}</r_amount>')
            p.append(f'            <r_date>{r["date"]}</r_date>')
            p.append(f'            <r_paym>{r["paym"]}</r_paym>')
            p.append('        </rorderenum>')
    p.append('    </rorder>')

    p.append(f'    <r_total>{fmt(r_total)}</r_total>')
    p.append('</audit>')
    return '\n'.join(p)


# ─── Main ───────────────────────────────────────────────────
def main():
    init()
    year, month = parse_month()
    now_bg = datetime.now(BG_TZ)

    if (year, month) >= (now_bg.year, now_bg.month):
        print(
            f'Warning: exporting {year}-{month:02d}, which is not a completed '
            f'month yet. For the previous completed month, run without an argument.'
        )

    start_bg = datetime(year, month, 1, tzinfo=BG_TZ)
    next_m = month + 1 if month < 12 else 1
    next_y = year if month < 12 else year + 1
    end_bg = datetime(next_y, next_m, 1, tzinfo=BG_TZ)

    start_ts = int(start_bg.timestamp())
    end_ts = int(end_bg.timestamp())

    # ── Pre-fetch invoices → receipt_number map ──
    print('Building invoice lookup map ...')
    receipt_to_inv = build_invoice_map(start_ts, end_ts)
    print(f'  {len(receipt_to_inv)} invoices mapped via receipt_number')

    # ── Fetch charges ──
    print(f'Fetching charges for {year}-{month:02d} ...')
    all_charges = collect(
        stripe.Charge.list(created={'gte': start_ts, 'lt': end_ts}, limit=100))
    charges = sorted(
        [c for c in all_charges if c.status == 'succeeded' and c.amount > 0],
        key=lambda c: c.created)
    print(f'  {len(charges)} successful charges')
    if not charges:
        print(
            '  No charges found. Check that you requested the intended month '
            'and that STRIPE_SECRET_KEY points to the right Stripe mode '
            '(test vs live).'
        )

    # ── Process each charge ──
    orders = []
    for i, ch in enumerate(charges, 1):
        print(f'  [{i}/{len(charges)}] {ch.id}')

        inv_id = find_invoice_id(ch, receipt_to_inv)
        try:
            if inv_id:
                articles, charge_total = from_invoice(inv_id)
            else:
                result = from_checkout(ch)
                if result:
                    articles, charge_total = result
                else:
                    articles, charge_total = from_charge(ch)
        except Exception as e:
            print(f'    !! fallback ({e})')
            articles, charge_total = from_charge(ch)

        # Extract inclusive VAT for articles that don't have it
        apply_inclusive_vat(articles)

        # Compute order totals from articles (ensures internal consistency)
        # art_price is per-unit; art_vat and art_sum are already TOTALS per line
        ord_total1 = r2(sum(a['price'] * a['qty'] for a in articles))
        ord_vat = r2(sum(a['vat'] for a in articles))
        ord_total2 = charge_total

        # Discount = balancing figure so that total1 - disc + vat = total2
        ord_disc = r2(ord_total1 + ord_vat - ord_total2)
        if ord_disc < 0:
            ord_disc = 0.0

        pi = sg(ch, 'payment_intent')
        if pi and not isinstance(pi, str):
            pi = sg(pi, 'id')

        src = f'invoice({inv_id})' if inv_id else 'checkout/charge'
        has_vat = any(a['vat'] > 0 for a in articles)
        check = r2(ord_total1 - ord_disc + ord_vat)
        print(f'    -> {src} | {len(articles)} items | '
              f't1={fmt(ord_total1)} disc={fmt(ord_disc)} '
              f'vat={fmt(ord_vat)} t2={fmt(ord_total2)} '
              f'chk={fmt(check)}'
              f'{" [HAS VAT]" if has_vat else ""}')

        orders.append({
            'id': ch.id,
            'date': local_date(ch.created),
            'pi': pi or ch.id,
            'articles': articles,
            'subtotal': ord_total1,
            'discount': ord_disc,
            'vat': ord_vat,
            'total': ord_total2,
        })

    # ── Fetch refunds ──
    print('Fetching refunds ...')
    refunds = collect_month_refunds(start_ts, end_ts, charges)
    print(f'  {len(refunds)} refunds')

    # ── Build refund items (per XSD: rorderenum) ──
    refund_items = []
    skipped_refunds = []
    for r in refunds:
        rd = refund_to_dict(r)
        if rd.get('status') in {'canceled', 'failed'}:
            skipped_refunds.append(rd)
            continue

        charge_ref = normalize_stripe_id(rd.get('charge'))

        refund_items.append({
            'ord_n': charge_ref or rd.get('id', ''),
            'amount': (rd.get('amount', 0) or 0) / 100,
            'date': local_date(rd.get('created', 0)),
            'paym': 2,  # 2 = card refund
        })

    r_total = r2(sum(r['amount'] for r in refund_items))
    if skipped_refunds:
        print(f'  {len(skipped_refunds)} canceled/failed refunds skipped')
        for r in skipped_refunds:
            print(
                f'    skipped refund: {r.get("id", "")} '
                f'{fmt((r.get("amount", 0) or 0) / 100)} '
                f'status={r.get("status", "")}'
            )

    # ── Generate XML ──
    xml = build_xml(year, month, orders, refund_items)

    last_day = calendar.monthrange(year, month)[1]
    out = f'audit-file-{year}-{month:02d}.xml'

    with open(out, 'wb') as f:
        f.write(xml.encode('cp1251', errors='replace'))

    print(f'\nDone: {out}')
    print(f'  {len(orders)} orders, {len(refund_items)} refunds ({fmt(r_total)} refund total)')
    for r in refund_items:
        print(f'    refund: {r["ord_n"]} {fmt(r["amount"])} on {r["date"]}')


if __name__ == '__main__':
    main()
