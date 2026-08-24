import type { ApiTodo } from "../api/types.js";
import type { DatosAlumno } from "../dto/DatosAlumno.js";
import { mapAviso } from "./aviso.mapper.js";
import { mapAlumno } from "./alumno.mapper.js";

export function mapTodo(data: ApiTodo): DatosAlumno {
  return {
    alumno: mapAlumno(data.al),
    avisos: data.lmsg.map(mapAviso),
  };
}
