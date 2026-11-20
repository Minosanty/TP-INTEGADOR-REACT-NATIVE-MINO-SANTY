import { StyleSheet, Text, View } from "react-native";
import { Link, usePathname } from "expo-router";
import { TEMA } from "../constants/tema";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Página no encontrada</Text>
      <Text style={styles.url}>La dirección {pathname} no existe en Biblioteca IPF.</Text>
      <Link href="/" accessibilityRole="button" style={styles.link}>Volver al catálogo</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: TEMA.colors.background, padding: TEMA.spacing.xl },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.title, fontWeight: "800", textAlign: "center" },
  url: { color: TEMA.colors.muted, marginTop: TEMA.spacing.sm, textAlign: "center" },
  link: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.lg, color: TEMA.colors.primary, fontWeight: "700", textAlignVertical: "center" },
});
