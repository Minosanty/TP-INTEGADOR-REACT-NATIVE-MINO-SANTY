import { useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FilaLibro } from "../../../components/FilaLibro";
import { MensajePantalla } from "../../../components/MensajePantalla";
import { TEMA } from "../../../constants/tema";
import { useLibros } from "../../../hooks/useLibros";
import { useBiblioteca } from "../../../context/BibliotecaContext";
import { usePermiso } from "../../../hooks/usePermiso";
import type { Libro } from "../../../types";

export default function Catalogo() {
  const navigation = useNavigation();
  const { libros, cargando, error, reintentar } = useLibros();
  const { recientes, ejemplares, sesionPersonal } = useBiblioteca();
  const { estado: estadoCamara } = usePermiso("camara");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir ingreso del personal"
          onPress={() => router.push(sesionPersonal ? "/mostrador" : "/login")}
          style={styles.personal}
        >
          <Text style={styles.personalTexto}>Personal</Text>
        </Pressable>
      ),
    });
  }, [navigation, sesionPersonal]);

  const abrirLibro = (libro: Libro) => router.push(`/libro/${libro.isbn}`);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={TEMA.colors.primary} />
        <Text style={styles.cargando}>Cargando el catálogo...</Text>
      </View>
    );
  }
  if (error) return <MensajePantalla titulo="No pudimos cargar" detalle={error} textoAccion="Reintentar" accion={reintentar} />;

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ListHeaderComponent={
        <View>
          <View style={styles.accesos}>
            <Pressable accessibilityRole="button" onPress={() => router.push("/buscar")} style={styles.acceso}>
              <Ionicons name="search" size={20} color={TEMA.colors.primary} />
              <Text style={styles.accesoTexto}>Buscar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(estadoCamara === "concedido" ? "/escanear" : "/permisos/camara")}
              style={styles.acceso}
            >
              <Ionicons name="camera-outline" size={20} color={TEMA.colors.primary} />
              <Text style={styles.accesoTexto}>Escanear</Text>
            </Pressable>
          </View>
          {recientes.length > 0 ? (
            <View style={styles.recientes}>
              <Text style={styles.subtitulo}>Vistos recientemente</Text>
              {recientes.map((libro) => (
                <Pressable key={libro.isbn} accessibilityRole="button" onPress={() => abrirLibro(libro)} style={styles.reciente}>
                  <Text style={styles.recienteTexto}>{libro.titulo}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={<MensajePantalla titulo="El catálogo está vacío" detalle="Todavía no hay libros disponibles." />}
      renderItem={({ item }) => (
        <FilaLibro libro={item} disponible={ejemplares[item.isbn] ?? item.ejemplares} alPresionar={abrirLibro} />
      )}
      contentContainerStyle={libros.length === 0 ? styles.listaVacia : styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: TEMA.colors.background },
  cargando: { color: TEMA.colors.muted, marginTop: TEMA.spacing.sm },
  lista: { paddingVertical: TEMA.spacing.md, backgroundColor: TEMA.colors.background },
  listaVacia: { flexGrow: 1, backgroundColor: TEMA.colors.background },
  accesos: { flexDirection: "row", gap: TEMA.spacing.sm, padding: TEMA.spacing.lg },
  acceso: { minHeight: TEMA.sizes.touch, flex: 1, borderRadius: TEMA.sizes.radius, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border, backgroundColor: TEMA.colors.surface, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: TEMA.spacing.sm },
  accesoTexto: { color: TEMA.colors.primary, fontWeight: "700" },
  recientes: { paddingHorizontal: TEMA.spacing.lg, paddingBottom: TEMA.spacing.md },
  subtitulo: { color: TEMA.colors.text, fontSize: TEMA.typography.medium, fontWeight: "700", marginBottom: TEMA.spacing.sm },
  reciente: { minHeight: TEMA.sizes.touch, justifyContent: "center" },
  recienteTexto: { color: TEMA.colors.primary },
  personal: { minHeight: TEMA.sizes.touch, justifyContent: "center", paddingHorizontal: TEMA.spacing.sm },
  personalTexto: { color: TEMA.colors.primary, fontWeight: "700" },
});
