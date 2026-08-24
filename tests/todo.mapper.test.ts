import test from "node:test";
import assert from "node:assert/strict";
import { mapTodo } from "../src/mappers/todo.mapper.js";
import { baseApiTodo } from "./helpers/mock.js";

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
