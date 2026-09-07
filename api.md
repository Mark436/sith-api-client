# sith-api-client — Cómo funciona (arquitectura y decisiones)

Notas de referencia para [`sith-api-client`](https://github.com/Mark436/sith-api-client)
(v3.0.0), cliente TypeScript no oficial que habla con la API académica de
SITH del Instituto Tecnológico de Hermosillo. El paquete es dueño del HTTP,
del parseo y del mapeo a DTOs; los consumidores deciden cuándo consultar,
cómo cachear y cómo presentar.

> ⚠️ API no oficial. Restricciones, bloqueos o cambios son posibles; el
> descargo completo está en el README.

## Superficie pública

```ts
import { SithClient } from "sith-api-client";

// Sin opciones usa el endpoint oficial.
const client = new SithClient();

// Con opciones se puede apuntar a un proxy propio (p. ej. HTTPS).
const clientProxy = new SithClient({
  baseUrl: "https://mi-proxy.ejemplo.mx/sith",
});

const datos = await client.fetchDatos({ user: "usuario", pass: "contraseña" });
// datos: { alumno: Alumno, avisos: Aviso[] }

// Mapper estático para payloads crudos capturados por el consumidor:
await SithClient.mapDatos(rawApiTodo); // Promise<{ alumno, avisos }>
```

- El paquete es ESM: conserva las extensiones `.js` en imports internos.
- El mapa `exports` solo expone la entrada raíz; imports profundos como
  `sith-api-client/dist/dto/Alumno.js` están bloqueados. Los tipos públicos
  (`Alumno`, `Aviso`, `DatosAlumno`, `HorarioMateria`, `ReticulaMateria`,
  errores, etc.) se re-exportan desde la raíz, así que impórtalos de ahí.
- **v3.0.0 (breaking):** se expone `alumno.reticula` (la retícula del plan de
  estudios) y se añade `SithMappingError` para payloads malformados. El resto
  (logout inmutable, validación de shape) es refactor interno sin cambios
  observables. Retrocompatible con 2.x salvo la nueva propiedad `reticula` en
  `Alumno`.

## Ciclo de vida de una petición (sin estado)

Cada llamada a `fetchDatos()` ejecuta un ciclo completo de un solo uso:

1. Valida `{ user, pass }` localmente (no vacíos tras trim); si falla lanza
   `SithAuthError("Credenciales inválidas")` sin hacer peticiones.
2. `POST {baseUrl}/login` con JSON `{ user, pass }`.
3. Requiere `al` (payload del alumno) y `tkn` (token de sesión) en la
   respuesta; si faltan, lanza `SithAuthError` adjuntando los avisos de
   error del API como `cause` (`string[]` de `"summary: detail"`).
4. Inmediatamente `POST {baseUrl}/logout` con `{ tkn }`. **Best-effort**:
   si falla (red o status !ok) NO se descartan los datos ya descargados;
   se agrega al resultado un aviso `{ titulo: "Logout fallido",
   tipo: "warn" }` y la respuesta regresa normal.
5. Mapea el payload a DTOs y regresa `{ alumno, avisos }`.

Consecuencias:

- **No hay sesión.** El token (un JWT con `sub`/`exp` según muestras) se
  consume internamente y jamás se expone; cada actualización necesita las
  credenciales otra vez.
- El endpoint oficial es **HTTP plano**; servirse sobre HTTPS produce riesgo
  de mixed-content. La mitigación hoy es `SithClientOptions.baseUrl`
  apuntando a un proxy propio con TLS.

## Errores

Desde v2.3.0 todos los fallos lanzan subclases de `SithError` (exportadas
desde la raíz). Los mensajes siguen siendo los mismos de siempre y el
`cause` conserva su forma original, así que quien inspeccionaba
`error.cause` sigue funcionando.

| Clase              | Cuándo ocurre                                             | `cause`                                  | Extra                    |
| ------------------ | --------------------------------------------------------- | ---------------------------------------- | ------------------------ |
| `SithAuthError`    | credenciales vacías/malformadas localmente                | —                                        | no hace peticiones       |
| `SithAuthError`    | login rechazado por el API o HTTP 401/403                 | `string[]` de avisos, o `{ status, statusText, url }` | |
| `SithNetworkError` | `fetch` rechaza (red, DNS, CORS...)                       | error nativo                             |                          |
| `SithHttpError`    | HTTP !ok distinto de 401/403, o cuerpo 200 que no es JSON | `{ status, statusText, url }` o `{ url, detalle }` | `.status` numérico si existe |

```ts
try {
  const datos = await client.fetchDatos(credenciales);
} catch (error) {
  if (error instanceof SithAuthError) {
    // credenciales incorrectas -> pedirlas de nuevo
  } else if (error instanceof SithNetworkError || error instanceof SithHttpError) {
    // problema de conexión/servicio -> reintentar más tarde
  }
}
```

Quirks conocidos:

- Si el login funciona pero el logout inmediato falla, antes v2.3.0 se
  perdían los datos; ahora llegan completos con un aviso extra de tipo
  `"warn"`.
- Los mensajes de error son genéricos y en español; clasifícalos siempre
  por clase/`cause`, nunca mostrándolos crudos.

## Modelo de datos (lo que regresa `fetchDatos()`)

Reutiliza los tipos del paquete (se exportan desde la raíz). Resumen del
grafo mapeado:

**`Alumno`**

- Identidad: `numeroControl`, `nombre`, `carrera`, `correo`, `telefono`,
  `semestre`, `fechaReinscripcion`, `periodoInscripcion { inicio, fin }`
- Académicas: `promedioGeneral` (`number`), `promedioSemestral` (`number`),
  `boleta { periodo, promedio, materias: CalificacionMateria[] }`
- `CalificacionMateria`: `clave`, `nombre`, `calificacion` (**string**, puede
  venir vacío o no-numérico), `claveOportunidad`, `oportunidad`,
  `creditos` (`number`)
- Progreso: `progreso` (**número simple**: % aprobado) y
  `creditos { totales, faltantes }`; los créditos aprobados se derivan como
  `totales − faltantes`; no existe conteo separado "en curso".
- Adeudos: `adeudos { tieneAdeudos, biblioteca, academico, escolar,
  financiero, administrativo }`; cada área es `"N"` cuando no hay adeudo, u
  otro texto describiéndolo cuando sí.
- Horario: `horario: HorarioMateria[]` (v2.3.0, derivado de `gins[]`) con
  `clave`, `creditos?`, `grupo`, `docente` y `dias { lunes..sabado? }`. Los
  días sin clase se omiten; tolera entradas enmascaradas/vacías (grupo `*`,
  créditos `""`), típicas de periodos vacacionales.
- Retícula (v3.0.0, derivada de `ret[]`):
  `reticula: ReticulaMateria[]`, el plan de estudios completo con
  `clave`, `nombre`, `coordenadas { x, y }`, `calificacion?`, `c`, `g` y
  `seriacion`. Consulta "Retícula" abajo para el detalle y lo que está en
  fase de prueba.
- Avisos: `avisos: Aviso[] { titulo, mensaje, tipo }` a nivel raíz.

### Gotchas de tipos

- `calificacion` es string ("70".."100", "Aprobado", "", ...).
- `progreso` es un número suelto (porcentaje), no un objeto.
- `fechaReinscripcion` llega ISO con offset fijo `-07:00`: Hermosillo es
  UTC-7 todo el año desde 2022, así que es correcto, pero está hardcodeado
  en el mapper.
- `periodoInscripcion { inicio, fin }` se expone **tal cual** lo manda el API
  (`"YYYY-MM-DD hh:mm:ss"`, hora local de Hermosillo): **sin conversión** ni
  offset. El API no especifica zona horaria; la hora ya es de Hermosillo.
  A diferencia de `fechaReinscripcion` (que sí se formatea a ISO con `-07:00`),
  aquí se conserva el string crudo.
- `Aviso.tipo` es `string` **a propósito**: los valores conocidos hasta hoy
  son `"error"`, `"warn"`, `"info"` (y `"success"` fuera del login, p. ej.
  en inscripción), pero la lista NO es exhaustiva; se mantiene abierto
  mientras se descubren más severidades.

## Retícula (`alumno.reticula`)

Desde v3.0.0 la retícula (`ret[]`) se mapea a `ReticulaMateria[]`. Cada
materia expone:

- `coordenadas { x, y }` → `x` es el semestre y `y` la columna dentro de él.
- `clave` (`m`) y `nombre` (primera parte de `t`).
- `calificacion? { calificacion?, oportunidad? }`: solo si la materia ya fue
  cursada. El texto crudo `t` mezcla `"NOMBRE CALIF OPORTUNIDAD"` (o separado
  por salto de línea); el mapper los separa.
- `seriacion: Coordenadas[][]` → grupos "o" de `r`. Para cursar la materia se
  requiere aprobar UNA coordenada de cada grupo no vacío; los grupos vacíos se
  omiten.
- `codigoEstado` → código numérico del estado (campo crudo `c`).
- `estado` → **estado** de la materia como cadena legible, decodificado de
  `codigoEstado` por el mapper. Lista oficial del API (0-13, en
  `ESTADO_MATERIA_RETICULA`, re-exportada desde la raíz): 0 Falta cursar,
  1 Inscripción normal, 2 Acreditada, 3 Acreditada sin calificación,
  4 Complementarias aprobadas, 5 Repetición por cursar, 6 Inscripción en
  repetición, 7 Curso global, 8 A especial, 9 Inscripción en especial,
  10 Especial reprobado, 11 Inscrito en curso normal, 12 Inscrito en curso de
  repetición, 13 Inscrito en curso de especial.
- `c` → **deprecated** (retrocompatible): mismo valor numérico que
  `codigoEstado`; usa `estado` (texto) o `codigoEstado` (código) en su lugar.
- `g` → campo crudo conservado tal cual.

**Auto-acreditables:** las tutorías, actividades complementarias y
extraescolares (nombre que contiene `TUTORIA`/`COMPLEMENTARIA`/`EXTRAESCOLAR`)
se fuerzan a `estado = ACREDITADA` (2) si la API las reporta en
`FALTA_CURSAR` (0) o `INSCRIPCION_NORMAL` (1), porque suele reportarlas así
aun cuando el alumno ya las completó. Estados >= 2 se respetan.

### ⚠️ Fase de prueba

- **`g`** llega siempre `0` en las muestras; significado por confirmar.
- **Parseo de `t`:** separar nombre de calificación/oportunidad se basa en
  muestras (separador `\n` o espacio) y puede requerir ajustes.

## Glosario del payload crudo

Referencia rápida campo-crudo → significado (fuente: muestras locales y
observación; lo no confirmado se marca).

- Top level: `al` (alumno), `lmsg` (avisos), `tkn` (token JWT),
  `rol` (`"al"` = alumno, visto en otras rutas).
- `infadic`: `nom` nombre, `car` carrera, `sem` semestre, `toca` fecha de
  reinscripción, `ini`/`fin` inicio/fin del periodo de reinscripción,
  `prg`/`prs` promedios global/semestral, `tot`/`cfa`
  créditos totales/faltantes, `abi/aca/aes/afi/ava` adeudos por área
  (`"N"` = sin adeudo).
- `gins[]` (materias inscritas): `mat` clave, `cr` créditos (¡a veces
  string!), `gpo` grupo (`*` sin definir), `mape`/`mnom` apellidos/nombres
  docente, `lu/ma/mi/ju/vi/sa` horarios `"hh:mm-hh:mm salón\n"` (vacío =
  sin clase).
- `ret[]` (retícula): `x`/`y` coordenadas (`x` = semestre, `y` = columna), `m`
  clave, `t` `"NOMBRE\nCALIF OPORTUNIDAD"` (o separado por espacio; si no se
  cursó solo el nombre), `r` seriación `[[[x,y], ...], ...]` (grupos "o";
  los vacíos llegan como `[]`). `c` es el **estado** de la materia
  (ver `ESTADO_MATERIA_RETICULA`) y `g` es siempre `0` (sin definir); ver
  "Retícula" arriba.
- `kdx[]` kardex histórico (en muestras llega vacío o igual que `boleta`);
  `boleta.prom` promedio del periodo como string; `banco.mp_order`
  curiosamente coincide con el número de control (así se obtiene
  `numeroControl`).

## Gaps restantes

1. **Sin mecanismo real de sesión/token.** Cada consulta reenvía
   credenciales. Candidato a mejora del backend.
2. **Endpoint oficial en HTTP plano** con base configurable pero sin HTTPS
   nativo; usar proxy propio si hace falta TLS.
3. **Retícula mapeada pero parcialmente en fase de prueba**: `c` ya está
   confirmado como estado (`ESTADO_MATERIA_RETICULA`); `g` y el parseo de `t`
   siguen sin confirmar; ver "Retícula" arriba.
4. **`kdx` y `banco` poco explorados**: se usan mínimamente (boleta actual,
   número de control); puede haber más información aprovechable.
5. Severidades de avisos y el campo `ret[].g` siguen bajo observación;
   documentar hallazgos aquí.

## Pruebas

Suite unitaria offline con `node:test` corriendo vía `tsx` (sin
dependencias nuevas). Todo el data es mock fabricado en
`tests/helpers/mock.ts`; las pruebas del cliente sustituyen
`globalThis.fetch`, así que nunca tocan la red ni la API real.

```bash
npm test          # suite completa
npm run build     # tsc -> dist/
npm run prepublish # build + test
```

Cobertura: cada mapper por separado (incluidos casos borde: días vacíos,
créditos `""`/`"*"`, progreso 0, adeudos mixtos, retícula y su seriación,
payload malformado -> `SithMappingError`) y el ciclo completo del
cliente (éxito, logout fallido conservando datos + aviso warn, 401 ->
`SithAuthError`, otros !ok -> `SithHttpError`, rechazo de red, cuerpo
no-JSON, credenciales inválidas sin peticiones, `baseUrl` personalizada).
