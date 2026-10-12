import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandHeader, Button, C, Divider, Photo, Pill, RoundAction, ScreenTitle } from "@/components/bazaaro/ui";
import { useBazaaro } from "@/lib/bazaaro/state";
import { formatINR, normalizeIndianPhone } from "@/lib/bazaaro/utils";
import type { Fulfilment } from "@/lib/bazaaro/types";

export default function CartScreen() {
  const { products, cart, cartCount, cartTotal, customerProfile, setCartQuantity, placeOrder, language } = useBazaaro();
  const [name, setName] = useState(customerProfile.name);
  const [phone, setPhone] = useState(customerProfile.phone);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);
  const [confirmationTotal, setConfirmationTotal] = useState(0);
  useEffect(() => {
    if (!name && customerProfile.name) setName(customerProfile.name);
    if (!phone && customerProfile.phone) setPhone(customerProfile.phone);
  }, [name, phone, customerProfile.name, customerProfile.phone]);

  const t = language === "hi" ? { title: "आपकी टोकरी", subtitle: "कारीगर से सीधे, बिना हड़बड़ी के।", name: "आपका नाम", phone: "मोबाइल नंबर", delivery: "घर पहुँचाएँ", pickup: "दुकान से लें", address: "पता", pin: "पिन कोड", note: "कारीगर के लिए एक संदेश", total: "कुल", order: "ऑर्डर करें" } : { title: "Your basket", subtitle: "A few thoughtful finds, straight from the maker.", name: "Your name", phone: "Mobile number", delivery: "Deliver to me", pickup: "I'll pick it up", address: "Street, locality and city", pin: "6-digit PIN code", note: "A little note for the maker (optional)", total: "Order total", order: "Place order" };

  const lines = useMemo(() => cart.map((line) => ({ line, product: products.find((item) => item.id === line.productId) })).filter((row): row is { line: typeof cart[number]; product: NonNullable<typeof row.product> } => Boolean(row.product)), [cart, products]);
  const validateAndPlace = () => {
    setError("");
    if (!lines.length) return;
    if (name.trim().length < 2) { setError("Add the name the maker can call you by."); return; }
    if (!/^[6-9]\d{9}$/.test(normalizeIndianPhone(phone))) { setError("Enter a valid 10-digit Indian mobile number starting with 6–9."); return; }
    if (fulfilment === "delivery" && address.trim().length < 5) { setError("Add a delivery address with your locality."); return; }
    if (fulfilment === "delivery" && !/^[1-9]\d{5}$/.test(pinCode)) { setError("Enter a valid 6-digit PIN code."); return; }
    const result = placeOrder({ customerName: name, phone, fulfilment, address, pinCode, note });
    if (!result.ok) { setError(result.message); return; }
    setConfirmationTotal(result.total);
    setPlaced(true);
  };

  if (placed) return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.successWrap}>
        <View style={styles.successSeal}><Ionicons name="checkmark" size={38} color={C.white} /></View>
        <Text style={styles.successEyebrow}>A GOOD THING IS HAPPENING</Text>
        <Text style={styles.successTitle}>{language === "hi" ? "ऑर्डर हो गया!" : "Your order is in."}</Text>
        <Text style={styles.successBody}>Your note is saved in this demo order. No payment has been taken; coordinate delivery or pickup directly with the shop.</Text>
        <View style={styles.successTicket}><Ionicons name="receipt-outline" size={20} color={C.vermilion} /><Text style={styles.successTicketText}>Order confirmation · {formatINR(confirmationTotal)}</Text></View>
        <Button title="Back to discovering" onPress={() => { setPlaced(false); router.push("/(tabs)" as any); }} style={{ alignSelf: "stretch", marginTop: 12 }} />
        <Button title="See my order history" variant="secondary" onPress={() => router.push("/(tabs)/profile" as any)} style={{ alignSelf: "stretch", marginTop: 8 }} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <BrandHeader right={<RoundAction icon="storefront-outline" label="Open merchant desk" onPress={() => router.push("/(tabs)/shop" as any)} />} />
          <ScreenTitle title={t.title} subtitle={t.subtitle} />
          {lines.length ? <>
            <View style={styles.itemsCard}>
              {lines.map(({ line, product }, index) => (
                <View key={product.id}>
                  {index > 0 && <Divider />}
                  <View style={styles.cartLine}>
                    <Photo imageKey={product.imageKey} style={styles.cartPhoto} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={2} style={styles.itemName}>{product.name}</Text>
                      <Text style={[styles.itemMeta, product.status !== "active" && { color: C.vermilion }]}>{formatINR(product.price)} · {product.status !== "active" ? "Listing paused" : `${product.stock} available`}</Text>
                      <View style={styles.stepper}>
                        <Pressable accessibilityRole="button" accessibilityLabel={`Remove one ${product.name}`} onPress={() => setCartQuantity(product.id, line.quantity - 1)} style={styles.stepperButton}><Ionicons name="remove" size={17} color={C.ink} /></Pressable>
                        <Text style={styles.stepperValue}>{line.quantity}</Text>
                        <Pressable accessibilityRole="button" accessibilityLabel={`Add one ${product.name}`} disabled={product.status !== "active" || line.quantity >= product.stock} onPress={() => setCartQuantity(product.id, line.quantity + 1)} style={[styles.stepperButton, (product.status !== "active" || line.quantity >= product.stock) && { opacity: 0.45 }]}><Ionicons name="add" size={17} color={C.ink} /></Pressable>
                      </View>
                    </View>
                    <Text style={styles.lineTotal}>{formatINR(product.price * line.quantity)}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.smallNote}><Ionicons name="heart-outline" size={16} color={C.vermilion} /><Text style={styles.smallNoteText}>Every order stays with the independent maker. One order is created per shop.</Text></View>
            <View style={styles.checkoutCard}>
              <Text style={styles.formTitle}>A name & a way to reach you</Text>
              <Field label={t.name} value={name} onChangeText={setName} placeholder="e.g. Kavya" autoCapitalize="words" />
              <Field label={t.phone} value={phone} onChangeText={(value: string) => setPhone(value.replace(/[^0-9+\s-]/g, "").slice(0, 15))} placeholder="10-digit number" keyboardType="phone-pad" />
              <Text style={styles.fieldLabel}>How would you like your order?</Text>
              <View style={styles.choiceRow}>
                {(["delivery", "pickup"] as Fulfilment[]).map((option) => <Pressable key={option} onPress={() => setFulfilment(option)} style={[styles.choice, fulfilment === option && styles.choiceActive]}><Ionicons name={option === "delivery" ? "bicycle-outline" : "storefront-outline"} size={19} color={fulfilment === option ? C.vermilion : C.muted} /><Text style={[styles.choiceText, fulfilment === option && styles.choiceTextActive]}>{option === "delivery" ? t.delivery : t.pickup}</Text></Pressable>)}
              </View>
              {fulfilment === "delivery" && <>
                <Field label={t.address} value={address} onChangeText={setAddress} placeholder="House, street, locality" />
                <Field label={t.pin} value={pinCode} onChangeText={(value: string) => setPinCode(value.replace(/\D/g, "").slice(0, 6))} placeholder="302004" keyboardType="number-pad" maxLength={6} />
              </>}
              <Field label={t.note} value={note} onChangeText={setNote} placeholder="Gift note, gate number…" multiline />
              <View style={styles.paymentNote}><Ionicons name="information-circle-outline" size={16} color={C.leaf} /><Text style={styles.paymentText}>No online payment is collected here. Agree payment and timing directly with the maker.</Text></View>
              {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
              <Divider />
              <View style={styles.totalRow}><Text style={styles.totalLabel}>{t.total} · {cartCount} item{cartCount === 1 ? "" : "s"}</Text><Text style={styles.total}>{formatINR(cartTotal)}</Text></View>
              <Button title={t.order} icon="receipt-outline" onPress={validateAndPlace} disabled={!lines.length} style={{ marginTop: 12 }} />
              <Text style={styles.dataNote}>This preview saves orders on this device only.</Text>
            </View>
          </> : (
            <View style={styles.empty}>
              <View style={styles.bagIcon}><Ionicons name="basket-outline" size={30} color={C.vermilion} /></View>
              <Text style={styles.emptyTitle}>{language === "hi" ? "अभी टोकरी खाली है।" : "A good little thing belongs here."}</Text>
              <Text style={styles.emptyBody}>Take a look around. Every item has a maker and a story behind it.</Text>
              <Button title="Find a local favourite" onPress={() => router.push("/(tabs)" as any)} style={{ marginTop: 16 }} />
              <Pill title="Shop small, right here" tone="yellow" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: any) {
  return <View style={{ marginTop: 12 }}><Text style={styles.fieldLabel}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor="#A59C8E" style={[styles.input, props.multiline && { minHeight: 76, textAlignVertical: "top" }, props.style]} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 32 },
  itemsCard: { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 14 },
  cartLine: { flexDirection: "row", alignItems: "center", gap: 11 },
  cartPhoto: { width: 74, height: 80, borderRadius: 14, backgroundColor: C.clay },
  itemName: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 16, lineHeight: 19 },
  itemMeta: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 7 },
  stepperButton: { width: 27, height: 27, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: C.paper, borderWidth: 1, borderColor: C.line },
  stepperValue: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 14 },
  lineTotal: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 15 },
  smallNote: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, paddingVertical: 12 },
  smallNoteText: { flex: 1, color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 16 },
  checkoutCard: { backgroundColor: C.white, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 16 },
  formTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 20 },
  fieldLabel: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13, marginBottom: 5 },
  input: { minHeight: 47, borderRadius: 13, backgroundColor: C.paper, borderColor: C.line, borderWidth: 1, paddingHorizontal: 12, color: C.ink, fontFamily: "Hind_400Regular", fontSize: 15, outlineStyle: "none" as any },
  choiceRow: { flexDirection: "row", gap: 9, marginTop: 7 },
  choice: { flex: 1, minHeight: 49, borderRadius: 14, backgroundColor: C.paper, borderColor: C.line, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  choiceActive: { backgroundColor: C.goldLight, borderColor: C.saffron },
  choiceText: { color: C.muted, fontFamily: "Hind_500Medium", fontSize: 13 },
  choiceTextActive: { color: C.ink, fontFamily: "Hind_700Bold" },
  paymentNote: { flexDirection: "row", alignItems: "flex-start", gap: 7, backgroundColor: C.leafLight, borderRadius: 11, padding: 10, marginTop: 14 },
  paymentText: { color: C.leaf, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 16, flex: 1 },
  error: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 13, marginTop: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { color: C.muted, fontFamily: "Hind_500Medium", fontSize: 14 },
  total: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 23 },
  dataNote: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, textAlign: "center", marginTop: 8 },
  empty: { marginTop: 15, padding: 25, alignItems: "center", backgroundColor: C.white, borderRadius: 22, borderWidth: 1, borderColor: C.line },
  bagIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 19, textAlign: "center" },
  emptyBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 14, textAlign: "center", lineHeight: 19, marginTop: 4 },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, maxWidth: 520, width: "100%", alignSelf: "center" },
  successSeal: { width: 78, height: 78, borderRadius: 28, backgroundColor: C.leaf, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-5deg" }] },
  successEyebrow: { color: C.vermilion, fontFamily: "Hind_700Bold", letterSpacing: 1.3, fontSize: 10, marginTop: 21 },
  successTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 31, marginTop: 4 },
  successBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 5 },
  successTicket: { flexDirection: "row", alignItems: "center", gap: 9, borderRadius: 13, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 13, alignSelf: "stretch", marginVertical: 18 },
  successTicketText: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 14 },
});
