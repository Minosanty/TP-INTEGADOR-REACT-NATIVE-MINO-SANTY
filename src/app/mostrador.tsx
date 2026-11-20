import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LIBROS } from "../data/libros";
import { MensajePantalla } from "../components/MensajePantalla";
import { TEMA } from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";

export default function Mostrador() {
  const { reservasEspera, entregarSiguiente, cerrarsesion } = useBiblioteca();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const librosEsperados = LIBROS.filter((libro) => (reservasEspera[libro.isbn]?.length ?? 0) > 0);

  const entregar = async (isbn: string) => {
    setProcesando(isbn);
    try {
      setMensaje(await entregarSiguiente(isbn));
    } catch {
      setMensaje("No pudimos entregar el libro. Intentá nuevamente.");
    } finally {
      setProcesando(null);
    }
  };

  const cerrar = () => {
    cerrarsesion();
    router.dismissAll();
    router.replace("/");
  };

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={librosEsperados}
        keyExtractor={(libro) => libro.isbn}
        ListEmptyComponent={<MensajePantalla titulo="No hay listas de espera" detalle="Todas las colas están vacías." />}
        renderItem={({ item }) => {
          const personas = reservasEspera[item.isbn] ?? [];
          return (
            <View style={styles.tarjeta}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.detalle}>Al frente: {personas[0] ?? "Nadie"} · Esperan: {personas.length}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: procesando === item.isbn }}
                disabled={procesando === item.isbn}
                onPress={() => void entregar(item.isbn)}
                style={styles.boton}
              >
                <Text style={styles.botonTexto}>
                  {procesando === item.isbn ? "Entregando..." : "Entregar al siguiente"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
      {mensaje ? <Text accessibilityLiveRegion="polite" style={styles.mensaje}>{mensaje}</Text> : null}
      <Pressable accessibilityRole="button" onPress={cerrar} style={styles.cerrar}>
        <Text style={styles.cerrarTexto}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background },
  tarjeta: { margin: TEMA.spacing.lg, padding: TEMA.spacing.md, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.surface, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.medium, fontWeight: "700" },
  detalle: { color: TEMA.colors.muted, marginTop: TEMA.spacing.sm },
  boton: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.md, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
  cerrar: { minHeight: TEMA.sizes.touch, margin: TEMA.spacing.lg, alignItems: "center", justifyContent: "center" },
  cerrarTexto: { color: TEMA.colors.danger, fontWeight: "700" },
  mensaje: { color: TEMA.colors.primary, marginHorizontal: TEMA.spacing.lg, textAlign: "center" },
});
