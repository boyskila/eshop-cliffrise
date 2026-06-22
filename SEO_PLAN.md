# SEO Implementation Plan for CliffRise

## Goal

Improve search engine visibility, increase organic traffic, and establish CliffRise as a trusted source for climbing products and climbing information in Bulgaria.

---

# Phase 1: Technical SEO Foundations

## 1. Create a reusable SEO component

Create a shared `SEO.astro` component responsible for:

* Page title
* Meta description
* Canonical URL
* Open Graph tags
* Twitter tags
* Robots directives

### Acceptance Criteria

* Every page uses the SEO component.
* No page relies on browser defaults.

---

## 2. Define page-specific metadata

Create unique metadata for every page.

### Examples

#### Homepage

* Title: CliffRise — Climbing Chalk That Supports New Routes
* Description: Climbing chalk, liquid chalk and finger tape. Every purchase supports the bolting of new climbing routes in Bulgaria.

#### Product Pages

* Include product name
* Include primary keywords
* Include brand name

#### About Us

* Focus on route development and community impact

### Acceptance Criteria

* No duplicate titles.
* No duplicate descriptions.

---

## 3. Add canonical URLs

Add canonical tags to every page.

### Acceptance Criteria

* Every page has exactly one canonical URL.
* Canonicals match the public URL structure.

---

## 4. Prevent indexing of utility pages

Add:

```html
<meta name="robots" content="noindex,nofollow" />
```

### Pages

* /cart
* /checkout
* /checkout/shipping
* /checkout/payment
* /success
* /cancel

### Acceptance Criteria

* Utility pages are excluded from search results.

---

## 5. Generate sitemap

Install:

```bash
npm install @astrojs/sitemap
```

Configure sitemap generation in Astro.

### Acceptance Criteria

* Sitemap generated during build.
* Includes all public pages.
* Excludes checkout and utility pages.

---

## 6. Add robots.txt

Create:

```txt
public/robots.txt
```

Example:

```txt
User-agent: *
Allow: /

Disallow: /cart
Disallow: /checkout
Disallow: /success
Disallow: /cancel

Sitemap: https://cliffrise.com/sitemap-index.xml
```

### Acceptance Criteria

* Search engines can discover the sitemap.

---

# Phase 2: International SEO

## 7. Implement hreflang tags

Support:

* English
* Bulgarian

Example:

```html
<link rel="alternate" hreflang="en" href="https://cliffrise.com/en/" />
<link rel="alternate" hreflang="bg" href="https://cliffrise.com/bg/" />
<link rel="alternate" hreflang="x-default" href="https://cliffrise.com/en/" />
```

### Acceptance Criteria

* Every translated page references its counterpart.

---

## 8. Verify URL structure

### Preferred

```txt
/en/products/climbing-chalk
/bg/products/magneziy-za-katerene

/en/climbing-guide/teteven/zaslona
/bg/climbing-guide/teteven/zaslona
```

### Avoid

```txt
/products?id=123
```

### Acceptance Criteria

* URLs are descriptive and localized.

---

# Phase 3: Structured Data

## 9. Add Product Schema

Implement JSON-LD Product schema.

### Include

* Product name
* Description
* Price
* Currency
* Availability
* Brand
* Images

### Acceptance Criteria

* Rich results validation passes.

---

## 10. Add Organization Schema

Create Organization schema for CliffRise.

### Include

* Company name
* Logo
* Website
* Social profiles

### Acceptance Criteria

* Organization appears correctly in Google's structured data tests.

---

## 11. Add Breadcrumb Schema

Implement breadcrumb schema for:

* Products
* Climbing guides
* Blog posts

### Acceptance Criteria

* Breadcrumbs appear in search results.

---

# Phase 4: Performance Optimization

## 12. Optimize Images

### Tasks

* Convert images to WebP/AVIF
* Add descriptive alt text
* Specify width and height
* Avoid lazy-loading hero images

### Acceptance Criteria

* Images contribute minimal layout shift.

---

## 13. Improve Core Web Vitals

### Focus Areas

* Largest Contentful Paint (LCP)
* Cumulative Layout Shift (CLS)
* Interaction to Next Paint (INP)

### Tasks

* Reduce client-side JavaScript
* Use Astro Islands only where necessary
* Optimize fonts
* Optimize images

### Acceptance Criteria

* Lighthouse score > 90 on desktop and mobile.

---

# Phase 5: Content SEO

## 14. Create Climbing Guide Pages

### Locations

#### Ribaritsa

* The Cave
* Sectora s Chervata

#### Teteven

* Zaslona
* Sinioto Kolelo
* Dolinata

  * Tavanite
  * Vodopada Left
  * Vodopada Right
  * Malkite Tavani
  * Drugarsiya

### Include

* GPS coordinates
* Approach information
* Sun exposure
* Route list
* Images

### Acceptance Criteria

* Every sector has a dedicated indexable page.

---

## 15. Launch a Blog

### Suggested Topics

#### English

* How to Choose Climbing Chalk
* Climbing in Bulgaria
* Why Route Bolting Matters
* Best Climbing Areas Near Sofia

#### Bulgarian

* Как да изберем магнезий
* Катерене в България
* Защо е важно екипирането на маршрути
* Най-добрите обекти за катерене около София

### Acceptance Criteria

* Publish at least one article per month.

---

## 16. Strengthen Internal Linking

### Examples

Product Page → Mission Page

Mission Page → Climbing Guide

Climbing Guide → Products

Blog Posts → Related Products

### Acceptance Criteria

* Every page links to at least 2–3 related pages.

---

# Phase 6: Search Console & Analytics

## 17. Set up Google Search Console

### Tasks

* Verify domain ownership
* Submit sitemap
* Monitor indexing

### Acceptance Criteria

* Sitemap successfully processed.

---

## 18. Set up Bing Webmaster Tools

### Acceptance Criteria

* Sitemap submitted and validated.

---

## 19. Add Analytics

Preferred:

* Plausible
* Google Analytics 4

Track:

* Product views
* Add-to-cart actions
* Checkout starts
* Purchases

### Acceptance Criteria

* Conversion funnel is measurable.

---

# Phase 7: Monitoring & Continuous Improvement

## 20. Monthly SEO Review

### Review

* Search Console performance
* Indexed pages
* Crawl errors
* Broken links
* Lighthouse scores
* Organic traffic growth

### Deliverables

Monthly report including:

* Organic traffic
* Top pages
* Top keywords
* Technical issues
* Recommended actions

---

# Priority Order

## High Priority

1. SEO component
2. Metadata
3. Canonicals
4. Noindex checkout pages
5. Sitemap
6. Robots.txt
7. Hreflang
8. Product schema

## Medium Priority

9. Organization schema
10. Breadcrumb schema
11. Image optimization
12. Core Web Vitals

## Long-Term Growth

13. Climbing guide pages
14. Blog content
15. Internal linking
16. Search Console optimization
17. Monthly SEO reviews


src/pages/index.astro is empty. The root / should probably redirect to /${DEFAULT_LANG}/ or serve a canonical homepage. Right now it does not use SEO and may produce a poor root response.

Sitemap is dynamic, not generated during build. That is fine functionally, but it does not exactly match the plan’s @astrojs/sitemap build-time approach.

Product URLs are not localized. The plan prefers localized slugs like /bg/products/magneziy-za-katerene/, but current product slugs appear shared between languages.

Breadcrumb schema exists only for products. That is okay because climbing guide/blog pages do not exist yet, but the plan lists those too.
Rich results validation has not been done yet. Product/Organization schema exists, but it still needs testing in Google’s Rich Results Test.
Image/Core Web Vitals work is only partially covered by existing image usage. No Lighthouse/Core Web Vitals audit has been implemented.
Climbing guide pages are not implemented.
Blog is not implemented.
Internal linking has not been fully audited against the “2-3 related links per page” goal.
Search Console and Bing Webmaster setup are external tasks and not implemented in code.
Analytics exists via GoogleAnalytics, but product view/add-to-cart/checkout/purchase funnel tracking is not confirmed from the SEO plan.
The biggest practical gap I’d fix next is the empty root src/pages/index.astro, then verify the rendered sitemap.xml, robots.txt, and product JSON-LD against production SITE_URL.