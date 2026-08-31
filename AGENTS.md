# AGENTS.md — Guía de referencia para agentes

Documento de contexto para agentes/LLMs que trabajen sobre este repositorio.
Lee esto antes de modificar el código. Refleja el estado **actual** (v3.0.0).

> Documentación humana complementaria: [`README.md`](./README.md) (uso público),
> [`api.md`](./api.md) (funcionamiento interno, glosario y fase de prueba),
> [`ARCHITECTURE.md`](./ARCHITECTURE.md) (estructura), [`PLAN.md`](./PLAN.md)
> (pendientes y backlog).

---

## ¿Qué es este proyecto?

`sith-api-client`: cliente TypeScript **no oficial** para la API académica de
SITH del Instituto Tecnológico de Hermosillo (ITH). Es una librería publicada
en npm.

- **ESM**, `strict`, sin dependencias en runtime (usa `fetch` global de Node ≥24).
- Es **dueño del HTTP, del parseo y del mapeo** a DTOs. El consumidor decide
  cuándo consultar, cómo cachear y cómo presentar.
- API **no oficial**: puede romperse en cualquier momento. El token de sesión
  se consume internamente y jamás se expone; cada llamada reenvía credenciales.

---

## Arquitectura (capas)

```
src/
  api/types.ts         Tipos CRUDOS con nombres abreviados del API (al, lmsg, tkn...)
  dto/                 DTOs PÚBLICOS con nombres legibles (Alumno, Aviso, ...)
  mappers/             Funciones puras raw -> DTO (un mapper por DTO)
  errors.ts            Jerarquía SithError
  index.ts             SithClient (HTTP) + re-exports públicos
  test.ts              Script manual (ignorado por git/npm); usa .env
```

Principio: el paquete dueño hace HTTP + parseo + mapeo; el consumidor decide
cuándo/cómo. `package.json` `exports` solo expone la raíz; los tipos públicos
se re-exportan desde `src/index.ts`.

---

## Funciones de la API pública

### `class SithClient`

**`constructor(options?: SithClientOptions)`**
- `SithClientOptions.baseUrl?`: base de los endpoints. Default
  `http://sith.ith.mx/XTodo/wr`. Se derivan `/login` y `/logout` (quita `/` finales).
- Útil para apuntar a un proxy HTTPS propio (evita mixed-content).

**`async fetchDatos(credenciales: Credenciales): Promise<DatosAlumno>`**
Ciclo completo sin estado. `Credenciales = { user: string; pass: string }`.
1. Valida credenciales localmente (no vacías tras trim). Si falla → `SithAuthError` sin red.
2. `POST {login}` con `{ user, pass }`.
3. Exige `al` y `tkn`; si faltan → `SithAuthError` (cause = avisos de error `"summary: detail"`).
4. `POST {logout}` con `{ tkn }` **best-effort**: si falla NO descarta datos; añade aviso `"Logout fallido"` (inmutable, ver mapeo).
5. Mapea el payload y regresa `{ alumno, avisos }`.

**`static async mapDatos(data: ApiTodo): Promise<DatosAlumno>`**
Mapea un payload crudo capturado por el consumidor **sin** peticiones HTTP.
Internamente llama a `mapTodo` (incluye la validación de shape).

### Re-exports desde la raíz (`src/index.ts`)
- Errores: `SithError`, `SithNetworkError`, `SithHttpError`, `SithAuthError`, `SithMappingError`.
- Constante: `TIPO_AVISO` (`ERROR="error"`, `ADVERTENCIA="warn"`, `INFORMACION="info"`).
- Tipos: `Credenciales`, `SithClientOptions`, `DatosAlumno`, `Alumno`, `Aviso`,
  `Adeudos`, `Boleta`, `CalificacionMateria`, `Coordenadas`, `ReticulaMateria`,
  `ReticulaCalificacion`, `Creditos`, `HorarioDia`, `HorarioMateria`.

---

## Errores (`src/errors.ts`)

Todos heredan de `SithError` (un `instanceof SithError` basta). El `cause`
conserva su forma original; clasificar siempre por clase/`cause`, nunca mostrar
mensajes crudos.

| Clase | Cuándo | Extra |
| --- | --- | --- |
| `SithAuthError` | credenciales inválidas/vacías, login rechazado, HTTP 401/403, falta `al`/`tkn` | |
| `SithNetworkError` | `fetch` rechazó (red, DNS, CORS) | |
| `SithHttpError` | HTTP !ok ≠ 401/403, o cuerpo 200 no-JSON | `.status` |
| `SithMappingError` | payload malformado en `mapTodo` (sin `al`/`lmsg`, o no-objeto) | `cause` = payload |

---

## DTOs (modelo mapeado)

`DatosAlumno = { alumno: Alumno, avisos: Aviso[] }`

**`Alumno`**
- `numeroControl`, `nombre`, `carrera`, `correo`, `telefono` (string)
- `semestre` (number), `fechaReinscripcion` (ISO con offset fijo `-07:00` Hermosillo)
- `promedioGeneral`, `promedioSemestral` (number)
- `boleta: Boleta { periodo, promedio (string), materias: CalificacionMateria[] }`
- `adeudos: Adeudos { biblioteca, academico, escolar, financiero, administrativo, tieneAdeudos }`
  (cada área es `"N"` = sin adeudo, u otro texto si lo hay)
- `progreso` (number: % aprobado, derivado de créditos)
- `creditos: Creditos { totales, faltantes }` (aprobados = totales − faltantes)
- `horario: HorarioMateria[]` (días sin clase omitidos; tolera `*`/vacío)
- `reticula: ReticulaMateria[]` **(v3.0.0, fase de prueba)**

**`HorarioMateria`**: `clave`, `creditos?`, `grupo`, `docente`, `dias: HorarioDia { lunes..sabado? }`.

**`CalificacionMateria`**: `clave`, `nombre`, `calificacion` (**string**, puede ser "" o texto), `claveOportunidad`, `oportunidad`, `creditos` (number).

**`ReticulaMateria`** (fase de prueba): `clave`, `nombre`, `coordenadas {x,y}`,
`calificacion?: { calificacion?, oportunidad? }`, `c` (⚠️ NO créditos), `g` (siempre 0),
`seriacion: Coordenadas[][]` (grupos "o"; sub-arrays vacíos omitidos).

**`Aviso`**: `titulo`, `mensaje`, `tipo` (**string** a propósito; valores conocidos `error`/`warn`/`info`/`success`, no exhaustivos).

---

## Mappers (`src/mappers/`)

Funciones puras, sin red, sin estado. Un mapper por DTO:

| Mapper | Raw → DTO | Notas |
| --- | --- | --- |
| `mapAviso` | `ApiAviso` → `Aviso` | summary→titulo, detail→mensaje, severity→tipo |
| `mapAlumno` | `ApiAlumno` → `Alumno` | Horario, boleta, adeudos, créditos, progreso, retícula |
| `mapBoleta` | `ApiBoleta` → `Boleta` | |
| `mapCalificacionMateria` | `ApiCalificacionMateria` → `CalificacionMateria` | cali→calificacion, dopor→oportunidad, opor→claveOportunidad |
| `mapHorario` | `ApiMateriaInscripcion` → `HorarioMateria` | créditos string tolerable; días no vacíos |
| `mapReticula` | `ApiMateriaReticula[]` → `ReticulaMateria[]` | parsea `t` (nombre + calif/oportunidad), seriación |
| `mapTodo` | `ApiTodo` → `DatosAlumno` | **valida shape** y lanza `SithMappingError` |

Detalles de `mapReticula` (importante para futuros ajustes):
- `nombre`: `t.trim().split(/\s*\d/)[0]` (corta en el primer dígito).
- `calificacion`: regex `/(\d{2,3}|[0-9]+)\s+([A-Z]{2})$/` sobre `t`; `undefined` si no cursa.
- `c`/`g` se conservan crudos **sin interpretar** (fase de prueba).
- `r` es `ApiCoordenadas[][][]` donde cada sub-array es un grupo "o"; los vacíos se omiten.

`mapTodo` guard (v3.0.0): exige `data` objeto no-null con `data.al` objeto y
`data.lmsg` array; en caso contrario lanza `SithMappingError("Payload ... ")` con `cause=data`.

---

## Payload crudo (glosario clave, ver `api.md` para el completo)

- top: `al` (alumno), `lmsg` (avisos), `tkn` (JWT), `rol`.
- `infadic`: `nom`, `car`, `sem`, `toca`, `prg`/`prs`, `tot`/`cfa`, `abi/aca/aes/afi/ava`.
- `gins[]`: `mat`, `cr` (a veces string), `gpo`, `mape`/`mnom`, `lu/ma/mi/ju/vi/sa`.
- `ret[]`: `x`/`y`, `m`, `t` (`"NOMBRE\nCALIF OPORTUNIDAD"` o separado por espacio), `r`, `c`, `g`.
- `kdx[]` kardex histórico (llega vacío o igual que `boleta`); `banco.mp_order` = número de control.

---

## Comandos

```bash
npm test          # suite unitaria offline (node:test vía tsx); mock fabricado en tests/helpers/mock.ts
npm run build     # tsc -> dist/ (rootDir src)
npm run prepublishOnly  # build + test
```

- Tests: usan `node:test`. `client.test.ts` sustituye `globalThis.fetch` (nunca toca red).
- **No ejecutes** `src/test.ts` (script manual, requiere `.env` real y golpea la API de verdad).

---

## Convenciones y reglas importantes

- **ESM**: los imports internos llevan extensión `.js` (`from "./dto/Aviso.js"`).
- **No añadas comentarios** de especulación al código; si falta confirmar algo,
  márcalo con `⚠️ Fase de prueba` en el JSDoc del DTO/mapper.
- **Nuevos campos/DTOs públicos** deben re-exportarse desde `src/index.ts`.
- **Seguridad de credenciales**: NUNCA pongas credenciales reales en código,
  `.gitignore`, ni los dejes en archivos versionados. `.env` está en
  `.gitignore` y `.npmignore`. Para scripts usa `SITH_USER`/`SITH_PASS` vía
  `process.loadEnvFile`. Ejemplo documentado en `.env.example`.
- **Versionado**: cambios breaking de la API pública → bump mayor. La retícula
  (v3.0.0) fue el último.
- `tsconfig.json`: `include: ["src/**/*.ts"]`, `exclude: ["node_modules","dist","src/test.ts"]`
  (este último para no publicar el script manual en `dist`).

---

## Pendientes / backlog (resumen, detalle en `PLAN.md`)

- ✅ Bloque 4 (retícula, logout inmutable, validación de shape, limpiezas) — hecho en v3.0.0.
- ⏳ Confirmar significado real de `c` y `g` de la retícula y el parseo de `t` (fase de prueba).
- ⏳ Backlog futuro: unificar tipos inconsistentes, timeout/`AbortSignal`, `fetch` inyectable, retry.
