/**
 * Periodo de reinscripción (`infadic.ini`/`infadic.fin`).
 *
 * Las fechas se exponen tal cual llegan del API (formato
 * `"YYYY-MM-DD hh:mm:ss"`, hora local de Hermosillo), sin conversión ni
 * offset de zona horaria.
 */
export interface PeriodoInscripcion {
  /** Inicio del periodo de reinscripción. */
  inicio: string;
  /** Fin del periodo de reinscripción. */
  fin: string;
}