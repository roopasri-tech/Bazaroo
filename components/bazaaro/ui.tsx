import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";

import { ARTWORK } from "@/lib/bazaaro/fixtures";
import type { ImageKey } from "@/lib/bazaaro/types";

export const C = {
  vermilion: "#A63D24",
  vermilionDark: "#7C2E1B",
  saffron: "#F2C14E",
  paper: "#FBF7EF",
  white: "#FFFFFF",
  ink: "#292621",
  muted: "#777167",
  line: "#EAE2D5",
  clay: "#F3E5D7",
  leaf: "#315C45",
  leafLight: "#E5EEE7",
  goldLight: "#FFF3CC",
  roseLight: "#F9E9E4",
  surface: "#FFFDF9",
};

export const SHADOW = {
  shadowColor: "#4B301B",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 2,
};

const GENERATED_ART: Record<ImageKey, string> = {
  market: "/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-2.webp",
  scarf: "/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-3.webp",
  diya: "/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-4.webp",
  spices: "/manus-storage/async-images/8ftDmORLASil8W4vUfKnbk/image-5.webp",
  cups: "/manus-storage/async-images/Cf0XRAxoPyTjAKxd8I6moY/image-1.webp",
  tote: "/manus-storage/async-images/Cf0XRAxoPyTjAKxd8I6moY/image-2.webp",
  pickle: "/manus-storage/async-images/Cf0XRAxoPyTjAKxd8I6moY/image-3.webp",
};

const isManagedPreview = () => typeof window !== "undefined" && window.location.hostname.endsWith(".manus.computer");

export function BrandMark({ size = 38 }: { size?: number }) {
  return <Image accessibilityLabel="Bazaaro market-stall and sun mark" source={require("../../assets/images/icon.png")} style={[styles.mark, { width: size, height: size, borderRadius: size * 0.32 }]} contentFit="cover" />;
}

export function BrandName({ compact = false }: { compact?: boolean }) {
  return (
    <View>
      <Text style={styles.brand}>Bazaaro</Text>
      {!compact && <Text style={styles.brandLine}>LOCAL · MADE WITH CARE</Text>}
    </View>
  );
}

export function BrandHeader({ right }: { right?: React.ReactNode }) {
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandRow}>
        <BrandMark />
        <View style={{ marginLeft: 10 }}>
          <BrandName />
        </View>
      </View>
      {right}
    </View>
  );
}

export function Photo({ imageKey, style, contentFit = "cover" }: {
  imageKey: ImageKey;
  style: any;
  contentFit?: "cover" | "contain" | "fill";
}) {
  const [fallback, setFallback] = useState(false);
  const useProjectArtwork = isManagedPreview() && !fallback;
  useEffect(() => setFallback(false), [imageKey]);
  const source = useProjectArtwork
    ? { uri: GENERATED_ART[imageKey] }
    : ARTWORK[imageKey] as ImageSourcePropType;
  return <Image source={source} style={style} contentFit={contentFit} cachePolicy="memory-disk" transition={160} onError={() => { if (useProjectArtwork) setFallback(true); }} />;
}

export function RoundAction({ icon, onPress, label, badge }: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.roundAction, pressed && { transform: [{ scale: 0.94 }] }]}>
      <Ionicons name={icon} size={20} color={C.ink} />
      {!!badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text></View>}
    </Pressable>
  );
}

export function Button({ title, onPress, variant = "primary", icon, disabled = false, style }: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "dark";
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: any;
}) {
  const colors = variant === "primary"
    ? { bg: C.vermilion, fg: C.white, border: C.vermilion }
    : variant === "dark"
      ? { bg: C.ink, fg: C.white, border: C.ink }
      : variant === "secondary"
        ? { bg: C.goldLight, fg: C.ink, border: C.goldLight }
        : { bg: "transparent", fg: C.vermilion, border: "transparent" };
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: colors.bg, borderColor: colors.border, opacity: disabled ? 0.46 : pressed ? 0.86 : 1 }, style]}>
      {icon ? <Ionicons name={icon} size={18} color={colors.fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.buttonText, { color: colors.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? C.white : C.muted} style={{ marginRight: 5 }} /> : null}
      <Text style={[styles.chipText, active && { color: C.white }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionHeading({ eyebrow, title, action, onAction }: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHead}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && onAction ? <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10}><Text style={styles.actionText}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function Pill({ title, tone = "clay", icon }: {
  title: string;
  tone?: "clay" | "green" | "yellow" | "red" | "paper";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const palette = {
    clay: [C.clay, C.vermilion], green: [C.leafLight, C.leaf], yellow: [C.goldLight, C.vermilionDark], red: [C.roseLight, C.vermilion], paper: [C.paper, C.muted],
  } as const;
  const [bg, fg] = palette[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={13} color={fg} style={{ marginRight: 5 }} /> : null}
      <Text style={[styles.pillText, { color: fg }]}>{title}</Text>
    </View>
  );
}

export function Money({ amount, size = 17, muted = false }: { amount: number; size?: number; muted?: boolean }) {
  const label = `₹${Math.round(amount).toLocaleString("en-IN")}`;
  return <Text style={{ color: muted ? C.muted : C.ink, fontSize: size, fontFamily: "Hind_600SemiBold", includeFontPadding: false }}>{label}</Text>;
}

export function ScreenTitle({ title, subtitle, back = false, right }: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenTitle}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        {back && <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={20} color={C.ink} /></Pressable>}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

export function Divider() { return <View style={styles.divider} />; }

export function LoadingView() {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.paper }}><ActivityIndicator color={C.vermilion} /></View>;
}

export function StarRating({ value }: { value: number }) {
  return <View style={{ flexDirection: "row", alignItems: "center" }}><Ionicons name="star" size={13} color="#D39113" /><Text style={styles.rating}>{value.toFixed(1)}</Text></View>;
}

const styles = StyleSheet.create({
  mark: { backgroundColor: C.vermilion, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  markSun: { position: "absolute", top: "13%", width: "21%", height: "21%", borderRadius: 30, backgroundColor: C.saffron },
  brandHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brand: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 24, lineHeight: 27 },
  brandLine: { color: C.muted, fontFamily: "Hind_500Medium", fontSize: 8, letterSpacing: 1.45, marginTop: -1 },
  roundAction: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  badge: { position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, paddingHorizontal: 3, borderRadius: 9, backgroundColor: C.vermilion, alignItems: "center", justifyContent: "center" },
  badgeText: { color: C.white, fontFamily: "Hind_700Bold", fontSize: 10, lineHeight: 12 },
  button: { minHeight: 48, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  buttonText: { fontFamily: "Hind_600SemiBold", fontSize: 16 },
  chip: { minHeight: 38, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  chipActive: { backgroundColor: C.vermilion, borderColor: C.vermilion },
  chipText: { color: C.ink, fontFamily: "Hind_500Medium", fontSize: 14 },
  sectionHead: { flexDirection: "row", alignItems: "flex-end", marginBottom: 14, gap: 12 },
  eyebrow: { fontFamily: "Hind_600SemiBold", color: C.vermilion, letterSpacing: 1.3, fontSize: 10, marginBottom: 2 },
  sectionTitle: { fontFamily: "Hind_700Bold", color: C.ink, fontSize: 23, lineHeight: 27 },
  actionText: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 14, marginBottom: 3 },
  pill: { minHeight: 27, borderRadius: 9, paddingHorizontal: 9, alignItems: "center", justifyContent: "center", flexDirection: "row", alignSelf: "flex-start" },
  pillText: { fontFamily: "Hind_600SemiBold", fontSize: 12, lineHeight: 15 },
  screenTitle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 },
  title: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 28, lineHeight: 32 },
  subtitle: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 14, marginTop: 3 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center", marginRight: 10 },
  divider: { height: 1, backgroundColor: C.line, marginVertical: 14 },
  rating: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13, marginLeft: 4 },
});
