import type { ApiTodo } from "./api/types";
import { mapTodo } from "./mappers/todo.mapper.js";

interface Credenciales {
  user: string;
  pass: string;
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
      throw new Error("Error en el log in", { cause: e });
    });
    const data = await loginRes.json();

    const { alumno, avisos, token } = (() => {
      let datos;
      try {
        datos = mapTodo(data);
      } catch (e) {
        throw new Error("No se encontraron todos los datos ", { cause: e });
      }
      return datos;
    })();

    const logoutRes = await fetch(this.#LOGOUT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tkn: token }),
    }).catch((e: unknown) => {
      throw new Error("Error en el log out ", { cause: e });
    });
    return { alumno, avisos };
  }
  static async mapDatos(data: ApiTodo) {
    const { alumno, avisos } = mapTodo(data);
    return { alumno, avisos };
  }
}
