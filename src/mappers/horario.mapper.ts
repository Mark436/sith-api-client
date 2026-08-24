import type { ApiMateriaInscripcion } from "../api/types.js";
import type { HorarioDia, HorarioMateria } from "../dto/Horario.js";

function limpiarDia(valor: string | undefined): string | undefined {
  const limpio = valor?.trim();
  return limpio ? limpio : undefined;
}

function mapearDias(data: ApiMateriaInscripcion): HorarioDia {
  const dias: HorarioDia = {};
  const pares: Array<[keyof HorarioDia, string | undefined]> = [
    ["lunes", data.lu],
    ["martes", data.ma],
    ["miercoles", data.mi],
    ["jueves", data.ju],
    ["viernes", data.vi],
    ["sabado", data.sa],
  ];
  for (const [dia, valor] of pares) {
    const limpio = limpiarDia(valor);
    if (limpio !== undefined) {
      dias[dia] = limpio;
    }
  }
  return dias;
}

function mapearCreditos(cr: number | string): number | undefined {
  if (cr === "") {
    return undefined;
  }
  const creditos = Number(cr);
  return Number.isFinite(creditos) ? creditos : undefined;
}

export function mapHorario(data: ApiMateriaInscripcion): HorarioMateria {
  return {
    clave: data.mat.trim(),
    creditos: mapearCreditos(data.cr),
    grupo: data.gpo.trim(),
    docente: `${data.mape} ${data.mnom}`.trim(),
    dias: mapearDias(data),
  };
}
