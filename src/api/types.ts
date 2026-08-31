/**
 * Tipos crudos del API de SITH, con los nombres originales (muy abreviados)
 * tal como llegan en el JSON.
 *
 * Los comentarios se basan en observación de respuestas reales y en las
 * notas de `_local api samples/api_meaning.json`; varios campos siguen sin
 * confirmarse y se marcan como dudosos.
 */

export interface ApiInfoAdicional {
  nom: string; // nombre del alumno
  car: string; // carrera
  sem: number; // semestre actual
  toca: string; // fecha de reinscripción ("YYYY-MM-DD hh:mm:ss", hora local Hermosillo)
  // promedios
  prg: number; // promedio global
  prs: number; // promedio del semestre
  // créditos de la carrera
  tot: number; // totales
  cfa: number; // faltantes para terminar
  // adeudos; cada área trae "N" cuando no hay adeudo, u otro texto describiéndolo
  abi: string; // biblioteca
  aca: string; // académico
  aes: string; // escolar
  afi: string; // financiero
  ava: string; // administrativo
}

/**
 * Coordenada [x, y] dentro de la retícula, tal como llega en `r`.
 */
export type ApiCoordenadas = [number, number];

export interface ApiMateriaReticula {
  x: number; // posición horizontal / columna de la materia en la retícula
  y: number; // posición vertical / fila (semestre sugerido)
  /**
   * ⚠️ NO son créditos (sin confirmar). En las muestras toma 0/1/2/3/9,
   * sin relación con los créditos reales de la materia (4-5 según el kardex).
   * Significado real pendiente de confirmar.
   */
  c: number;
  /**
   * ⚠️ Sin confirmar. Siempre `0` en las muestras; significado desconocido.
   */
  g: number;
  m: string; // clave de la materia
  /**
   * Nombre de la materia; las materias ya cursadas traen además calificación
   * y oportunidad mezcladas (`"NOMBRE CALIF OPORTUNIDAD"` o
   * `"NOMBRE\nCALIF OPORTUNIDAD"`).
   */
  t: string;
  /**
   * Seriaciones de la materia. Lista de grupos "o": para cursar la materia se
   * requiere cumplir UNA coordenada de cada grupo no vacío. Formato:
   * `[[[x,y], ...], [[x,y], ...], ...]`; los grupos vacíos llegan como `[]`.
   */
  r: ApiCoordenadas[][];
}
export interface ApiMateriaInscripcion {
  mat: string; // clave de la materia
  gbl: string; // información global de la materia (vacío en las muestras)
  cr: number | string; // créditos de la materia (puede llegar vacío "")
  gpo: string; // grupo asignado ("*" si está sin definir)
  mape: string; // apellidos del maestro
  mnom: string; // nombres del maestro
  /**
   * Horario por día: "hh:mm-hh:mm GGG\n" (hora inicio-fin y salón/grupo).
   * Si no hay clase ese día llega vacío o solo "\n".
   */
  lu: string; // lunes
  ma: string; // martes
  mi: string; // miércoles
  ju: string; // jueves
  vi: string; // viernes
  sa: string; // sábado
}
export interface ApiCalificacionMateria {
  clve: string; // clave de la materia
  dmat: string; // nombre de la materia
  cali: string; // calificación (70–100; también textos como "Aprobado"/"No aprobado")
  opor: string; // clave de la oportunidad (OO = ordinaria, OC = complementaria, etc.)
  dopor: string; // descripción legible de la oportunidad ("Ev Ordinaria", ...)
  cr: number; // créditos que vale la materia
}
/**
 * Boleta de un periodo.
 */
export interface ApiBoleta {
  prom: string; // promedio del periodo (string aunque sea numérico)
  descPer: string; // texto del periodo (p. ej. "SEP-FEB 2025")
  lcal: ApiCalificacionMateria[]; // materias del periodo con calificación
}
/**
 * Datos del módulo de pagos. Poco explorado; `mp_order` curiosamente
 * coincide con el número de control y se usa como tal en el mapeo.
 */
export interface ApiBanco {
  mp_amount: string; // adeudo actual
  mp_order: string; // número de control del alumno
}
export interface ApiAlumno {
  tit: string; // número de control + nombre + carrera separados por espacios
  ret: ApiMateriaReticula[]; // retícula (materias del plan de estudios con coordenadas)
  gins: ApiMateriaInscripcion[]; // materias inscritas con horario semanal
  correo: string;
  telefono: string;
  infadic: ApiInfoAdicional; // información adicional del alumno
  /** Kardex histórico. En las muestras llega vacío o igual que `boleta`. */
  kdx: ApiBoleta[];
  boleta: ApiBoleta; // boleta del periodo actual
  banco: ApiBanco; // datos de pagos
}
export interface ApiAviso {
  summary: string; // resumen, útil como título
  detail: string; // mensaje detallado
  severity: string; // severidad conocidos: "error", "warn", "info" (lista no exhaustiva)
}
export interface ApiTodo {
  rol?: string; // rol del usuario ("al" = alumno); presente en otras rutas
  al: ApiAlumno; // información del alumno
  lmsg: ApiAviso[]; // lista de avisos/mensajes
  tkn: string; // token de sesión (JWT) — consumido internamente por el cliente
}
