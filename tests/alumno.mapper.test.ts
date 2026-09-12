import test from "node:test";
import assert from "node:assert/strict";
import { mapAlumno } from "../src/mappers/alumno.mapper.js";
import { baseApiTodo, baseApiTodoReticula } from "./helpers/mock.js";

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

test("mapAlumno expone el periodo de inscripción sin conversión", () => {
  const alumno = mapAlumno(baseApiTodo.al);

  assert.deepEqual(alumno.periodoInscripcion, {
    inicio: "2025-12-28 08:00:00",
    fin: "2026-01-09 23:59:59",
  });
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

// ===== TESTS PARA NUEVA ESTRUCTURA DE RETÍCULA =====

test("mapAlumno expone semestres como matriz 2D (semestres[0] = 1er semestre)", () => {
  const alumno = mapAlumno(baseApiTodoReticula.al);

  assert.ok(Array.isArray(alumno.semestres));
  assert.equal(alumno.semestres.length, 6); // max semestre en mock = 6

  // Semestre 1 (índice 0): TUS2010
  assert.equal(alumno.semestres[0].length, 1);
  assert.equal(alumno.semestres[0][0].clave, "TUS2010");

  // Semestre 2 (índice 1): vacío
  assert.equal(alumno.semestres[1].length, 0);

  // Semestre 3 (índice 2): ACF0904
  assert.equal(alumno.semestres[2].length, 1);
  assert.equal(alumno.semestres[2][0].clave, "ACF0904");

  // Semestre 4 (índice 3): ACF0905
  assert.equal(alumno.semestres[3].length, 1);
  assert.equal(alumno.semestres[3][0].clave, "ACF0905");

  // Semestre 5 (índice 4): vacío
  assert.equal(alumno.semestres[4].length, 0);

  // Semestre 6 (índice 5): ACS2010
  assert.equal(alumno.semestres[5].length, 1);
  assert.equal(alumno.semestres[5][0].clave, "ACS2010");
});

test("mapAlumno expone reticulaMap para acceso directo por clave", () => {
  const alumno = mapAlumno(baseApiTodoReticula.al);

  assert.ok(alumno.reticulaMap instanceof Map);
  assert.equal(alumno.reticulaMap.size, 4);

  const materia = alumno.reticulaMap.get("ACF0905")!;
  assert.equal(materia.clave, "ACF0905");
  assert.equal(materia.nombre, "ECUACIONES DIFERENCIALES");
  assert.deepEqual(materia.coordenadas, { x: 4, y: 1 });
});

test("mapAlumno: cada materia en reticulaMap incluye anteriores y siguientes", () => {
  const alumno = mapAlumno(baseApiTodoReticula.al);

  const acf0905 = alumno.reticulaMap.get("ACF0905")!;
  const acf0904 = alumno.reticulaMap.get("ACF0904")!;

  // ACF0905 tiene prerrequisito ACF0904
  assert.deepEqual(acf0905.anteriores, ["ACF0904"]);

  // ACF0904 es prerrequisito de ACF0905
  assert.deepEqual(acf0904.siguientes, ["ACF0905"]);
});

test("mapAlumno regresa semestres vacío y reticulaMap vacío cuando no hay retícula", () => {
  const alumno = mapAlumno(baseApiTodo.al);

  assert.deepEqual(alumno.semestres, []);
  assert.ok(alumno.reticulaMap instanceof Map);
  assert.equal(alumno.reticulaMap.size, 0);
});

// Campo legacy 'reticula' removido en v4 - estos tests ya no aplican
// test("mapAlumno mapea la retícula cuando el payload la trae", ...)
// test("mapAlumno regresa retícula vacía cuando el payload no la trae", ...)