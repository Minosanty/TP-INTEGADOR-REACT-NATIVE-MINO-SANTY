import { Pressable, StyleSheet, Text, View } from "react-native";
import { TEMA } from "../constants/tema";

type Props = {
  titulo: string;
  detalle?: string;
  textoAccion?: string;
  accion?: () => void;
};

export function MensajePantalla({ titulo, detalle, textoAccion, accion }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      {textoAccion && accion ? (
        <Pressable accessibilityRole="button" onPress={accion} style={styles.boton}>
          <Text style={styles.textoBoton}>{textoAccion}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center", padding: TEMA.spacing.xl },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.large, fontWeight: "700", textAlign: "center" },
  detalle: { color: TEMA.colors.muted, marginTop: TEMA.spacing.sm, textAlign: "center" },
  boton: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.lg, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: TEMA.spacing.lg },
  textoBoton: { color: TEMA.colors.surface, fontWeight: "700" },
});
