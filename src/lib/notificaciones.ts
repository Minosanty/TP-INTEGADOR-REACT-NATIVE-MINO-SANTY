import { isRunningInExpoGo } from "expo";
import { AndroidImportance } from "expo-notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function prepararCanalPrestamos(): Promise<boolean> {
  if (Platform.OS !== "android" || isRunningInExpoGo()) return false;

  await Notifications.setNotificationChannelAsync("prestamos", {
    name: "Recordatorios de préstamos",
    importance: AndroidImportance.HIGH,
  });
  return true;
}

export async function programarRecordatorio(titulo: string): Promise<string | null> {
  const canalDisponible = await prepararCanalPrestamos();
  const permiso = await Notifications.getPermissionsAsync();
  if (permiso.status !== "granted") return null;
  return Notifications.scheduleNotificationAsync({
    content: { title: "Devolución de Biblioteca IPF", body: `Recordá devolver ${titulo}.`, sound: "default" },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 15,
      ...(canalDisponible ? { channelId: "prestamos" } : {}),
    },
  });
}

export async function cancelarRecordatorio(notificationId: string | null): Promise<void> {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
