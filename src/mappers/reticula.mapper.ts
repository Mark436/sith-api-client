import type { ApiCoordenadas, ApiMateriaReticula } from "../api/types.js";
import { ESTADO_MATERIA_RETICULA } from "../dto/Materias.js";
import type {
  Coordenadas,
  ReticulaCalificacion,
  ReticulaMateria,
  ReticulaMap,
  SemestresReticula,
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
    .map((grupo): Coordenadas[] => grupo.map((c) => mapCoordenadas(c)));
}

/**
 * Materias que se consideran "auto-acreditables": tutorías, actividades
 * complementarias y extraescolares. El API suele reportarlas en estado 0
 * (falta cursar) o 1 (inscripción normal) aun cuando el alumno ya las completó.
 */
const MATERIAS_AUTO_ACREDITADAS = ["TUTORIA", "COMPLEMENTARIA", "EXTRAESCOLAR"] as const;

function esAutoAcreditada(nombre: string): boolean {
  const normalizado = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  return MATERIAS_AUTO_ACREDITADAS.some((clave) => normalizado.includes(clave));
}

/** Decodifica el código numérico del estado (`c`) a su cadena legible. */
const ESTADOS_POR_CODIGO: Record<number, ESTADO_MATERIA_RETICULA> = {
  0: ESTADO_MATERIA_RETICULA.FALTA_CURSAR,
  1: ESTADO_MATERIA_RETICULA.INSCRIPCION_NORMAL,
  2: ESTADO_MATERIA_RETICULA.ACREDITADA,
  3: ESTADO_MATERIA_RETICULA.ACREDITADA_SIN_CALIFICACION,
  4: ESTADO_MATERIA_RETICULA.COMPLEMENTARIAS_APROBADAS,
  5: ESTADO_MATERIA_RETICULA.REPETICION_POR_CURSAR,
  6: ESTADO_MATERIA_RETICULA.INSCRIPCION_EN_REPETICION,
  7: ESTADO_MATERIA_RETICULA.CURSO_GLOBAL,
  8: ESTADO_MATERIA_RETICULA.A_ESPECIAL,
  9: ESTADO_MATERIA_RETICULA.INSCRIPCION_EN_ESPECIAL,
  10: ESTADO_MATERIA_RETICULA.ESPECIAL_REPROBADO,
  11: ESTADO_MATERIA_RETICULA.INSCRITO_EN_CURSO_NORMAL,
  12: ESTADO_MATERIA_RETICULA.INSCRITO_EN_CURSO_DE_REPETICION,
  13: ESTADO_MATERIA_RETICULA.INSCRITO_EN_CURSO_DE_ESPECIAL,
};

interface MateriaConIndices {
  materia: ReticulaMateria;
  coordenadasPrerrequisitos: ApiCoordenadas[][];
}

/**
 * Mapea la retícula cruda a una estructura organizada:
 * - Matriz 2D por semestre (semestres[0] = 1er semestre)
 * - Map por clave para acceso directo O(1)
 * - Cada materia incluye `anteriores` y `siguientes` (claves de prerrequisitos/dependientes)
 */
export function mapReticulaEstructurada(
  data: ApiMateriaReticula[] | undefined,
): { semestres: SemestresReticula; mapa: ReticulaMap } {
  if (!data || data.length === 0) {
    return { semestres: [], mapa: new Map() };
  }

  // PASADA 1: Crear materias base, agrupar por semestre, construir Map coordenada->clave
  const mapa = new Map<string, ReticulaMateria>();
  const coordenadaAClave = new Map<string, string>();
  const materiasPorSemestre = new Map<number, ReticulaMateria[]>();
  let maxSemestre = 0;

  const materiasConIndices: MateriaConIndices[] = [];

  for (const m of data) {
    const nombre = mapNombre(m.t);
    let codigo = m.c;
    if ((codigo === 0 || codigo === 1) && esAutoAcreditada(nombre)) {
      codigo = 2;
    }

    const coordenadas: Coordenadas = { x: m.x, y: m.y };
    const clave = m.m.trim();

    const materia: ReticulaMateria = {
      clave,
      nombre,
      coordenadas,
      calificacion: mapCalificacion(m.t),
      codigoEstado: codigo,
      estado: ESTADOS_POR_CODIGO[codigo] ?? (String(codigo) as ESTADO_MATERIA_RETICULA),
      anteriores: [],
      siguientes: [],
      seriacion: mapSeriacion(m.r ?? []),
    };

    mapa.set(clave, materia);
    coordenadaAClave.set(`${m.x},${m.y}`, clave);

    if (!materiasPorSemestre.has(m.x)) {
      materiasPorSemestre.set(m.x, []);
    }
    materiasPorSemestre.get(m.x)!.push(materia);

    if (m.x > maxSemestre) {
      maxSemestre = m.x;
    }

    materiasConIndices.push({
      materia,
      coordenadasPrerrequisitos: m.r ?? [],
    });
  }

  // PASADA 2: Resolver anteriores/siguientes usando el Map de coordenadas
  for (const { materia, coordenadasPrerrequisitos } of materiasConIndices) {
    const anterioresSet = new Set<string>();

    for (const grupo of coordenadasPrerrequisitos) {
      for (const coord of grupo) {
        const clavePrerreq = coordenadaAClave.get(`${coord[0]},${coord[1]}`);
        if (clavePrerreq && clavePrerreq !== materia.clave) {
          anterioresSet.add(clavePrerreq);
        }
      }
    }

    materia.anteriores = Array.from(anterioresSet);

    // Construir índice inverso: para cada prerrequisito, agregar esta materia como "siguiente"
    for (const clavePrerreq of anterioresSet) {
      const prerreq = mapa.get(clavePrerreq);
      if (prerreq && !prerreq.siguientes.includes(materia.clave)) {
        prerreq.siguientes.push(materia.clave);
      }
    }
  }

  // Construir matriz 2D: semestres[0] = semestre 1, etc.
  const semestres: SemestresReticula = [];
  for (let i = 1; i <= maxSemestre; i++) {
    semestres.push(materiasPorSemestre.get(i) ?? []);
  }

  return { semestres, mapa };
}

/**
 * @deprecated Usa `mapReticulaEstructurada` para obtener semestres + mapa con anteriores/siguientes.
 * Esta función se mantiene por compatibilidad temporal y será eliminada en v5.
 */
export function mapReticula(
  data: ApiMateriaReticula[] | undefined,
): ReticulaMateria[] {
  if (!data) {
    return [];
  }
  return data.map((materia) => {
    const nombre = mapNombre(materia.t);
    let codigo = materia.c;
    if ((codigo === 0 || codigo === 1) && esAutoAcreditada(nombre)) {
      codigo = 2;
    }
    return {
      clave: materia.m.trim(),
      nombre,
      coordenadas: { x: materia.x, y: materia.y },
      calificacion: mapCalificacion(materia.t),
      codigoEstado: codigo,
      estado:
        ESTADOS_POR_CODIGO[codigo] ??
        (String(codigo) as ESTADO_MATERIA_RETICULA),
      anteriores: [],
      siguientes: [],
      seriacion: mapSeriacion(materia.r ?? []),
    };
  });
}