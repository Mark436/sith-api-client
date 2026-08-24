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

export interface ApiMateriaReticula {
  x: number; // posición horizontal / columna de la materia en la retícula
  y: number; // posición vertical / fila (semestre sugerido)
  c: number; // probablemente créditos de la materia (sin confirmar)
  g: number; // probablemente grupo (sin confirmar)
  m: string; // clave de la materia
  t: string; // nombre de la materia, posiblemente seguido de calificación y oportunidad
  /**
   * Registros/información relacionada con la materia (serias con las que
   * se cursa). El formato exacto aún no está claro; en muestras llega como
   * listas anidadas de pares [x, y].
   */
  r: unknown;
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
