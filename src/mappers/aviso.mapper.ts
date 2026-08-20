import type { ApiAviso } from "../api/types.js";
import type { Aviso } from "../dto/Aviso.js";
export function mapAviso(data: ApiAviso): Aviso {
  return {
    titulo: data.summary,
    mensaje: data.detail,
    tipo: data.severity,
  };
}
