export type Libro = {
  isbn: string;
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;
};

export type Prestamo = {
  isbn: string;
  titulo: string;
  vencimiento: string;
  recordatorioActivo: boolean;
  notificationId: string | null;
};

export type RecursoPermiso = "camara" | "notificaciones";
