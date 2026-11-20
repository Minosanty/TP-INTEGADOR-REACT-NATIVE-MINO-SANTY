import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LIBROS } from "../../data/libros";
import { MensajePantalla } from "../../components/MensajePantalla";
import { TEMA } from "../../constants/tema";
import { useBiblioteca } from "../../context/BibliotecaContext";
import { usePermiso } from "../../hooks/usePermiso";
import type { Prestamo } from "../../types";

export default function MisReservas() {
  const { prestamos, reservasEspera, devolver, cambiarRecordatorio, aviso, limpiarAviso } = useBiblioteca();
  const { estado, actualizar } = usePermiso("notificaciones");
  const reservasPersonales = LIBROS.filter((libro) =>
    (reservasEspera[libro.isbn] ?? []).includes("Ana"),
  );

  useFocusEffect(
    useCallback(() => {
      void actualizar();
    }, [actualizar]),
  );

  const manejarRecordatorio = (prestamo: Prestamo, activo: boolean) => {
    if (activo && estado !== "concedido") {
      router.push({
        pathname: "/permisos/[recurso]",
        params: { recurso: "notificaciones", isbn: prestamo.isbn },
      });
      return;
    }
    void cambiarRecordatorio(prestamo.isbn, activo);
  };

  return (
    <View style={styles.contenedor}>
      {aviso ? (
        <View style={styles.aviso}>
          <Text style={styles.avisoTexto}>{aviso}</Text>
          <Pressable accessibilityRole="button" onPress={limpiarAviso} style={styles.avisoCerrar}>
            <Text style={styles.avisoCerrarTexto}>Cerrar</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.seccion}>Mis préstamos</Text>
      <FlatList
        data={prestamos}
        keyExtractor={(prestamo) => prestamo.isbn}
        ListEmptyComponent={<MensajePantalla titulo="No tenés préstamos activos" detalle="Reservá un libro disponible desde el catálogo." />}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.detalle}>Devolver antes del {new Date(item.vencimiento).toLocaleDateString("es-AR")}</Text>
            <View style={styles.fila}>
              <Text style={styles.recordatorio}>Recordarme</Text>
              <Switch
                value={item.recordatorioActivo}
                onValueChange={(activo) => manejarRecordatorio(item, activo)}
                accessibilityLabel={`Recordarme para devolver ${item.titulo}`}
              />
            </View>
            <Pressable accessibilityRole="button" onPress={() => void devolver(item.isbn)} style={styles.boton}>
              <Text style={styles.botonTexto}>Devolver</Text>
            </Pressable>
          </View>
        )}
      />
      <Text style={styles.seccion}>Reservas en espera</Text>
      <FlatList
        data={reservasPersonales}
        keyExtractor={(libro) => libro.isbn}
        ListEmptyComponent={<MensajePantalla titulo="No estás en ninguna cola" detalle="Las reservas sin ejemplares aparecerán aquí." />}
        renderItem={({ item }) => {
          const posicion = (reservasEspera[item.isbn] ?? []).indexOf("Ana") + 1;
          return (
            <View style={styles.tarjeta}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.detalle}>Tu posición en la lista: {posicion}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background },
  seccion: { color: TEMA.colors.text, fontSize: TEMA.typography.medium, fontWeight: "800", marginHorizontal: TEMA.spacing.lg, marginTop: TEMA.spacing.lg },
  tarjeta: { marginHorizontal: TEMA.spacing.lg, marginTop: TEMA.spacing.sm, padding: TEMA.spacing.md, borderRadius: TEMA.sizes.radius, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border, backgroundColor: TEMA.colors.surface },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.body, fontWeight: "700" },
  detalle: { color: TEMA.colors.muted, marginTop: TEMA.spacing.xs },
  fila: { minHeight: TEMA.sizes.touch, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recordatorio: { color: TEMA.colors.text },
  boton: { minHeight: TEMA.sizes.touch, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.danger, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
  aviso: { margin: TEMA.spacing.lg, padding: TEMA.spacing.md, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.warning },
  avisoTexto: { color: TEMA.colors.surface },
  avisoCerrar: { minHeight: TEMA.sizes.touch, justifyContent: "center", alignItems: "flex-end" },
  avisoCerrarTexto: { color: TEMA.colors.surface, fontWeight: "700" },
});
