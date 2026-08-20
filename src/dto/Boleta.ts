import type { CalificacionMateria } from "./Materias.js";

export interface Boleta {
  periodo: string; //Periodo de la boleta
  promedio: string; //promedio del periodo
  materias: CalificacionMateria[]; //lista de las materias de la boleta con calificacion
}
