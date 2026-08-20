import type { ApiAviso, ApiTodo } from "./api/types.js";
import { TIPO_AVISO } from "./dto/Aviso.js";
import { mapTodo } from "./mappers/todo.mapper.js";

interface Credenciales {
  user: string;
  pass: string;
}

function getResponseInfo(response: Response) {
  return {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  };
}

export class SithClient {
  #LOGIN_ENDPOINT = "http://sith.ith.mx/XTodo/wr/login";
  #LOGOUT_ENDPOINT = "http://sith.ith.mx/XTodo/wr/logout";
  /**
   * API NO OFICIAL.
   * El uso de esta API es responsabilidad exclusiva del usuario.
   * El autor no se hace responsable de las consecuencias derivadas de su uso,
   * incluyendo posibles restricciones, bloqueos o sanciones impuestas por el
   * servicio.
   *
   * @param credenciales Usuario y contraseña del alumno. Se utilizan únicamente
   * para realizar la consulta y no son almacenadas por esta librería.
   * @returns Objeto con la información del alumno y sus avisos.   */
  async fetchDatos(credenciales: Credenciales) {
    if (
      !credenciales ||
      typeof credenciales !== "object" ||
      typeof credenciales.user !== "string" ||
      typeof credenciales.pass !== "string"
    ) {
      throw new Error("Credenciales inválidas");
    }
    const loginRes = await fetch(this.#LOGIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credenciales),
    }).catch((e: unknown) => {
      throw new Error("Error en el login", { cause: e });
    });
    if (!loginRes.ok) {
      throw new Error("Error en el login", {
        cause: getResponseInfo(loginRes),
      });
    }
    const data = await loginRes.json();

    if (!(data.al && data.tkn)) {
      throw new Error("Error en el login, faltan datos esperados", {
        cause:
          (Array.isArray(data.lmsg) &&
            data.lmsg
              ?.filter((aviso: ApiAviso) => aviso.severity === TIPO_AVISO.ERROR)
              .map((aviso: ApiAviso) => `${aviso.summary}: ${aviso.detail}`)) ||
          [],
      });
    }
    const token = data.tkn.toString();
    const logoutRes = await fetch(this.#LOGOUT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tkn: token }),
    }).catch((e: unknown) => {
      throw new Error("Error en el log out ", { cause: e });
    });
    if (!logoutRes.ok) {
      throw new Error("Logout fallido", {
        cause: getResponseInfo(logoutRes),
      });
    }
    const { alumno, avisos } = mapTodo(data);

    return { alumno, avisos };
  }
  static async mapDatos(data: ApiTodo) {
    const { alumno, avisos } = mapTodo(data);
    return { alumno, avisos };
  }
}
