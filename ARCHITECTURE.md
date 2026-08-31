# Arquitectura de sith-api-client

Resumen estructural de [`sith-api-client`](https://github.com/Mark436/sith-api-client),
cliente TypeScript no oficial para la API académica de SITH del Instituto
Tecnológico de Hermosillo.

> ⚠️ API no oficial. Restricciones, bloqueos o cambios son posibles; el
> descargo completo está en el README.

---

## Vista general

El paquete es **ESM**, `strict`, sin dependencias en runtime (usa el `fetch`
global de Node `>=24`). Está ordenado en tres capas separadas por
responsabilidad:

```
┌─────────────┐   HTTP + parseo + token   ┌─────────────┐
│  index.ts   │ ────────────────────────────────────────▶ │ mappers     │
│  SithClient │   (fetchDatos)            └──┬──────────┘
└─────────────┘     mapDatos (sin HTTP)     │   │   │
        │                                    ▼   ▼   ▼
        │                ┌──────────────┐  raw → DTO limpio
        ▼                │ api/types.ts │
   errors.ts             │   (crudo)    │
        │                └──────────────┘
        ▼
   dto/*  (público, limpio, re-exportado desde la raíz)
```

- **`api/types.ts`** — tipos crudos con los nombres abreviados del API
  (`al`, `gins`, `infadic`, `lmsg`, ...). La capa "como llega".
- **`dto/`** — DTOs públicos con nombres legibles (`Alumno`, `Aviso`,
  `HorarioMateria`, `Boleta`, ...). La capa "como se consume".
- **`mappers/`** — funciones puras `raw → DTO` (un mapper por DTO). Sin efectos
  laterales, sin red, sin estado.
- **`index.ts`** — `SithClient` (dueño del HTTP, el parseo y el ciclo de
  sesión) más los re-exports de errores, DTOs y `TIPO_AVISO` desde la raíz.
- **`errors.ts`** — jerarquía tipada `SithError` → `SithNetworkError` /
  `SithHttpError` / `SithAuthError`.

Este orden responde a un principio claro: **el paquete dueño es responsable del
HTTP, del parseo y del mapeo; el consumidor decide cuándo consultar, cómo
cachear y cómo presentar.**

---

## Ciclo de vida de una petición (sin estado)

Cada llamada a `fetchDatos()` ejecuta un ciclo completo de un solo uso:

1. Valida `{ user, pass }` localmente; si falla, `SithAuthError` sin red.
2. `POST {baseUrl}/login` con `{ user, pass }`.
3. Exige `al` y `tkn`; si faltan, `SithAuthError` con los avisos como `cause`.
4. `POST {baseUrl}/logout` con `{ tkn }` — **best-effort**: si falla no se
   descartan los datos; se agrega un aviso `"warn"` de forma inmutable al
   resultado (refactor 4b en `PLAN.md`).
5. Mapea el payload a DTOs y regresa `{ alumno, avisos }`.

Consecuencias de diseño:

- **No hay sesión** ni token expuesto: cada actualización reenvía credenciales.
- El endpoint oficial es **HTTP plano**; un proxy HTTPS propio se configura con
  `SithClientOptions.baseUrl` (evita el mixed-content en contextos web).

---

## Acceso a la API pública

```ts
import { SithClient } from "sith-api-client";

const client = new SithClient(); // endpoint oficial
const clientProxy = new SithClient({ baseUrl: "https://mi-proxy.ejemplo.mx/sith" });

const datos = await client.fetchDatos({ user, pass });
// datos: { alumno: Alumno, avisos: Aviso[] }

// Mapper estático para payloads crudos capturados por el consumidor:
await SithClient.mapDatos(rawApiTodo);
```

- `exports` del `package.json` solo expone la raíz; los imports profundos
  (`sith-api-client/dist/dto/Alumno.js`) están bloqueados. Todos los tipos
  públicos se re-exportan desde la raíz.
- Se conservan extensiones `.js` en los imports internos por ESM.

---

## Modelo mapeado

El grafo de `fetchDatos()` produce:

```
DatosAlumno
├─ alumno: Alumno
│   ├─ identidad     : numeroControl, nombre, carrera, correo, telefono, semestre
│   ├─ académicos    : promedioGeneral, promedioSemestral, boleta
│   │                   └─ Boleta { periodo, promedio, materias[] }
│   ├─ progreso      : % aprobado (derivado de créditos)
│   ├─ creditos      : totales, faltantes
│   ├─ adeudos       : 5 áreas ("N" = sin adeudo) + tieneAdeudos
│   ├─ horario       : HorarioMateria[] (días sin clase omitidos)
│   └─ reticula      : ReticulaMateria[] (fase de prueba; ver 4a en PLAN.md)
└─ avisos: Aviso[] { titulo, mensaje, tipo }
```

### Gotchas de tipos (documentados)

- `calificacion` es `string` ("70", "Aprobado", "", ...) — no siempre numérica.
- `progreso` es un `number` suelto (porcentaje), no un objeto.
- `fechaReinscripcion` llega ISO con offset fijo `-07:00` (Hermosillo es UTC-7).
- `Aviso.tipo` es `string` a propósito: los valores conocidos (`error`, `warn`,
  `info`, `success`) no son exhaustivos.

> Varias de estas inconsistencias de tipo están pendientes de unificar; ver
> la sección "Unificar tipos" en `PLAN.md`.

---

## Errores

Todos los fallos lanzan subclases de `SithError`:

| Clase | Cuándo | Extra |
| --- | --- | --- |
| `SithAuthError` | credenciales inválidas/rechazadas, HTTP 401/403 | · |
| `SithNetworkError` | `fetch` rechazó (red, DNS, CORS) | · |
| `SithHttpError` | HTTP !ok ≠ 401/403, o cuerpo no-JSON | `.status` |
| `SithMappingError` | payload crudo malformado (sin `al`/`lmsg`) en `mapTodo`/`mapDatos` | `cause` = payload |

El `cause` conserva su forma histórica (información cruda) y los mensajes son
genéricos en español: **clasificar siempre por clase/`cause`, nunca mostrar
mensajes crudos.**

---

## Pruebas

Suite unitaria 100% offline con `node:test` vía `tsx` (sin dependencias
nuevas). Todo el data es mock fabricado en `tests/helpers/mock.ts`; los tests
del cliente sustituyen `globalThis.fetch`, así que nunca tocan la red.

```bash
npm test          # suite completa
npm run build     # tsc → dist/
npm run prepublish # build + test (se ejecuta al publicar)
```

Cobertura: cada mapper por separado (incluidos casos borde: días vacíos,
créditos `""`/`"*"`, progreso 0, adeudos mixtos) y el ciclo completo del
cliente (éxito, logout fallido, 401, otros !ok, rechazo de red, cuerpo no-JSON,
credenciales inválidas sin peticiones, `baseUrl` personalizada).

---

## Decisiones y pendientes

- Documentación funcional y glosario del payload: [`api.md`](./api.md).
- Pendientes de limpieza y backlog futuro: [`PLAN.md`](./PLAN.md).
