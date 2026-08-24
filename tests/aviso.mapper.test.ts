import test from "node:test";
import assert from "node:assert/strict";
import { mapAviso } from "../src/mappers/aviso.mapper.js";

test("mapAviso mapea summary/detail/severity a titulo/mensaje/tipo", () => {
  const aviso = mapAviso({
    summary: "Bienvenido",
    detail: "Sesión iniciada",
    severity: "info",
  });

  assert.deepEqual(aviso, {
    titulo: "Bienvenido",
    mensaje: "Sesión iniciada",
    tipo: "info",
  });
});

test("mapAviso preserva severidades desconocidas sin alterarlas", () => {
  const aviso = mapAviso({
    summary: "Alumno",
    detail: "Inscrito",
    severity: "success",
  });

  assert.equal(aviso.tipo, "success");
});
