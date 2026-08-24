import type { Aviso } from "./Aviso.js";
import type { Alumno } from "./Alumno.js";

/**
 * Resultado de `fetchDatos()` y `mapDatos()`.
 */
export interface DatosAlumno {
  alumno: Alumno;
  avisos: Aviso[];
}
