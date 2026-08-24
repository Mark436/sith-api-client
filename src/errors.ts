/**
 * Jerarquía de errores tipados del cliente.
 *
 * Todos heredan de `SithError`, así que un solo `instanceof SithError`
 * basta para reconocer cualquier fallo de esta librería. Los mensajes
 * siguen siendo los mismos de siempre y el `cause` conserva su forma
 * original, para no romper a quien ya inspeccionaba `error.cause`.
 */

export class SithError extends Error {
  override readonly name: string = "SithError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** `fetch` rechazó la petición (red, DNS, CORS...). */
export class SithNetworkError extends SithError {
  override readonly name = "SithNetworkError";
}

/**
 * El servidor respondió con un status HTTP !ok.
 * Expone `status`, extraído del `cause` ({ status, statusText, url }).
 */
export class SithHttpError extends SithError {
  override readonly name = "SithHttpError";
  readonly status?: number;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    const causa = this.cause as { status?: unknown } | null;
    if (causa && typeof causa === "object" && typeof causa.status === "number") {
      this.status = causa.status;
    }
  }
}

/** Credenciales inválidas localmente o rechazadas por el API. */
export class SithAuthError extends SithError {
  override readonly name = "SithAuthError";
}
