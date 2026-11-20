import { Stack } from "expo-router";

export default function CatalogoStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Catálogo" }} />
      <Stack.Screen name="libro/[isbn]" />
    </Stack>
  );
}
