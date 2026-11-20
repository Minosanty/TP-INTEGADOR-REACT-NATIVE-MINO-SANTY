import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LIBROS } from "../../../../data/libros";
import { MensajePantalla } from "../../../../components/MensajePantalla";
import { TEMA } from "../../../../constants/tema";
import { useBiblioteca } from "../../../../context/BibliotecaContext";

export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const navigation = useNavigation();
  const { ejemplares, reservasEspera, registrarReciente } = useBiblioteca();
  const valido = /^\d{13}$/.test(isbn ?? "");
  const libro = valido ? LIBROS.find((item) => item.isbn === isbn) : undefined;

  useEffect(() => {
    if (libro) {
      navigation.setOptions({ title: libro.titulo });
      registrarReciente(libro);
    } else {
      navigation.setOptions({ title: "Libro inexistente" });
    }
  }, [libro, navigation, registrarReciente]);

  if (!valido) {
    return <MensajePantalla titulo="El ISBN no es válido" detalle="Debe tener exactamente 13 dígitos." textoAccion="Ir al Catálogo" accion={() => router.replace("/")} />;
  }
  if (!libro) {
    return <MensajePantalla titulo="No encontramos ese libro" detalle={`El ISBN ${isbn} no está en el catálogo.`} textoAccion="Ir al Catálogo" accion={() => router.replace("/")} />;
  }

  const disponibles = ejemplares[libro.isbn] ?? libro.ejemplares;
  const espera = reservasEspera[libro.isbn] ?? [];
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.autor}>{libro.autor}</Text>
      <Text style={styles.metadato}>Año: {libro.anio}</Text>
      <Text style={styles.metadato}>ISBN: {libro.isbn}</Text>
      <Text style={disponibles > 0 ? styles.disponible : styles.espera}>
        {disponibles > 0 ? `${disponibles} ejemplar(es) disponible(s)` : "Sin ejemplares disponibles"}
      </Text>
      <Text style={styles.esperaTexto}>{espera.length} persona(s) en lista de espera</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push(`/reservar/${libro.isbn}`)} style={styles.boton}>
        <Text style={styles.botonTexto}>Reservar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background, padding: TEMA.spacing.xl },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.display, fontWeight: "800" },
  autor: { color: TEMA.colors.primary, fontSize: TEMA.typography.medium, marginTop: TEMA.spacing.sm },
  metadato: { color: TEMA.colors.muted, marginTop: TEMA.spacing.sm },
  disponible: { color: TEMA.colors.success, marginTop: TEMA.spacing.lg, fontWeight: "700" },
  espera: { color: TEMA.colors.warning, marginTop: TEMA.spacing.lg, fontWeight: "700" },
  esperaTexto: { color: TEMA.colors.muted, marginTop: TEMA.spacing.sm },
  boton: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.xl, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
});
