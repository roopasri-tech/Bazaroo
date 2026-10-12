# Vercel and Render deployment

## What these deployments contain

This configuration deploys the **Expo Web static frontend** (`dist/`) on either Vercel or Render. The product-detail and storefront route rules send `/product/*` and `/store/*` back to the web app so Expo Router can render the deep link. `vercel.json` and `render.yaml` are checked into the project.

Both hosts receive the same local-first demo. AsyncStorage persists separately in each visitor's own browser/device: changes are **not** shared among vendors and customers. The initialized Express/tRPC API, OAuth and Drizzle/MySQL starter do not become a live production backend by publishing this static site. No database, OAuth service, payment provider, image upload, WhatsApp messaging service or delivery provider has been connected. Do not put live customers/orders through the demo. A production multi-user release needs an explicitly provisioned and secured API, reachable database, authentication, migration/back-up policy, privacy controls and fulfilment/payment decisions.

## Deploy the web app on Vercel

1. Push the source ZIP contents to a GitHub repository you own (see the root [README](../README.md)).
2. Import that repository in the Vercel dashboard.
3. Keep the checked-in `vercel.json` settings: install with Corepack/pnpm, build with `pnpm web:build`, publish `dist/`, and retain the product/storefront rewrites.
4. Deploy. Vercel assigns the HTTPS address; test `/`, `/product/p-scarf`, and `/store/mitti-more` on that host.

The same build can be verified locally with:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm web:build
```

## Deploy the web app on Render

1. Connect the GitHub repository as a Render **Static Site** or use Render's Blueprint import for the checked-in `render.yaml`.
2. Review the Blueprint before creating the service: the sole service is a static site named `bazaaro-mobile-web`, publishes `dist/`, and rebuilds the frontend. It does not create a paid database or backend service.
3. Deploy and test `/`, `/product/p-scarf`, and `/store/mitti-more`.

The Render service definition keeps the build and static route rewrites in source control. Changes to the GitHub default branch can rebuild either hosted copy, depending on the deployment integration you authorize.

## Expo-native testing

The ZIP also runs as an Expo Android/iOS app from Expo Go (`pnpm dev:mobile`). Vercel and Render configurations in this project deploy the companion Web export, not a signed APK/AAB or App Store submission. Native release builds use the managed Expo project's build flow.

## No supplied host credentials

No GitHub, Render or Vercel account credential is stored in this ZIP. Those platform accounts choose the repository, access scope and public URL. Only claim a push/deployment after the relevant service confirms success.

Official references: [Expo publishing websites](https://docs.expo.dev/guides/publishing-websites/), [Render Blueprint spec](https://render.com/docs/blueprint-spec), [Vercel rewrites](https://vercel.com/docs/routing/rewrites), [Vercel project configuration](https://vercel.com/docs/project-configuration).
