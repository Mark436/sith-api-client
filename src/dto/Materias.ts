export interface CalificacionMateria {
  clave: string;
  nombre: string;
  calificacion: string;
  /** Código de oportunidad (p. ej. "OO", "OC"); se expone por si se necesita, aunque la descripción legible suele bastar. */
  claveOportunidad: string;
  /** Descripción legible de la oportunidad (p. ej. "Ev Ordinaria"). */
  oportunidad: string;
  creditos: number;
}

/** Coordenada de una materia dentro de la retícula (x = semestre, y = columna dentro del semestre). */
export interface Coordenadas {
  x: number;
  y: number;
}

/**
 * Calificación y oportunidad de una materia ya cursada dentro de la retícula.
 *
 * La carga cruda mezcla todo en el campo de texto `t` (`"NOMBRE 87 OO"` o
 * `"NOMBRE\n87 OO"`); aquí se separan. Si la materia aún no se cursa, ambos
 * campos quedan `undefined`.
 *
 * ⚠️ Fase de prueba: el parseo del texto mezclado está basado en muestras y
 * puede requerir ajustes.
 */
export interface ReticulaCalificacion {
  /** Calificación numérica como texto (p. ej. "87"). */
  calificacion?: string;
  /** Código de oportunidad (p. ej. "OO"). */
  oportunidad?: string;
}

/**
 * Materia del plan de estudios dentro de la retícula.
 *
 * `estado` es el estado de la materia (confirmado; ver
 * `ESTADO_MATERIA_RETICULA`). ⚠️ Fase de prueba: el campo `g` sigue sin
 * confirmar (siempre `0` en las muestras).
 */
export interface ReticulaMateria {
  /** Clave de la materia (`m`). */
  clave: string;
  /** Nombre de la materia, extraído de `t` (sin calificación/oportunidad). */
  nombre: string;
  /** Posición de la materia en la retícula. */
  coordenadas: Coordenadas;
  /** Calificación/oportunidad si la materia ya fue cursada; `undefined` si no. */
  calificacion?: ReticulaCalificacion;
  /** Código numérico del estado de la materia (campo crudo `c`). */
  codigoEstado: number;
  /** Estado legible de la materia. Ver `ESTADO_MATERIA_RETICULA`. */
  estado: ESTADO_MATERIA_RETICULA;
  /**
   * @deprecated Mantenido por retrocompatibilidad; usa `estado` (texto) o
   * `codigoEstado` (código). Corresponde al campo crudo `c` del API.
   */
  c: number;
  /** ⚠️ Fase de prueba: siempre `0` en las muestras; significado por confirmar. */
  g: number;
  /**
   * Seriaciones de la materia (`r`). Cada grupo "o" es uno de los sub-arrays:
   * para cursar esta materia se requiere aprobar UNA de las coordenadas
   * listadas en cada grupo. Los sub-arrays vacíos se omiten.
   */
  seriacion: Coordenadas[][];
}

/**
 * Estado de la materia en la retícula (campo `c` del API). Cadena legible;
 * el código numérico original se conserva en `ReticulaMateria.codigoEstado`
 * (y en `c`, deprecado). Lista oficial de estados (0-13) en el orden del API.
 */
export enum ESTADO_MATERIA_RETICULA {
  /** 0 — Falta cursar */
  FALTA_CURSAR = "Falta cursar",
  /** 1 — Inscripción normal */
  INSCRIPCION_NORMAL = "Inscripción normal",
  /** 2 — Acreditada */
  ACREDITADA = "Acreditada",
  /** 3 — Acreditada sin calificación */
  ACREDITADA_SIN_CALIFICACION = "Acreditada sin calificación",
  /** 4 — Complementarias aprobadas */
  COMPLEMENTARIAS_APROBADAS = "Complementarias aprobadas",
  /** 5 — Repetición por cursar */
  REPETICION_POR_CURSAR = "Repetición por cursar",
  /** 6 — Inscripción en repetición */
  INSCRIPCION_EN_REPETICION = "Inscripción en repetición",
  /** 7 — Curso global */
  CURSO_GLOBAL = "Curso global",
  /** 8 — A especial */
  A_ESPECIAL = "A especial",
  /** 9 — Inscripción en especial */
  INSCRIPCION_EN_ESPECIAL = "Inscripción en especial",
  /** 10 — Especial reprobado */
  ESPECIAL_REPROBADO = "Especial reprobado",
  /** 11 — Inscrito en curso normal */
  INSCRITO_EN_CURSO_NORMAL = "Inscrito en curso normal",
  /** 12 — Inscrito en curso de repetición */
  INSCRITO_EN_CURSO_DE_REPETICION = "Inscrito en curso de repetición",
  /** 13 — Inscrito en curso de especial */
  INSCRITO_EN_CURSO_DE_ESPECIAL = "Inscrito en curso de especial",
}
