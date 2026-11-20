import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { TEMA } from "../constants/tema";
import { useBiblioteca } from "../context/BibliotecaContext";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const { iniciarsesion } = useBiblioteca();

  const entrar = () => {
    if (iniciarsesion(usuario, clave)) router.replace("/mostrador");
    else setError("Usuario o clave incorrectos.");
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Ingreso del personal</Text>
      <TextInput value={usuario} onChangeText={setUsuario} placeholder="Usuario" autoCapitalize="none" style={styles.input} />
      <TextInput value={clave} onChangeText={setClave} placeholder="Clave" secureTextEntry style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" onPress={entrar} style={styles.boton}>
        <Text style={styles.botonTexto}>Ingresar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: TEMA.colors.background, padding: TEMA.spacing.xl, justifyContent: "center" },
  titulo: { color: TEMA.colors.text, fontSize: TEMA.typography.title, fontWeight: "800", textAlign: "center", marginBottom: TEMA.spacing.lg },
  input: { minHeight: TEMA.sizes.touch, borderWidth: TEMA.sizes.border, borderColor: TEMA.colors.border, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.surface, paddingHorizontal: TEMA.spacing.md, marginBottom: TEMA.spacing.sm },
  error: { color: TEMA.colors.danger, marginTop: TEMA.spacing.sm },
  boton: { minHeight: TEMA.sizes.touch, marginTop: TEMA.spacing.md, borderRadius: TEMA.sizes.radius, backgroundColor: TEMA.colors.primary, alignItems: "center", justifyContent: "center" },
  botonTexto: { color: TEMA.colors.surface, fontWeight: "700" },
});
