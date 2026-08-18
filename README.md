# sith-api-client

Cliente TypeScript **no oficial** para la API de SITH del ITH (Instituto Tecnológico de Hermosillo).

## ⚠️ Aviso Legal

Esta es una API **NO OFICIAL**. El uso de esta librería es responsabilidad exclusiva del usuario. El autor no se hace responsable de las consecuencias derivadas de su uso, incluyendo posibles restricciones, bloqueos o sanciones impuestas por el servicio.

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

## 🚀 Uso Rápido

```typescript
import { SithClient } from 'sith-api-client';

const client = new SithClient();

const datos = await client.fetchDatos({
  user: 'tu_usuario',
  pass: 'tu_contraseña'
});

console.log(datos.alumno);  // Información del alumno
console.log(datos.avisos);  // Avisos disponibles
```

## 📚 API

### `SithClient`

#### `fetchDatos(credenciales)`

Obtiene la información del alumno y sus avisos.

**Parámetros:**
- `credenciales` (Credenciales): Objeto con `user` y `pass`

**Retorna:** Promise<{ alumno, avisos }>

**Ejemplo:**
```typescript
const { alumno, avisos } = await client.fetchDatos({
  user: 'matricula',
  pass: 'contraseña'
});
```

#### `mapDatos(data)`

Mapea datos raw de la API a objetos tipados (método estático).

**Parámetros:**
- `data` (ApiTodo): Respuesta raw de la API

**Retorna:** Promise<{ alumno, avisos }>

## 🔒 Seguridad

- Las credenciales **NO se almacenan** en la librería
- Se usan únicamente para realizar la consulta en el momento
- Se recomienda usar variables de entorno para las credenciales

```typescript
const datos = await client.fetchDatos({
  user: process.env.SITH_USER!,
  pass: process.env.SITH_PASS!
});
```

## 📝 Licencia

MIT

## 🤝 Contribuir

Si encuentras bugs o tienes mejoras, puedes reportarlos en el repositorio.

---

**Desarrollado por:** Tu Nombre  
**Última actualización:** 2026
