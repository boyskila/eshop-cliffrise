# Astro Best-Practices Audit

Audit date: June 20, 2026

Project versions actually resolved by npm:

- Astro 5.18.1
- `@astrojs/node` 9.5.5
- `@astrojs/sitemap` 3.7.3
- `@astrojs/solid-js` 5.1.3

This review compares the application with the official Astro documentation and
focuses on behavior, security, rendering strategy, routing, client-side
navigation, assets, and maintainability. Recommendations that only exist in
Astro 6 are not treated as requirements for this Astro 5 application.

## Executive summary

The application uses many Astro features correctly: strict TypeScript,
server-side rendering with the official Node adapter, typed actions with Zod,
sessions for cart state, selective Solid hydration, `astro:assets` for the
main product media, and the official sitemap integration.

However, the review found several important gaps:

1. `Cache-Control` is set inside layouts, where Astro documents that response
   headers cannot reliably be modified.
2. a missing `SITE_URL` silently produces localhost canonical and sitemap URLs;
3. public actions and test endpoints expose sensitive or state-changing
   behavior without sufficient authorization;
4. Redis sessions use a deprecated configuration shape and incomplete session
   typing;
5. the language switcher manipulates history without performing navigation;
6. the sitemap depends on a live Stripe request during Astro configuration;
7. an inline analytics script is not safe against repeated execution under
   `ClientRouter`;
8. the whole site is rendered on demand even where Astro recommends
   prerendering static pages;
9. several forms, images, redirects, and environment variables do not use the
   stronger patterns documented by Astro.

## Priority overview

| ID  | Priority | Area            | Summary                                                                    |
| --- | -------- | --------------- | -------------------------------------------------------------------------- |
| A01 | Critical | Deployment URLs | Production builds can silently emit localhost URLs                         |
| A02 | High     | Security        | Checkout-status action is public and not bound to the visitor's order      |
| A03 | High     | Security        | Test API routes are available in every build                               |
| A04 | High     | HTTP caching    | Layout-level response headers are not supported                            |
| A05 | High     | Navigation      | Language switching changes history without navigating                      |
| A06 | High     | Sessions        | Deprecated Redis session configuration and build-time environment capture  |
| A07 | High     | Sitemap         | Sitemap generation performs a live Stripe request during config evaluation |
| A08 | Medium   | Actions         | Cart and checkout action validation/error contracts are too weak           |
| A09 | Medium   | Analytics       | Inline global script can bind duplicate listeners under `ClientRouter`     |
| A10 | Medium   | Environment     | No `astro:env` schema or startup validation                                |
| A11 | Medium   | Rendering       | Static content is forced through server rendering                          |
| A12 | Medium   | Routing         | Unknown product slugs return redirects instead of not-found responses      |
| A13 | Medium   | Forms           | Contact form has no zero-JavaScript action fallback                        |
| A14 | Medium   | i18n            | Locale URLs are assembled manually instead of with Astro i18n APIs         |
| A15 | Low      | Hydration       | Cart hydration priority does not match its interaction priority            |
| A16 | Low      | Images          | Public/native images miss Astro optimization and dimensions                |
| A17 | Low      | Project data    | Imported translation data is stored in `public/`                           |
| A18 | Low      | Assets/tooling  | A missing font fallback causes a build warning                             |

---

## A01 — Production URLs can silently fall back to localhost

Priority: Critical

Locations:

- `astro.config.js:15`
- `astro.config.js:84`
- `src/pages/[lang]/checkout/index.astro:75`
- `src/pages/[lang]/checkout/index.astro:82`
- `src/pages/[lang]/checkout/index.astro:103`

Current behavior:

```js
const siteUrl = new URL(getEnv('SITE_URL') || 'http://localhost:4321')
```

The same fallback is used when creating Stripe product image and return URLs.
During this audit, `npm run build` succeeded without `SITE_URL` and generated:

```xml
<loc>http://localhost:4321/bg/</loc>
```

The generated `sitemap-index.xml` also points to
`http://localhost:4321/sitemap-0.xml`.

Why this is out of sync:

The sitemap documentation says `site` must contain the deployed URL. `Astro.site`
also feeds canonical URLs and structured data throughout this application.
Silently accepting localhost makes a production build technically successful
but semantically invalid.

Impact:

- search engines can receive localhost sitemap and canonical URLs;
- Stripe can receive unusable product image and return URLs;
- Open Graph and JSON-LD URLs can be wrong;
- deployment mistakes are discovered after release rather than at startup.

Recommended change:

1. keep localhost as an explicit development-only default;
2. fail configuration or startup when `SITE_URL` is missing in production;
3. define and validate `SITE_URL` through `astro:env`;
4. use `Astro.site` or one validated URL helper everywhere instead of repeating
   fallbacks.

Official documentation:

- [Sitemap usage](https://docs.astro.build/en/guides/integrations-guide/sitemap/#usage)
- [Type-safe environment variables](https://docs.astro.build/en/guides/environment-variables/#type-safe-environment-variables)

---

## A02 — Checkout status is exposed by an unauthenticated public action

Priority: High

Location: `src/actions/checkout.ts:27-43`

The public `getCheckoutStatus` action accepts any Stripe Checkout Session ID,
retrieves it with the secret Stripe API key, and returns the customer's email:

```ts
const session = await stripe.checkout.sessions.retrieve(sessionId)

return {
  status: session.status,
  customerEmail: session.customer_details?.email ?? null,
}
```

It also clears the caller's cart when the supplied Stripe session is complete.
There is no check that the Stripe session was created for the current Astro
session.

Related page locations:

- `src/pages/[lang]/checkout/index.astro:71-73`
- `src/pages/[lang]/checkout/success.astro:14-22`

These pages similarly retrieve any supplied `session_id` without comparing it
to an order ID stored in the current Astro session.

Why this is out of sync:

Astro documents that actions are public endpoints and must perform the same
authorization checks as API endpoints. Origin checking is useful CSRF
protection, but it does not prove that a requested resource belongs to the
current visitor.

Impact:

- a leaked or discovered Stripe session ID can expose order status and email;
- one visitor can use another order ID to trigger cart state changes;
- the action's public endpoint is easy to call independently of the UI.

Recommended change:

1. store the newly created Stripe Checkout Session ID in `Astro.session`;
2. compare every supplied ID with the ID stored for that visitor;
3. preferably remove `customerEmail` from the action response unless required;
4. throw `ActionError({ code: 'UNAUTHORIZED' | 'FORBIDDEN' })` on mismatch;
5. clear the stored order ID once the order flow is complete.

Official documentation:

- [Security when using actions](https://docs.astro.build/en/guides/actions/#security-when-using-actions)
- [`ActionError`](https://docs.astro.build/en/reference/modules/astro-actions/#actionerror)

---

## A03 — Test API routes are exposed in all deployment modes

Priority: High

Locations:

- `src/pages/api/test/sent-emails.ts:1-11`
- `src/pages/api/test/delete-emails.ts:1-10`

Because these files are under `src/pages`, Astro registers them as public server
endpoints in the production build.

`GET /api/test/sent-emails/` returns the in-memory fake email collection.
`GET /api/test/delete-emails/` performs state changes:

```ts
clearSentEmails()
clearRateLimitStore()
```

There is no mode guard, secret, authorization check, or production exclusion.
The second route can clear the contact form's in-memory rate-limit state.

Why this is out of sync:

Astro server endpoints are public routes. Test helpers placed in `src/pages`
must therefore be protected like any other endpoint or excluded from production.

Impact:

- production-only state can be reset by an unauthenticated GET request;
- future changes to the fake email service could expose test data;
- a crawler or link prefetcher can trigger a state-changing GET.

Recommended change:

1. return `404` unless `import.meta.env.MODE === 'test'`;
2. preferably register these endpoints only through a test-only integration or
   move test control behind Playwright fixtures;
3. use `POST` or `DELETE` for mutation if an endpoint must remain;
4. require a test secret even in non-production shared environments.

Official documentation:

- [Server endpoints](https://docs.astro.build/en/guides/on-demand-rendering/#server-endpoints)
- [Endpoint response requirements](https://docs.astro.build/en/reference/errors/endpoint-did-not-return-aresponse/)

---

## A04 — Response headers are set inside layouts

Priority: High

Locations:

- `src/layouts/MainLayout.astro:109`
- `src/layouts/CheckoutLayout.astro:15`

Both layouts call:

```ts
Astro.response.headers.set('Cache-Control', 'no-store')
```

Why this is out of sync:

Astro explicitly warns that response headers can only be modified at the page
level. Layouts are components, and by the time a component runs, headers may
already have been sent.

The shipping page correctly sets the header at page level
(`src/pages/[lang]/checkout/shipping.astro:13`), but other checkout and main
layout pages rely on the unsupported layout call.

Impact:

- personalized cart/session HTML might not receive the intended `no-store`;
- checkout responses may be cached contrary to the code's apparent intent;
- behavior can differ by adapter, streaming timing, or proxy.

Recommended change:

Use one of these supported approaches:

- set the header in each on-demand page;
- or set it in middleware after `const response = await next()`, based on route;
- keep static public pages cacheable instead of applying `no-store` globally.

Official documentation:

- [On-demand rendering: response headers](https://docs.astro.build/en/guides/on-demand-rendering/#on-demand-rendering-features)

---

## A05 — Language switching updates the URL without loading translated content

Priority: High

Location: `src/components/header/LangSwitcher.astro:38-54`

When the current URL has a hash, the click handler prevents the anchor's normal
navigation and only calls:

```ts
history.pushState(null, '', nextHref)
```

This changes the address bar but does not fetch or render the other locale. The
page can therefore display Bulgarian content under an English URL, or the
reverse.

Why this is out of sync:

With `<ClientRouter />`, Astro documents `navigate()` as the API for
programmatic navigation. A normal anchor should also be allowed to proceed.
Raw `history.pushState()` only changes history state.

Recommended change:

- simplest: calculate the full locale URL, including the hash, in the anchor's
  `href` and remove the click interception;
- otherwise call `navigate(nextHref)` from `astro:transitions/client`;
- generate the locale URL with Astro's i18n helpers instead of string
  replacement.

Official documentation:

- [View-transition router control](https://docs.astro.build/en/guides/view-transitions/#router-control)
- [Accessing the current locale](https://docs.astro.build/en/reference/api-reference/#currentlocale)

---

## A06 — Redis sessions use deprecated configuration

Priority: High

Location: `astro.config.js:102-112`

Current configuration:

```js
session: {
  driver: 'redis',
  options: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    // ...
  },
}
```

Why this is out of sync:

Astro marks `session.options` as deprecated and recommends a driver created
through `sessionDrivers.redis(...)`. The documentation also notes that session
drivers are configured at build time by default, so environment values can be
inlined and become impossible to override at runtime.

This matters for the Node standalone adapter, where deployment environments
often provide `REDIS_URL` only when the built server starts.

Recommended change:

1. import `sessionDrivers` from `astro/config`;
2. use `driver: sessionDrivers.redis({ ... })`;
3. decide deliberately whether Redis configuration is build-time or runtime;
4. if runtime configuration is required, use a dedicated driver entrypoint as
   described in Astro's session guide;
5. fail production startup rather than defaulting to local Redis.

Official documentation:

- [Session configuration](https://docs.astro.build/en/reference/configuration-reference/#session-options)
- [Sessions and runtime configuration](https://docs.astro.build/en/guides/sessions/#configuring-sessions)

---

## A07 — Sitemap generation performs live Stripe work during config evaluation

Priority: High

Locations:

- `astro.config.js:32-62`
- `astro.config.js:64-67`
- `astro.config.js:115-122`

The config file makes a Stripe API request at top level and feeds the result to
`customPages`.

Why this is out of sync:

- Astro config evaluation now depends on network access and Stripe uptime;
- failures are swallowed, producing a successful but incomplete sitemap;
- `customPages` is documented for externally generated pages, while these are
  Astro product routes;
- the sitemap integration cannot automatically enumerate SSR dynamic routes,
  so the application needs an explicit, reliable strategy for them.

Impact:

- nondeterministic builds;
- silently missing product URLs;
- slower local commands and CI;
- secrets are required during configuration just to enumerate routes.

Recommended change:

Choose one deterministic strategy:

1. generate product route data from a versioned/local product manifest;
2. generate a separate dynamic product sitemap endpoint and include it through
   `customSitemaps`;
3. run a dedicated prebuild data-fetch step that fails clearly and writes a
   validated artifact consumed by Astro config.

Do not silently return an empty product list on production sitemap failure.

Official documentation:

- [Sitemap configuration](https://docs.astro.build/en/guides/integrations-guide/sitemap/#configuration)
- [SSR dynamic-route sitemap limitation](https://docs.astro.build/en/guides/integrations-guide/sitemap/#_top)

---

## A08 — Action validation and error contracts are too permissive

Priority: Medium

Locations:

- `src/actions/cart.ts:15-20`
- `src/actions/cart.ts:26-34`
- `src/actions/cart.ts:64`
- `src/actions/cart.ts:87-104`
- `src/actions/checkout.ts:7-15`
- `src/actions/checkout.ts:17-25`
- `src/actions/searchOffices.ts:55-57`

Examples:

- cart quantity accepts any JavaScript number, including decimals, very large
  values, `NaN`-like coercion paths, and negative values in `addToCart`;
- `lang` is an arbitrary string and then cast to `Locale`;
- an invalid product returns `{}` instead of a typed `NOT_FOUND` error;
- `getShippingRate` validates `officeId` but never uses it;
- `saveShipping` trusts an arbitrary office name/ID pair without verifying it;
- Speedy failures are converted into an indistinguishable empty result.

Why this is out of sync:

Astro actions are designed around runtime input validation and standardized
`ActionError` responses. Returning success-shaped empty values hides backend
failures and forces callers into ambiguous `undefined` checks.

Recommended change:

- use `z.enum(['bg', 'en'])`;
- use `z.number().int().min(1).max(reasonableLimit)` for quantities;
- validate IDs as positive integers;
- throw `ActionError({ code: 'NOT_FOUND' })` for unknown products;
- throw `BAD_REQUEST` for invalid product-kind combinations;
- throw `INTERNAL_SERVER_ERROR` or `UNAVAILABLE`-equivalent errors for upstream
  failures rather than returning an empty list;
- use `isInputError()` in clients to display field-specific validation errors.

Official documentation:

- [Action input validators](https://docs.astro.build/en/reference/modules/astro-actions/#imports-from-astroactions)
- [Handling backend errors](https://docs.astro.build/en/guides/actions/#handling-backend-errors-in-your-action)
- [Displaying form input errors](https://docs.astro.build/en/guides/actions/#displaying-form-input-errors)

---

## A09 — The inline analytics script is not repeat-execution safe

Priority: Medium

Location: `src/components/GoogleAnalytics.astro:7-70`

The component uses `<script is:inline>` and registers global listeners every
time it executes:

```js
document.addEventListener('astro:page-load', ...)
window.addEventListener('cliffrise:analytics-accepted', ...)
```

Astro documents that inline scripts can execute more than once during a
`ClientRouter` visit. The script does not guard listener registration, even
though `src/env.d.ts:12-21` already declares several apparent guard flags such
as `__gaListenersBound`.

Additional correctness issue:

The cookie banner does not dispatch the acceptance event when consent already
exists in local storage. On a later visit, the banner is hidden but analytics
is not loaded.

Impact:

- duplicate page-view events;
- duplicate consent listeners;
- inconsistent analytics across initial and client-side navigations;
- users who previously consented may not be measured.

Recommended change:

1. initialize global state only if it does not already exist;
2. bind global listeners once;
3. use `astro:page-load` for each navigation's page view;
4. check persisted consent during initialization;
5. deduplicate page views by URL;
6. keep the script valid for the formatter/linter.

Official documentation:

- [Script behavior with view transitions](https://docs.astro.build/en/guides/view-transitions/#script-behavior-with-view-transitions)
- [`astro:page-load`](https://docs.astro.build/en/guides/view-transitions/#astropage-load)

---

## A10 — Environment variables have no Astro schema

Priority: Medium

Relevant locations:

- `astro.config.js:10-15`
- `src/actions/contactForm.ts`
- `src/actions/searchOffices.ts`
- `src/pages/[lang]/checkout/index.astro`
- `src/pages/api/webhooks/stripe.ts`
- `src/services/email/index.ts`
- `src/services/stripe.ts`
- `src/utils/stripeShipping.ts`

The project reads many security- and payment-sensitive values from
`import.meta.env` or `process.env`, but `astro.config.js` has no `env.schema`.

Affected values include:

- Stripe public/secret/webhook keys and shipping rates;
- Redis URL;
- Resend API key and template ID;
- owner/BCC addresses;
- Speedy credentials;
- site URL;
- rate-limit settings.

Why this is out of sync:

Astro's `astro:env` API provides type-safe server/client boundaries, data type
validation, defaults, optional fields, and secret validation. The current
approach catches missing values inconsistently and often only when a route is
visited.

Recommended change:

- define all variables with `envField`;
- mark secrets as server/secret;
- use numeric fields for rate limits;
- validate required production secrets on server start;
- import values from `astro:env/server` and `astro:env/client`;
- use `getSecret()` for dynamic secret lookup rather than direct
  `process.env` access.

Official documentation:

- [Type-safe environment variables](https://docs.astro.build/en/guides/environment-variables/#type-safe-environment-variables)
- [`getSecret()`](https://docs.astro.build/en/reference/modules/astro-env/#_top)

---

## A11 — Static pages are forced through on-demand rendering

Priority: Medium

Locations:

- `astro.config.js:100`
- `src/layouts/MainLayout.astro:65`
- `src/components/header/Header.astro:12`
- `src/pages/[lang]/gdpr.astro`
- `src/pages/[lang]/privacy-policy.astro`
- `src/pages/[lang]/terms-and-conditions.astro`
- founder profile pages

`output: 'server'` makes every page on-demand by default. Even legal and founder
content cannot simply opt into prerendering because the shared layout/header
reads the session.

Why this is out of sync:

Astro recommends static output until most pages truly need on-demand rendering.
In server mode, Astro specifically recommends adding
`export const prerender = true` to pages that do not need a server.

Impact:

- every legal/content request requires Node and Redis/session work;
- reduced cacheability and resilience;
- unnecessary server cost and latency;
- sitemap handling becomes more complicated.

Recommended change:

1. split the shell into static and personalized variants;
2. fetch the cart count after hydration or isolate personalization in a server
   island;
3. prerender legal pages and founder profiles;
4. evaluate whether default static output plus selected
   `export const prerender = false` routes is a better fit.

Official documentation:

- [Enabling on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering)

---

## A12 — Missing products redirect instead of returning not found

Priority: Medium

Location: `src/pages/[lang]/products/[id].astro:30-34`

An unknown product slug returns a temporary redirect to `/[lang]/products/`,
which itself redirects to the homepage products hash.

Why this is out of sync:

The request is for a resource that does not exist. Astro's SSR routing examples
direct unknown dynamic-route values to a 404 route or set an explicit 404
response. A chain of 302 redirects makes invalid URLs look temporarily moved
and obscures the not-found state from crawlers and monitoring.

Recommended change:

- add a localized `404.astro` page;
- return a 404 response or redirect to the 404 route;
- use permanent redirects only for known renamed product slugs.

Official documentation:

- [On-demand dynamic routes](https://docs.astro.build/en/guides/routing/#on-demand-dynamic-routes)
- [`Astro.response`](https://docs.astro.build/en/reference/api-reference/#response)

---

## A13 — Contact action has no zero-JavaScript form fallback

Priority: Medium

Locations:

- `src/components/contactForm/FormFields.astro:9-14`
- `src/components/contactForm/ContactUsModal.astro:95-128`

The form has `method="POST"` but no `action`. JavaScript always prevents the
default and invokes `actions.contact(formData)`. If the client script fails or
is blocked, the browser posts to the current page instead of the Astro action.

Why this is out of sync:

Astro documents HTML form actions as a built-in zero-JavaScript path and
progressive enhancement fallback:

```astro
<form method="POST" action={actions.contact}></form>
```

Recommended change:

1. import `actions` in the Astro component and set the form action;
2. keep the JavaScript enhancement for modal state if desired;
3. handle `Astro.getActionResult()` on the server;
4. use `isInputError()` for field-level feedback.

Official documentation:

- [Call actions from an HTML form](https://docs.astro.build/en/guides/actions/#call-actions-from-an-html-form-action)

---

## A14 — Locale routing duplicates Astro's i18n APIs

Priority: Medium

Locations:

- `src/utils/i18.ts:10-17`
- `src/layouts/MainLayout.astro:71-94`
- `src/components/header/LangSwitcher.astro:4-8`
- `src/middleware.ts:5-17`

The application manually:

- reads locale from `Astro.params`;
- replaces the first path segment;
- appends trailing slashes;
- detects whether a locale prefix exists;
- constructs alternate locale URLs.

Why this is out of sync:

Astro exposes `Astro.currentLocale`, `Astro.preferredLocale`, and locale URL
helpers for these tasks. Manual string operations already contributed to the
broken language-switch behavior in A05 and increase the risk of errors with
query strings, hashes, future locale aliases, and route changes.

Recommended change:

- use `Astro.currentLocale` for the active locale;
- use `getRelativeLocaleUrl()`/related helpers for links;
- decide whether locale routing should stay automatic or move to
  `routing: 'manual'` with Astro's i18n middleware helpers;
- keep the Cloudflare-country override as a small, explicit customization.

Official documentation:

- [`Astro.currentLocale`](https://docs.astro.build/en/reference/api-reference/#currentlocale)
- [Internationalization API](https://docs.astro.build/en/reference/modules/astro-i18n/)

---

## A15 — Cart hydration priority is lower than its trigger

Priority: Low

Locations:

- `src/components/header/Header.astro:71`
- `src/layouts/MainLayout.astro:135-149`

The cart button hydrates with `client:load`, but the cart dialog it opens
hydrates with `client:idle`. A user can interact with the button before the cart
is ready.

Why this is out of sync:

Astro documents `client:load` for immediately visible UI that needs to be
interactive immediately, and `client:idle` for lower-priority UI. Although the
dialog starts hidden, it is the immediate result of a high-priority header
interaction.

Recommended change:

- hydrate the button and dialog as one island;
- or use `client:load` for both;
- or add a bounded `client:idle={{ timeout: ... }}` if the short delay is an
  intentional performance tradeoff.

Official documentation:

- [Client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

---

## A16 — Several images bypass Astro optimization and intrinsic sizing

Priority: Low

Examples:

- `src/components/Hero.astro:19-25`
- `src/components/Hero.astro:43-51`
- `src/components/header/Header.astro:28-33`
- `src/components/header/Header.astro:55-68`
- `src/components/Footer.astro:83-98`
- `src/components/checkout/ShippingForm.astro:19-24`
- `src/components/cart/Cart.tsx:102`
- several Solid carousel images

Many static assets live in `public/` and are rendered with native `<img>`.
Several do not provide `width` and `height`.

Why this is out of sync:

Astro recommends keeping local images in `src/` where possible and using
`<Image />` or `<Picture />` for optimization and inferred dimensions. Files in
`public/` are copied unchanged and cannot use responsive image generation.

SVG icons can reasonably stay in `public`, but Astro 5 also supports importing
local SVGs as components. Raster assets such as `speedy-logo.png` are stronger
candidates for `src/assets`.

Recommended change:

- move optimizable raster assets to `src/assets`;
- use `<Image />` with responsive layout where appropriate;
- add explicit intrinsic dimensions to remaining public/remote `<img>` tags;
- import reusable SVGs as components when inline styling or guaranteed sizing
  is useful.

Official documentation:

- [Where to store images](https://docs.astro.build/en/guides/images/#_top)
- [Astro image components](https://docs.astro.build/en/guides/images/#astro-components-for-images)
- [Responsive images](https://docs.astro.build/en/guides/images/#responsive-image-behavior)

---

## A17 — Translation source data is imported from `public/`

Priority: Low

Location: `src/utils/i18.ts:1-2`

The translation JSON is imported into the server/client module graph from:

```ts
../../public/locales/.../translations.json
```

At the same time, the files are copied unchanged into the final public output.

Why this is out of sync:

Astro reserves `public/` for files that should be served or copied as-is.
Imported project data belongs under `src/`, where it participates in normal
bundling and dependency tracking.

Impact:

- duplicate availability as bundled data and public JSON;
- translation content is directly downloadable even if that was not intended;
- the source/public boundary is less clear.

Recommended change:

Move translation JSON to `src/data`, `src/i18n`, or a content collection. Keep
it in `public/` only if runtime URL-based fetching is intentional.

Official documentation:

- [The `src/` and `public/` asset boundary](https://docs.astro.build/en/guides/images/#_top)

---

## A18 — Font CSS references an asset that does not exist

Priority: Low

Location: `src/styles/fonts.css:36-40`

The CSS declares:

```css
url('/fonts/nafta.woff2') format('woff2'),
url('/fonts/nafta.woff') format('woff');
```

Only `public/fonts/nafta.woff2` exists. `npm run build` warns:

```text
/fonts/nafta.woff referenced in /fonts/nafta.woff didn't resolve at build time
```

Recommended change:

Remove the nonexistent fallback or add the licensed `.woff` file. A clean Astro
build should not contain unresolved asset references.

---

## Additional implementation notes

### Session type coverage is incomplete

`src/env.d.ts:3-7` types only `cart`, while the application also stores:

- `shipping` in `src/actions/checkout.ts:23`;
- `orderEmail` in `src/pages/[lang]/checkout/success.astro:21`.

Astro's session guide recommends extending `App.SessionData` for type checking.
Add both keys, and consider storing the current Stripe Checkout Session ID as
recommended in A02.

Documentation:

- [Session data types](https://docs.astro.build/en/guides/sessions/#session-data-types)

### Root locale redirect logic is duplicated

Both `src/middleware.ts` and `src/pages/index.astro` implement a root locale
redirect. In practice middleware handles `/` first, making the page-level
redirect redundant for normal requests. Consolidating this behavior will make
status codes, cache headers, and locale detection easier to reason about.

### In-memory rate limiting is process-local

`src/services/rateLimit.ts` stores request timestamps in a module-level `Map`.
With multiple Node processes or replicas, each process has an independent
limit, and every restart clears it. Since Redis is already configured for
sessions, a shared rate-limit store would produce predictable behavior.

### `getShippingRate` has misleading input

`src/actions/checkout.ts:7-15` requires `officeId`, but the handler ignores it
and always returns the same standard rate. Remove the input if shipping is
global, or actually validate/use the office if it affects pricing.

### Checkout session creation should be idempotent

`src/pages/[lang]/checkout/index.astro:89-118` creates a Stripe session whenever
the route is visited without `session_id`, then redirects to itself. Repeated
loads can create multiple abandoned sessions. Store the created ID in the Astro
session and reuse or invalidate it deliberately.

---

## Tooling verification

### Build

Command:

```text
npm run build
```

Result: passed.

Relevant warning:

```text
/fonts/nafta.woff referenced in /fonts/nafta.woff didn't resolve at build time
```

The generated sitemap used `http://localhost:4321`, confirming A01.

### Lint

Command:

```text
npm run lint
```

Result: failed with 31 errors.

Most errors are in the untracked generated
`scripts/generate-odit-file.js`, but one tracked application error remains:

```text
src/components/GoogleAnalytics.astro
Use the rest parameters instead of 'arguments'
```

### Formatting

Command:

```text
npm run format:check
```

Result: failed.

Prettier reports multiple unformatted files and cannot parse
`src/components/GoogleAnalytics.astro`. This reinforces the recommendation in
A09 to restructure the inline analytics script.

---

## Recommended remediation order

### Phase 1 — Release blockers

1. require a valid production `SITE_URL`;
2. protect/remove test endpoints;
3. bind Stripe session IDs to the current Astro session;
4. move `Cache-Control` logic to pages or middleware;
5. fix the language switcher's navigation.

### Phase 2 — Framework alignment

1. migrate Redis sessions away from deprecated `session.options`;
2. add an `astro:env` schema;
3. make sitemap generation deterministic;
4. harden action schemas and `ActionError` handling;
5. make analytics initialization safe under `ClientRouter`.

### Phase 3 — Performance and maintainability

1. prerender static legal/profile pages;
2. use Astro i18n URL helpers;
3. add progressive-enhancement form actions;
4. improve image storage and dimensions;
5. move translation data into `src`;
6. remove the unresolved font reference and restore clean lint/format checks.

## Official Astro references used

- [Actions](https://docs.astro.build/en/guides/actions/)
- [Actions API](https://docs.astro.build/en/reference/modules/astro-actions/)
- [Environment variables](https://docs.astro.build/en/guides/environment-variables/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Internationalization API](https://docs.astro.build/en/reference/modules/astro-i18n/)
- [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Routing](https://docs.astro.build/en/guides/routing/)
- [Sessions](https://docs.astro.build/en/guides/sessions/)
- [Session configuration](https://docs.astro.build/en/reference/configuration-reference/#session-options)
- [Sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Template/client directives](https://docs.astro.build/en/reference/directives-reference/)
- [View transitions](https://docs.astro.build/en/guides/view-transitions/)
