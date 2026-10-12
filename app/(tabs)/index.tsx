import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard, ShopCard } from "@/components/bazaaro/cards";
import { BrandHeader, BrandMark, C, Chip, Photo, RoundAction, SectionHeading } from "@/components/bazaaro/ui";
import { useBazaaro } from "@/lib/bazaaro/state";
import { STORES } from "@/lib/bazaaro/fixtures";
import type { Product } from "@/lib/bazaaro/types";

const CATEGORY_FILTERS = [
  { name: "Everything", icon: "sparkles-outline" as const },
  { name: "Home & living", icon: "home-outline" as const },
  { name: "Textiles", icon: "color-palette-outline" as const },
  { name: "Pottery", icon: "cafe-outline" as const },
  { name: "Pantry", icon: "leaf-outline" as const },
  { name: "Accessories", icon: "bag-outline" as const },
];

export default function DiscoverScreen() {
  const { products, storefront, cartCount, language, addToCart } = useBazaaro();
  const discoverStores = useMemo(() => [storefront, ...STORES.filter((store) => store.slug !== storefront.slug)], [storefront]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Everything");
  const [location, setLocation] = useState("Jaipur");
  const activeLocation = location === "All India" ? location : storefront.city;
  const [notice, setNotice] = useState("");
  const t = language === "hi"
    ? { greeting: "नमस्ते", sub: "आपके शहर के पास से, दिल से बना।", local: "आपके आसपास", made: "हाथों से, पास ही बना", makers: "कारीगरों से मिलें", picks: "आज की खास खोज", shop: "दुकान खोलें" }
    : { greeting: "Good morning", sub: "Made close by, found by you.", local: "NEAR YOU · {city}", made: "A good little find", makers: "Meet the makers", picks: "Something lovely, made nearby", shop: "Run your shop" };

  const visibleProducts = useMemo(() => products.filter((product) => {
    const search = query.trim().toLowerCase();
    const shop = discoverStores.find((item) => item.slug === product.shopSlug);
    const matchSearch = !search || `${product.name} ${product.category} ${shop?.name ?? ""} ${shop?.city ?? ""}`.toLowerCase().includes(search);
    const matchCategory = category === "Everything" || product.category === category;
    const matchLocation = activeLocation === "All India" || shop?.city === activeLocation;
    return matchSearch && matchCategory && matchLocation && product.status === "active";
  }), [products, query, category, activeLocation, discoverStores]);

  const notifyAdded = (ok: boolean) => {
    setNotice(ok ? "A lovely find is in your basket." : "That find is no longer available.");
    setTimeout(() => setNotice(""), 2400);
  };
  const openShop = () => router.push({ pathname: "/store/[slug]", params: { slug: storefront.slug } } as any);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <BrandHeader right={<View style={styles.headerRight}>
          <Pressable onPress={() => setLocation((current) => current === "All India" ? storefront.city : "All India")} style={styles.locationButton} accessibilityRole="button" accessibilityLabel={`Choose location, currently ${activeLocation}`}>
            <Ionicons name="location-outline" size={16} color={C.vermilion} />
            <Text style={styles.locationText}>{activeLocation}</Text>
            <Ionicons name="chevron-down" size={14} color={C.muted} />
          </Pressable>
          <RoundAction icon="bag-handle-outline" label="Open basket" badge={cartCount} onPress={() => router.push("/(tabs)/cart" as any)} />
        </View>} />

        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t.greeting}, {storefront.city} <Text style={styles.greetingMark}>✳</Text></Text>
            <Text style={styles.greetingSub}>{t.sub}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t.shop} onPress={() => router.push("/(tabs)/shop" as any)} style={styles.miniStore}>
            <BrandMark size={37} />
          </Pressable>
        </View>

        <View style={styles.sampleRibbon}>
          <Ionicons name="information-circle-outline" size={16} color={C.leaf} />
          <Text style={styles.sampleRibbonText}>{language === "hi" ? "नमूना बाज़ार · यहाँ कोई लाइव दुकान या ऑर्डर नहीं है" : "Sample market · no live sellers or customer orders"}</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={C.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder={language === "hi" ? "दुकान या चीज़ खोजें" : "Find a shop, a craft, a craving…"} placeholderTextColor="#9A9185" style={styles.searchInput} returnKeyType="search" accessibilityLabel="Search shops, products and places" />
          <View style={styles.searchStamp}><Ionicons name="options-outline" size={17} color={C.vermilion} /></View>
        </View>

        <View style={styles.hero}>
          <Photo imageKey="market" style={styles.heroImage} />
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>THE NEIGHBOURHOOD EDIT</Text>
            <Text style={styles.heroTitle}>A little more{ "\n" }local. A lot more{ "\n" }lovely.</Text>
            <Pressable accessibilityRole="button" onPress={openShop} style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Shop the edit</Text><Ionicons name="arrow-forward" size={15} color={C.ink} />
            </Pressable>
          </View>
          <View style={styles.heroSeal}><Text style={styles.heroSealText}>MADE{ "\n" }NEARBY</Text><Ionicons name="sparkles" size={13} color={C.vermilion} /></View>
        </View>

        <SectionHeading eyebrow={t.local.replace("{city}", activeLocation.toUpperCase())} title={language === "hi" ? "मन से चुनें" : "Browse by mood"} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORY_FILTERS.map((item) => <Chip key={item.name} label={item.name === "Everything" && language === "hi" ? "सब" : item.name} icon={item.icon} active={category === item.name} onPress={() => setCategory(item.name)} />)}
        </ScrollView>

        <SectionHeading eyebrow="INDEPENDENT BY NATURE" title={t.makers} action="View all" onAction={() => setLocation("All India")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shopRail}>
          {discoverStores.map((store) => <ShopCard key={store.id} store={store} />)}
        </ScrollView>

        <View style={styles.productHeading}><SectionHeading eyebrow="THE GOOD STUFF" title={t.picks} action="Clear" onAction={() => { setQuery(""); setCategory("Everything"); setLocation(storefront.city); }} /></View>
        {visibleProducts.length ? (
          <View style={styles.productGrid}>{visibleProducts.map((product: Product) => <ProductCard key={product.id} product={product} onAdded={notifyAdded} />)}</View>
        ) : (
          <View style={styles.emptyBox}><Ionicons name="search-outline" size={26} color={C.vermilion} /><Text style={styles.emptyTitle}>No finds just yet.</Text><Text style={styles.emptyBody}>Try a different maker, category or location.</Text></View>
        )}

        <Pressable onPress={() => router.push("/(tabs)/profile" as any)} style={styles.merchantInvite}>
          <View style={styles.inviteSeal}><Ionicons name="storefront-outline" size={23} color={C.vermilion} /></View>
          <View style={{ flex: 1 }}><Text style={styles.inviteTitle}>Have a shop of your own?</Text><Text style={styles.inviteBody}>Make your corner of the internet feel like yours.</Text></View>
          <Ionicons name="arrow-forward" size={18} color={C.vermilion} />
        </Pressable>
        <Text style={styles.demoNote}>A sample marketplace · Your shop, your customers, your terms.</Text>
      </ScrollView>
      {!!notice && <View accessibilityLiveRegion="polite" style={styles.toast}><Ionicons name="checkmark-circle" size={17} color={C.white} /><Text style={styles.toastText}>{notice}</Text></View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30, maxWidth: 920, width: "100%", alignSelf: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationButton: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 38, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 20, paddingHorizontal: 10 },
  locationText: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  greetingRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  greeting: { fontFamily: "Hind_700Bold", color: C.ink, fontSize: 25, lineHeight: 31 },
  greetingMark: { color: C.vermilion, fontSize: 20 },
  greetingSub: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 14, marginTop: 1 },
  sampleRibbon: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: C.leafLight, marginBottom: 12 },
  sampleRibbonText: { color: C.leaf, fontFamily: "Hind_500Medium", fontSize: 11, flex: 1 },
  miniStore: { width: 47, height: 47, borderRadius: 16, backgroundColor: C.goldLight, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EEDDAD" },
  searchBox: { minHeight: 52, borderRadius: 17, paddingHorizontal: 14, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  searchInput: { flex: 1, height: 48, color: C.ink, fontFamily: "Hind_400Regular", fontSize: 15, padding: 0, outlineStyle: "none" as any },
  searchStamp: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center" },
  hero: { height: 205, borderRadius: 23, overflow: "hidden", backgroundColor: C.vermilionDark, marginBottom: 25 },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(28,21,18,0.33)" },
  heroCopy: { padding: 19, paddingTop: 20, width: "78%" },
  heroEyebrow: { color: "#FFF3D6", fontFamily: "Hind_700Bold", fontSize: 10, letterSpacing: 1.6 },
  heroTitle: { color: C.white, fontFamily: "Hind_700Bold", fontSize: 30, lineHeight: 31, marginTop: 7 },
  heroCta: { marginTop: 11, alignSelf: "flex-start", backgroundColor: C.saffron, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 13, minHeight: 37, paddingHorizontal: 13 },
  heroCtaText: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 14 },
  heroSeal: { position: "absolute", right: 13, top: 14, borderRadius: 999, width: 51, height: 51, backgroundColor: C.goldLight, alignItems: "center", justifyContent: "center", transform: [{ rotate: "7deg" }] },
  heroSealText: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 8, lineHeight: 9, textAlign: "center" },
  chips: { gap: 8, paddingBottom: 21, marginTop: -2 },
  shopRail: { gap: 12, paddingHorizontal: 1, paddingBottom: 20 },
  productHeading: { marginTop: 1 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  emptyBox: { padding: 24, borderRadius: 18, backgroundColor: C.white, alignItems: "center", borderWidth: 1, borderColor: C.line },
  emptyTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 17, marginTop: 9 },
  emptyBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 13, textAlign: "center", marginTop: 2 },
  merchantInvite: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.clay, borderRadius: 19, padding: 14, marginTop: 6 },
  inviteSeal: { width: 43, height: 43, borderRadius: 15, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  inviteTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 16 },
  inviteBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 16 },
  demoNote: { color: C.muted, textAlign: "center", fontFamily: "Hind_400Regular", fontSize: 11, marginTop: 16 },
  toast: { position: "absolute", bottom: 11, left: 20, right: 20, alignSelf: "center", maxWidth: 480, minHeight: 46, borderRadius: 15, backgroundColor: C.ink, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 14 },
  toastText: { color: C.white, fontFamily: "Hind_500Medium", fontSize: 14 },
});
