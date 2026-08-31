import type { ApiTodo } from "../api/types.js";
import type { DatosAlumno } from "../dto/DatosAlumno.js";
import { SithMappingError } from "../errors.js";
import { mapAviso } from "./aviso.mapper.js";
import { mapAlumno } from "./alumno.mapper.js";

function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esApiTodo(data: unknown): data is ApiTodo {
  return (
    esObjetoPlano(data) &&
    esObjetoPlano(data.al) &&
    Array.isArray(data.lmsg)
  );
}

export function mapTodo(data: ApiTodo): DatosAlumno {
  if (!esApiTodo(data)) {
    throw new SithMappingError(
      "El payload del API tiene una forma inesperada: se esperaba un objeto con `al` (objeto) y `lmsg` (arreglo).",
      { cause: data },
    );
  }

  return {
    alumno: mapAlumno(data.al),
    avisos: data.lmsg.map(mapAviso),
  };
}
