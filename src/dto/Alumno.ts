import type { Adeudos } from "./Adeudos.js";
import type { Boleta } from "./Boleta.js";
import type { Creditos } from "./Creditos.js";

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
}
