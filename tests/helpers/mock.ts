import type { ApiTodo } from "../../src/api/types.js";

/**
 * Payload crudo fabricado para las pruebas unitarias.
 * Todos los datos son inventados; no reflejan ningún alumno real.
 */
export const baseApiTodo: ApiTodo = {
  al: {
    tit: "00000000 NOMBRE PRUEBA INGENIERIA EN SISTEMAS",
    ret: [],
    gins: [],
    correo: "prueba@ejemplo.mx",
    telefono: "0000000000",
    infadic: {
      nom: "NOMBRE PRUEBA",
      car: "INGENIERIA EN SISTEMAS COMPUTACIONALES",
      sem: 1,
      toca: "2026-01-05 08:00:00",
      prg: 90,
      prs: 85,
      tot: 300,
      cfa: 150,
      abi: "N",
      aca: "N",
      aes: "N",
      afi: "N",
      ava: "N",
    },
    kdx: [],
    boleta: {
      prom: "90",
      descPer: "AGO-DIC 2026",
      lcal: [
        {
          clve: "SCC-1001",
          dmat: "MATERIA PRUEBA",
          cali: "95",
          opor: "OO",
          dopor: "Ev Ordinaria",
          cr: 10,
        },
      ],
    },
    banco: { mp_amount: "0", mp_order: "00000000" },
  },
  lmsg: [{ summary: "Bienvenido", detail: "Sesión iniciada", severity: "info" }],
  tkn: "token-mock",
};

/**
 * Retícula cruda fabricada (`ret[]`). Cubre las variantes observadas del
 * campo `t`: nombre con calificación+oportunidad separados por salto de
 * línea, por espacio, y materia sin cursar (solo nombre). Incluye seriación
 * con grupos "o" (y grupos vacíos que el mapper debe omitir).
 */
export const retReticulaMock = [
  {
    x: 4,
    y: 1,
    c: 2,
    g: 0,
    m: "ACF0905",
    t: "ECUACIONES DIFERENCIALES\n87 OO",
    r: [[[3, 1]], []],
  },
  {
    x: 3,
    y: 1,
    c: 2,
    g: 0,
    m: "ACF0904",
    t: "CALCULO VECTORIAL 83 OC",
    r: [[], []],
  },
  {
    x: 1,
    y: 7,
    c: 0,
    g: 0,
    m: "TUS2010",
    t: "TUTORIAS I",
    r: [[], []],
  },
  {
    x: 6,
    y: 8,
    c: 3,
    g: 0,
    m: "ACS2010",
    t: "ACTIVIDADES COMPLEMENTARIAS",
    r: [[[4, 8], [5, 8]], [[6, 7]]],
  },
];

/** `baseApiTodo` con la retícula poblada, para pruebas de `4a`. */
export const baseApiTodoReticula: ApiTodo = {
  ...baseApiTodo,
  al: { ...baseApiTodo.al, ret: retReticulaMock },
};

