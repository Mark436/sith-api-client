import test from "node:test";
import assert from "node:assert/strict";
import { mapReticula } from "../src/mappers/reticula.mapper.js";
import { retReticulaMock } from "./helpers/mock.js";

test("mapReticula separa nombre, calificación y oportunidad del texto t", () => {
  const ret = mapReticula(retReticulaMock);

  const conSalto = ret.find((m) => m.clave === "ACF0905");
  assert.equal(conSalto?.nombre, "ECUACIONES DIFERENCIALES");
  assert.deepEqual(conSalto?.calificacion, { calificacion: "87", oportunidad: "OO" });

  const conEspacio = ret.find((m) => m.clave === "ACF0904");
  assert.equal(conEspacio?.nombre, "CALCULO VECTORIAL");
  assert.deepEqual(conEspacio?.calificacion, { calificacion: "83", oportunidad: "OC" });

  const sinCursar = ret.find((m) => m.clave === "TUS2010");
  assert.equal(sinCursar?.nombre, "TUTORIAS I");
  assert.equal(sinCursar?.calificacion, undefined);
});

test("mapReticula conserva coordenadas y campos de prueba c/g", () => {
  const ret = mapReticula(retReticulaMock);

  const materia = ret.find((m) => m.clave === "ACS2010");
  assert.deepEqual(materia?.coordenadas, { x: 6, y: 8 });
  assert.equal(materia?.c, 3);
  assert.equal(materia?.g, 0);
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
