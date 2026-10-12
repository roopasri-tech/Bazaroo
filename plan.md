# Bazaaro — implementation plan

## Product scope

Bazaaro is a mobile-first storefront and merchant desk for India's small vendors and local businesses. It addresses the gap between social-media word-of-mouth and high-friction marketplaces: a vendor gets a structured, shareable storefront, a product catalogue, inventory/order tools and practical insight; a shopper gets clear discovery, INR pricing and a direct route to the maker.

The saved setup direction is **Bazaar Ledger**. The app is portrait-first and one-handed. Main journeys are:

1. **Discover:** browse neighborhood vendors and products, search/filter by category/location, open a shop or product, save favourites, and add to a cart.
2. **Order:** select delivery or pickup, enter a six-digit Indian PIN code and contact details, review the order, then see a clear confirmation and history.
3. **Run a shop:** guided profile/storefront setup; edit the public shop identity, contact details, address and hours; manage products and stock; review/advance orders; inspect visit, interest, sales and repeat-customer signals.
4. **Share:** provide vendor-owned contact options (including a WhatsApp deep link) and a shareable shop URL. Payments, delivery integrations and identity verification providers were not specified; this build will not imply that a payment or courier integration is live.

The scope preserves the approved setup features: business identity/contact/operating details and guided launch; branded shop name, logo, cover, description, policies/contact/share link; catalogue categories, variants, photos, descriptions, INR pricing and availability; quick stock adjustments, low-stock/out-of-stock state and movement history; search/categories/location/filters; favourites/cart/order placement; delivery or pickup; vendor order decisions and status/history; customer profiles/repeat status/direct contact; storefront/product-interest/sales/order/inventory/repeat-customer analytics; Hindi/English language choice, INR, address/PIN handling, and low-bandwidth/accessibility considerations.

## Implementation approach

- Keep the initialized **Expo Router + React Native + TypeScript + NativeWind** starter; it supports Android/iOS through Expo Go and a web build from the same source. The managed starter already supplies an Express/tRPC server, Drizzle, a MySQL-compatible database, OAuth plumbing, AsyncStorage and the fixed Metro/API ports (8081/3000). Do not replace its framework, identifiers, OAuth or runtime.
- Build a usable, offline-friendly MVP with a small bundled artisan catalogue and AsyncStorage-backed working state. Store creation, product edits, stock changes, favourite/cart actions, orders and analytics are interactions rather than static screen mockups. Local persistence is per device/browser; it is not cross-customer synchronization. Keep those boundaries visible in the handoff and preserve the existing tRPC/MySQL/OAuth foundation for the later shared deployment configuration.
- Keep the public discovery experience readable before sign-in. Do not invent an authenticated user or bypass the starter's real authentication. No user-supplied payment provider, secrets, or delivery platform is presumed.
- Use React Native components, NativeWind for supported text/layout styles and `StyleSheet` for `Pressable` containers. Use static, compressed, bundled illustrations/photos so a first-run catalogue does not depend on remote image requests. Add an AsyncStorage state provider, domain types/fixtures, reusable product/store cards, and focused screens under the existing router tree.
- Prepare portable source rather than transferring the mobile project's canonical repository: Mobile Dev requires the Manus-managed canonical repo and the platform does not allow a canonical GitHub switch for Mobile. Include normal Git and host configuration files, environment examples without secrets, and explicit GitHub handoff instructions. The project ZIP excludes `.git`, `node_modules`, `.env`, caches and runtime credentials.
- Configure Expo Web static output for Vercel and Render Static Sites. Include `vercel.json`, `render.yaml`, and exact commands. The Express API/backend remains separable for a Render web service; live multi-user sync/authentication requires a reachable database and the corresponding deployment secrets, and must not be represented as complete merely because static hosting works.

## Project structure

- `app/`: Expo Router root, customer tabs, product/store detail, cart, orders, merchant desk, and profile/onboarding routes.
- `components/bazaaro/`: small, reusable brand header, search/category controls, cards, badges, and merchant status elements.
- `lib/bazaaro/`: typed catalogue/store/order models, curated demo data, local persistence/state actions, validation, currency/PIN helpers and translations.
- `assets/images/`: distinct launcher/splash/adaptive icons, marketplace story/cover art and one image per sample product. `public/` provides the companion web manifest and PWA icons; all sample images are bundled and local.
- `server/`, `drizzle/`, `shared/`: retain the managed Express/tRPC/Drizzle foundation; preserve existing OAuth and user table. Any new DB schema changes must be additive and migrations must be checked before use; no destructive migration or production-data reset is in scope.
- `README.md`, `docs/DEPLOYMENT.md`, `.env.example`, `.nvmrc`, `pnpm-workspace.yaml`, `render.yaml`, `vercel.json`, `.vscode/`: VS Code setup, source-archive boundaries, local preview, external host steps, environment contracts and reproducible installs.

## Design system — Bazaar Ledger

- **Design movement:** contemporary Indian merchant vernacular, inspired by hand-painted bazaar signs, stamped receipts and a practical clothbound business ledger.
- **Core principles:** useful before ornamental; honest maker/product imagery; locally familiar without caricature; comfortable, legible, one-handed commerce.
- **Color philosophy:** baked-earth vermilion `#A63D24` carries the shop-sign identity and direct calls to action. Saffron/marigold `#F2C14E` punctuates prices, new stock and small status marks. Warm paper and ink support long catalogue and ledger reading; neutral earth tints keep dense merchant information calm and high contrast.
- **Layout paradigm:** a portrait editorial stream with a top seller/location masthead, tactile search ticket, horizontal category ribbon and staggered shop/product stories. The merchant desk uses ledger rows and compact decision cards instead of a generic dashboard grid. Bottom navigation keeps primary actions in thumb reach.
- **Signature elements:** a simplified striped shop awning/sun-stamp; fine receipt-rule dividers and item numbers; small marigold seal/badge accents for local makers and stock states.
- **Interaction philosophy:** clear direct actions, large touch targets, labelled icon controls, immediate cart/stock feedback, and confirmation after order placement. No gesture-only actions; destructive decisions require explicit confirmation.
- **Animation:** restrained 160–220 ms opacity/scale feedback on taps, light card reveal and a short favourite/stock acknowledgement. Respect reduced-motion settings; no autoplay video, heavy parallax or large animation bundles.
- **Typography system:** Hind for Latin and Devanagari, with medium/bold for compact labels and headings; regular for item descriptions and ledger figures. Price/quantity use tabular numerals where available. Keep line length short and body text comfortably readable.
- **Brand essence:** “A neighborhood storefront and practical merchant desk in every Indian small-business owner's pocket.” Personality: **grounded, resourceful, welcoming**.
- **Brand voice:** friendly, specific, merchant-respectful; avoid marketplace hype. Examples: “Your shop, your customers, your terms.” / “Find something lovely, made close by.”
- **Wordmark & logo:** a custom awning-and-rising-sun seal with a ledger fold; a bespoke mark, not the project name rendered in a default font. Maintain a distinct square launcher icon without baked-in rounded corners and reuse the mark across splash/adaptive assets.
- **Signature brand color:** Bazaar vermilion `#A63D24`.
