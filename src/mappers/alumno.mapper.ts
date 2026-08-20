import type { ApiAlumno } from "../api/types.js";
import type { Alumno } from "../dto/Alumno.js";
import { mapBoleta } from "./boleta.mapper.js";
export function mapAlumno(data: ApiAlumno): Alumno {
  return {
    nombre: data.infadic.nom,
    promedioGeneral: data.infadic.prg,
    promedioSemestral: data.infadic.prs,
    numeroControl: data.banco.mp_order,
    carrera: data.infadic.car,
    correo: data.correo,
    telefono: data.telefono,
    semestre: data.infadic.sem,
    boleta: mapBoleta(data.boleta),
  };
}
