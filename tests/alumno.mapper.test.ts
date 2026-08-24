import test from "node:test";
import assert from "node:assert/strict";
import { mapAlumno } from "../src/mappers/alumno.mapper.js";
import { baseApiTodo } from "./helpers/mock.js";

test("mapAlumno mapea la identidad y promedios del alumno", () => {
  const alumno = mapAlumno(baseApiTodo.al);

  assert.equal(alumno.numeroControl, "00000000");
  assert.equal(alumno.nombre, "NOMBRE PRUEBA");
  assert.equal(alumno.carrera, "INGENIERIA EN SISTEMAS COMPUTACIONALES");
  assert.equal(alumno.correo, "prueba@ejemplo.mx");
  assert.equal(alumno.telefono, "0000000000");
  assert.equal(alumno.semestre, 1);
  assert.equal(alumno.promedioGeneral, 90);
  assert.equal(alumno.promedioSemestral, 85);
});

test("mapAlumno conviende la fecha de reinscripción al formato ISO con offset de Hermosillo", () => {
  const alumno = mapAlumno(baseApiTodo.al);
  assert.equal(alumno.fechaReinscripcion, "2026-01-05T08:00:00-07:00");
});

test("mapAlumno marca tieneAdeudos en falso cuando todas las áreas son N", () => {
  const alumno = mapAlumno(baseApiTodo.al);

  assert.equal(alumno.adeudos.tieneAdeudos, false);
});

test("mapAlumno marca tieneAdeudos en verdadero cuando un área reporta adeudo", () => {
  const alumno = mapAlumno({
    ...baseApiTodo.al,
    infadic: {
      ...baseApiTodo.al.infadic,
      afi: "Adeudo pendiente de colegiatura",
    },
  });

  assert.equal(alumno.adeudos.financiero, "Adeudo pendiente de colegiatura");
  assert.equal(alumno.adeudos.tieneAdeudos, true);
});

test("mapAlumno calcula el progreso como porcentaje de créditos aprobados", () => {
  const alumno = mapAlumno(baseApiTodo.al);
  // totales 300, faltantes 150 -> aprobados 150 -> 50%
  assert.equal(alumno.creditos.totales, 300);
  assert.equal(alumno.creditos.faltantes, 150);
  assert.equal(alumno.progreso, 50);
});

test("mapAlumno regresa progreso 0 cuando los créditos totales son 0", () => {
  const alumno = mapAlumno({
    ...baseApiTodo.al,
    infadic: { ...baseApiTodo.al.infadic, tot: 0, cfa: 0 },
  });

  assert.equal(alumno.progreso, 0);
});

test("mapAlumno incluye la boleta mapeada", () => {
  const alumno = mapAlumno(baseApiTodo.al);

  assert.equal(alumno.boleta.periodo, "AGO-DIC 2026");
  assert.equal(alumno.boleta.materias.length, 1);
});

test("mapAlumno mapea el horario desde gins y tolera entradas vacías", () => {
  const alumno = mapAlumno({
    ...baseApiTodo.al,
    gins: [
      {
        mat: "SCC-1001",
        gbl: "",
        cr: "10",
        gpo: "1203",
        mape: "PEREZ",
        mnom: "JUAN",
        lu: "07:00-08:00 A1\n",
        ma: "\n",
        mi: "",
        ju: "",
        vi: "",
        sa: "",
      },
      {
        mat: "",
        gbl: "",
        cr: "",
        gpo: "*",
        mape: "Sin",
        mnom: "Grupo",
        lu: "",
        ma: "",
        mi: "",
        ju: "",
        vi: "",
        sa: "",
      },
    ],
  });

  assert.equal(alumno.horario.length, 2);
  assert.deepEqual(alumno.horario[0].dias, { lunes: "07:00-08:00 A1" });
  assert.equal(alumno.horario[1].grupo, "*");
  assert.equal(alumno.horario[1].creditos, undefined);
});

test("mapAlumno regresa horario vacío cuando no hay materias inscritas", () => {
  const alumno = mapAlumno(baseApiTodo.al);
  assert.deepEqual(alumno.horario, []);
});
