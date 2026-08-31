import type { ApiCoordenadas, ApiMateriaReticula } from "../api/types.js";
import type {
  Coordenadas,
  ReticulaCalificacion,
  ReticulaMateria,
} from "../dto/Materias.js";

function mapCoordenadas(coordenada: ApiCoordenadas): Coordenadas {
  return { x: coordenada[0], y: coordenada[1] };
}

/**
 * Separa el nombre de la materia de su calificación y oportunidad.
 *
 * La carga cruda `t` mezcla el nombre con la calificación y la oportunidad de
 * la materia ya cursada. En las muestras llegó con ambos separadores:
 * `"NOMBRE\n87 OO"` y `"NOMBRE 87 OO"` (espacio).
 *
 * ⚠️ Fase de prueba: el límite entre el nombre y la calificación se detecta
 * buscando el primer número al final del texto; puede requerir ajustes.
 */
function mapNombre(t: string): string {
  return t.trim().split(/\s*\d/)[0].trim();
}

function mapCalificacion(t: string): ReticulaCalificacion | undefined {
  const texto = t.trim();
  // Último token: "CALIF OPORTUNIDAD" (p. ej. "87 OO"); si solo hay nombre no hay calificación.
  const coincidencia = texto.match(/(\d{2,3}|[0-9]+)\s+([A-Z]{2})$/);
  if (!coincidencia) {
    return undefined;
  }
  return {
    calificacion: coincidencia[1],
    oportunidad: coincidencia[2],
  };
}

function mapSeriacion(r: ApiCoordenadas[][]): Coordenadas[][] {
  return r
    .filter((grupo) => grupo.length > 0)
    .map((grupo) => grupo.map(mapCoordenadas));
}

export function mapReticula(
  data: ApiMateriaReticula[] | undefined,
): ReticulaMateria[] {
  if (!data) {
    return [];
  }
  return data.map((materia) => ({
    clave: materia.m.trim(),
    nombre: mapNombre(materia.t),
    coordenadas: { x: materia.x, y: materia.y },
    calificacion: mapCalificacion(materia.t),
    c: materia.c,
    g: materia.g,
    seriacion: mapSeriacion(materia.r ?? []),
  }));
}
