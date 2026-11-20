import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as Notifications from "expo-notifications";
import { prepararCanalPrestamos } from "../lib/notificaciones";
import type { RecursoPermiso } from "../types";

export type EstadoPermiso = "cargando" | "concedido" | "preguntable" | "bloqueado" | "error";

export function usePermiso(recurso: RecursoPermiso) {
  const [permisoCamara, pedirCamara, actualizarCamara] = useCameraPermissions();
  const [estado, setEstado] = useState<EstadoPermiso>("cargando");
  const [error, setError] = useState<string | null>(null);

  const actualizar = useCallback(async () => {
    if (recurso === "camara") {
      await actualizarCamara();
      return;
    }
    try {
      const permiso = await Notifications.getPermissionsAsync();
      setError(null);
      setEstado(permiso.status === "granted" ? "concedido" : permiso.canAskAgain ? "preguntable" : "bloqueado");
    } catch {
      setEstado("error");
      setError("No pudimos consultar el permiso de notificaciones. Intentá nuevamente.");
    }
  }, [actualizarCamara, recurso]);

  useEffect(() => {
    let activo = true;
    const obtenerEstado = async () => {
      if (recurso === "camara") {
        if (permisoCamara?.status === "granted") setEstado("concedido");
        else if (permisoCamara?.status === "denied" && permisoCamara.canAskAgain === false) setEstado("bloqueado");
        else if (permisoCamara) setEstado("preguntable");
        else setEstado("cargando");
        return;
      }
      try {
        const permiso = await Notifications.getPermissionsAsync();
        if (activo) {
          setError(null);
          setEstado(permiso.status === "granted" ? "concedido" : permiso.canAskAgain ? "preguntable" : "bloqueado");
        }
      } catch {
        if (activo) {
          setEstado("error");
          setError("No pudimos consultar el permiso de notificaciones. Intentá nuevamente.");
        }
      }
    };
    void obtenerEstado();
    return () => { activo = false; };
  }, [permisoCamara, recurso]);

  useEffect(() => {
    const manejarAppState = (estadoApp: AppStateStatus) => {
      if (estadoApp === "active") void actualizar();
    };
    const suscripcion = AppState.addEventListener("change", manejarAppState);
    return () => suscripcion.remove();
  }, [actualizar]);

  const pedir = useCallback(async (): Promise<boolean> => {
    if (recurso === "camara") {
      const respuesta = await pedirCamara();
      await actualizarCamara();
      return respuesta.granted;
    }
    setError(null);
    await prepararCanalPrestamos();
    const permiso = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    setEstado(permiso.status === "granted" ? "concedido" : permiso.canAskAgain ? "preguntable" : "bloqueado");
    return permiso.status === "granted";
  }, [pedirCamara, actualizarCamara, recurso]);

  return { estado, pedir, actualizar, error };
}
