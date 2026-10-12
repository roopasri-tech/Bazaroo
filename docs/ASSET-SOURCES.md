# Bazaaro image assets

All product and market images below are original illustrations/photos generated for this project (not licensed third-party marketplace listings). The app uses the unchanged Managed Storage paths in the Manus web preview and includes optimized local copies for native Expo builds, local VS Code runs and Vercel/Render static exports.

| Placement | Local source in the ZIP | Original Managed Storage path |
|---|---|---|
| Full-bleed launcher symbol | `assets/images/bazaaro-icon.png` | `/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-1.webp` |
| Discovery story/cover | `assets/images/market-story.jpg` | `/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-2.webp` |
| Block-print scarf | `assets/images/blockprint-scarf.jpg` | `/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-3.webp` |
| Brass diya | `assets/images/brass-diya.jpg` | `/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-4.webp` |
| Spice jars | `assets/images/spice-duo.jpg` | `/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-5.webp` |
| Terracotta cups | `assets/images/terracotta-cups.jpg` | `/manus-storage/async-images/Cf0XRAxoPyTjAKxd8I6moY/image-1.webp` |
| Woven tote | `assets/images/loom-tote.jpg` | `/manus-storage/async-images/Cf0XRAxoPyTjAKxd8I6moY/image-2.webp` |
| Mango achaar | `assets/images/mango-achaar.jpg` | `/manus-storage/async-images/Cf0XRAxoPyTjAKxd8I6moY/image-3.webp` |
| Transparent adaptive-icon mark | `assets/images/android-icon-foreground.png` | `/manus-storage/async-images/ESSqMHEW2UsALdmJEYeM99/image-1.webp` |

`components/bazaaro/ui.tsx` keeps each Managed Storage URL exactly as returned for the Manus browser preview. On Expo native, local development and external deployments it instead uses the corresponding generated local image bundled in `assets/images/`; no external image CDN is required for the app itself. The full-bleed 1024px launcher file has no baked-in corner mask; the adaptive foreground and monochrome masks are transparent and inset for icon-safe area. `app.config.ts` separately points `logoUrl` at the durable uploaded CDN asset, which is platform branding metadata, not the web favicon.
