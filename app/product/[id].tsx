import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/bazaaro/cards";
import { Button, C, Divider, Money, Photo, Pill, RoundAction, ScreenTitle, SectionHeading, StarRating } from "@/components/bazaaro/ui";
import { STORES } from "@/lib/bazaaro/fixtures";
import { useBazaaro } from "@/lib/bazaaro/state";
import { formatINR, waLink } from "@/lib/bazaaro/utils";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, storefront, favouriteIds, toggleFavourite, addToCart, trackProductInterest } = useBazaaro();
  const product = products.find((item) => item.id === id && item.status === "active");
  const isCounted = useRef(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { if (product && !isCounted.current) { trackProductInterest(product.id); isCounted.current = true; } }, [product, trackProductInterest]);

  if (!product) return <SafeAreaView style={styles.safe}><View style={styles.notFound}><Text style={styles.notFoundTitle}>This little find has moved on.</Text><Button title="Back to discovering" onPress={() => router.replace("/(tabs)" as any)} /></View></SafeAreaView>;

  const store = product.shopSlug === storefront.slug ? storefront : STORES.find((item) => item.slug === product.shopSlug) ?? storefront;
  const saved = favouriteIds.includes(product.id);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id && item.status === "active").slice(0, 2);
  const onAdd = () => { const ok = addToCart(product.id); setNotice(ok ? "Added to your basket." : "This one is sold out just now."); setTimeout(() => setNotice(""), 2300); };
  const contactMaker = () => {
    if (!store.whatsapp) { setNotice("This sample maker hasn't added a WhatsApp number yet."); setTimeout(() => setNotice(""), 2300); return; }
    Linking.openURL(waLink(store.whatsapp, `Hello ${store.name}, I'd like to ask about ${product.name}.`)).catch(() => { setNotice("WhatsApp is not available on this device."); setTimeout(() => setNotice(""), 2300); });
  };
  const share = () => Share.share({ title: product.name, message: `${product.name} · ${formatINR(product.price)} · ${store.name}` });

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.topline}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={19} color={C.ink} /></Pressable><View style={{ flex: 1 }}><Text style={styles.toplineLabel}>A FIND FROM {store.city.toUpperCase()}</Text><Text style={styles.toplineTitle}>Made close by</Text></View><View style={{ flexDirection: "row", gap: 7 }}><RoundAction icon="share-social-outline" label="Share product" onPress={share} /><RoundAction icon="heart-outline" label="Save product" onPress={() => toggleFavourite(product.id)} /></View></View>
        <View style={styles.heroPhoto}><Photo imageKey={product.imageKey} style={styles.productImage} /><View style={styles.productSeal}><Pill title={product.stock > 0 ? "MADE IN SMALL BATCHES" : "SOLD OUT"} tone={product.stock > 0 ? "yellow" : "red"} /></View></View>
        <View style={styles.productInfo}>
          <View style={styles.ratingLine}><View style={styles.makerChip}><Ionicons name="storefront-outline" size={13} color={C.vermilion} /><Text style={styles.makerChipText}>{store.name}</Text></View><StarRating value={store.rating} /></View>
          <View style={{ alignSelf: "flex-start", marginTop: 9 }}><Pill title="Illustrative sample listing" tone="yellow" /></View>
          <Text style={styles.productTitle}>{product.name}</Text>
          <View style={styles.priceLine}><Money amount={product.price} size={25} /><Text style={styles.unit}>per {product.unit}</Text></View>
          <Text style={styles.productDescription}>{product.description}</Text>
          {product.variant ? <View style={styles.variantRow}><Text style={styles.variantLabel}>THE DETAIL</Text><Pill title={product.variant} tone="clay" /></View> : null}
          <View style={styles.stockNote}><Ionicons name={product.stock ? "sparkles-outline" : "time-outline"} size={17} color={product.stock ? C.leaf : C.vermilion} /><Text style={[styles.stockText, !product.stock && { color: C.vermilion }]}>{product.stock ? `Only ${product.stock} ready in this batch` : "This batch is all spoken for. Ask the maker."}</Text></View>

          <View style={styles.makerCard}>
            <View style={styles.makerIcon}><Ionicons name="person-outline" size={20} color={C.vermilion} /></View>
            <View style={{ flex: 1 }}><Text style={styles.makerLabel}>THE PERSON BEHIND IT</Text><Text style={styles.makerName}>{store.ownerName}</Text><Text style={styles.makerLocation}><Ionicons name="location-outline" size={12} color={C.muted} /> {store.city}, {store.state}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Visit ${store.name}`} onPress={() => router.push({ pathname: "/store/[slug]", params: { slug: store.slug } } as any)} style={styles.visit}><Ionicons name="arrow-forward" size={17} color={C.vermilion} /></Pressable>
          </View>

          <View style={styles.detailRows}><DetailRow icon="cube-outline" title="Made in small batches" body="Stock reflects what the maker has ready today." /><DetailRow icon="chatbubble-ellipses-outline" title="Questions are welcome" body="Talk directly to the person who made it." /><DetailRow icon="shield-checkmark-outline" title="Clear local terms" body={store.policy} /></View>
          <View style={styles.actionRow}><Button title={product.stock ? "Add to basket" : "Ask when it's back"} icon={product.stock ? "bag-add-outline" : "chatbubble-ellipses-outline"} onPress={product.stock ? onAdd : contactMaker} style={{ flex: 1 }} /><Pressable accessibilityRole="button" accessibilityLabel="Message the maker on WhatsApp" onPress={contactMaker} style={styles.waButton}><Ionicons name="logo-whatsapp" size={21} color={C.leaf} /></Pressable></View>
          <Text style={styles.paymentNote}>No payment is collected in this demo. Choose delivery or pickup at checkout, then coordinate directly with the maker.</Text>
        </View>
        {!!related.length && <View style={{ marginTop: 7 }}><SectionHeading eyebrow="IN THE SAME LEDGER" title="A few more like this" /><View style={styles.relatedGrid}>{related.map((item) => <ProductCard key={item.id} product={item} onAdded={() => {}} />)}</View></View>}
      </ScrollView>
      {!!notice && <View accessibilityLiveRegion="polite" style={styles.toast}><Ionicons name="checkmark-circle" size={17} color={C.saffron} /><Text style={styles.toastText}>{notice}</Text></View>}
    </SafeAreaView>
  );
}

function DetailRow({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return <View style={styles.detailRow}><View style={styles.detailIcon}><Ionicons name={icon} size={17} color={C.vermilion} /></View><View style={{ flex: 1 }}><Text style={styles.detailTitle}>{title}</Text><Text style={styles.detailBody}>{body}</Text></View></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },
  topline: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 14 },
  back: { width: 40, height: 40, borderRadius: 15, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  toplineLabel: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1.1 },
  toplineTitle: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 16, lineHeight: 20 },
  heroPhoto: { height: 300, borderRadius: 22, overflow: "hidden", backgroundColor: C.clay, position: "relative" },
  productImage: { width: "100%", height: "100%" },
  productSeal: { position: "absolute", bottom: 11, left: 11 },
  productInfo: { paddingTop: 15 },
  ratingLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  makerChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.roseLight, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  makerChipText: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 12 },
  productTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 28, lineHeight: 33, marginTop: 9 },
  priceLine: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 },
  unit: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 13 },
  productDescription: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 15, lineHeight: 22, marginTop: 8 },
  variantRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 11 },
  variantLabel: { color: C.muted, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1 },
  stockNote: { flexDirection: "row", alignItems: "center", gap: 7, padding: 10, backgroundColor: C.leafLight, borderRadius: 12, marginTop: 12 },
  stockText: { color: C.leaf, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  makerCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 12, marginTop: 13 },
  makerIcon: { width: 41, height: 41, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: C.goldLight },
  makerLabel: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1.1 },
  makerName: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 15, lineHeight: 18 },
  makerLocation: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, marginTop: 2 },
  visit: { width: 35, height: 35, borderRadius: 12, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center" },
  detailRows: { marginTop: 9 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 9, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.line },
  detailIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  detailTitle: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  detailBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 16 },
  actionRow: { flexDirection: "row", gap: 9, marginTop: 14 },
  waButton: { width: 50, borderRadius: 15, backgroundColor: C.leafLight, alignItems: "center", justifyContent: "center" },
  paymentNote: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, textAlign: "center", lineHeight: 15, marginTop: 8 },
  relatedGrid: { flexDirection: "row", justifyContent: "space-between" },
  toast: { position: "absolute", bottom: 18, left: 20, right: 20, minHeight: 45, maxWidth: 450, alignSelf: "center", borderRadius: 14, backgroundColor: C.ink, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  toastText: { color: C.white, fontFamily: "Hind_500Medium", fontSize: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 10 },
  notFoundTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 20 },
});
