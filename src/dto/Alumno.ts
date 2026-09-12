import type { Adeudos } from "./Adeudos.js";
import type { Boleta } from "./Boleta.js";
import type { Creditos } from "./Creditos.js";
import type { HorarioMateria } from "./Horario.js";
import type { ReticulaMateria, ReticulaMap, SemestresReticula } from "./Materias.js";
import type { PeriodoInscripcion } from "./PeriodoInscripcion.js";

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
  /** Periodo de reinscripción (inicio y fin), tal cual el API lo reporta. */
  periodoInscripcion: PeriodoInscripcion;
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
   * Retícula organizada por semestre: `semestres[0]` = 1er semestre.
   * Semestres sin materias son arrays vacíos.
   * ⚠️ Fase de prueba: el parseo de la calificación y el campo `g` siguen
   * pendientes de confirmar.
   */
  semestres: SemestresReticula;
  /**
   * Mapa de acceso directo a materias por clave: `reticulaMap.get("ACF0905")`.
   * Cada materia incluye `anteriores` (prerrequisitos) y `siguientes` (dependientes).
   */
  reticulaMap: ReticulaMap;
}