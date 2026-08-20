import type { ApiBoleta } from "../api/types.js";
import type { Boleta } from "../dto/Boleta.js";
import { mapCalificacionMateria } from "./calificacionMateria.mapper.js";

export function mapBoleta(data: ApiBoleta): Boleta {
  return {
    periodo: data.descPer,
    promedio: data.prom,
    materias: data.lcal.map(mapCalificacionMateria),
  };
}
