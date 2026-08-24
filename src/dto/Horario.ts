/**
 * Cadena cruda del API con horas y salón para ese día.
 * Formato observado: `"hh:mm-hh:mm GGG\n"` (hora inicio-fin y grupo).
 * Cuando no hay clase el valor llega vacío o solo con salto de línea,
 * por lo que los días sin horario se omiten (`undefined`).
 */
export interface HorarioDia {
  lunes?: string;
  martes?: string;
  miercoles?: string;
  jueves?: string;
  viernes?: string;
  sabado?: string;
}

/**
 * Materia inscrita con su horario semanal, derivada de `gins[]`.
 * Los valores pueden llegar vacíos o enmascarados (p. ej. grupo `*`
 * en periodos vacacionales); la clave y el docente se entregan tal cual.
 */
export interface HorarioMateria {
  /** Clave de la materia (`gins[].mat`). */
  clave: string;
  /** Créditos de la materia; `undefined` si el API no lo reporta. */
  creditos?: number;
  /** Grupo asignado (`gpo`), puede ser `*`. */
  grupo: string;
  /** Docente: apellidos + nombres concatenados. */
  docente: string;
  dias: HorarioDia;
}
