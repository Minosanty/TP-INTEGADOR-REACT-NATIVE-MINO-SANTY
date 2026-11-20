import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useBiblioteca } from "../context/BibliotecaContext";
import { TEMA } from "../constants/tema";

export function NavegacionPrincipal() {
  const { sesionPersonal, cargandoDatos } = useBiblioteca();
  if (cargandoDatos) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={TEMA.colors.primary} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: "Buscar" }} />
      <Stack.Screen name="escanear" options={{ title: "Escanear ISBN", presentation: "card" }} />
      <Stack.Screen name="reservar/[isbn]" options={{ title: "Confirmar reserva", presentation: "modal" }} />
      <Stack.Screen name="permisos/[recurso]" options={{ title: "Permiso", presentation: "modal" }} />
      <Stack.Screen name="reserva" options={{ headerShown: false }} />
      <Stack.Protected guard={!sesionPersonal}>
        <Stack.Screen name="login" options={{ title: "Ingreso del personal", presentation: "modal" }} />
      </Stack.Protected>
      <Stack.Protected guard={sesionPersonal}>
        <Stack.Screen name="mostrador" options={{ title: "Mostrador" }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" options={{ title: "Página no encontrada" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  cargando: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: TEMA.colors.background },
});
