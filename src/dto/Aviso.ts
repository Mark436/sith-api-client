export interface Aviso {
  mensaje: string;
  titulo: string;
  /**
   * Severidad tal cual la reporta el API. Valores conocidos hasta ahora:
   * `"error"`, `"warn"`, `"info"` (y `"success"` en respuestas fuera del
   * login, p. ej. inscripción). La lista NO es exhaustiva: el tipo se
   * mantiene como `string` a propósito mientras se descubren más valores.
   */
  tipo: string;
}

export enum TIPO_AVISO {
  ERROR = "error",
  ADVERTENCIA = "warn",
  INFORMACION = "info",
}
