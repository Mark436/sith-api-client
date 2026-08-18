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
import { SithClient } from 'sith-api-client';

const client = new SithClient();

const datos = await client.fetchDatos({
  user: 'tu_usuario',
  pass: 'tu_contraseña',
});

console.log(datos.alumno);
console.log(datos.avisos);
```

## 📚 API

### `SithClient`

#### `fetchDatos(credenciales)`

Obtiene la información del alumno y sus avisos a partir de las credenciales proporcionadas por el usuario.

**Parámetros:**
- `credenciales` (Credenciales): objeto con `user` y `pass`

**Retorna:** `Promise<{ alumno, avisos }>`

**Ejemplo:**
```typescript
const { alumno, avisos } = await client.fetchDatos({
  user: 'matricula',
  pass: 'contraseña',
});
```

#### `mapDatos(data)`

Mapea la respuesta raw de la API a objetos tipados.

**Parámetros:**
- `data` (ApiTodo): respuesta cruda de la API

**Retorna:** `Promise<{ alumno, avisos }>`

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

## 🤝 Contribuir

Si encuentras errores o quieres proponer mejoras, puedes abrir un issue o enviar un pull request.

---

**Nota:** Esta biblioteca es solo una herramienta para consumo por parte del usuario y no sustituye ni representa una API oficial ni un servicio respaldado por la institución.
