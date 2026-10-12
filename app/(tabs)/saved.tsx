import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductCard } from "@/components/bazaaro/cards";
import { BrandHeader, Button, C, RoundAction, ScreenTitle } from "@/components/bazaaro/ui";
import { useBazaaro } from "@/lib/bazaaro/state";

export default function SavedScreen() {
  const { products, favouriteIds, cartCount, language } = useBazaaro();
  const [notice, setNotice] = useState("");
  const saved = products.filter((product) => favouriteIds.includes(product.id));
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <BrandHeader right={<RoundAction icon="bag-handle-outline" label="Open basket" badge={cartCount} onPress={() => router.push("/(tabs)/cart" as any)} />} />
        <ScreenTitle title={language === "hi" ? "आपकी पसंद" : "Kept close"} subtitle={language === "hi" ? "आपके सहेजे हुए स्थानीय ख़ज़ाने।" : "Your saved local finds, all in one little list."} />
        {saved.length ? <View style={styles.grid}>{saved.map((product) => <ProductCard key={product.id} product={product} onAdded={() => { setNotice("Added to your basket."); setTimeout(() => setNotice(""), 2000); }} />)}</View> : (
          <View style={styles.empty}>
            <View style={styles.heart}><Ionicons name="heart-outline" size={27} color={C.vermilion} /></View>
            <Text style={styles.emptyTitle}>Nothing pinned here yet.</Text>
            <Text style={styles.emptyBody}>Tap the little heart on any product to save a find for another day.</Text>
            <Button title="Find something lovely" onPress={() => router.push("/(tabs)" as any)} style={{ marginTop: 16 }} />
          </View>
        )}
      </ScrollView>
      {!!notice && <View style={styles.toast}><Text style={styles.toastText}>{notice}</Text></View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { width: "100%", maxWidth: 920, alignSelf: "center", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 30 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  empty: { marginTop: 18, padding: 24, alignItems: "center", backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 22 },
  heart: { width: 58, height: 58, borderRadius: 19, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 19, marginTop: 12 },
  emptyBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 14, textAlign: "center", marginTop: 3, lineHeight: 20 },
  toast: { position: "absolute", bottom: 15, alignSelf: "center", backgroundColor: C.ink, borderRadius: 15, paddingHorizontal: 16, paddingVertical: 12 },
  toastText: { color: C.white, fontFamily: "Hind_500Medium", fontSize: 14 },
});
