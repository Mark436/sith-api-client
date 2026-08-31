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

/** Coordenada de una materia dentro de la retícula (columna, semestre/fila). */
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
 * ⚠️ Fase de prueba: los campos `c` y `g` siguen sin confirmar. `c` **NO** son
 * créditos (las materias de la retícula valen 4-5 créditos según el kardex,
 * pero `c` toma 0/1/2/3/9); su significado real está pendiente de confirmar.
 * `g` llega siempre `0` en las muestras.
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
  /** ⚠️ Fase de prueba: NO es créditos; significado por confirmar. */
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
