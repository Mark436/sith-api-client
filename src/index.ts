import type { ApiAviso, ApiTodo } from "./api/types.js";
import { TIPO_AVISO } from "./dto/Aviso.js";
import type { DatosAlumno } from "./dto/DatosAlumno.js";
import { mapTodo } from "./mappers/todo.mapper.js";
import { SithAuthError, SithHttpError, SithNetworkError } from "./errors.js";

export interface Credenciales {
  user: string;
  pass: string;
}

export interface SithClientOptions {
  /**
   * Base de los endpoints del API. Por defecto se usa el endpoint oficial
   * (`http://sith.ith.mx/XTodo/wr`); los paths `/login` y `/logout` se
   * derivan de aquí. Útil para apuntar a un proxy propio (por ejemplo uno
   * con HTTPS que evite el mixed-content del endpoint original, que es
   * HTTP plano).
   */
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "http://sith.ith.mx/XTodo/wr";

function getResponseInfo(response: Response) {
  return {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  };
}

export class SithClient {
  #loginEndpoint: string;
  #logoutEndpoint: string;

  constructor(options: SithClientOptions = {}) {
    const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#loginEndpoint = `${baseUrl}/login`;
    this.#logoutEndpoint = `${baseUrl}/logout`;
  }

  /**
   * API NO OFICIAL.
   * El uso de esta API es responsabilidad exclusiva del usuario.
   * El autor no se hace responsable de las consecuencias derivadas de su uso,
   * incluyendo posibles restricciones, bloqueos o sanciones impuestas por el
   * servicio.
   *
   * Realiza un ciclo completo sin estado: login -> validación -> logout ->
   * mapeo. El token de sesión se consume internamente y nunca se expone.
   *
   * @param credenciales Usuario y contraseña del alumno. Se utilizan únicamente
   * para realizar la consulta y no son almacenadas por esta librería.
   * @returns Objeto con la información del alumno y sus avisos.
   * @throws {SithAuthError} Credenciales inválidas o rechazadas por el API.
   * @throws {SithNetworkError} Fallo de red/DNS al contactar el API.
   * @throws {SithHttpError} Respuesta HTTP !ok o cuerpo no-JSON.
   */
  async fetchDatos(credenciales: Credenciales): Promise<DatosAlumno> {
    if (
      !credenciales ||
      typeof credenciales !== "object" ||
      typeof credenciales.user !== "string" ||
      credenciales.user.trim() === "" ||
      typeof credenciales.pass !== "string" ||
      credenciales.pass.trim() === ""
    ) {
      throw new SithAuthError("Credenciales inválidas");
    }

    const loginRes = await fetch(this.#loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credenciales),
    }).catch((e: unknown) => {
      throw new SithNetworkError("Error en el login", { cause: e });
    });

    if (!loginRes.ok) {
      const causa = getResponseInfo(loginRes);
      if (loginRes.status === 401 || loginRes.status === 403) {
        throw new SithAuthError("Error en el login", { cause: causa });
      }
      throw new SithHttpError("Error en el login", { cause: causa });
    }

    const data = await loginRes.json().catch((e: unknown) => {
      throw new SithHttpError(
        "El servidor respondió con contenido que no es JSON válido",
        { cause: { url: this.#loginEndpoint, detalle: String(e) } },
      );
    });

    if (!(data.al && data.tkn)) {
      throw new SithAuthError("Error en el login, faltan datos esperados", {
        cause:
          (Array.isArray(data.lmsg) &&
            data.lmsg
              ?.filter((aviso: ApiAviso) => aviso.severity === TIPO_AVISO.ERROR)
              .map((aviso: ApiAviso) => `${aviso.summary}: ${aviso.detail}`)) ||
          [],
      });
    }

    const token = data.tkn.toString();

    // El logout es best-effort: si falla no se descartan los datos ya descargados,
    // se agrega un aviso de advertencia a la respuesta.
    let logoutFallido: unknown;
    try {
      const logoutRes = await fetch(this.#logoutEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tkn: token }),
      });
      if (!logoutRes.ok) {
        logoutFallido = getResponseInfo(logoutRes);
      }
    } catch (e: unknown) {
      logoutFallido = e;
    }

    const datos = mapTodo(data);
    if (logoutFallido !== undefined) {
      datos.avisos.push({
        titulo: "Logout fallido",
        mensaje:
          "Los datos se obtuvieron correctamente, pero no se pudo cerrar la sesión en el servidor.",
        tipo: TIPO_AVISO.ADVERTENCIA,
      });
    }

    return datos;
  }

  /**
   * Mapea una respuesta cruda del API (por ejemplo capturada por el
   * consumidor) a DTOs tipados, sin hacer ninguna petición HTTP.
   */
  static async mapDatos(data: ApiTodo): Promise<DatosAlumno> {
    return mapTodo(data);
  }
}

export { SithAuthError, SithError, SithHttpError, SithNetworkError } from "./errors.js";
export { TIPO_AVISO } from "./dto/Aviso.js";
export type { Aviso } from "./dto/Aviso.js";
export type { Alumno } from "./dto/Alumno.js";
export type { Adeudos } from "./dto/Adeudos.js";
export type { Boleta } from "./dto/Boleta.js";
export type { CalificacionMateria, Coordenadas, ReticulaMateria } from "./dto/Materias.js";
export type { Creditos } from "./dto/Creditos.js";
export type { HorarioDia, HorarioMateria } from "./dto/Horario.js";
export type { DatosAlumno } from "./dto/DatosAlumno.js";
