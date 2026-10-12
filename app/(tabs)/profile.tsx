import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandHeader, Button, C, Divider, Photo, Pill, RoundAction, ScreenTitle } from "@/components/bazaaro/ui";
import { useBazaaro } from "@/lib/bazaaro/state";
import { STORES } from "@/lib/bazaaro/fixtures";
import { copy } from "@/lib/bazaaro/i18n";
import type { ImageKey, Language, ShopProfile } from "@/lib/bazaaro/types";
import { formatINR, normalizeIndianPhone, orderTone, timeAgo, waLink } from "@/lib/bazaaro/utils";

const LANGUAGES: { id: Language; name: string; native: string }[] = [
  { id: "en", name: "English", native: "English" },
  { id: "hi", name: "Hindi", native: "हिन्दी" },
];
const SHOP_ART: ImageKey[] = ["market", "scarf", "diya", "spices", "cups", "tote", "pickle"];

export default function ProfileScreen() {
  const { storefront, shopProfile, customerProfile, orders, ready, language, setLanguage, updateShop } = useBazaaro();
  const t = copy[language];
  const [draft, setDraft] = useState<ShopProfile>(shopProfile);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (ready) setDraft(shopProfile);
  }, [ready, shopProfile]);

  function set<K extends keyof ShopProfile>(field: K, value: ShopProfile[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  const save = () => {
    setError("");
    setNotice("");
    if (draft.businessName.trim().length < 2 || draft.ownerName.trim().length < 2) {
      setError("Add both your business name and the name customers know you by.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(normalizeIndianPhone(draft.phone))) {
      setError("Enter a valid 10-digit Indian mobile number (starting 6–9).");
      return;
    }
    if (draft.whatsapp.trim() && !/^[6-9]\d{9}$/.test(normalizeIndianPhone(draft.whatsapp))) {
      setError("Enter a valid 10-digit Indian WhatsApp number (starting 6–9), or leave it blank.");
      return;
    }
    if (!/^[1-9]\d{5}$/.test(draft.pinCode)) {
      setError("Your shop PIN code must be a valid 6-digit code.");
      return;
    }
    updateShop(draft);
    setSaved(true);
    setNotice("Your storefront details are saved on this device.");
    setTimeout(() => setNotice(""), 2600);
  };

  const shareShop = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/store/${storefront.slug}` : `bazaaro://store/${storefront.slug}`;
    try {
      await Share.share({ title: storefront.name, message: `Meet ${storefront.name} — ${storefront.description} ${url}` });
    } catch {
      setNotice("Share link ready on your shop page.");
    }
  };
  const call = () => {
    if (draft.phone) Linking.openURL(`tel:${draft.phone}`).catch(() => setNotice("Call link is not available on this device."));
    else setNotice("Add your shop number in Business details first.");
  };
  const contact = () => {
    if (!/^[6-9]\d{9}$/.test(normalizeIndianPhone(draft.whatsapp))) {
      setNotice("Add a valid WhatsApp number in Business details first.");
      return;
    }
    Linking.openURL(waLink(draft.whatsapp, `Hello ${storefront.name}! I found your shop on Bazaaro.`)).catch(() => setNotice("WhatsApp is not available on this device."));
  };
  const recentOrders = orders.filter((order) => order.shopSlug === storefront.slug).slice(0, 3);
  const customerOrders = customerProfile.phone
    ? orders.filter((order) => normalizeIndianPhone(order.phone) === customerProfile.phone).slice(0, 6)
    : [];

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <BrandHeader right={<RoundAction icon="share-social-outline" label="Share storefront" onPress={shareShop} />} />
        <ScreenTitle title={language === "hi" ? "आपका कोना" : "Your corner"} subtitle={language === "hi" ? "दुकान की जानकारी और आपकी पसंद।" : "A little home for your shop and your preferences."} />

        <View style={styles.profileCard}>
          <Photo imageKey={storefront.logoImageKey} style={styles.profileMark} />
          <View style={{ flex: 1 }}><Text style={styles.profileName}>{storefront.name}</Text><Text style={styles.profileMeta}>{storefront.category} · {storefront.city}</Text><Pill title={saved ? "Storefront updated" : "Your shop is taking shape"} tone="green" /></View>
          <Pressable accessibilityRole="button" accessibilityLabel="View merchant desk" onPress={() => router.push("/(tabs)/shop" as any)} style={styles.viewShop}><Ionicons name="eye-outline" size={17} color={C.vermilion} /></Pressable>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeading}><View><Text style={styles.formEyebrow}>THE PERSON BEHIND THE SHOP</Text><Text style={styles.formTitle}>Business details</Text></View><Ionicons name="receipt-outline" size={20} color={C.vermilion} /></View>
          <Field label="Business name" value={draft.businessName} onChangeText={(value: string) => set("businessName", value)} placeholder="The name on your shop sign" autoCapitalize="words" />
          <Field label="Your name" value={draft.ownerName} onChangeText={(value: string) => set("ownerName", value)} placeholder="Who customers can ask for" autoCapitalize="words" />
          <Text style={styles.label}>What you make or sell</Text>
          <View style={styles.categoryTags}>{["Home & living", "Handloom & textiles", "Pottery", "Pantry & spices", "Accessories"].map((value) => <Pressable key={value} accessibilityRole="button" onPress={() => set("category", value)} style={[styles.categoryChoice, draft.category === value && styles.categoryChoiceActive]}><Text style={[styles.categoryChoiceText, draft.category === value && { color: C.vermilion }]}>{value}</Text></Pressable>)}</View>
          <Field label="A little about your shop" value={draft.description} onChangeText={(value: string) => set("description", value)} placeholder="What makes your work yours?" multiline />
          <PhotoPicker title="Your shop-sign mark" value={draft.logoImageKey} onPick={(value) => set("logoImageKey", value)} />
          <PhotoPicker title="Your storefront cover" value={draft.coverImageKey} onPick={(value) => set("coverImageKey", value)} />
          <View style={styles.twoCol}><View style={{ flex: 1 }}><Field label="City" value={draft.city} onChangeText={(value: string) => set("city", value)} placeholder="Jaipur" /></View><View style={{ flex: 1 }}><Field label="State" value={draft.state} onChangeText={(value: string) => set("state", value)} placeholder="Rajasthan" /></View></View>
          <Field label="Shop PIN code" value={draft.pinCode} onChangeText={(value: string) => set("pinCode", value.replace(/\D/g, "").slice(0, 6))} placeholder="302004" keyboardType="number-pad" maxLength={6} />
          <View style={styles.twoCol}><View style={{ flex: 1 }}><Field label="Phone" value={draft.phone} onChangeText={(value: string) => set("phone", value)} placeholder="10-digit mobile" keyboardType="phone-pad" /></View><View style={{ flex: 1 }}><Field label="WhatsApp" value={draft.whatsapp} onChangeText={(value: string) => set("whatsapp", value)} placeholder="10-digit mobile" keyboardType="phone-pad" /></View></View>
          <Field label="Opening hours" value={draft.openingHours} onChangeText={(value: string) => set("openingHours", value)} placeholder="Mon–Sat · 10 am–7 pm" />
          <Field label="Pickup, delivery & exchange notes" value={draft.policy} onChangeText={(value: string) => set("policy", value)} placeholder="Tell customers what to expect" multiline />
          {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          <Button title={t.save} icon="checkmark" onPress={save} style={{ marginTop: 16 }} />
          <Text style={styles.localNote}>Changes are stored on this device in this demo; real public storefront sync needs a connected production database.</Text>
        </View>

        <View style={styles.languageCard}>
          <View style={styles.formHeading}><View><Text style={styles.formEyebrow}>YOUR APP, YOUR WAY</Text><Text style={styles.formTitle}>Language</Text></View><Ionicons name="language-outline" size={20} color={C.vermilion} /></View>
          <View style={styles.languageRow}>{LANGUAGES.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Set language to ${item.name}`} onPress={() => setLanguage(item.id)} style={[styles.languageChoice, language === item.id && styles.languageActive]}><Text style={[styles.languageNative, language === item.id && { color: C.vermilion }]}>{item.native}</Text><Text style={styles.languageName}>{item.name}</Text>{language === item.id ? <Ionicons name="checkmark-circle" size={16} color={C.vermilion} /> : null}</Pressable>)}</View>
          <Text style={styles.localNote}>English and Hindi navigation/actions are available. Currency, phone and PIN entry are India-ready.</Text>
        </View>

        <View style={styles.directCard}>
          <View style={{ flex: 1 }}><Text style={styles.formEyebrow}>KEEP THE RELATIONSHIP YOURS</Text><Text style={styles.directTitle}>Your customers, direct.</Text><Text style={styles.directBody}>Invite people to message you on WhatsApp or call your shop.</Text></View>
          <View style={styles.contactActions}><Pressable accessibilityRole="button" onPress={contact} style={styles.whatsApp}><Ionicons name="logo-whatsapp" size={19} color={C.white} /><Text style={styles.contactActionText}>WhatsApp</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Call your shop" onPress={call} style={styles.callButton}><Ionicons name="call-outline" size={18} color={C.vermilion} /></Pressable></View>
        </View>

        <View style={styles.historyHead}><View><Text style={styles.formEyebrow}>YOUR SIDE OF THE BASKET</Text><Text style={styles.formTitle}>Orders you placed</Text></View><Pill title={`${customerOrders.length} saved`} tone="yellow" /></View>
        <View style={styles.historyCard}>
          {customerOrders.length ? customerOrders.map((order, index) => {
            const shopName = order.shopSlug === storefront.slug
              ? storefront.name
              : STORES.find((store) => store.slug === order.shopSlug)?.name ?? "Local maker";
            return <View key={order.id}>{index > 0 && <Divider />}<View style={styles.historyRow}>
              <View style={styles.historyIcon}><Ionicons name="receipt-outline" size={17} color={C.vermilion} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.historyName}>{shopName}</Text>
                <Text style={styles.historyMeta}>{order.id} · {order.status} · {timeAgo(order.createdAt)}</Text>
                <Text numberOfLines={2} style={styles.historyDetail}>{order.items.map((item) => `${item.name} × ${item.quantity}`).join(" · ")}</Text>
                <Text numberOfLines={1} style={styles.historyDetail}>{order.fulfilment === "delivery" ? `${order.address} · ${order.pinCode}` : "Store pickup"}</Text>
              </View>
              <View style={styles.customerOrderTotal}><Text style={styles.historyPrice}>{formatINR(order.total)}</Text><Pill title={order.status} tone={orderTone(order.status)} /></View>
            </View></View>;
          }) : <Text style={styles.localNote}>Place a demo order to see the shop's updates here. This history stays on this device.</Text>}
        </View>

        <View style={[styles.historyHead, { marginTop: 20 }]}><View><Text style={styles.formEyebrow}>YOUR MERCHANT DESK</Text><Text style={styles.formTitle}>Orders my shop received</Text></View><Pill title={`${orders.filter((order) => order.shopSlug === storefront.slug).length} saved`} tone="yellow" /></View>
        <View style={styles.historyCard}>
          {recentOrders.length ? recentOrders.map((order, index) => <View key={order.id}>{index > 0 && <Divider />}<View style={styles.historyRow}><View style={styles.historyIcon}><Ionicons name="receipt-outline" size={17} color={C.vermilion} /></View><View style={{ flex: 1 }}><Text style={styles.historyName}>{order.customerName}</Text><Text style={styles.historyMeta}>{order.id} · {order.status} · {timeAgo(order.createdAt)}</Text></View><Text style={styles.historyPrice}>{formatINR(order.total)}</Text></View></View>) : <Text style={styles.localNote}>New customer orders will appear here.</Text>}
        </View>
        <Text style={styles.footerText}>Bazaaro · for the hands behind the handiwork.</Text>
      </ScrollView>
      {!!notice && <View accessibilityLiveRegion="polite" style={styles.toast}><Ionicons name="checkmark-circle" size={17} color={C.saffron} /><Text style={styles.toastText}>{notice}</Text></View>}
    </SafeAreaView>
  );
}

function PhotoPicker({ title, value, onPick }: { title: string; value: ImageKey; onPick: (key: ImageKey) => void }) {
  return (
    <View style={styles.mediaSection}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.mediaHint}>Choose from the included photo set for this demo.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRail}>
        {SHOP_ART.map((key) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Use ${key} as ${title.toLowerCase()}`} accessibilityState={{ selected: value === key }} onPress={() => onPick(key)} style={[styles.mediaOption, value === key && styles.mediaOptionSelected]}><Photo imageKey={key} style={styles.mediaImage} />{value === key && <View style={styles.mediaCheck}><Ionicons name="checkmark" size={12} color={C.white} /></View>}</Pressable>)}
      </ScrollView>
    </View>
  );
}

function Field({ label, ...props }: any) {
  return <View style={{ marginTop: 12 }}><Text style={styles.label}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor="#A59C8E" style={[styles.input, props.multiline && { minHeight: 76, textAlignVertical: "top" }]} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 32 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 17, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 13, marginBottom: 15 },
  profileMark: { width: 49, height: 49, borderRadius: 17, backgroundColor: C.vermilion },
  profileName: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 17 },
  profileMeta: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, marginTop: -2, marginBottom: 5 },
  viewShop: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center" },
  formCard: { borderRadius: 19, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 14 },
  formHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
  formEyebrow: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1.2 },
  formTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 20, lineHeight: 25 },
  label: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13, marginBottom: 5 },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 12, paddingTop: 9, color: C.ink, fontFamily: "Hind_400Regular", fontSize: 15, outlineStyle: "none" as any },
  twoCol: { flexDirection: "row", gap: 10 },
  categoryTags: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  categoryChoice: { minHeight: 33, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  categoryChoiceActive: { borderColor: C.saffron, backgroundColor: C.goldLight },
  categoryChoiceText: { color: C.muted, fontFamily: "Hind_500Medium", fontSize: 12 },
  mediaSection: { marginTop: 14 },
  mediaHint: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, marginTop: -3, marginBottom: 7 },
  mediaRail: { gap: 7, paddingBottom: 2 },
  mediaOption: { width: 58, height: 62, borderRadius: 13, padding: 3, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
  mediaOptionSelected: { borderColor: C.vermilion, backgroundColor: C.roseLight },
  mediaImage: { width: "100%", height: "100%", borderRadius: 8 },
  mediaCheck: { position: "absolute", right: 5, bottom: 5, width: 17, height: 17, borderRadius: 9, backgroundColor: C.vermilion, alignItems: "center", justifyContent: "center" },
  error: { color: C.vermilion, fontFamily: "Hind_600SemiBold", marginTop: 9, fontSize: 13 },
  localNote: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, lineHeight: 15, marginTop: 9 },
  languageCard: { borderRadius: 19, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 14 },
  languageRow: { flexDirection: "row", gap: 9, marginTop: 8 },
  languageChoice: { flex: 1, minHeight: 77, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.paper, alignItems: "center", justifyContent: "center", gap: 2 },
  languageActive: { borderColor: C.saffron, backgroundColor: C.goldLight },
  languageNative: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 18 },
  languageName: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11 },
  directCard: { borderRadius: 19, backgroundColor: C.clay, padding: 15, marginBottom: 18 },
  directTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 18 },
  directBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 13, lineHeight: 18, marginTop: 1, maxWidth: 350 },
  contactActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  whatsApp: { flex: 1, minHeight: 43, borderRadius: 13, backgroundColor: C.leaf, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  contactActionText: { color: C.white, fontFamily: "Hind_600SemiBold", fontSize: 14 },
  callButton: { width: 45, height: 43, borderRadius: 13, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  historyHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
  historyCard: { paddingHorizontal: 13, borderRadius: 17, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  historyRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 9 },
  historyIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.roseLight },
  historyName: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 14 },
  historyMeta: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11 },
  historyDetail: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, lineHeight: 15 },
  customerOrderTotal: { alignItems: "flex-end", gap: 6 },
  historyPrice: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 14 },
  footerText: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, textAlign: "center", marginTop: 17 },
  toast: { position: "absolute", bottom: 16, left: 19, right: 19, maxWidth: 450, alignSelf: "center", minHeight: 45, borderRadius: 14, paddingHorizontal: 13, backgroundColor: C.ink, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  toastText: { color: C.white, fontFamily: "Hind_500Medium", fontSize: 13 },
});
