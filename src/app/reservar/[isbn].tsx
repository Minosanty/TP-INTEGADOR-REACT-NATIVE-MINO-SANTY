import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LIBROS } from "../../data/libros";
import { MensajePantalla } from "../../components/MensajePantalla";
import { TEMA } from "../../constants/tema";
import { useBiblioteca } from "../../context/BibliotecaContext";

export default function ConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const { ejemplares, reservar, avisar } = useBiblioteca();
  const libro = /^\d{13}$/.test(isbn ?? "") ? LIBROS.find((item) => item.isbn === isbn) : undefined;

  if (!libro) return <MensajePantalla titulo="No podemos reservar este libro" textoAccion="Ir al Catálogo" accion={() => router.replace("/")} />;

  const confirmar = () => {
    const resultado = reservar(libro);
    if (!resultado.ok) {
      setMensaje(resultado.mensaje);
      return;
    }
    const confirmacion = resultado.tipo === "prestamo"
      ? "El préstamo quedó registrado. Tenés 7 días para devolver el libro."
      : `Te anotamos en la lista de espera. Tu posición es ${resultado.posicion}.`;
    avisar(confirmacion);
    router.replace("/reservas");
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.detalle}>
        {(ejemplares[libro.isbn] ?? libro.ejemplares) > 0
          ? "Hay ejemplares disponibles. Al confirmar tendrás el libro por 7 días."
          : "No hay ejemplares disponibles. Tu nombre será agregado a la cola de espera."}
      </Text>
      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
      <Pressable accessibilityRole="button" onPress={confirmar} style={styles.boton}>
        <Text style={styles.botonTexto}>Confirmar</Text>
      </Pressable>
      {mensaje ? (
        <Pressable accessibilityRole="button" onPress={() => router.replace("/reservas")} style={styles.secundario}>
          <Text style={styles.secundarioTexto}>Ver mis reservas</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background, padding: TEMA.spacing.xl },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.title, fontWeight: "800" },
  detalle: { color: TEMA.colors.muted, marginTop: TEMA.spacing.lg, lineHeight: TEMA.typography.line },
  mensaje: { color: TEMA.colors.primary, marginTop: TEMA.spacing.lg, fontWeight: "700" },
  boton: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.xl, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
  secundario: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.sm, alignItems: "center", justifyContent: "center" },
  secundarioTexto: { color: TEMA.colors.primary, fontWeight: "700" },
});
