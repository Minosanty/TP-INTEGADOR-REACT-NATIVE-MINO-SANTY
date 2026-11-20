import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { TEMA } from "../../constants/tema";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: TEMA.colors.primary, tabBarStyle: styles.tabBar }}>
      <Tabs.Screen name="(catalogo)" options={{ title: "Catálogo", tabBarIcon: ({ color, size }) => <Ionicons name="library-outline" size={typeof size === "number" ? size : 24} color={typeof color === "string" ? color : TEMA.colors.primary} /> }} />
      <Tabs.Screen name="reservas" options={{ title: "Mis reservas", tabBarIcon: ({ color, size }) => <Ionicons name="bookmarks-outline" size={typeof size === "number" ? size : 24} color={typeof color === "string" ? color : TEMA.colors.primary} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { minHeight: TEMA.sizes.tabBarHeight },
});
