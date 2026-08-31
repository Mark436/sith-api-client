import test from "node:test";
import assert from "node:assert/strict";
import { mapTodo } from "../src/mappers/todo.mapper.js";
import { SithMappingError } from "../src/errors.js";
import { baseApiTodo, baseApiTodoReticula } from "./helpers/mock.js";

test("mapTodo regresa alumno y avisos mapeados", () => {
  const datos = mapTodo(baseApiTodo);

  assert.equal(datos.alumno.numeroControl, "00000000");
  assert.equal(datos.avisos.length, 1);
  assert.equal(datos.avisos[0].tipo, "info");
});

test("mapTodo mapea todos los avisos de la lista", () => {
  const datos = mapTodo({
    ...baseApiTodo,
    lmsg: [
      { summary: "Uno", detail: "Primer aviso", severity: "info" },
      { summary: "Dos", detail: "Segundo aviso", severity: "warn" },
      { summary: "Tres", detail: "Tercer aviso", severity: "error" },
    ],
  });

  assert.deepEqual(
    datos.avisos.map((aviso) => aviso.tipo),
    ["info", "warn", "error"],
  );
});

test("mapTodo regresa la retícula mapeada dentro de alumno", () => {
  const datos = mapTodo(baseApiTodoReticula);
  assert.equal(datos.alumno.reticula.length, 4);
});

test("mapTodo lanza SithMappingError cuando falta al", () => {
  const { al, ...sinAl } = baseApiTodo;
  assert.throws(
    () => mapTodo({ ...sinAl } as never),
    (error: unknown) =>
      error instanceof SithMappingError && error.message.includes("al"),
  );
});

test("mapTodo lanza SithMappingError cuando lmsg no es un arreglo", () => {
  assert.throws(
    () =>
      mapTodo({
        ...baseApiTodo,
        lmsg: "no-soy-arreglo",
      } as never),
    (error: unknown) => error instanceof SithMappingError,
  );
});

test("mapTodo lanza SithMappingError cuando el payload no es un objeto", () => {
  assert.throws(
    () => mapTodo(null as never),
    (error: unknown) => error instanceof SithMappingError,
  );
  assert.throws(
    () => mapTodo("texto" as never),
    (error: unknown) => error instanceof SithMappingError,
  );
});

test("mapTodo conserva el payload problemático en cause del SithMappingError", () => {
  const payloadIncompleto = { lmsg: [] };
  assert.throws(
    () => mapTodo(payloadIncompleto as never),
    (error: unknown) =>
      error instanceof SithMappingError && (error as SithMappingError).cause === payloadIncompleto,
  );
});
