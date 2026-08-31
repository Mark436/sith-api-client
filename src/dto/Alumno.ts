import type { Adeudos } from "./Adeudos.js";
import type { Boleta } from "./Boleta.js";
import type { Creditos } from "./Creditos.js";
import type { HorarioMateria } from "./Horario.js";
import type { ReticulaMateria } from "./Materias.js";

/**
 * Información del alumno solicitado
 */
export interface Alumno {
  numeroControl: string;
  nombre: string;
  carrera: string;
  correo: string;
  telefono: string;
  semestre: number;
  fechaReinscripcion: string;
  promedioGeneral: number;
  promedioSemestral: number;
  boleta: Boleta;
  adeudos: Adeudos;
  progreso: number;
  creditos: Creditos;
  /**
   * Materias inscritas con horario semanal, derivadas de `gins[]`.
   * Puede llegar vacía (p. ej. en periodos vacacionales).
   */
  horario: HorarioMateria[];
  /**
   * Materias del plan de estudios (retícula), derivadas de `ret[]`.
   * ⚠️ Fase de prueba: los campos `c`/`g` y el parseo de la calificación
   * siguen pendientes de confirmar.
   */
  reticula: ReticulaMateria[];
}
