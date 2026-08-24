import test from "node:test";
import assert from "node:assert/strict";
import { mapHorario } from "../src/mappers/horario.mapper.js";

test("mapHorario mapea los días con contenido y omite los vacíos", () => {
  const horario = mapHorario({
    mat: "SCC-1001",
    gbl: "",
    cr: "10",
    gpo: "1203",
    mape: "PEREZ PEREZ",
    mnom: "JUAN",
    lu: "07:00-08:00 A1\n",
    ma: "\n",
    mi: "",
    ju: "09:00-10:00 B2\n",
    vi: "",
    sa: "",
  });

  assert.deepEqual(horario.dias, {
    lunes: "07:00-08:00 A1",
    jueves: "09:00-10:00 B2",
  });
});

test("mapHorario concatena apellidos y nombres del docente", () => {
  const horario = mapHorario({
    mat: "SCC-1001",
    gbl: "",
    cr: "10",
    gpo: "1203",
    mape: "LOPEZ LOPEZ",
    mnom: "MARIA",
    lu: "",
    ma: "",
    mi: "",
    ju: "",
    vi: "",
    sa: "",
  });

  assert.equal(horario.docente, "LOPEZ LOPEZ MARIA");
});

test("mapHorario convierte créditos numéricos y tolera valores vacíos o no numéricos", () => {
  const base = {
    gbl: "",
    gpo: "*",
    mape: "SIN",
    mnom: "GRUPO",
    lu: "",
    ma: "",
    mi: "",
    ju: "",
    vi: "",
    sa: "",
  };

  assert.equal(mapHorario({ ...base, mat: "A", cr: "12" }).creditos, 12);
  assert.equal(mapHorario({ ...base, mat: "B", cr: "" }).creditos, undefined);
  assert.equal(mapHorario({ ...base, mat: "C", cr: "*" }).creditos, undefined);
  assert.equal(mapHorario({ ...base, mat: "D", cr: 8 }).creditos, 8);
});
