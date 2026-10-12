import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OrderStatusButton, StatCard, StockLine } from "@/components/bazaaro/cards";
import { BrandHeader, Button, C, Chip, Divider, Money, Photo, Pill, RoundAction, ScreenTitle, SectionHeading } from "@/components/bazaaro/ui";
import { ARTWORK } from "@/lib/bazaaro/fixtures";
import { useBazaaro } from "@/lib/bazaaro/state";
import type { ImageKey, Order, OrderStatus, SellerSection } from "@/lib/bazaaro/types";
import { countRepeatCustomers, nextOrderStatus, orderTone, timeAgo } from "@/lib/bazaaro/utils";

const SECTIONS: { id: SellerSection; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "overview", icon: "sunny-outline" },
  { id: "inventory", icon: "cube-outline" },
  { id: "orders", icon: "receipt-outline" },
  { id: "insights", icon: "bar-chart-outline" },
];
const PICTURES: ImageKey[] = ["scarf", "diya", "spices", "cups", "tote", "pickle"];
const NEXT_LABEL: Record<OrderStatus, string> = { New: "Accept order", Accepted: "Mark preparing", Preparing: "Ready for pickup", Ready: "Complete order", Completed: "Completed", Declined: "Declined" };

export default function ShopScreen() {
  const { products, orders, storefront, shopProfile, visits, inventoryEvents, adjustStock, toggleProductStatus, updateOrderStatus, addProduct, language } = useBazaaro();
  const [section, setSection] = useState<SellerSection>("overview");
  const [addOpen, setAddOpen] = useState(false);
  const [declineOrder, setDeclineOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [variant, setVariant] = useState("");
  const [category, setCategory] = useState("Home & living");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageKey, setImageKey] = useState<ImageKey>("diya");
  const [formError, setFormError] = useState("");

  const sellerProducts = products.filter((product) => product.shopSlug === storefront.slug);
  const sellerOrders = orders.filter((order) => order.shopSlug === storefront.slug);
  const recentOrders = sellerOrders.filter((order) => order.status !== "Declined");
  const pendingOrders = sellerOrders.filter((order) => order.status === "New").length;
  const sales = sellerOrders.filter((order) => order.status === "Completed").reduce((sum, order) => sum + order.total, 0);
  const shopProductInterest = sellerProducts.reduce((sum, product) => sum + product.interest, 0);
  const lowStock = sellerProducts.filter((product) => product.stock <= product.lowStockAt);
  const returning = countRepeatCustomers(sellerOrders);
  const t = language === "hi"
    ? { hi: "आज का आपका बहीखाता", sub: "आपके कारोबार की छोटी-सी झलक।", overview: "आज", inventory: "स्टॉक", orders: "ऑर्डर", insights: "आँकड़े" }
    : { hi: `A little ledger, ${shopProfile.ownerName.split(" ")[0]}.`, sub: "Your shop, your customers, your terms.", overview: "Today", inventory: "Inventory", orders: "Orders", insights: "Insights" };

  const flash = (message: string) => { setNotice(message); setTimeout(() => setNotice(""), 2400); };
  const shareShop = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/store/${storefront.slug}` : `bazaaro://store/${storefront.slug}`;
    try { await Share.share({ title: storefront.name, message: `${storefront.name} — made with care in ${storefront.city}. ${url}` }); } catch { flash("Share link is ready to copy from your shop page."); }
  };

  const saveProduct = () => {
    const amount = Number(price);
    const count = Number(stock);
    if (productName.trim().length < 2) { setFormError("Give this find a name."); return; }
    if (!Number.isFinite(amount) || amount < 1) { setFormError("Enter a price in rupees."); return; }
    if (!Number.isInteger(count) || count < 0) { setFormError("Stock must be zero or more whole items."); return; }
    addProduct({
      name: productName.trim(),
      description: description.trim() || "A thoughtful small-batch find, made by hand.",
      category,
      price: amount,
      stock: count,
      lowStockAt: 3,
      imageKey,
      unit: "piece",
      variant: variant.trim() || undefined,
    });
    setProductName(""); setDescription(""); setVariant(""); setPrice(""); setStock(""); setFormError(""); setAddOpen(false);
    flash("Your new find is on the shelf.");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <BrandHeader right={<View style={styles.headerActions}><RoundAction icon="share-social-outline" label="Share shop" onPress={shareShop} /><RoundAction icon="eye-outline" label="View storefront" onPress={() => router.push({ pathname: "/store/[slug]", params: { slug: storefront.slug } } as any)} /></View>} />
        <View style={styles.shopMasthead}>
          <View style={{ flex: 1 }}>
            <Text style={styles.shopEyebrow}>YOUR MERCHANT DESK</Text>
            <Text style={styles.shopHeading}>{t.hi}</Text>
            <Text style={styles.shopSub}>{t.sub}</Text>
          </View>
          <View style={styles.shopSeal}><Photo imageKey={storefront.logoImageKey} style={styles.shopSealPhoto} /><View style={styles.liveDot} /></View>
        </View>

        <View style={styles.shopRibbon}>
          <View style={{ flex: 1 }}><Text style={styles.ribbonLabel}>OPEN STOREFRONT</Text><Text style={styles.ribbonName}>{storefront.name}</Text><Text style={styles.ribbonLocation}><Ionicons name="location-outline" size={13} color={C.muted} /> {storefront.city} · PIN {storefront.pinCode}</Text></View>
          <Pressable onPress={() => router.push("/(tabs)/profile" as any)} style={styles.editButton}><Ionicons name="create-outline" size={17} color={C.vermilion} /><Text style={styles.editText}>Edit</Text></Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentRail}>
          {SECTIONS.map((item) => {
            const label = item.id === "overview" ? t.overview : item.id === "inventory" ? t.inventory : item.id === "orders" ? t.orders : t.insights;
            return <Chip key={item.id} label={label} icon={item.icon} active={section === item.id} onPress={() => setSection(item.id)} />;
          })}
        </ScrollView>

        {section === "overview" && <>
          <View style={styles.metricGrid}>
            <StatCard icon="cash-outline" label="Completed sales · sample" value={`₹${sales.toLocaleString("en-IN")}`} note="Completed orders shown here" tint="#FFF0CB" />
            <StatCard icon="receipt-outline" label="Orders to date" value={`${sellerOrders.length}`} note={pendingOrders ? `${pendingOrders} needs your reply` : "All caught up"} tint="#F6E6DE" />
            <StatCard icon="eye-outline" label="Store visits" value={`${visits.toLocaleString("en-IN")}`} note="Sample + this device" tint="#E7EFE7" />
            <StatCard icon="heart-outline" label="Product interest" value={`${shopProductInterest.toLocaleString("en-IN")}`} note="Sample + this shop's product taps" tint="#ECE7F2" />
          </View>
          <View style={styles.quickActions}>
            <Pressable onPress={() => { setSection("inventory"); setAddOpen(true); }} style={styles.quickCard}><View style={[styles.quickIcon, { backgroundColor: C.goldLight }]}><Ionicons name="add" size={19} color={C.vermilion} /></View><Text style={styles.quickTitle}>Add a find</Text><Text style={styles.quickBody}>Put a new product on your shelf</Text></Pressable>
            <Pressable onPress={shareShop} style={styles.quickCard}><View style={[styles.quickIcon, { backgroundColor: C.leafLight }]}><Ionicons name="paper-plane-outline" size={17} color={C.leaf} /></View><Text style={styles.quickTitle}>Share your shop</Text><Text style={styles.quickBody}>Send your own shop link to customers</Text></Pressable>
          </View>
          <SectionHeading eyebrow="A SMALL REMINDER" title={lowStock.length ? "A few shelves need love" : "Your shelves are looking good"} />
          {lowStock.length ? <View style={styles.stockCard}>{lowStock.slice(0, 3).map((product) => <StockLine key={product.id} product={product} onAdjust={(delta) => adjustStock(product.id, delta, "Quick stock edit")} />)}</View> : <View style={styles.allGood}><Ionicons name="checkmark-circle" size={20} color={C.leaf} /><Text style={styles.allGoodText}>No low-stock items right now.</Text></View>}
          <SectionHeading eyebrow="FRESH OFF THE LEDGER" title="Latest orders" action="See all" onAction={() => setSection("orders")} />
          {sellerOrders.slice(0, 2).map((order) => <OrderCard key={order.id} order={order} onAdvance={() => updateOrderStatus(order.id, nextOrderStatus(order.status))} onDecline={() => setDeclineOrder(order)} />)}
          <View style={styles.demoCallout}><Pill title="Sample data" tone="yellow" /><Text style={styles.demoCalloutText}>This starter shop has illustrative orders and counts. New edits you make stay on this device.</Text></View>
        </>}

        {section === "inventory" && <>
          <View style={styles.inventoryTop}><View><Text style={styles.inventoryCount}>{sellerProducts.length} <Text style={styles.inventoryCountLabel}>items on your shelf</Text></Text><Text style={styles.smallMuted}>Use + / − for a quick stock update.</Text></View><Button title="Add product" icon="add" onPress={() => setAddOpen(true)} style={{ minHeight: 42, paddingHorizontal: 12 }} /></View>
          <View style={styles.stockCard}>{sellerProducts.length ? sellerProducts.map((product) => <View key={product.id}><StockLine product={product} onAdjust={(delta) => adjustStock(product.id, delta, "Quick stock edit")} /><View style={styles.visibilityRow}><Text style={styles.visibilityLabel}>{product.status === "active" ? "Visible in your shop" : "Hidden from your shop"}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${product.status === "active" ? "Hide" : "Show"} ${product.name}`} onPress={() => toggleProductStatus(product.id)} style={[styles.visibilityAction, product.status === "active" ? { backgroundColor: C.roseLight } : { backgroundColor: C.leafLight }]}><Ionicons name={product.status === "active" ? "eye-off-outline" : "eye-outline"} size={15} color={product.status === "active" ? C.vermilion : C.leaf} /><Text style={[styles.visibilityText, { color: product.status === "active" ? C.vermilion : C.leaf }]}>{product.status === "active" ? "Hide" : "Publish"}</Text></Pressable></View></View>) : <Text style={styles.allGoodText}>No products yet. Add your first handmade find.</Text>}</View>
          <SectionHeading eyebrow="A LITTLE PAPER TRAIL" title="Stock movement" />
          <View style={styles.activityCard}>{inventoryEvents.filter((event) => sellerProducts.some((product) => product.id === event.productId)).slice(0, 6).map((event) => (
            <View key={event.id} style={styles.activityRow}><View style={[styles.activitySign, event.delta < 0 && { backgroundColor: C.roseLight }]}><Text style={[styles.activityDelta, event.delta < 0 && { color: C.vermilion }]}>{event.delta > 0 ? `+${event.delta}` : event.delta}</Text></View><View style={{ flex: 1 }}><Text style={styles.activityName}>{event.productName}</Text><Text style={styles.smallMuted}>{event.reason}</Text></View><Text style={styles.activityTime}>{timeAgo(event.createdAt)}</Text></View>
          ))}</View>
        </>}

        {section === "orders" && <>
          <View style={styles.orderSummary}><Ionicons name="receipt-outline" size={20} color={C.vermilion} /><Text style={styles.orderSummaryText}>{pendingOrders} new · {sellerOrders.length} total</Text><Pill title="Direct orders" tone="green" /></View>
          {sellerOrders.length ? sellerOrders.map((order) => <OrderCard key={order.id} order={order} onAdvance={() => updateOrderStatus(order.id, nextOrderStatus(order.status))} onDecline={() => setDeclineOrder(order)} />) : <View style={styles.allGood}><Text style={styles.allGoodText}>No orders yet. Share your shop link when you're ready.</Text></View>}
        </>}

        {section === "insights" && <>
          <View style={styles.insightIntro}><Text style={styles.insightTitle}>A small shop can have a big reach.</Text><Text style={styles.insightBody}>Simple signals to help decide what to make and when to restock.</Text><Pill title="Sample + this device" tone="yellow" /></View>
          <View style={styles.metricGrid}>
            <StatCard icon="eye-outline" label="Storefront visits" value={String(visits)} note="Visits on this device" tint="#E7EFE7" />
            <StatCard icon="sparkles-outline" label="Product interest" value={String(shopProductInterest)} note="Views on this shop's listings" tint={C.goldLight} />
            <StatCard icon="repeat-outline" label="Repeat buyers" value={String(returning)} note="Same phone, more than once" tint="#ECE7F2" />
            <StatCard icon="cube-outline" label="Stock movements" value={String(inventoryEvents.length)} note="Adjustments and orders" tint="#F6E6DE" />
          </View>
          <SectionHeading eyebrow="WHAT PEOPLE ARE NOTICING" title="Most looked at" />
          <View style={styles.interestCard}>
            {sellerProducts.slice().sort((a, b) => b.interest - a.interest).map((product, index) => {
              const max = Math.max(1, ...sellerProducts.map((item) => item.interest));
              const width = `${Math.max(8, (product.interest / max) * 100)}%` as `${number}%`;
              return <View key={product.id} style={styles.interestRow}><Text style={styles.rank}>{String(index + 1).padStart(2, "0")}</Text><Photo imageKey={product.imageKey} style={styles.interestPhoto} /><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.activityName}>{product.name}</Text><View style={styles.barTrack}><View style={[styles.bar, { width }]} /></View></View><Text style={styles.interestValue}>{product.interest}</Text></View>;
            })}
          </View>
          <SectionHeading eyebrow="BUSINESS NOTEBOOK" title="Your next good move" />
          <View style={styles.tipCard}><Ionicons name="bulb-outline" size={19} color={C.vermilion} /><Text style={styles.tipText}>{lowStock.length ? `${lowStock[0].name} is running low. Add a small batch before the next market day.` : "Try sharing one product story with your regulars this week."}</Text></View>
        </>}
      </ScrollView>

      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalScrim}><View style={styles.productModal}>
          <View style={styles.modalHeader}><View><Text style={styles.modalEyebrow}>PUT IT ON YOUR SHELF</Text><Text style={styles.modalTitle}>Add a product</Text></View><Pressable accessibilityLabel="Close product form" onPress={() => { setAddOpen(false); setFormError(""); }} style={styles.closeButton}><Ionicons name="close" size={20} color={C.ink} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Input label="Product name" value={productName} onChangeText={setProductName} placeholder="e.g. Indigo garden scarf" />
            <Input label="A few words about it" value={description} onChangeText={setDescription} placeholder="What's lovely about this find?" multiline />
            <Input label="Variant or size (optional)" value={variant} onChangeText={setVariant} placeholder="e.g. indigo · 180 cm" />
            <Text style={styles.label}>Category</Text>
            <View style={styles.formChips}>{["Home & living", "Textiles", "Pantry", "Pottery", "Accessories"].map((value) => <Chip key={value} label={value} active={category === value} onPress={() => setCategory(value)} />)}</View>
            <View style={styles.inputRow}><View style={{ flex: 1 }}><Input label="Price (₹)" value={price} onChangeText={setPrice} placeholder="450" keyboardType="decimal-pad" /></View><View style={{ flex: 1 }}><Input label="Stock" value={stock} onChangeText={(value: string) => setStock(value.replace(/\D/g, ""))} placeholder="8" keyboardType="number-pad" /></View></View>
            <Text style={styles.label}>Choose a sample product photo</Text>
            <ScrollView horizontal contentContainerStyle={{ gap: 8, paddingBottom: 8 }} showsHorizontalScrollIndicator={false}>{PICTURES.map((key) => <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Choose ${key} photo`} onPress={() => setImageKey(key)} style={[styles.photoOption, imageKey === key && styles.photoOptionActive]}><Photo imageKey={key} style={styles.optionPhoto} />{imageKey === key && <View style={styles.photoCheck}><Ionicons name="checkmark" size={12} color={C.white} /></View>}</Pressable>)}</ScrollView>
            {!!formError && <Text style={styles.formError}>{formError}</Text>}
            <Button title="Save product" icon="checkmark" onPress={saveProduct} style={{ marginTop: 10, marginBottom: 15 }} />
            <Text style={styles.sampleImageNote}>In this starter, choose from the bundled sample photos. Add your own photo storage before accepting real vendor uploads.</Text>
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={!!declineOrder} animationType="fade" transparent onRequestClose={() => setDeclineOrder(null)}>
        <View style={styles.modalScrim}><View style={styles.confirmCard}><View style={styles.confirmIcon}><Ionicons name="close-circle-outline" size={25} color={C.vermilion} /></View><Text style={styles.modalTitle}>Decline this order?</Text><Text style={styles.confirmBody}>The customer will see that {declineOrder?.id} was declined. You can still contact them directly.</Text><View style={styles.confirmActions}><Button title="Keep order" variant="ghost" onPress={() => setDeclineOrder(null)} style={{ flex: 1 }} /><Button title="Decline order" onPress={() => { if (declineOrder) updateOrderStatus(declineOrder.id, "Declined"); setDeclineOrder(null); }} style={{ flex: 1 }} /></View></View></View>
      </Modal>

      {!!notice && <View accessibilityLiveRegion="polite" style={styles.toast}><Ionicons name="checkmark-circle" size={17} color={C.saffron} /><Text style={styles.toastText}>{notice}</Text></View>}
    </SafeAreaView>
  );
}

function Input({ label, ...props }: any) {
  return <View style={{ marginTop: 11 }}><Text style={styles.label}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor="#A59C8E" style={[styles.input, props.multiline && { minHeight: 74, textAlignVertical: "top" }]} /></View>;
}

function OrderCard({ order, onAdvance, onDecline }: { order: Order; onAdvance: () => void; onDecline: () => void }) {
  const statusText = order.status === "New" ? "New · needs a reply" : order.status;
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}><View style={styles.customerIcon}><Ionicons name="person-outline" size={18} color={C.vermilion} /></View><View style={{ flex: 1 }}><Text style={styles.customerName}>{order.customerName}</Text><Text style={styles.orderMeta}>{order.id} · {timeAgo(order.createdAt)}</Text></View><Pill title={statusText} tone={orderTone(order.status)} /></View>
      <View style={styles.orderItems}>{order.items.map((item) => <View key={item.productId} style={styles.orderItem}><Photo imageKey={item.imageKey} style={styles.orderItemPhoto} /><Text numberOfLines={1} style={styles.orderItemName}>{item.quantity} × {item.name}</Text><Money amount={item.price * item.quantity} size={14} /></View>)}</View>
      <View style={styles.orderBottom}><View style={{ flex: 1 }}><Text style={styles.orderTotal}>{`₹${order.total.toLocaleString("en-IN")}`}</Text><Text style={styles.orderMeta}>{order.fulfilment === "delivery" ? `Delivery · ${order.pinCode}` : "Shop pickup"}{order.phone ? ` · ${order.phone}` : " · sample contact"}</Text></View>
        {order.status === "New" ? <View style={styles.orderActions}><Pressable accessibilityRole="button" onPress={onDecline} style={styles.decline}><Text style={styles.declineText}>Decline</Text></Pressable><OrderStatusButton title={NEXT_LABEL[order.status]} onPress={onAdvance} /></View> : ["Accepted", "Preparing", "Ready"].includes(order.status) ? <OrderStatusButton title={NEXT_LABEL[order.status]} onPress={onAdvance} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  page: { width: "100%", maxWidth: 920, alignSelf: "center", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 32 },
  headerActions: { flexDirection: "row", gap: 8 },
  shopMasthead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 17 },
  shopEyebrow: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 10, letterSpacing: 1.45 },
  shopHeading: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 25, lineHeight: 31, marginTop: 2 },
  shopSub: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 13, marginTop: 1 },
  shopSeal: { width: 56, height: 56, borderRadius: 19, backgroundColor: C.vermilion, alignItems: "center", justifyContent: "center", overflow: "hidden", transform: [{ rotate: "4deg" }] },
  shopSealPhoto: { width: "100%", height: "100%" },
  liveDot: { position: "absolute", top: 6, right: 6, width: 9, height: 9, borderRadius: 5, backgroundColor: C.saffron, borderWidth: 1, borderColor: C.vermilion },
  shopRibbon: { flexDirection: "row", alignItems: "center", backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 17, padding: 13, marginBottom: 17 },
  ribbonLabel: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1.1 },
  ribbonName: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 19, lineHeight: 22 },
  ribbonLocation: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 12, marginTop: 2 },
  editButton: { minWidth: 61, height: 36, borderRadius: 12, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 4 },
  editText: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  segmentRail: { gap: 8, paddingBottom: 18 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginBottom: 17 },
  quickActions: { flexDirection: "row", gap: 10, marginBottom: 21 },
  quickCard: { flex: 1, borderRadius: 17, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 12 },
  quickIcon: { width: 35, height: 35, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  quickTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 15 },
  quickBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, lineHeight: 15, marginTop: 2 },
  stockCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingHorizontal: 11, marginBottom: 22 },
  visibilityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 42, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: 2 },
  visibilityLabel: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11 },
  visibilityAction: { minHeight: 30, borderRadius: 10, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 5 },
  visibilityText: { fontFamily: "Hind_600SemiBold", fontSize: 12 },
  allGood: { minHeight: 65, flexDirection: "row", alignItems: "center", gap: 9, padding: 14, borderRadius: 14, backgroundColor: C.leafLight, marginBottom: 18 },
  allGoodText: { color: C.leaf, fontFamily: "Hind_500Medium", fontSize: 14, flex: 1 },
  demoCallout: { flexDirection: "row", alignItems: "center", gap: 10, padding: 11, marginTop: 1, borderRadius: 12, backgroundColor: C.goldLight },
  demoCalloutText: { color: C.ink, fontFamily: "Hind_400Regular", fontSize: 12, lineHeight: 16, flex: 1 },
  inventoryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 13, gap: 10 },
  inventoryCount: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 20 },
  inventoryCountLabel: { fontFamily: "Hind_500Medium", fontSize: 14, color: C.muted },
  smallMuted: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, marginTop: 1 },
  activityCard: { backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, marginBottom: 20 },
  activityRow: { minHeight: 67, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  activitySign: { width: 35, height: 35, borderRadius: 12, backgroundColor: C.leafLight, alignItems: "center", justifyContent: "center" },
  activityDelta: { color: C.leaf, fontFamily: "Hind_700Bold", fontSize: 14 },
  activityName: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 14 },
  activityTime: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11 },
  orderSummary: { flexDirection: "row", alignItems: "center", gap: 9, padding: 11, borderRadius: 13, backgroundColor: C.clay, marginBottom: 13 },
  orderSummaryText: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 14, flex: 1 },
  orderCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 17, padding: 13, marginBottom: 11 },
  orderTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  customerIcon: { width: 39, height: 39, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: C.roseLight },
  customerName: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 15 },
  orderMeta: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, marginTop: 1 },
  orderItems: { paddingTop: 7, paddingBottom: 8 },
  orderItem: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: 8 },
  orderItemPhoto: { width: 31, height: 31, borderRadius: 9, backgroundColor: C.clay },
  orderItemName: { flex: 1, color: C.ink, fontFamily: "Hind_500Medium", fontSize: 13 },
  orderBottom: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 9, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  orderTotal: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 17 },
  orderActions: { flexDirection: "row", alignItems: "center", gap: 5 },
  decline: { minHeight: 37, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  declineText: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 13 },
  insightIntro: { padding: 15, borderRadius: 17, backgroundColor: C.clay, marginBottom: 12 },
  insightTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 18 },
  insightBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 13, lineHeight: 18, marginTop: 1, marginBottom: 9 },
  interestCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingHorizontal: 12, marginBottom: 22 },
  interestRow: { minHeight: 65, flexDirection: "row", alignItems: "center", gap: 9, borderBottomWidth: 1, borderBottomColor: C.line },
  rank: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 12, width: 22 },
  interestPhoto: { width: 40, height: 42, borderRadius: 11, backgroundColor: C.clay },
  barTrack: { height: 5, backgroundColor: C.paper, borderRadius: 3, marginTop: 5, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 3, backgroundColor: C.vermilion },
  interestValue: { color: C.muted, fontFamily: "Hind_700Bold", fontSize: 12 },
  tipCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 15, borderWidth: 1, borderColor: "#ECDDAB", backgroundColor: C.goldLight, padding: 13 },
  tipText: { color: C.ink, fontFamily: "Hind_500Medium", fontSize: 13, lineHeight: 18, flex: 1 },
  modalScrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28,23,19,.48)" },
  productModal: { maxHeight: "91%", paddingHorizontal: 19, paddingTop: 19, paddingBottom: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: C.paper },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 },
  modalEyebrow: { color: C.vermilion, fontFamily: "Hind_700Bold", fontSize: 9, letterSpacing: 1.3 },
  modalTitle: { color: C.ink, fontFamily: "Hind_700Bold", fontSize: 23, lineHeight: 29 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.white, alignItems: "center", justifyContent: "center" },
  label: { color: C.ink, fontFamily: "Hind_600SemiBold", fontSize: 13, marginBottom: 5 },
  input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, paddingHorizontal: 12, paddingTop: 10, color: C.ink, fontFamily: "Hind_400Regular", fontSize: 15, outlineStyle: "none" as any },
  formChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  inputRow: { flexDirection: "row", gap: 10 },
  photoOption: { width: 65, height: 71, borderRadius: 14, padding: 3, borderWidth: 2, borderColor: "transparent", overflow: "hidden" },
  photoOptionActive: { borderColor: C.vermilion, backgroundColor: C.white },
  optionPhoto: { width: "100%", height: "100%", borderRadius: 10 },
  photoCheck: { position: "absolute", right: 6, bottom: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: C.vermilion, alignItems: "center", justifyContent: "center" },
  formError: { color: C.vermilion, fontFamily: "Hind_600SemiBold", fontSize: 13, marginTop: 9 },
  sampleImageNote: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 11, textAlign: "center", marginBottom: 9 },
  confirmCard: { alignSelf: "center", width: "88%", maxWidth: 400, padding: 20, borderRadius: 22, backgroundColor: C.paper, alignItems: "center", marginBottom: "auto", marginTop: "auto" },
  confirmIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: C.roseLight, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  confirmBody: { color: C.muted, fontFamily: "Hind_400Regular", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 5 },
  confirmActions: { flexDirection: "row", gap: 8, alignSelf: "stretch", marginTop: 15 },
  toast: { position: "absolute", bottom: 18, left: 20, right: 20, alignSelf: "center", maxWidth: 470, minHeight: 45, paddingHorizontal: 13, borderRadius: 14, backgroundColor: C.ink, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  toastText: { color: C.white, fontFamily: "Hind_500Medium", fontSize: 14 },
});
