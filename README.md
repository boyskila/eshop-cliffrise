# eshop-cliffrise

A simple online shop implemented using AstroJs, Tailwind and Stripe for handling payments.

## Google Analytics

Set the public GA4 measurement ID in the production environment:

```env
PUBLIC_GOOGLE_ANALYTICS_ID=G-D9DXQP66G4
```

Analytics is disabled when this variable is missing. Playwright uses the fake
`G-TEST` ID so browser tests cannot send events to the production property.
