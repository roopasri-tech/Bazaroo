import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const styles = `
html, body {
  background: #FBF7EF;
  color: #292621;
  margin: 0;
  min-height: 100%;
}
body { min-width: 320px; }
#root { min-height: 100vh; }
button, a, input, textarea { -webkit-tap-highlight-color: transparent; }
::selection { background: #F2C14E; color: #292621; }
`;

export default function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#A63D24" />
        <meta name="description" content="Discover independent Indian makers, shop locally and run a neighbourhood storefront with Bazaaro." />
        <meta property="og:title" content="Bazaaro — Local business, beautifully online" />
        <meta property="og:description" content="Find something lovely, made close by." />
        <meta property="og:type" content="website" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/bazaaro-192.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>Bazaaro — Local business, beautifully online</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
