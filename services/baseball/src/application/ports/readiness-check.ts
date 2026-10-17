/** Puerto: comprueba que las dependencias (base de datos) estan listas para recibir trafico. */
export interface ReadinessCheck {
  /** Resuelve si todo esta listo; rechaza si alguna dependencia no responde. */
  check(): Promise<void>;
}

export const READINESS_CHECK = Symbol('READINESS_CHECK');
