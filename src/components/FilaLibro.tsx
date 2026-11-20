import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Libro } from "../types";
import { TEMA } from "../constants/tema";

type Props = {
  libro: Libro;
  disponible: number;
  alPresionar: (libro: Libro) => void;
};

export function FilaLibro({ libro, disponible, alPresionar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => alPresionar(libro)}
      style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
    >
      <View style={styles.texto}>
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.detalle}>{libro.autor} · {libro.anio}</Text>
      </View>
      <Text style={[styles.estado, disponible > 0 ? styles.disponible : styles.espera]}>
        {disponible > 0 ? `${disponible} disponible${disponible === 1 ? "" : "s"}` : "Lista de espera"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: { minHeight: TEMA.sizes.cardHeight, marginHorizontal: TEMA.spacing.lg, marginBottom: TEMA.spacing.sm, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.surface, padding: TEMA.spacing.md, flexDirection: "row", alignItems: "center" },
  presionada: { opacity: 0.75 },
  texto: { flex: 1, paddingRight: TEMA.spacing.sm },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.body, fontWeight: "700" },
  detalle: { color: TEMA.colors.muted, marginTop: TEMA.spacing.xs },
  estado: { fontSize: TEMA.typography.small, fontWeight: "700" },
  disponible: { color: TEMA.colors.success },
  espera: { color: TEMA.colors.warning },
});
