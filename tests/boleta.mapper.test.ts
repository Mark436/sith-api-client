import test from "node:test";
import assert from "node:assert/strict";
import { mapBoleta } from "../src/mappers/boleta.mapper.js";

test("mapBoleta mapea periodo y promedio sin transformarlos", () => {
  const boleta = mapBoleta({
    prom: "88.5",
    descPer: "AGO-DIC 2026",
    lcal: [],
  });

  assert.equal(boleta.periodo, "AGO-DIC 2026");
  assert.equal(boleta.promedio, "88.5");
});

test("mapBoleta mapea las materias con el mapper de calificaciones", () => {
  const boleta = mapBoleta({
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
  });

  assert.equal(boleta.materias.length, 1);
  assert.equal(boleta.materias[0].clave, "SCC-1001");
  assert.equal(boleta.materias[0].oportunidad, "Ev Ordinaria");
});
