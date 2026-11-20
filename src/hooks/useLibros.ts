import { useCallback, useEffect, useState } from "react";
import { obtenerLibros } from "../lib/api";
import type { Libro } from "../types";

export function useLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const datos = await obtenerLibros();
        if (activo) setLibros(datos);
      } catch {
        if (activo) setError("No pudimos cargar el catálogo. Probá nuevamente.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
    return () => { activo = false; };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCargando(true);
    setError(null);
    setIntento((valor) => valor + 1);
  }, []);
  return { libros, cargando, error, reintentar };
}
