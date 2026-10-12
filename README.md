# Bazaaro

**A neighbourhood storefront and practical merchant desk in every Indian small-business owner's pocket.**

Bazaaro is a mobile-first Expo app for local makers and shoppers. Its sample marketplace demonstrates storefront discovery, product pages, favourites, a basket, India-ready checkout capture, WhatsApp handoff, merchant stock/order tools and a small-shop analytics notebook.

## Run it in VS Code

### Requirements

- Node.js 20.19.4 or newer (Node 22 recommended)
- Corepack and pnpm 9.12.0 (the project pins this in `package.json`)
- VS Code; an Android/iOS phone with Expo Go is optional

### Web preview (no database/account setup needed)

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev:web
```

Open <http://localhost:8081>. The initial product data, demo actions and your subsequent local edits are stored by the app on this browser/device using AsyncStorage. The starter API server and database do not need to be running for this standalone demo.

### Android/iOS with Expo Go

```bash
pnpm dev:mobile
```

Open the QR code from the same Wi-Fi network in Expo Go. Expo Go/device access and a released APK/AAB/iOS build are different: this ZIP contains source, not a signed native release package.

### Check and export

```bash
pnpm check
pnpm test
pnpm web:build
```

`web:build` creates the static Expo Web site in `dist/` for Vercel or Render Static Sites. Product and storefront URLs use the host rewrites in `vercel.json` and `render.yaml`.

## Walk the demo

- **Discover:** search sample products and makers; filter by craft category and the saved owner city or all India.
- **Shop:** open a shareable product/shop page; save a find; add it to the basket; choose pickup or delivery; enter customer and PIN details; see the order confirmation and follow the order's local status from Account.
- **Saved:** browse favourites.
- **Merchant desk:** adjust stock and view a movement log; hide/publish a product; create a product from bundled sample photos; accept, advance or decline orders; inspect visits, product interest, completed order value and repeat-customer signals.
- **Account:** set your shop name, category, description, city/state, six-digit PIN, 10-digit Indian contact numbers, hours, policies, shop-sign/cover image, Hindi/English preference and WhatsApp actions; share the storefront URL; review both customer orders you placed and orders your shop received.

All product/store imagery is original generated artwork bundled under `assets/images/`. To keep first run deterministic and low-bandwidth, the onboarding and add-product flows select bundled photos. There is no real photo-upload pipeline in this demo.

## Important demo boundaries

This deliverable is a **working local-first product prototype**, not a live multi-vendor commerce backend. Browser/device changes do not sync to another customer or seller; the illustrative sample shops, ratings, orders and starting analytics are not real businesses or customers. Orders and analytics remain local to the demo. **No payment, courier, account-login or real production customer-data service is connected.** WhatsApp links are composed only from a number the shop owner enters. Do not use this build to accept real customer data or live orders until authentication, shared data storage, production privacy controls and fulfilment/payment arrangements are configured and tested.

The initialized Expo repository retains its Express/tRPC/Drizzle/OAuth starter foundation for later backend work. The current static web deployments do not publish that API. See [deployment notes](docs/DEPLOYMENT.md) before exposing a build to the public internet.

## Source layout

```text
app/                    Expo Router tabs, shop profile, product/store pages, cart
components/bazaaro/     Bazaar Ledger visual primitives and maker/product cards
lib/bazaaro/            Typed app state, sample data, translations and helpers
assets/images/          App/native/PWA icons and seven distinct original artisan photos
public/                  PWA manifest and icons
server/, drizzle/, lib/  Preserved managed Expo starter server/auth/database foundation
docs/                    Deployment boundary and image asset provenance
```

## GitHub source copy

The ZIP intentionally excludes `.git`, `node_modules`, Expo build caches and `.env` files; it includes the complete editable source, images, `pnpm-lock.yaml`, VS Code recommendations and deploy descriptors. Extract it, create a private GitHub repository you own, then run from this folder:

```bash
git init
git add -A
git commit -m "Initial Bazaaro marketplace app"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/bazaaro.git
git push -u origin main
```

Do not commit actual credentials; `.env.example` contains blank placeholders and `.gitignore` keeps `.env` private. The managed Mobile project's canonical repository remains managed by Manus.
