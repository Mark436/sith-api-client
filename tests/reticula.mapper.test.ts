import test from "node:test";
import assert from "node:assert/strict";
import { mapReticula, mapReticulaEstructurada } from "../src/mappers/reticula.mapper.js";
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

test("mapReticula (legacy) separa nombre, calificación y oportunidad del texto t", () => {
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

test("mapReticula (legacy) conserva coordenadas y expone el estado", () => {
  const ret = mapReticula(retReticulaMock);

  const materia = ret.find((m) => m.clave === "ACS2010");
  assert.deepEqual(materia?.coordenadas, { x: 6, y: 8 });
  assert.equal(materia?.estado, ESTADO_MATERIA_RETICULA.ACREDITADA_SIN_CALIFICACION);
  assert.equal(materia?.codigoEstado, 3);
  // deprecated fields removed in v4
  assert.equal("anteriores" in materia, true);
  assert.equal("siguientes" in materia, true);
});

test("ESTADO_MATERIA_RETICULA documenta los estados según la lista oficial del API", () => {
  assert.deepEqual(estadosEnOrden, estadosOficiales);
});

test("mapReticula (legacy) decodifica los 14 códigos del estado (0-13)", () => {
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
});

test("mapReticula (legacy) fuerza a ACREDITADA las auto-acreditables que vienen en 0 o 1", () => {
  const ret = mapReticula([
    { x: 1, y: 7, c: 0, g: 0, m: "TUS2010", t: "TUTORIAS I", r: [] },
    { x: 1, y: 6, c: 1, g: 0, m: "TUS2011", t: "TUTORIAS II", r: [] },
    { x: 4, y: 4, c: 0, g: 0, m: "ACC0004", t: "ACTIVIDADES COMPLEMENTARIAS", r: [] },
    { x: 1, y: 5, c: 1, g: 0, m: "ACC0005", t: "ACTIVIDAD COMPLEMENTARIA 5", r: [] },
    { x: 2, y: 6, c: 0, g: 0, m: "EXT0001", t: "EXTRAESCOLARES I", r: [] },
    { x: 2, y: 7, c: 1, g: 0, m: "EXT0002", t: "EXTRAESCOLARES II", r: [] },
  ]);
  for (const materia of ret) {
    assert.equal(materia.estado, ESTADO_MATERIA_RETICULA.ACREDITADA);
    assert.equal(materia.codigoEstado, 2);
  }
});

test("mapReticula (legacy) respeta estados ya acreditados o en curso en las auto-acreditables", () => {
  const ret = mapReticula([
    { x: 4, y: 4, c: 3, g: 0, m: "ACC0004", t: "ACTIVIDADES COMPLEMENTARIAS", r: [] },
    { x: 2, y: 6, c: 4, g: 0, m: "EXT0001", t: "EXTRAESCOLARES I", r: [] },
  ]);
  assert.equal(ret[0]?.estado, ESTADO_MATERIA_RETICULA.ACREDITADA_SIN_CALIFICACION);
  assert.equal(ret[0]?.codigoEstado, 3);
  assert.equal(ret[1]?.estado, ESTADO_MATERIA_RETICULA.COMPLEMENTARIAS_APROBADAS);
  assert.equal(ret[1]?.codigoEstado, 4);
});

test("mapReticula (legacy) mapea la seriación a grupos de coordenadas y omite los vacíos", () => {
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

test("mapReticula (legacy) regresa arreglo vacío cuando no llega ret", () => {
  assert.deepEqual(mapReticula(undefined), []);
  assert.deepEqual(mapReticula([]), []);
});

// ===== NUEVOS TESTS PARA mapReticulaEstructurada =====

test("mapReticulaEstructurada organiza materias en matriz 2D por semestre", () => {
  const { semestres } = mapReticulaEstructurada(retReticulaMock);

  // Semestres 1, 3, 4, 6 tienen materias; 2 y 5 están vacíos
  assert.equal(semestres.length, 6); // max semestre = 6
  assert.equal(semestres[0].length, 1); // semestre 1: TUS2010 (x=1)
  assert.equal(semestres[1].length, 0); // semestre 2: vacío
  assert.equal(semestres[2].length, 1); // semestre 3: ACF0904 (x=3)
  assert.equal(semestres[3].length, 1); // semestre 4: ACF0905 (x=4)
  assert.equal(semestres[4].length, 0); // semestre 5: vacío
  assert.equal(semestres[5].length, 1); // semestre 6: ACS2010 (x=6)

  // Verificar orden dentro del semestre (por y)
  assert.equal(semestres[0][0].clave, "TUS2010");
  assert.equal(semestres[2][0].clave, "ACF0904");
  assert.equal(semestres[3][0].clave, "ACF0905");
  assert.equal(semestres[5][0].clave, "ACS2010");
});

test("mapReticulaEstructurada expone Map por clave para acceso O(1)", () => {
  const { mapa } = mapReticulaEstructurada(retReticulaMock);

  assert.equal(mapa.size, 4);
  assert.ok(mapa.has("ACF0905"));
  assert.ok(mapa.has("ACF0904"));
  assert.ok(mapa.has("TUS2010"));
  assert.ok(mapa.has("ACS2010"));

  const materia = mapa.get("ACF0905")!;
  assert.equal(materia.clave, "ACF0905");
  assert.equal(materia.nombre, "ECUACIONES DIFERENCIALES");
  assert.deepEqual(materia.coordenadas, { x: 4, y: 1 });
});

test("mapReticulaEstructurada resuelve 'anteriores' (prerrequisitos) desde la seriación", () => {
  const { mapa } = mapReticulaEstructurada(retReticulaMock);

  // ACF0905 (x=4,y=1) tiene seriación [[[3,1]]] -> prerrequisito ACF0904 (x=3,y=1)
  const acf0905 = mapa.get("ACF0905")!;
  assert.deepEqual(acf0905.anteriores, ["ACF0904"]);

  // ACS2010 (x=6,y=8) tiene seriación [[[4,8],[5,8]], [[6,7]]]
  // Pero en el mock solo existe ACF0905 (4,1) - no hay materias en (4,8), (5,8), (6,7)
  // Así que anteriores debería estar vacío para coordenadas que no existen
  const acs2010 = mapa.get("ACS2010")!;
  assert.deepEqual(acs2010.anteriores, []);
});

test("mapReticulaEstructurada construye 'siguientes' (dependientes) como índice inverso", () => {
  const { mapa } = mapReticulaEstructurada(retReticulaMock);

  // ACF0904 es prerrequisito de ACF0905
  const acf0904 = mapa.get("ACF0904")!;
  assert.deepEqual(acf0904.siguientes, ["ACF0905"]);

  // ACF0905 no es prerrequisito de nadie en el mock
  const acf0905 = mapa.get("ACF0905")!;
  assert.deepEqual(acf0905.siguientes, []);
});

test("mapReticulaEstructurada mantiene campos legacy en cada materia (compatibilidad)", () => {
  const { mapa } = mapReticulaEstructurada(retReticulaMock);

  const materia = mapa.get("ACF0905")!;
  assert.equal(materia.codigoEstado, 2);
  assert.equal(materia.estado, ESTADO_MATERIA_RETICULA.ACREDITADA);
  assert.deepEqual(materia.seriacion, [[{ x: 3, y: 1 }]]);
  assert.equal("anteriores" in materia, true);
  assert.equal("siguientes" in materia, true);
  // deprecated c, g removidos
  assert.equal("c" in materia, false);
  assert.equal("g" in materia, false);
});

test("mapReticulaEstructurada maneja ret vacía o undefined", () => {
  assert.deepEqual(mapReticulaEstructurada(undefined), { semestres: [], mapa: new Map() });
  assert.deepEqual(mapReticulaEstructurada([]), { semestres: [], mapa: new Map() });
});