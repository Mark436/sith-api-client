import test from "node:test";
import assert from "node:assert/strict";
import { mapCalificacionMateria } from "../src/mappers/calificacionMateria.mapper.js";

test("mapCalificacionMateria mapea los campos crudos a los del DTO", () => {
  const materia = mapCalificacionMateria({
    clve: "SCC-1001",
    dmat: "MATERIA PRUEBA",
    cali: "95",
    opor: "OO",
    dopor: "Ev Ordinaria",
    cr: 10,
  });

  assert.deepEqual(materia, {
    clave: "SCC-1001",
    nombre: "MATERIA PRUEBA",
    calificacion: "95",
    claveOportunidad: "OO",
    oportunidad: "Ev Ordinaria",
    creditos: 10,
  });
});

test("mapCalificacionMateria mantiene la calificación como string aunque sea texto", () => {
  const materia = mapCalificacionMateria({
    clve: "SCC-1002",
    dmat: "OTRA MATERIA",
    cali: "Aprobado",
    opor: "OC",
    dopor: "Ev Complementaria",
    cr: 8,
  });

  assert.equal(materia.calificacion, "Aprobado");
});
