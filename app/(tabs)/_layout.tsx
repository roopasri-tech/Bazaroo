import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useBazaaro } from "@/lib/bazaaro/state";
import { C } from "@/components/bazaaro/ui";

export default function TabLayout() {
  const { cartCount, language } = useBazaaro();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 9 : Math.max(insets.bottom, 8);
  const label = language === "hi"
    ? { discover: "खोजें", saved: "पसंद", basket: "टोकरी", shop: "दुकान", account: "खाता" }
    : { discover: "Discover", saved: "Saved", basket: "Basket", shop: "My shop", account: "Account" };

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarActiveTintColor: C.vermilion,
      tabBarInactiveTintColor: "#877F74",
      tabBarLabelStyle: { fontFamily: "Hind_500Medium", fontSize: 11, marginBottom: 1 },
      tabBarStyle: {
        height: 58 + bottomPadding,
        paddingTop: 7,
        paddingBottom: bottomPadding,
        backgroundColor: C.surface,
        borderTopColor: C.line,
        borderTopWidth: 1,
        elevation: 0,
      },
    }}>
      <Tabs.Screen name="index" options={{ title: label.discover, tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="saved" options={{ title: label.saved, tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: label.basket, tabBarBadge: cartCount > 0 ? cartCount : undefined, tabBarBadgeStyle: { backgroundColor: C.vermilion, fontFamily: "Hind_600SemiBold" }, tabBarIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="shop" options={{ title: label.shop, tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: label.account, tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
