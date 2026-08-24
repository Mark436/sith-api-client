import test from "node:test";
import assert from "node:assert/strict";
import { SithClient } from "../src/index.js";
import {
  SithAuthError,
  SithHttpError,
  SithNetworkError,
} from "../src/errors.js";
import { baseApiTodo } from "./helpers/mock.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Sustituto de fetch graba las URLs llamadas y responde con la siguiente
 * entrada de la lista; si la entrada es un Error, lo lanza (simula fallo
 * de red).
 */
function installFetch(
  respuestas: Array<Response | Error>,
): { urls: string[] } {
  const urls: string[] = [];
  let indice = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    urls.push(String(input));
    const siguiente = respuestas[indice++];
    if (!siguiente) {
      throw new Error("no hay respuesta mock configurada");
    }
    if (siguiente instanceof Error) {
      throw siguiente;
    }
    return siguiente;
  }) as typeof fetch;
  return { urls };
}

const credenciales = { user: "usuario-prueba", pass: "secreto" };

test("fetchDatos hace login, logout y regresa los datos mapeados", async () => {
  const { urls } = installFetch([
    jsonResponse(baseApiTodo),
    jsonResponse({ ok: true }),
  ]);

  const client = new SithClient();
  const datos = await client.fetchDatos(credenciales);

  assert.equal(datos.alumno.numeroControl, "00000000");
  assert.equal(datos.avisos.length, 1);
  assert.deepEqual(urls, [
    "http://sith.ith.mx/XTodo/wr/login",
    "http://sith.ith.mx/XTodo/wr/logout",
  ]);
});

test("si el logout falla por red, los datos se conservan y se agrega un aviso warn", async () => {
  installFetch([jsonResponse(baseApiTodo), new Error("red caída")]);

  const client = new SithClient();
  const datos = await client.fetchDatos(credenciales);

  assert.equal(datos.alumno.numeroControl, "00000000");
  assert.equal(datos.avisos.length, 2);
  assert.equal(datos.avisos[1].titulo, "Logout fallido");
  assert.equal(datos.avisos[1].tipo, "warn");
});

test("si el logout responde !ok, también se conserva todo y se avisa", async () => {
  installFetch([jsonResponse(baseApiTodo), jsonResponse({}, 500)]);

  const client = new SithClient();
  const datos = await client.fetchDatos(credenciales);

  assert.equal(datos.avisos.length, 2);
  assert.equal(datos.avisos[1].tipo, "warn");
});

test("login con 401 lanza SithAuthError conservando el status en cause", async () => {
  installFetch([jsonResponse({}, 401)]);

  const client = new SithClient();

  await assert.rejects(
    client.fetchDatos(credenciales),
    (error: unknown) =>
      error instanceof SithAuthError &&
      (error.cause as { status?: number }).status === 401,
  );
});

test("login con otro status !ok lanza SithHttpError con status expuesto", async () => {
  installFetch([jsonResponse({}, 503)]);

  const client = new SithClient();

  await assert.rejects(
    client.fetchDatos(credenciales),
    (error: unknown) => error instanceof SithHttpError && error.status === 503,
  );
});

test("un rechazo de red en el login lanza SithNetworkError", async () => {
  installFetch([new TypeError("fetch failed")]);

  const client = new SithClient();

  await assert.rejects(
    client.fetchDatos(credenciales),
    (error: unknown) => error instanceof SithNetworkError,
  );
});

test("login sin al/tkn lanza SithAuthError con los avisos de error como cause", async () => {
  installFetch([
    jsonResponse({
      lmsg: [{ summary: "Acceso", detail: "Denegado", severity: "error" }],
    }),
  ]);

  const client = new SithClient();

  await assert.rejects(
    client.fetchDatos(credenciales),
    (error: unknown) => {
      assert.ok(error instanceof SithAuthError);
      assert.deepEqual(error.cause, ["Acceso: Denegado"]);
      return true;
    },
  );
});

test("una respuesta 200 que no es JSON lanza SithHttpError", async () => {
  installFetch([
    new Response("<html>gateway error</html>", { status: 200 }),
  ]);

  const client = new SithClient();

  await assert.rejects(
    client.fetchDatos(credenciales),
    (error: unknown) => error instanceof SithHttpError,
  );
});

test("credenciales inválidas localmente lanza SithAuthError sin hacer peticiones", async () => {
  const { urls } = installFetch([]);
  const client = new SithClient();

  await assert.rejects(
    client.fetchDatos({ user: "", pass: "x" }),
    (error: unknown) =>
      error instanceof SithAuthError &&
      error.message === "Credenciales inválidas",
  );

  assert.deepEqual(urls, []);
});

test("baseUrl personalizada deriva los endpoints login/logout", async () => {
  const { urls } = installFetch([
    jsonResponse(baseApiTodo),
    jsonResponse({ ok: true }),
  ]);

  const client = new SithClient({ baseUrl: "https://proxy.ejemplo.mx/sith/" });
  await client.fetchDatos(credenciales);

  assert.deepEqual(urls, [
    "https://proxy.ejemplo.mx/sith/login",
    "https://proxy.ejemplo.mx/sith/logout",
  ]);
});
