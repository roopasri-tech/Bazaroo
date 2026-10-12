import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/bazaaro/cards";
import { Button, C, Photo, RoundAction, SectionHeading, StarRating } from "@/components/bazaaro/ui";
import { STORES } from "@/lib/bazaaro/fixtures";
import { useBazaaro } from "@/lib/bazaaro/state";
import { formatINR, waLink } from "@/lib/bazaaro/utils";
import type { Storefront } from "@/lib/bazaaro/types";

export default function StorefrontScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { products, storefront, trackStoreVisit } = useBazaaro();
  const [notice, setNotice] = useState("");
  const counted = useRef(false);
  const stores: Storefront[] = [storefront, ...STORES.filter((store) => store.slug !== storefront.slug)];
  const shop = stores.find((store) => store.slug === slug);
  useEffect(() => { if (shop && !counted.current) { trackStoreVisit(shop.slug); counted.current = true; } }, [shop, trackStoreVisit]);

  if (!shop) return <SafeAreaView style={styles.safe}><View style={styles.notFound}><Text style={styles.notFoundTitle}>That storefront isn't here yet.</Text><Button title="Back to the market" onPress={() => router.replace("/(tabs)" as any)} /></View></SafeAreaView>;
  const shopProducts = products.filter((product) => product.shopSlug === shop.slug && product.status === "active");
  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/store/${shop.slug}` : `bazaaro://store/${shop.slug}`;
    try { await Share.share({ title: shop.name, message: `${shop.name} · ${shop.description} · ${url}` }); } catch { setNotice("Shop link is ready to share."); setTimeout(() => setNotice(""), 2000); }
  };
  const contact = () => {
    if (!shop.whatsapp) { setNotice("This sample shop hasn't added a WhatsApp number yet."); setTimeout(() => setNotice(""), 2200); return; }
    Linking.openURL(waLink(shop.whatsapp, `Hello ${shop.name}, I found your shop on Bazaaro.`)).catch(() => { setNotice("WhatsApp is not available on this device."); setTimeout(() => setNotice(""), 2200); });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={19} color={C.ink} /></Pressable><View style={{ flex: 1 }}><Text style={styles.barText}>SAMPLE STOREFRONT</Text><Text style={styles.barSub}>Illustrative profile · not a live business</Text></View><RoundAction icon="share-social-outline" label="Share this shop" onPress={share} /></View>
        <View style={styles.cover}><Photo imageKey={shop.imageKey} style={styles.coverImage} /><View style={styles.coverShade} /><View style={styles.coverStamp}><Text style={styles.coverStampText}>LOCAL{ "\n" }MAKER</Text><Ionicons name="sparkles" size={12} color={C.vermilion} /></View><View style={styles.coverBadge}><Ionicons name="location" size={13} color={C.white} /><Text style={styles.coverBadgeText}>{shop.city} · {shop.pinCode}</Text></View></View>
        <View style={styles.shopIdentity}><View style={{ flex: 1 }}><View style={styles.categoryRow}><Text style={styles.category}>{shop.category.toUpperCase()}</Text><StarRating value={shop.rating} /></View><Text style={styles.shopName}>{shop.name}</Text><Text style={styles.ownerLine}>A little shop by <Text style={styles.ownerName}>{shop.ownerName}</Text></Text></View><Photo imageKey={shop.logoImageKey} style={styles.profileSeal} /></View>
        <Text style={styles.bio}>{shop.description}</Text>
        <View style={styles.metaCard}><MetaRow icon="location-outline" title="Find the shop" detail={`${shop.city}, ${shop.state} · PIN ${shop.pinCode}`} /><MetaRow icon="time-outline" title="Open for a chat" detail={shop.hours} /><MetaRow icon="cube-outline" title="How it works" detail={shop.policy} /></View>
        <View style={styles.contactRow}><Button title="Message the maker" icon="logo-whatsapp" onPress={contact} style={{ flex: 1 }} /><Pressable accessibilityRole="button" accessibilityLabel="Share storefront" onPress={share} style={styles.shareButton}><Ionicons name="share-social-outline" size={19} color={C.vermilion} /></Pressable></View>
        <SectionHeading eyebrow="RIGHT FROM THIS SHOP" title={`${shopProducts.length} thoughtful finds`} />
        {shopProducts.length ? <View style={styles.grid}>{shopProducts.map((product) => <ProductCard key={product.id} product={product} onAdded={() => { setNotice("Added to your basket."); setTimeout(() => setNotice(""), 2200); }} />)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>New finds are on their way.</Text></View>}
        <View style={styles.lastNote}><Ionicons name="heart-outline" size={16} color={C.vermilion} /><Text style={styles.lastNoteText}>Buying here keeps a relationship with the maker, not a marketplace middleman.</Text></View>
      </ScrollView>
      {!!notice && <View accessibilityLiveRegion="polite" style={styles.toast}><Text style={styles.toastText}>{notice}</Text></View>}
    </SafeAreaView>
  );
}

function MetaRow({ icon, title, detail }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string }) {
  return <View style={styles.metaRow}><View style={styles.metaIcon}><Ionicons name={icon} size={17} color={C.vermilion} /></View><View style={{ flex: 1 }}><Text style={styles.metaTitle}>{title}</Text><Text style={styles.metaDetail}>{detail}</Text></View></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },
  topbar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  back: { width: 40, height: 40, borderRadius: 15, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  barText: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 10, letterSpacing: 1.2 },
  barSub: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12 },
  cover: { height: 202, borderRadius: 22, overflow: "hidden", backgroundColor: C.clay, position: "relative" },
  coverImage: { width: "100%", height: "100%" },
  coverShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(26,20,14,.18)" },
  coverStamp: { position: "absolute", top: 12, right: 12, width: 51, height: 51, borderRadius: 26, backgroundColor: C.goldLight, alignItems: "center", justifyContent: "center", transform: [{ rotate: "7deg" }] },
  coverStampText: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 8, lineHeight: 8, textAlign: "center" },
  coverBadge: { position: "absolute", bottom: 12, left: 12, minHeight: 32, borderRadius: 12, backgroundColor: C.vermilion, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10 },
  coverBadgeText: { color: C.white, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  shopIdentity: { flexDirection: "row", alignItems: "center", marginTop: 13 },
  categoryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 1 },
  category: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1.1 },
  shopName: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 29, lineHeight: 33 },
  ownerLine: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 13 },
  ownerName: { color: C.ink, fontFamily: "Hind_600SemiBold" },
  profileSeal: { width: 51, height: 51, borderRadius: 18, backgroundColor: C.vermilion, marginLeft: 8 },
  bio: { color: C.ink, fontFamily: "Hind_400Regular", fontSize: 15, lineHeight: 22, marginTop: 9, marginBottom: 12 },
  metaCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 17, paddingHorizontal: 12, marginBottom: 12 },
  metaRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 8 },
  metaIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.roseLight },
  metaTitle: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  metaDetail: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 16 },
  contactRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  shareButton: { width: 49, borderRadius: 15, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  empty: { padding: 20, borderRadius: 16, backgroundColor: C.white, alignItems: "center" },
  emptyTitle: { color: C.muted, fontFamily: "Hind_500Medium", fontSize: 14 },
  lastNote: { flexDirection: "row", gap: 8, alignItems: "center", borderRadius: 13, backgroundColor: C.clay, padding: 11, marginTop: 4 },
  lastNoteText: { color: C.ink, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 17, flex: 1 },
  toast: { position: "absolute", left: 20, right: 20, bottom: 18, maxWidth: 450, alignSelf: "center", minHeight: 45, backgroundColor: C.ink, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  toastText: { color: C.white, fontFamily: "Hind_500Medium", fontSize: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  notFoundTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 19 },
});
