import type { ApiCalificacionMateria } from "../api/types";
import type { CalificacionMateria } from "../dto/Materias";

export function mapCalificacionMateria(
  data: ApiCalificacionMateria,
): CalificacionMateria {
  return {
    clave: data.clve,
    nombre: data.dmat,
    calificacion: data.cali,
    oportunidad: data.dopor,
    claveOportunidad: data.opor,
    creditos: data.cr,
  };
}
