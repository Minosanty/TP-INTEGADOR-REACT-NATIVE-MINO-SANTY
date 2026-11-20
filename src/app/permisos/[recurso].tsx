import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MensajePantalla } from "../../components/MensajePantalla";
import { TEMA } from "../../constants/tema";
import { useBiblioteca } from "../../context/BibliotecaContext";
import { usePermiso } from "../../hooks/usePermiso";
import type { RecursoPermiso } from "../../types";

export default function PantallaPermiso() {
  const { recurso, isbn } = useLocalSearchParams<{ recurso: string; isbn?: string }>();
  const valido = recurso === "camara" || recurso === "notificaciones";
  const recursoTipado: RecursoPermiso = recurso === "notificaciones" ? "notificaciones" : "camara";
  const { estado, pedir, error: errorPermiso } = usePermiso(recursoTipado);
  const { cambiarRecordatorio, avisar } = useBiblioteca();
  const [error, setError] = useState<string | null>(null);

  if (!valido) {
    return <MensajePantalla titulo="Permiso desconocido" textoAccion="Ir al Catálogo" accion={() => router.replace("/")} />;
  }

  const beneficio = recurso === "camara"
    ? "La cámara te permite leer el ISBN sin escribirlo manualmente."
    : "Las notificaciones te recuerdan cuándo debes devolver un préstamo.";

  const continuar = async () => {
    setError(null);
    if (estado === "bloqueado") {
      try {
        await Linking.openSettings();
      } catch {
        setError("No pudimos abrir los ajustes del dispositivo. Podés seguir usando las opciones manuales.");
      }
      return;
    }

    try {
      const concedido = estado === "concedido" || await pedir();
      if (recurso === "camara") {
        router.replace("/escanear");
        return;
      }
      if (concedido && isbn) await cambiarRecordatorio(isbn, true);
      if (!concedido) avisar("Sin permiso para notificaciones, los avisos estarán disponibles dentro de la app.");
      router.replace("/reservas");
    } catch (error) {
      const detalle = error instanceof Error ? error.message : String(error);
      setError(`No pudimos solicitar el permiso: ${detalle}`);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Un permiso útil</Text>
      <Text style={styles.beneficio}>{beneficio}</Text>
      {error || errorPermiso ? <Text style={styles.error}>{error ?? errorPermiso}</Text> : null}
      <Pressable accessibilityRole="button" onPress={continuar} style={styles.boton}>
        <Text style={styles.botonTexto}>
          {estado === "bloqueado" ? "Abrir Ajustes" : estado === "error" ? "Reintentar" : "Continuar"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background, padding: TEMA.spacing.xl, justifyContent: "center" },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.title, fontWeight: "800", textAlign: "center" },
  beneficio: { color: TEMA.colors.muted, marginTop: TEMA.spacing.lg, textAlign: "center", lineHeight: TEMA.typography.line },
  error: { color: TEMA.colors.danger, marginTop: TEMA.spacing.md, textAlign: "center" },
  boton: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.xl, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
});
