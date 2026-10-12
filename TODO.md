# Bazaaro delivery outcomes

This checklist records the requested Indian local-vendor mobile app and deployment handoff. Completed app behavior is implemented as an offline-capable, device-local prototype; customer/vendor state does not synchronize across visitors or production accounts.

## Vendor setup and independent storefront
- [x] The local prototype provides simple vendor onboarding with business-profile identity and contact details, operating information, PIN/city settings, shop-sign/cover choices, and a guided editable storefront profile.
- [x] The prototype provides a customizable branded storefront with business name, logo, cover imagery, description, policies, contact options and a share URL; shop and listing examples are explicitly labelled sample data.

## Product catalogue and inventory control
- [x] Product catalogue management in the prototype supports categories, optional variants, INR pricing, distinct bundled product photos, descriptions, availability, adding products and quick stock edits.
- [x] Local inventory tracking supports stock adjustments, low-stock visibility, out-of-stock controls, hiding/publishing a listing and movement history.

## Customer discovery and ordering
- [x] The marketplace demo supports search, categories, a near-me/all-India toggle, maker cards, individual storefronts and product pages.
- [x] The demo shopping journey supports favourites, basket quantities, delivery or pickup selection, Indian customer contact/PIN capture, a stock-aware local order, confirmation and local history.

## Seller operations and direct customer relationships
- [x] The merchant desk supports incoming-order review, accept/decline, status transitions, fulfilment choice/details and order history.
- [x] Local customer details entered at checkout support repeat-customer signals; shop-owned WhatsApp links hand off directly to the number the owner enters.

## Business insight and India readiness
- [x] The seller notebook shows sample/on-device storefront visits, product interest, completed order value, order counts, inventory movements and repeat-customer trends.
- [x] The portrait-first mobile interface supports English/Hindi labels, INR, Indian 10-digit phone and six-digit PIN handling, bundled imagery for low-network first-run use, keyboard/accessibility labels and touch-friendly controls.

## Source and external deployment handoff
- [x] The full editable project source, lockfile, app/PWA images, blank environment example, VS Code settings and host configs are packaged as a ZIP. The archive excludes secrets, populated `.env`, `.git`, caches, build output and `node_modules`; README instructions explain extraction and local setup.
- [x] The project includes private-repository GitHub push instructions plus checked-in Vercel/Render static-site descriptors and deployment documentation. The descriptors deploy the Expo Web build, not the retained Expo starter API/database.
- [ ] Push the complete source to a GitHub repository and publish the Expo Web build to both Vercel and Render. Do not mark this outcome complete or claim a URL until the corresponding account access is authorized and each service returns a successful result.
