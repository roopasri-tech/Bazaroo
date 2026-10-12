import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useBazaaro } from "@/lib/bazaaro/state";
import type { Product, Storefront } from "@/lib/bazaaro/types";
import { formatINR } from "@/lib/bazaaro/utils";
import { Button, C, Photo, Pill, SHADOW, StarRating } from "./ui";

export function ProductCard({ product, onAdded }: { product: Product; onAdded?: (ok: boolean) => void }) {
  const { favouriteIds, toggleFavourite, addToCart, storefront } = useBazaaro();
  const saved = favouriteIds.includes(product.id);
  const maker = product.shopSlug === storefront.slug ? storefront.name : undefined;
  const add = () => onAdded?.(addToCart(product.id));
  return (
    <View style={styles.productCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${product.name}`} onPress={() => router.push({ pathname: "/product/[id]", params: { id: product.id } } as any)}>
        <View style={styles.productPhotoBox}>
          <Photo imageKey={product.imageKey} style={styles.productPhoto} />
          <View style={styles.photoSeal}><Text style={styles.photoSealText}>MADE CLOSE BY</Text></View>
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={saved ? "Remove from saved" : "Save this find"} onPress={() => toggleFavourite(product.id)} style={styles.heart}>
        <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color={saved ? C.vermilion : C.ink} />
      </Pressable>
      <View style={styles.productText}>
        <Text numberOfLines={1} style={styles.productName}>{product.name}</Text>
        <Text numberOfLines={1} style={styles.makerName}>{maker ?? product.category} · {product.variant ?? "Small batch"}</Text>
        <View style={styles.productFoot}>
          <Text style={styles.productPrice}>{formatINR(product.price)}</Text>
          {product.stock > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Add ${product.name} to basket`} onPress={add} style={({ pressed }) => [styles.addCircle, pressed && { transform: [{ scale: 0.92 }] }]}>
              <Ionicons name="add" size={19} color={C.white} />
            </Pressable>
          ) : <Text style={styles.soldOut}>Sold out</Text>}
        </View>
      </View>
    </View>
  );
}

export function ShopCard({ store }: { store: Storefront }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Visit ${store.name}`} onPress={() => router.push({ pathname: "/store/[slug]", params: { slug: store.slug } } as any)} style={({ pressed }) => [styles.shopCard, pressed && { opacity: 0.9 }]}>
      <Photo imageKey={store.imageKey} style={styles.shopPhoto} />
      <View style={styles.shopCopy}>
        <View style={styles.shopHeading}><Text numberOfLines={1} style={styles.shopName}>{store.name}</Text><StarRating value={store.rating} /></View>
        <Text numberOfLines={1} style={styles.shopMeta}>{store.category} · {store.city}</Text>
        <Text numberOfLines={2} style={styles.shopDescription}>{store.description}</Text>
        <Text style={styles.shopLink}>Meet the maker  <Ionicons name="arrow-forward" size={12} color={C.vermilion} /></Text>
      </View>
    </Pressable>
  );
}

export function StockLine({ product, onAdjust }: { product: Product; onAdjust: (delta: number) => void }) {
  const low = product.stock <= product.lowStockAt;
  return (
    <View style={styles.stockLine}>
      <Photo imageKey={product.imageKey} style={styles.stockPhoto} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={styles.productName}>{product.name}</Text>
        <View style={styles.stockMetaRow}>
          <Text style={[styles.stockText, low && { color: C.vermilion }]}>{product.stock === 0 ? "Out of stock" : `${product.stock} ${product.unit}s left`}</Text>
          {low && product.stock > 0 ? <Pill title="Low stock" tone="yellow" /> : null}
        </View>
      </View>
      <View style={styles.quantityTools}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Decrease stock for ${product.name}`} onPress={() => onAdjust(-1)} style={styles.quantityButton}><Ionicons name="remove" size={17} color={C.ink} /></Pressable>
        <Text style={styles.quantityValue}>{product.stock}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Increase stock for ${product.name}`} onPress={() => onAdjust(1)} style={[styles.quantityButton, styles.quantityAdd]}><Ionicons name="add" size={17} color={C.white} /></Pressable>
      </View>
    </View>
  );
}

export function OrderStatusButton({ title, onPress }: { title: string; onPress: () => void }) {
  return <Button title={title} onPress={onPress} variant="secondary" style={{ minHeight: 37, paddingHorizontal: 12, borderRadius: 12 }} />;
}

export function StatCard({ icon, label, value, note, tint = C.goldLight }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; note?: string; tint?: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}><Ionicons name={icon} size={18} color={C.vermilion} /></View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {note ? <Text style={styles.statNote}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: { width: "48.3%", borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, marginBottom: 12, overflow: "hidden", ...SHADOW },
  productPhotoBox: { height: 156, backgroundColor: C.clay, position: "relative" },
  productPhoto: { width: "100%", height: "100%" },
  photoSeal: { position: "absolute", left: 9, bottom: 9, backgroundColor: "rgba(251,247,239,.92)", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  photoSealText: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 0.8 },
  heart: { position: "absolute", top: 9, right: 9, width: 33, height: 33, borderRadius: 17, backgroundColor: "rgba(255,253,249,.94)", alignItems: "center", justifyContent: "center" },
  productText: { paddingHorizontal: 11, paddingTop: 8, paddingBottom: 10 },
  productName: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 16, lineHeight: 20 },
  makerName: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, marginTop: 1 },
  productFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  productPrice: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 18 },
  addCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.vermilion, alignItems: "center", justifyContent: "center" },
  soldOut: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 12 },
  shopCard: { width: 246, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, overflow: "hidden", ...SHADOW },
  shopPhoto: { width: "100%", height: 125 },
  shopCopy: { padding: 12 },
  shopHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  shopName: { flex: 1, color: C.ink, fontFamily: "Hind_700Bold", fontSize: 16 },
  shopMeta: { color: C.vermilion, fontFamily: "Hind_500Medium", fontSize: 12, marginTop: 2 },
  shopDescription: { minHeight: 35, color: C.muted, fontFamily: "Hind_400Regular", lineHeight: 17, fontSize: 12, marginTop: 5 },
  shopLink: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 13, marginTop: 8 },
  stockLine: { minHeight: 74, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.line, gap: 10, paddingVertical: 10 },
  stockPhoto: { width: 52, height: 54, borderRadius: 12, backgroundColor: C.clay },
  stockMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  stockText: { color: C.muted, fontFamily: "Hind_500Medium", fontSize: 12 },
  quantityTools: { flexDirection: "row", alignItems: "center", gap: 7 },
  quantityButton: { width: 30, height: 30, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: C.paper, borderWidth: 1, borderColor: C.line },
  quantityAdd: { backgroundColor: C.vermilion, borderColor: C.vermilion },
  quantityValue: { minWidth: 19, textAlign: "center", color: C.ink, fontFamily: "Hind_700Bold", fontSize: 15 },
  statCard: { flex: 1, minWidth: 142, padding: 14, backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 17 },
  statIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statValue: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 24, lineHeight: 27 },
  statLabel: { color: C.ink, fontFamily: "Hind_500Medium", fontSize: 13, marginTop: 1 },
  statNote: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, marginTop: 5 },
});
