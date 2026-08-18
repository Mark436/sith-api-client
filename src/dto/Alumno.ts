import type { Boleta } from "./Boleta";

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
  promedioGeneral: number;
  promedioSemestral: number;
  boleta: Boleta;
}
