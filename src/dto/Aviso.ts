export interface Aviso {
  mensaje: string;
  titulo: string;
  tipo: string;
}

export enum TIPO_AVISO {
  ERROR = "error",
  ADVERTENCIA = "warn",
  INFORMACION = "info",
}
