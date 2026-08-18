import type { ApiAviso } from "../api/types";
import type { Aviso } from "../dto/Aviso";
export function mapAviso(data: ApiAviso): Aviso {
  return {
    titulo: data.summary,
    mensaje: data.detail,
    prioridad: data.severity,
  };
}
