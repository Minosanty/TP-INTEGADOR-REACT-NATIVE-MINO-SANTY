import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { buscarLibros } from "../lib/api";
import { FilaLibro } from "../components/FilaLibro";
import { MensajePantalla } from "../components/MensajePantalla";
import { TEMA } from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";
import type { Libro } from "../types";

type EstadoBusqueda = {
  q: string | null;
  resultados: Libro[];
  error: string | null;
};

export default function Buscar() {
  const params = useLocalSearchParams<{ q?: string }>();
  const textoUrl = typeof params.q === "string" ? params.q : "";
  const [intento, setIntento] = useState(0);
  const [busqueda, setBusqueda] = useState<EstadoBusqueda>({
    q: null,
    resultados: [],
    error: null,
  });
  const { ejemplares } = useBiblioteca();

  useEffect(() => {
    let activo = true;
    const temporizador = setTimeout(() => {
      const buscar = async () => {
        try {
          const resultados = await buscarLibros(textoUrl);
          if (activo) setBusqueda({ q: textoUrl, resultados, error: null });
        } catch {
          if (activo) {
            setBusqueda({
              q: textoUrl,
              resultados: [],
              error: "No pudimos realizar la búsqueda.",
            });
          }
        }
      };
      void buscar();
    }, 300);

    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [textoUrl, intento]);

  const cambiarTexto = (valor: string) => {
    router.setParams({ q: valor });
  };
  const cargando = busqueda.q !== textoUrl;
  const errorActual = !cargando ? busqueda.error : null;
  const resultados = !cargando ? busqueda.resultados : [];

  if (errorActual) {
    return (
      <MensajePantalla
        titulo="Búsqueda no disponible"
        detalle={errorActual}
        textoAccion="Reintentar"
        accion={() => setIntento((actual) => actual + 1)}
      />
    );
  }

  return (
    <View style={styles.contenedor}>
      <TextInput
        value={textoUrl}
        onChangeText={cambiarTexto}
        placeholder="Título o autor"
        style={styles.input}
        accessibilityLabel="Buscar por título o autor"
        autoCapitalize="none"
      />
      {cargando ? <ActivityIndicator style={styles.carga} color={TEMA.colors.primary} /> : null}
      <FlatList
        data={resultados}
        keyExtractor={(libro) => libro.isbn}
        ListEmptyComponent={
          cargando
            ? undefined
            : <MensajePantalla titulo="Sin coincidencias" detalle="Probá con otro título o autor." />
        }
        renderItem={({ item }) => (
          <FilaLibro
            libro={item}
            disponible={ejemplares[item.isbn] ?? item.ejemplares}
            alPresionar={(libro) => router.push(`/libro/${libro.isbn}`)}
          />
        )}
        contentContainerStyle={resultados.length === 0 ? styles.vacia : undefined}
      />
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.volver}>
        <Text style={styles.volverTexto}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background },
  input: { minHeight: TEMA.sizes.touch, margin: TEMA.spacing.lg, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.surface, color: TEMA.colors.text, paddingHorizontal: TEMA.spacing.md },
  carga: { marginBottom: TEMA.spacing.sm },
  vacia: { flexGrow: 1 },
  volver: { minHeight: TEMA.sizes.touch, alignItems: "center", justifyContent: "center" },
  volverTexto: { color: TEMA.colors.primary, fontWeight: "700" },
});
