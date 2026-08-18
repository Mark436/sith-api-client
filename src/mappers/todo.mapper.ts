import type { ApiTodo } from "../api/types";
import { mapAviso } from "./aviso.mapper.js";
import { mapAlumno } from "./alumno.mapper.js";

export function mapTodo(data: ApiTodo) {
  return {
    alumno: mapAlumno(data.al),
    avisos: data.lmsg.map(mapAviso),
    token: data.tkn.toString(),
    // sessionToken:data.tkn, no estoy seguro de esta parte
  };
}
