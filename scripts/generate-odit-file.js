"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var fs = require("node:fs/promises");
var crypto = require("node:crypto");
var stripe_1 = require("stripe");
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
});
var EIK = requiredEnv('EIK');
var E_SHOP_N = requiredEnv('E_SHOP_N');
var DOMAIN_NAME = requiredEnv('DOMAIN_NAME');
var E_SHOP_TYPE = (_a = process.env.E_SHOP_TYPE) !== null && _a !== void 0 ? _a : '1';
var PAYMENT_CODE = (_b = process.env.PAYMENT_CODE) !== null && _b !== void 0 ? _b : '6';
var REFUND_PAYMENT_CODE = (_c = process.env.REFUND_PAYMENT_CODE) !== null && _c !== void 0 ? _c : '2';
var DEFAULT_PRODUCT_NAME = 'Product';
var SHIPPING_ITEM_NAME = 'Shipping';
function requiredEnv(name) {
    var value = process.env[name];
    if (!value) {
        throw new Error("Missing required env variable: ".concat(name));
    }
    return value;
}
function toDateOnly(timestamp) {
    return new Date(timestamp * 1000).toISOString().slice(0, 10);
}
function toAmount(amountInCents) {
    return amountInCents / 100;
}
function money(value) {
    return value.toFixed(2);
}
function stringToIntDocNumber(input) {
    // Create a hash of the input string and convert to a 10-digit integer
    var hash = crypto.createHash('sha256').update(input).digest('hex');
    var numericString = hash.replace(/[a-f]/g, function (char) {
        return String(char.charCodeAt(0) % 10);
    });
    return Math.abs(parseInt(numericString.slice(0, 10), 10)) || 1000000000;
}
function xmlEscape(value) {
    return String(value !== null && value !== void 0 ? value : '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
function getPaymentIntentId(paymentIntent) {
    if (!paymentIntent) {
        return '';
    }
    return typeof paymentIntent === 'string' ? paymentIntent : paymentIntent.id;
}
function makeAuditItem(params) {
    var name = params.name, quantity = params.quantity, grossTotalCents = params.grossTotalCents, taxCents = params.taxCents;
    var grossTotal = toAmount(grossTotalCents);
    var vat = toAmount(taxCents);
    var netTotal = grossTotal - vat;
    var netPrice = quantity > 0 ? netTotal / quantity : netTotal;
    return {
        name: name,
        quantity: quantity,
        netPrice: netPrice,
        vatRate: vat > 0 ? 20 : 0,
        vat: vat,
        grossTotal: grossTotal,
    };
}
function getMonthRange(year, month) {
    var start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    var end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return {
        startUnix: Math.floor(start.getTime() / 1000),
        endUnix: Math.floor(end.getTime() / 1000),
    };
}
function getPaidCheckoutSessions(year, month) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, startUnix, endUnix, sessions, _b, _c, _d, session, e_1_1;
        var _e, e_1, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _a = getMonthRange(year, month), startUnix = _a.startUnix, endUnix = _a.endUnix;
                    sessions = [];
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 6, 7, 12]);
                    _b = true, _c = __asyncValues(stripe.checkout.sessions.list({
                        limit: 100,
                        status: 'complete',
                        created: {
                            gte: startUnix,
                            lt: endUnix,
                        },
                        expand: ['data.payment_intent'],
                    }));
                    _h.label = 2;
                case 2: return [4 /*yield*/, _c.next()];
                case 3:
                    if (!(_d = _h.sent(), _e = _d.done, !_e)) return [3 /*break*/, 5];
                    _g = _d.value;
                    _b = false;
                    session = _g;
                    if (session.payment_status === 'paid') {
                        sessions.push(session);
                    }
                    _h.label = 4;
                case 4:
                    _b = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _h.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _h.trys.push([7, , 10, 11]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _f.call(_c)];
                case 8:
                    _h.sent();
                    _h.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, sessions];
            }
        });
    });
}
function getSessionLineItems(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var items, _a, _b, _c, item, e_2_1;
        var _d, e_2, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    items = [];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 6, 7, 12]);
                    _a = true, _b = __asyncValues(stripe.checkout.sessions.listLineItems(sessionId, {
                        limit: 100,
                    }));
                    _g.label = 2;
                case 2: return [4 /*yield*/, _b.next()];
                case 3:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                    _f = _c.value;
                    _a = false;
                    item = _f;
                    items.push(item);
                    _g.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _g.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _g.trys.push([7, , 10, 11]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _e.call(_b)];
                case 8:
                    _g.sent();
                    _g.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, items];
            }
        });
    });
}
function buildOrders(year, month) {
    return __awaiter(this, void 0, void 0, function () {
        var sessions, orders, _i, sessions_1, session, lineItems, orderNumber, paymentIntentId, documentNumber, processorId, items, shippingTotal, totalGross, totalNet, vat, totalDiscount;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0: return [4 /*yield*/, getPaidCheckoutSessions(year, month)];
                case 1:
                    sessions = _k.sent();
                    orders = [];
                    _i = 0, sessions_1 = sessions;
                    _k.label = 2;
                case 2:
                    if (!(_i < sessions_1.length)) return [3 /*break*/, 5];
                    session = sessions_1[_i];
                    return [4 /*yield*/, getSessionLineItems(session.id)];
                case 3:
                    lineItems = _k.sent();
                    orderNumber = ((_a = session.metadata) === null || _a === void 0 ? void 0 : _a.orderId) || session.client_reference_id || session.id;
                    paymentIntentId = getPaymentIntentId(session.payment_intent);
                    documentNumber = stringToIntDocNumber(((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.invoiceNumber) || paymentIntentId || session.id);
                    processorId = paymentIntentId;
                    items = lineItems.map(function (item) {
                        var _a, _b, _c;
                        return makeAuditItem({
                            name: item.description || DEFAULT_PRODUCT_NAME,
                            quantity: (_a = item.quantity) !== null && _a !== void 0 ? _a : 1,
                            grossTotalCents: (_b = item.amount_total) !== null && _b !== void 0 ? _b : 0,
                            taxCents: (_c = item.amount_tax) !== null && _c !== void 0 ? _c : 0,
                        });
                    });
                    shippingTotal = (_d = (_c = session.shipping_cost) === null || _c === void 0 ? void 0 : _c.amount_total) !== null && _d !== void 0 ? _d : 0;
                    if (shippingTotal > 0) {
                        items.push(makeAuditItem({
                            name: SHIPPING_ITEM_NAME,
                            quantity: 1,
                            grossTotalCents: shippingTotal,
                            taxCents: (_f = (_e = session.shipping_cost) === null || _e === void 0 ? void 0 : _e.amount_tax) !== null && _f !== void 0 ? _f : 0,
                        }));
                    }
                    totalGross = toAmount((_g = session.amount_total) !== null && _g !== void 0 ? _g : 0);
                    totalNet = items.reduce(function (sum, item) { return sum + item.netPrice * item.quantity; }, 0);
                    vat = items.reduce(function (sum, item) { return sum + item.vat; }, 0);
                    totalDiscount = toAmount((_j = (_h = session.total_details) === null || _h === void 0 ? void 0 : _h.amount_discount) !== null && _j !== void 0 ? _j : 0);
                    orders.push({
                        orderNumber: orderNumber,
                        orderDate: toDateOnly(session.created),
                        documentNumber: documentNumber,
                        documentDate: toDateOnly(session.created),
                        items: items,
                        totalNet: totalNet,
                        discount: totalDiscount,
                        vat: vat,
                        totalGross: totalGross,
                        paymentIntentId: paymentIntentId,
                        processorId: processorId,
                    });
                    _k.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, orders];
            }
        });
    });
}
function buildRefunds(year, month) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, startUnix, endUnix, refunds, _b, _c, _d, refund, paymentIntentId, orderNumber, sessions, session, e_3_1;
        var _e, e_3, _f, _g;
        var _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _a = getMonthRange(year, month), startUnix = _a.startUnix, endUnix = _a.endUnix;
                    refunds = [];
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 8, 9, 14]);
                    _b = true, _c = __asyncValues(stripe.refunds.list({
                        limit: 100,
                        created: {
                            gte: startUnix,
                            lt: endUnix,
                        },
                    }));
                    _k.label = 2;
                case 2: return [4 /*yield*/, _c.next()];
                case 3:
                    if (!(_d = _k.sent(), _e = _d.done, !_e)) return [3 /*break*/, 7];
                    _g = _d.value;
                    _b = false;
                    refund = _g;
                    if (refund.status === 'canceled' || refund.status === 'failed') {
                        return [3 /*break*/, 6];
                    }
                    paymentIntentId = typeof refund.payment_intent === 'string'
                        ? refund.payment_intent
                        : (_h = refund.payment_intent) === null || _h === void 0 ? void 0 : _h.id;
                    orderNumber = paymentIntentId || refund.id;
                    if (!paymentIntentId) return [3 /*break*/, 5];
                    return [4 /*yield*/, stripe.checkout.sessions.list({
                            payment_intent: paymentIntentId,
                            limit: 1,
                        })];
                case 4:
                    sessions = _k.sent();
                    session = sessions.data[0];
                    orderNumber =
                        ((_j = session === null || session === void 0 ? void 0 : session.metadata) === null || _j === void 0 ? void 0 : _j.orderId) ||
                            (session === null || session === void 0 ? void 0 : session.client_reference_id) ||
                            (session === null || session === void 0 ? void 0 : session.id) ||
                            paymentIntentId;
                    _k.label = 5;
                case 5:
                    refunds.push({
                        orderNumber: orderNumber,
                        amount: toAmount(refund.amount),
                        date: toDateOnly(refund.created),
                    });
                    _k.label = 6;
                case 6:
                    _b = true;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_3_1 = _k.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _k.trys.push([9, , 12, 13]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _f.call(_c)];
                case 10:
                    _k.sent();
                    _k.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14: return [2 /*return*/, refunds];
            }
        });
    });
}
function generateXml(params) {
    var year = params.year, month = params.month, orders = params.orders, refunds = params.refunds;
    var monthString = String(month).padStart(2, '0');
    var creationDate = new Date().toISOString().slice(0, 10);
    var ordersXml = orders
        .map(function (order) {
        var itemsXml = order.items
            .map(function (item) { return "\n        <artenum>\n          <art_name>".concat(xmlEscape(item.name), "</art_name>\n          <art_quant>").concat(item.quantity, "</art_quant>\n          <art_price>").concat(money(item.netPrice), "</art_price>\n          <art_vat_rate>").concat(item.vatRate, "</art_vat_rate>\n          <art_vat>").concat(money(item.vat), "</art_vat>\n          <art_sum>").concat(money(item.grossTotal), "</art_sum>\n        </artenum>"); })
            .join('');
        return "\n      <orderenum>\n        <ord_n>".concat(xmlEscape(order.orderNumber), "</ord_n>\n        <ord_d>").concat(order.orderDate, "</ord_d>\n        <doc_n>").concat(order.documentNumber, "</doc_n>\n        <doc_date>").concat(order.documentDate, "</doc_date>\n        <art>").concat(itemsXml, "\n        </art>\n        <ord_total1>").concat(money(order.totalNet), "</ord_total1>\n        <ord_disc>").concat(money(order.discount), "</ord_disc>\n        <ord_vat>").concat(money(order.vat), "</ord_vat>\n        <ord_total2>").concat(money(order.totalGross), "</ord_total2>\n        <paym>").concat(PAYMENT_CODE, "</paym>\n        <pos_n/>\n        <trans_n>").concat(xmlEscape(order.paymentIntentId), "</trans_n>\n        <proc_id>").concat(xmlEscape(order.processorId), "</proc_id>\n      </orderenum>");
    })
        .join('');
    var refundsXml = refunds
        .map(function (refund) { return "\n      <rorderenum>\n        <r_ord_n>".concat(xmlEscape(refund.orderNumber), "</r_ord_n>\n        <r_amount>").concat(money(refund.amount), "</r_amount>\n        <r_date>").concat(refund.date, "</r_date>\n        <r_paym>").concat(REFUND_PAYMENT_CODE, "</r_paym>\n      </rorderenum>"); })
        .join('');
    var refundTotal = refunds.reduce(function (sum, refund) { return sum + refund.amount; }, 0);
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<audit>\n  <eik>".concat(xmlEscape(EIK), "</eik>\n  <e_shop_n>").concat(xmlEscape(E_SHOP_N), "</e_shop_n>\n  <domain_name>").concat(xmlEscape(DOMAIN_NAME), "</domain_name>\n  <e_shop_type>").concat(xmlEscape(E_SHOP_TYPE), "</e_shop_type>\n  <creation_date>").concat(creationDate, "</creation_date>\n  <mon>").concat(monthString, "</mon>\n  <god>").concat(year, "</god>\n  <order>").concat(ordersXml, "\n  </order>\n  <r_ord>").concat(refunds.length, "</r_ord>\n  <rorder>").concat(refundsXml, "\n  </rorder>\n  <r_total>").concat(money(refundTotal), "</r_total>\n</audit>\n");
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var year, month, orders, refunds, xml, fileName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    year = Number(process.argv[2]);
                    month = Number(process.argv[3]);
                    if (!year || !month || month < 1 || month > 12) {
                        throw new Error('Usage: npx tsx scripts/export-nap-audit.ts 2026 5');
                    }
                    return [4 /*yield*/, buildOrders(year, month)];
                case 1:
                    orders = _a.sent();
                    return [4 /*yield*/, buildRefunds(year, month)];
                case 2:
                    refunds = _a.sent();
                    xml = generateXml({
                        year: year,
                        month: month,
                        orders: orders,
                        refunds: refunds,
                    });
                    fileName = "audit-".concat(year, "-").concat(String(month).padStart(2, '0'), ".xml");
                    return [4 /*yield*/, fs.writeFile(fileName, xml, 'utf8')];
                case 3:
                    _a.sent();
                    console.log("Generated ".concat(fileName));
                    console.log("Orders: ".concat(orders.length));
                    console.log("Refunds: ".concat(refunds.length));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error(error);
    process.exit(1);
});
