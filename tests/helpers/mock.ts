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
