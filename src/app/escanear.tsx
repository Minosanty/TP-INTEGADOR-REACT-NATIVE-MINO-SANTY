import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView } from "expo-camera";
import { router } from "expo-router";
import { TEMA } from "../constants/tema";
import { usePermiso } from "../hooks/usePermiso";
import { LIBROS } from "../data/libros";

export default function Escanear() {
  const { estado } = usePermiso("camara");
  const [manual, setManual] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const navegado = useRef(false);
  const ultimoAviso = useRef("");

  const procesarIsbn = (isbn: string) => {
    const limpio = isbn.replace(/[^0-9]/g, "");
    if (!/^\d{13}$/.test(limpio)) {
      if (ultimoAviso.current !== "formato") setAviso("El ISBN debe contener exactamente 13 dígitos.");
      ultimoAviso.current = "formato";
      return;
    }
    const libroExiste = LIBROS.some((libro) => libro.isbn === limpio);
    if (!libroExiste) {
      if (ultimoAviso.current !== limpio) setAviso("Ese ISBN no está en el catálogo. Podés seguir intentando.");
      ultimoAviso.current = limpio;
      return;
    }
    if (!navegado.current) {
      navegado.current = true;
      router.replace(`/libro/${limpio}`);
    }
  };

  return (
    <View style={styles.contenedor}>
      {estado === "concedido" ? (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
          onBarcodeScanned={({ data }) => procesarIsbn(data)}
        />
      ) : (
        <View style={styles.estadoCamara}>
          {estado === "cargando" ? <ActivityIndicator size="large" color={TEMA.colors.primary} /> : null}
          <Text style={styles.estadoTexto}>
            {estado === "cargando"
              ? "Consultando el permiso de cámara..."
              : estado === "preguntable"
                ? "La cámara todavía no tiene permiso. Podés escribir el ISBN o solicitarlo."
                : "El permiso de cámara está bloqueado. Podés escribir el ISBN o abrir Ajustes."}
          </Text>
          {estado !== "cargando" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/permisos/camara")}
              style={styles.permiso}
            >
              <Text style={styles.permisoTexto}>
                {estado === "bloqueado" ? "Abrir Ajustes" : "Solicitar permiso"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
      <View style={styles.manual}>
        <TextInput
          value={manual}
          onChangeText={setManual}
          onSubmitEditing={() => procesarIsbn(manual)}
          keyboardType="number-pad"
          maxLength={13}
          placeholder="Escribir ISBN de 13 dígitos"
          accessibilityLabel="Escribir ISBN de 13 dígitos"
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={() => procesarIsbn(manual)} style={styles.boton}>
          <Text style={styles.botonTexto}>Buscar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background },
  camera: { flex: 1 },
  estadoCamara: { flex: 1, alignItems: "center", justifyContent: "center", padding: TEMA.spacing.xl },
  estadoTexto: { color: TEMA.colors.muted, marginTop: TEMA.spacing.md, textAlign: "center" },
  permiso: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.md, justifyContent: "center" },
  permisoTexto: { color: TEMA.colors.primary, fontWeight: "700" },
  aviso: { color: TEMA.colors.danger, backgroundColor: TEMA.colors.surface, padding: TEMA.spacing.md, textAlign: "center" },
  manual: { flexDirection: "row", padding: TEMA.spacing.md, gap: TEMA.spacing.sm },
  input: { flex: 1, minHeight: TEMA.sizes.touch, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.surface, paddingHorizontal: TEMA.spacing.md },
  boton: { minHeight: TEMA.sizes.touch, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, paddingHorizontal: TEMA.spacing.lg, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
});
