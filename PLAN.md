# Plan de limpieza y pendientes

Notas de trabajo pendiente para [`sith-api-client`](https://github.com/Mark436/sith-api-client),
acumuladas tras una revisión de la arquitectura. Son pendientes para retomar
en otra sesión; **no hay cambios aplicados por este documento**.

> Para entender el contexto técnico, lee primero [`ARCHITECTURE.md`](./ARCHITECTURE.md)
> y [`api.md`](./api.md).

---

## 4. Limpieza (prioridad hoy)

> ✅ **Estado: implementado en v3.0.0.** Este bloque se resolvió; se deja el
> detalle de cómo quedó cada punto y lo que sigue pendiente de confirmar.

### 4a. Retícula: mapearla ✅ (hecho)

Se eligió la **opción 1 (mapearla)**. Creé `src/mappers/reticula.mapper.ts`,
expuse `alumno.reticula` y resolví los campos de la retícula:

- `x`, `y` → `coordenadas` (columna, semestre/fila).
- `c` → **NO son créditos** (confirmado contra `kdx`: las mismas materias
  valen 4-5 créditos pero `c` toma 0/1/2/3/9). Se conserva crudo, **sin
  interpretar** (en fase de prueba).
- `g` → siempre `0` en el sample; conservado crudo (en fase de prueba).
- `m` → `clave`.
- `t` → `"NOMBRE\nCALIF OPORTUNIDAD"` o `"NOMBRE CALIF OPORTUNIDAD"`; el
  mapper separa `nombre` y `calificacion { calificacion, oportunidad }`. Si la
  materia no se cursó, solo queda el nombre (sin `calificacion`).
- `r` → `seriacion: Coordenadas[][]` (grupos "o": requiere cursar una
  coordenada de cada grupo; los sub-arrays vacíos se omiten).

Es un **cambio breaking** de la API pública (nueva propiedad `reticula` en
`Alumno`) → **bump mayor a 3.0.0**.

**Fallos que quedaron en fase de prueba:** significado real de `c` y `g`, y el
parseo de `t` (separador `\n` vs espacio).

**Archivos tocados:** `src/dto/Materias.ts`, `src/dto/Alumno.ts`,
`src/mappers/alumno.mapper.ts`, `src/mappers/reticula.mapper.ts` (nuevo),
`src/mappers/todo.mapper.ts`, `src/api/types.ts`, `src/index.ts` (export),
`tests/`.

### 4b. Separar el logout fallido del mapper ✅ (hecho)

`src/index.ts` ya no muta `datos.avisos`; construye el resultado por inmutable
con spread (`return { ...datos, avisos: [...datos.avisos, ...] }`). Refactor
interno sin cambio observable; los tests de `tests/client.test.ts` pasan
intactos.

### 4c. Validar el shape en `mapTodo`/`mapDatos` ✅ (hecho)

Nuevo guard en `mapTodo` que lanza `SithMappingError` ("payload malformado")
si falta `al` u `lmsg`, o si el payload no es el objeto esperado; conserva el
payload en `cause`. Nuevo error exportado desde la raíz. Tests añadidos para
payload incompleto.

### 4d. Limpiezas varias ✅ (hecho salvo fases de prueba)

- **4d1 — DTO `Materias.ts`:** quitados los comentarios de incertidumbre y
  alineado el estilo. `c`/`g` quedan conservados crudos y marcados en fase de
  prueba. `nombre` ya no mezcla calificación/oportunidad (ver 4a).
- **4d2 — `tsconfig.json`:** `include: ["src/**/*.ts"]`, `exclude` simplificado
  a `["node_modules", "dist", "src/test.ts"]` (este último porque
  `src/test.ts` es un script manual que no debe publicarse en `dist`).
  Verificado con `tsc`.
- **4d3 — `src/test.ts`:** credenciales reales reemplazadas por variables de
  entorno (`SITH_USER`/`SITH_PASS`) leídas de `.env` (que ya está en
  `.gitignore` y `.npmignore`). Se añadió `.env.example` con placeholders.

---

## Backlog futuro (no hoy)

Estas surgieron en la revisión pero quedan fuera del alcance de la limpieza.

### Unificar tipos (inconsistencias actuales)

| Campo | Estado | Propuesta |
| --- | --- | --- |
| `alumno.promedioGeneral` / `promedioSemestral` | `number` | — |
| `boleta.promedio` | `string` | unificar a `number \| undefined` |
| `calificacionMateria.calificacion` | `string` ambigua | `Calificacion` union type |
| `calificacionMateria.creditos` | `number` | — |
| `horarioMateria.creditos` | `number \| undefined` | alinear con el anterior |
| `horarioMateria.dias` | string crudo `"07-08 G101"` | bloques `{ inicio, fin, salon }` |

Es un área de **cambios breaking**; pensarlo con campos nuevos opcionales +
deprecar los viejos, o bump mayor.

### Extensibilidad

- **Timeout + `AbortSignal`:** hoy no hay; un `fetch` colgado deja el `await`
  infinito. Añadir `timeoutMs`/`signal` a `SithClientOptions`.
- **`fetch` inyectable:** opción `fetch` en el constructor para testing,
  proxies e interceptores sin tocar el global.
- **Retry/backoff** ante `SithNetworkError` (opcional).

### Seguridad (baja prioridad, no es controlable)

El backend es HTTP plano y con credenciales en texto plano, pero **no se
controla**; cifrar sería obfuscación falsa. Solo documentar/reforzar el riesgo
y recomendar el proxy HTTPS (ya soportado por `baseUrl`).

---

## Resumen de archivos esperados (cuando se implemente)

> ✅ Todos resueltos en v3.0.0.

| Archivo | Cambio | Estado |
| --- | --- | --- |
| `src/mappers/reticula.mapper.ts` (nuevo) | mapper de retícula (4a) | ✅ |
| `src/dto/Materias.ts` | limpiar tipos / seriación (4d1) | ✅ |
| `src/dto/Alumno.ts` | + `reticula` (4a) | ✅ |
| `src/mappers/alumno.mapper.ts` | + `mapReticula` (4a) | ✅ |
| `src/mappers/todo.mapper.ts` | validación de shape (4c) | ✅ |
| `src/api/types.ts` | tipos de `ret[]` (`c`/`g`/`r`) | ✅ |
| `src/errors.ts` | + `SithMappingError` (4c) | ✅ |
| `src/index.ts` | logout inmutable (4b) + exports | ✅ |
| `tests/*` | tests de 4a/4c + mock con retícula | ✅ |
| `tsconfig.json` | limpiar include/exclude (4d2) | ✅ |
| `src/test.ts` | → env vars (4d3) | ✅ |
| `.env.example` (nuevo) | documentar env vars | ✅ |
