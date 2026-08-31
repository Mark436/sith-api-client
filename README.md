# sith-api-client

Cliente TypeScript para consumir la API de SITH del ITH (Instituto Tecnológico de Hermosillo), creado de forma independiente y sin relación oficial con la institución.

## ⚠️ Aviso importante

Esta librería es una implementación **no oficial** de un cliente para la API de SITH.

No está afiliada, respaldada ni aprobada por el Instituto Tecnológico de Hermosillo ni por ninguna autoridad institucional.

El uso de esta biblioteca es responsabilidad exclusiva del usuario. El autor no se hace responsable de:

- bloqueos, restricciones, errores o cambios en el servicio
- pérdidas de datos, inconvenientes o consecuencias derivadas del uso
- sanciones, penalizaciones o consecuencias de cualquier tipo impuestas por el servicio o la institución
- fallas, incompatibilidades o comportamiento inesperado del sistema externo

Esta librería se proporciona tal cual, sin garantías de ningún tipo, ni explícitas ni implícitas.

## 📦 Instalación

**Con pnpm:**

```bash
pnpm add sith-api-client
```

**Con npm:**

```bash
npm install sith-api-client
```

**Con yarn:**

```bash
yarn add sith-api-client
```

## 🚀 Uso rápido

```typescript
import { SithClient } from "sith-api-client";

const client = new SithClient();

const datos = await client.fetchDatos({
  user: "tu_usuario",
  pass: "tu_contraseña",
});

console.log(datos.alumno);
console.log(datos.avisos);
```

## ⚙️ Opciones

`SithClient` acepta opciones opcionales en el constructor:

```typescript
// Por defecto usa el endpoint oficial (HTTP plano).
const client = new SithClient();

// Se puede apuntar a un proxy propio, por ejemplo con HTTPS para evitar
// el mixed-content que causaría el endpoint original dentro de una web.
const clientProxy = new SithClient({
  baseUrl: "https://mi-proxy.ejemplo.mx/sith",
});
```

Los endpoints `/login` y `/logout` se derivan de `baseUrl`.

## 🔁 Cómo funciona

Cada llamada a `fetchDatos()` hace un ciclo completo **sin estado**:

1. Valida las credenciales localmente.
2. `POST /login` con `{ user, pass }` y exige `al` (alumno) y `tkn` (token).
3. `POST /logout` inmediato con el token (**best-effort**: si falla, los
   datos no se pierden; solo se agrega un aviso de tipo `warn`).
4. Mapea la respuesta cruda a DTOs tipados y regresa `{ alumno, avisos }`.

El token se consume internamente y nunca se expone: no hay sesión, por lo
que cada actualización necesita las credenciales otra vez. Los detalles
internos, el modelo de datos y el glosario del payload crudo están en
[`api.md`](./api.md).

## 📚 API

### `SithClient`

#### `fetchDatos(credenciales)`

Obtiene la información del alumno, su horario inscrito y sus avisos a partir de las credenciales proporcionadas por el usuario.

**Parámetros:**

- `credenciales` (Credenciales): objeto con `user` y `pass`

**Retorna:** `Promise<{ alumno, avisos }>`

`alumno.horario` contiene las materias inscritas con su horario semanal (`dias.lunes...sabado`, omitiendo los días sin clase). `alumno.reticula` contiene las materias del plan de estudios (la retícula; ⚠️ en fase de prueba, ver [`api.md`](./api.md)). Cada aviso contiene `titulo`, `mensaje` y `tipo`. Los tipos conocidos son `error`, `warn` e `info`, pero el API puede devolver otros (p. ej. `success`), por eso `tipo` es un string abierto.

**Errores:** lanza subclases de `SithError`:

| Clase | Cuándo |
| --- | --- |
| `SithAuthError` | credenciales inválidas localmente o rechazadas por el API (incluye 401/403) |
| `SithNetworkError` | fallo de red/DNS al contactar el servicio |
| `SithHttpError` | respuesta HTTP `!ok` distinta de 401/403 o cuerpo que no es JSON |
| `SithMappingError` | el payload del API llega malformado (le falta `al` o `lmsg`) |

Todos conservan el `cause` original con su forma histórica, y `SithHttpError` expone `.status`.

**Ejemplo:**

```typescript
import {
  SithClient,
  SithAuthError,
  SithHttpError,
  SithMappingError,
  SithNetworkError,
} from "sith-api-client";

try {
  const { alumno, avisos } = await client.fetchDatos({
    user: "matricula",
    pass: "contraseña",
  });
} catch (error) {
  if (error instanceof SithAuthError) {
    // credenciales incorrectas
  } else if (
    error instanceof SithNetworkError ||
    error instanceof SithHttpError
  ) {
    // problema de conexión o del servicio
  } else if (error instanceof SithMappingError) {
    // el API devolvió un payload inesperado
  }
}
```

#### `mapDatos(data)`

Mapea la respuesta raw de la API a objetos tipados, sin hacer peticiones.

**Parámetros:**

- `data` (ApiTodo): respuesta cruda de la API

**Retorna:** `Promise<{ alumno, avisos }>`

## 🧪 Pruebas

Suite unitaria 100% offline con datos mock fabricados (nunca toca la API
real):

```bash
npm test
```

## 🔒 Seguridad y manejo de credenciales

- Las credenciales no se almacenan dentro de la librería.
- Se utilizan solamente durante la ejecución de la consulta.
- Se recomienda manejar las credenciales mediante variables de entorno o por entrada del usuario en tiempo de ejecución.

```typescript
const datos = await client.fetchDatos({
  user: process.env.SITH_USER!,
  pass: process.env.SITH_PASS!,
});
```

## 🧾 Descargo de responsabilidad final

El uso de esta herramienta queda bajo la completa responsabilidad del usuario. El autor no garantiza su funcionamiento continuo, ni acepta ninguna responsabilidad por daños, pérdidas, limitaciones, bloqueos, errores del servicio externo o consecuencias derivadas del uso de la librería.

Si el servicio o la institución lo prohíben, restringen o cambian, el autor no tiene control sobre ello y no se hace responsable de ningún efecto resultante.

## 📝 Licencia

MIT

## 🗺️ Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — estructura y arquitectura del paquete.
- [`api.md`](./api.md) — detalle interno del ciclo de petición, el modelo de
  datos y el glosario del payload crudo.
- [`PLAN.md`](./PLAN.md) — pendientes de limpieza y backlog futuro.

## 🤝 Contribuir

Si encuentras errores o quieres proponer mejoras, puedes abrir un issue o enviar un pull request.

---

**Nota:** Esta biblioteca es solo una herramienta para consumo por parte del usuario y no sustituye ni representa una API oficial ni un servicio respaldado por la institución.
