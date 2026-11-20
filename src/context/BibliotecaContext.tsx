import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LIBROS } from "../data/libros";
import { cancelarRecordatorio, prepararCanalPrestamos, programarRecordatorio } from "../lib/notificaciones";
import { Pila } from "../estructuras/Pila";
import { Cola } from "../estructuras/Cola";
import type { Libro, Prestamo } from "../types";

type ResultadoReserva =
  | { ok: true; tipo: "prestamo" }
  | { ok: true; tipo: "espera"; posicion: number }
  | { ok: false; mensaje: string };

type BibliotecaContextValue = {
  cargandoDatos: boolean;
  sesionPersonal: boolean;
  iniciarsesion: (usuario: string, clave: string) => boolean;
  cerrarsesion: () => void;
  recientes: Libro[];
  registrarReciente: (libro: Libro) => void;
  ejemplares: Record<string, number>;
  prestamos: Prestamo[];
  reservasEspera: Record<string, string[]>;
  reservar: (libro: Libro) => ResultadoReserva;
  entregarSiguiente: (isbn: string) => Promise<string>;
  devolver: (isbn: string) => Promise<void>;
  cambiarRecordatorio: (isbn: string, activo: boolean) => Promise<void>;
  aviso: string | null;
  avisar: (mensaje: string) => void;
  limpiarAviso: () => void;
};

const BibliotecaContext = createContext<BibliotecaContextValue | null>(null);
const STORAGE_KEY = "biblioteca-ipf-estado-v2";

const ESPERA_INICIAL: Record<string, string[]> = {
  "9789505579488": ["Ana", "Luis"],
  "9788420471839": ["Marta", "Nicolás"],
  "9788432217166": ["Sofía"],
  "9780307474278": ["Valentina", "Mateo"],
};

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [sesionPersonal, setSesionPersonal] = useState(false);
  const [recientesPila, setRecientesPila] = useState(() => new Pila<Libro>());
  const [ejemplares, setEjemplares] = useState<Record<string, number>>(
    () => Object.fromEntries(LIBROS.map((libro) => [libro.isbn, libro.ejemplares])),
  );
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [reservasEspera, setReservasEspera] = useState<Record<string, string[]>>(ESPERA_INICIAL);
  const [aviso, setAviso] = useState<string | null>(null);
  const operacionesRecordatorio = useRef(new Map<string, number>());

  const iniciarOperacionRecordatorio = useCallback((isbn: string): number => {
    const revision = (operacionesRecordatorio.current.get(isbn) ?? 0) + 1;
    operacionesRecordatorio.current.set(isbn, revision);
    return revision;
  }, []);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const guardado = await AsyncStorage.getItem(STORAGE_KEY);
        if (guardado && activo) {
          const datos = JSON.parse(guardado) as {
            prestamos?: Prestamo[];
            reservasEspera?: Record<string, string[]>;
            recientes?: Libro[];
            ejemplares?: Record<string, number>;
          };
          if (datos.prestamos) setPrestamos(datos.prestamos);
          if (datos.reservasEspera) setReservasEspera(datos.reservasEspera);
          if (datos.ejemplares) setEjemplares(datos.ejemplares);
          if (datos.recientes) {
            const pila = new Pila<Libro>();
            datos.recientes.forEach((libro) => pila.apilar(libro));
            setRecientesPila(pila);
          }
        }
      } catch {
        if (activo) setAviso("No pudimos recuperar tus datos guardados. Se iniciará una biblioteca nueva.");
      } finally {
        if (activo) setCargandoDatos(false);
      }
    };
    void cargar();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (cargandoDatos) return;
    const guardar = async () => {
      try {
        const estado = {
          prestamos,
          reservasEspera,
          recientes: recientesPila.aArray(),
          ejemplares,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
      } catch {
        setAviso("No pudimos guardar los cambios en este dispositivo.");
      }
    };
    void guardar();
  }, [cargandoDatos, prestamos, reservasEspera, recientesPila, ejemplares]);

  const iniciarsesion = useCallback((usuario: string, clave: string) => {
    if (usuario.trim().toLowerCase() === "personal" && clave === "biblioteca123") {
      setSesionPersonal(true);
      return true;
    }
    return false;
  }, []);

  const cerrarsesion = useCallback(() => setSesionPersonal(false), []);

  const registrarReciente = useCallback((libro: Libro) => {
    setRecientesPila((pilaAnterior) => {
      const libros = pilaAnterior.aArray().filter((item) => item.isbn !== libro.isbn);
      const nuevaPila = new Pila<Libro>();
      [...libros, libro].slice(-3).forEach((item) => nuevaPila.apilar(item));
      return nuevaPila;
    });
  }, []);

  const reservar = useCallback((libro: Libro): ResultadoReserva => {
    if (prestamos.some((prestamo) => prestamo.isbn === libro.isbn)) {
      return { ok: false, mensaje: "Ya tenés un préstamo activo de este libro." };
    }
    if ((reservasEspera[libro.isbn] ?? []).includes("Ana")) {
      return { ok: false, mensaje: "Ya estás en la lista de espera de este libro." };
    }
    if ((ejemplares[libro.isbn] ?? 0) > 0) {
      const vencimiento = new Date();
      vencimiento.setDate(vencimiento.getDate() + 7);
      setEjemplares((actual) => ({ ...actual, [libro.isbn]: (actual[libro.isbn] ?? 0) - 1 }));
      setPrestamos((actual) => [
        ...actual,
        { isbn: libro.isbn, titulo: libro.titulo, vencimiento: vencimiento.toISOString(), recordatorioActivo: false, notificationId: null },
      ]);
      return { ok: true, tipo: "prestamo" };
    }
    const cola = new Cola<string>();
    (reservasEspera[libro.isbn] ?? []).forEach((persona) => cola.encolar(persona));
    cola.encolar("Ana");
    setReservasEspera((actual) => ({ ...actual, [libro.isbn]: cola.aArray() }));
    return { ok: true, tipo: "espera", posicion: cola.tamanio };
  }, [ejemplares, prestamos, reservasEspera]);

  const entregarSiguiente = useCallback(async (isbn: string) => {
    const libro = LIBROS.find((item) => item.isbn === isbn);
    if (!libro) return "No encontramos ese libro en el catálogo.";
    const cola = new Cola<string>();
    (reservasEspera[isbn] ?? []).forEach((persona) => cola.encolar(persona));
    if (cola.tamanio === 0) return "No hay personas esperando este libro.";
    const persona = cola.desencolar();
    setReservasEspera((actual) => ({ ...actual, [isbn]: cola.aArray() }));
    setEjemplares((actual) => ({ ...actual, [isbn]: Math.max(0, (actual[isbn] ?? 0) - 1) }));
    if (persona === "Ana") {
      const vencimiento = new Date();
      vencimiento.setDate(vencimiento.getDate() + 7);
      setPrestamos((actual) => actual.some((item) => item.isbn === isbn)
        ? actual
        : [
            ...actual,
            {
              isbn,
              titulo: libro.titulo,
              vencimiento: vencimiento.toISOString(),
              recordatorioActivo: false,
              notificationId: null,
            },
          ]);
      try {
        const respuesta = await Notifications.getPermissionsAsync();
        if (respuesta.status === "granted") {
          await prepararCanalPrestamos();
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Biblioteca IPF",
              body: "Ya llegó el libro que estabas esperando.",
            },
            trigger: null,
          });
        } else {
          setAviso("Ya llegó el libro que estabas esperando.");
        }
      } catch {
        setAviso("Ya llegó el libro que estabas esperando. No pudimos mostrar una notificación.");
      }
      return `${persona} pasó al frente y recibió el libro.`;
    }
    return `${persona ?? "La persona"} recibió el libro.`;
  }, [reservasEspera]);

  const devolver = useCallback(async (isbn: string) => {
    iniciarOperacionRecordatorio(isbn);
    const prestamo = prestamos.find((item) => item.isbn === isbn);
    if (prestamo) {
      try {
        await cancelarRecordatorio(prestamo.notificationId);
      } catch {
        setAviso("No pudimos cancelar el recordatorio. Intentá devolver el libro nuevamente.");
        return;
      }
    }
    setPrestamos((actual) => actual.filter((item) => item.isbn !== isbn));
    setEjemplares((actual) => ({ ...actual, [isbn]: (actual[isbn] ?? 0) + 1 }));
  }, [iniciarOperacionRecordatorio, prestamos]);

  const cambiarRecordatorio = useCallback(async (isbn: string, activo: boolean) => {
    const revision = iniciarOperacionRecordatorio(isbn);
    const prestamo = prestamos.find((item) => item.isbn === isbn);
    if (!prestamo) return;
    if (!activo) {
      try {
        await cancelarRecordatorio(prestamo.notificationId);
      } catch {
        setAviso("No pudimos cancelar el recordatorio. Intentá nuevamente.");
        return;
      }
      if (operacionesRecordatorio.current.get(isbn) !== revision) return;
      setPrestamos((actual) => actual.map((item) => item.isbn === isbn
        ? { ...item, recordatorioActivo: false, notificationId: null }
        : item));
      return;
    }
    try {
      const notificationId = await programarRecordatorio(prestamo.titulo);
      if (notificationId === null) {
        if (operacionesRecordatorio.current.get(isbn) !== revision) return;
        setAviso("Las notificaciones no están habilitadas; verás los avisos dentro de la app.");
        return;
      }
      if (operacionesRecordatorio.current.get(isbn) !== revision) {
        try {
          await cancelarRecordatorio(notificationId);
        } catch {
          setAviso("No pudimos cancelar un recordatorio que se estaba actualizando.");
        }
        return;
      }
      setPrestamos((actual) => actual.map((item) => item.isbn === isbn
        ? { ...item, recordatorioActivo: true, notificationId }
        : item));
    } catch {
      setAviso("No pudimos programar el recordatorio. Podés seguir usando la app y ver los avisos aquí.");
    }
  }, [iniciarOperacionRecordatorio, prestamos]);

  const avisar = useCallback((mensaje: string) => setAviso(mensaje), []);
  const limpiarAviso = useCallback(() => setAviso(null), []);

  const value = useMemo<BibliotecaContextValue>(() => ({
    cargandoDatos,
    sesionPersonal,
    iniciarsesion,
    cerrarsesion,
    recientes: recientesPila.aArray().reverse(),
    registrarReciente,
    ejemplares,
    prestamos,
    reservasEspera,
    reservar,
    entregarSiguiente,
    devolver,
    cambiarRecordatorio,
    aviso,
    avisar,
    limpiarAviso,
  }), [
    cargandoDatos, sesionPersonal, iniciarsesion, cerrarsesion, recientesPila,
    registrarReciente, ejemplares, prestamos, reservasEspera, reservar,
    entregarSiguiente, devolver, cambiarRecordatorio, aviso, avisar, limpiarAviso,
  ]);

  return <BibliotecaContext.Provider value={value}>{children}</BibliotecaContext.Provider>;
}

export function useBiblioteca(): BibliotecaContextValue {
  const contexto = useContext(BibliotecaContext);
  if (!contexto) throw new Error("BibliotecaProvider no está disponible.");
  return contexto;
}
