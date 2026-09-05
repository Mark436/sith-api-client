import test from "node:test";
import assert from "node:assert/strict";
import { mapReticula } from "../src/mappers/reticula.mapper.js";
import { ESTADO_MATERIA_RETICULA } from "../src/dto/Materias.js";
import { retReticulaMock } from "./helpers/mock.js";

const estadosOficiales = [
  "Falta cursar",
  "Inscripción normal",
  "Acreditada",
  "Acreditada sin calificación",
  "Complementarias aprobadas",
  "Repetición por cursar",
  "Inscripción en repetición",
  "Curso global",
  "A especial",
  "Inscripción en especial",
  "Especial reprobado",
  "Inscrito en curso normal",
  "Inscrito en curso de repetición",
  "Inscrito en curso de especial",
];

const estadosEnOrden = [
  ESTADO_MATERIA_RETICULA.FALTA_CURSAR,
  ESTADO_MATERIA_RETICULA.INSCRIPCION_NORMAL,
  ESTADO_MATERIA_RETICULA.ACREDITADA,
  ESTADO_MATERIA_RETICULA.ACREDITADA_SIN_CALIFICACION,
  ESTADO_MATERIA_RETICULA.COMPLEMENTARIAS_APROBADAS,
  ESTADO_MATERIA_RETICULA.REPETICION_POR_CURSAR,
  ESTADO_MATERIA_RETICULA.INSCRIPCION_EN_REPETICION,
  ESTADO_MATERIA_RETICULA.CURSO_GLOBAL,
  ESTADO_MATERIA_RETICULA.A_ESPECIAL,
  ESTADO_MATERIA_RETICULA.INSCRIPCION_EN_ESPECIAL,
  ESTADO_MATERIA_RETICULA.ESPECIAL_REPROBADO,
  ESTADO_MATERIA_RETICULA.INSCRITO_EN_CURSO_NORMAL,
  ESTADO_MATERIA_RETICULA.INSCRITO_EN_CURSO_DE_REPETICION,
  ESTADO_MATERIA_RETICULA.INSCRITO_EN_CURSO_DE_ESPECIAL,
];

test("mapReticula separa nombre, calificación y oportunidad del texto t", () => {
  const ret = mapReticula(retReticulaMock);

  const conSalto = ret.find((m) => m.clave === "ACF0905");
  assert.equal(conSalto?.nombre, "ECUACIONES DIFERENCIALES");
  assert.deepEqual(conSalto?.calificacion, { calificacion: "87", oportunidad: "OO" });

  const conEspacio = ret.find((m) => m.clave === "ACF0904");
  assert.equal(conEspacio?.nombre, "CALCULO VECTORIAL");
  assert.deepEqual(conEspacio?.calificacion, { calificacion: "83", oportunidad: "OC" });

  const autoAcreditada = ret.find((m) => m.clave === "TUS2010");
  assert.equal(autoAcreditada?.nombre, "TUTORIAS I");
  assert.equal(autoAcreditada?.calificacion, undefined);
  assert.equal(autoAcreditada?.estado, ESTADO_MATERIA_RETICULA.ACREDITADA);
});

test("mapReticula conserva coordenadas y expone el estado", () => {
  const ret = mapReticula(retReticulaMock);

  const materia = ret.find((m) => m.clave === "ACS2010");
  assert.deepEqual(materia?.coordenadas, { x: 6, y: 8 });
  assert.equal(materia?.estado, ESTADO_MATERIA_RETICULA.ACREDITADA_SIN_CALIFICACION);
  assert.equal(materia?.codigoEstado, 3);
  assert.equal(materia?.c, materia?.codigoEstado);
  assert.equal(materia?.g, 0);
});

test("ESTADO_MATERIA_RETICULA documenta los estados según la lista oficial del API", () => {
  assert.deepEqual(estadosEnOrden, estadosOficiales);
});

test("mapReticula decodifica los 14 códigos del estado (0-13)", () => {
  const codigos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const ret = mapReticula(
    codigos.map((c) => ({
      x: 1,
      y: 1,
      c,
      g: 0,
      m: `M${c}`,
      t: "MATERIA SIN NOMBRE ESPECIAL",
      r: [],
    })),
  );
  assert.deepEqual(
    ret.map((m) => m.estado),
    estadosOficiales,
  );
  assert.deepEqual(
    ret.map((m) => m.codigoEstado),
    codigos,
  );
  assert.deepEqual(
    ret.map((m) => m.c),
    codigos,
  );
});

test("mapReticula fuerza a ACREDITADA las auto-acreditables que vienen en 0", () => {
  const ret = mapReticula([
    { x: 1, y: 7, c: 0, g: 0, m: "TUS2010", t: "TUTORIAS I", r: [] },
    { x: 1, y: 6, c: 0, g: 0, m: "TUS2011", t: "TUTORIAS II", r: [] },
    { x: 4, y: 4, c: 0, g: 0, m: "ACC0004", t: "ACTIVIDADES COMPLEMENTARIAS", r: [] },
    { x: 1, y: 5, c: 0, g: 0, m: "ACC0005", t: "ACTIVIDAD COMPLEMENTARIA 5", r: [] },
    { x: 2, y: 6, c: 0, g: 0, m: "EXT0001", t: "EXTRAESCOLARES I", r: [] },
    { x: 2, y: 7, c: 0, g: 0, m: "EXT0002", t: "EXTRAESCOLARES II", r: [] },
  ]);
  for (const materia of ret) {
    assert.equal(materia.estado, ESTADO_MATERIA_RETICULA.ACREDITADA);
    assert.equal(materia.codigoEstado, 2);
    assert.equal(materia.c, 2);
  }
});

test("mapReticula respeta estados no-cero en las auto-acreditables", () => {
  const ret = mapReticula([
    { x: 4, y: 4, c: 3, g: 0, m: "ACC0004", t: "ACTIVIDADES COMPLEMENTARIAS", r: [] },
    { x: 2, y: 6, c: 1, g: 0, m: "EXT0001", t: "EXTRAESCOLARES I", r: [] },
  ]);
  assert.equal(ret[0]?.estado, ESTADO_MATERIA_RETICULA.ACREDITADA_SIN_CALIFICACION);
  assert.equal(ret[0]?.codigoEstado, 3);
  assert.equal(ret[0]?.c, 3);
  assert.equal(ret[1]?.estado, ESTADO_MATERIA_RETICULA.INSCRIPCION_NORMAL);
  assert.equal(ret[1]?.codigoEstado, 1);
  assert.equal(ret[1]?.c, 1);
});

test("mapReticula mapea la seriación a grupos de coordenadas y omite los vacíos", () => {
  const ret = mapReticula(retReticulaMock);

  const conSeria = ret.find((m) => m.clave === "ACF0905");
  assert.deepEqual(conSeria?.seriacion, [[{ x: 3, y: 1 }]]);

  const sinSeria = ret.find((m) => m.clave === "ACF0904");
  assert.deepEqual(sinSeria?.seriacion, []);

  const multi = ret.find((m) => m.clave === "ACS2010");
  assert.deepEqual(multi?.seriacion, [
    [
      { x: 4, y: 8 },
      { x: 5, y: 8 },
    ],
    [{ x: 6, y: 7 }],
  ]);
});

test("mapReticula regresa arreglo vacío cuando no llega ret", () => {
  assert.deepEqual(mapReticula(undefined), []);
  assert.deepEqual(mapReticula([]), []);
});
