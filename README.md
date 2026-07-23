# eshop-cliffrise

A simple online shop implemented using AstroJs, Tailwind and Stripe for handling payments.

## Google Analytics

Set the public GA4 measurement ID in the production environment:

```env
PUBLIC_GOOGLE_ANALYTICS_ID=G-D9DXQP66G4
```

Analytics is disabled when this variable is missing. Playwright uses the fake
`G-TEST` ID so browser tests cannot send events to the production property.

## Canonical host

SEO URLs are always generated with `https://cliffrise.com`, regardless of the
incoming request host. `SITE_URL` is normalized from `www.cliffrise.com` to the
canonical non-www host before it is used for application callback URLs.

Cloudflare is the single owner of the hostname redirect. Configure one
permanent edge redirect from `https://www.cliffrise.com/*` to
`https://cliffrise.com/*` that preserves the path and query string. Astro does
not duplicate this redirect behind the proxy.
