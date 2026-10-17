const OUTS_PER_INNING = 3;

/**
 * Entradas lanzadas, almacenadas como outs enteros (RN-GEN-004).
 * Inmutable. No redondea (RN-GEN-003): `asInnings()` alimenta formulas y `display()` es exacto.
 */
export class InningsPitched {
  /** Outs retirados; entero seguro >= 0. `-0` se normaliza a `0`. */
  readonly outs: number;

  constructor(outs: number) {
    if (typeof outs !== 'number') {
      throw new TypeError(`InningsPitched: outs must be a number, received ${typeof outs}`);
    }
    if (!Number.isSafeInteger(outs)) {
      throw new RangeError('InningsPitched: outs must be a safe integer');
    }
    if (outs < 0) {
      throw new RangeError('InningsPitched: outs must be >= 0');
    }
    this.outs = outs === 0 ? 0 : outs;
    Object.freeze(this);
  }

  /** Formato `entero.resto` con resto 0, 1 o 2 (20 outs -> "6.2"). Solo aritmetica entera. */
  display(): string {
    const remainder = this.outs % OUTS_PER_INNING;
    const whole = (this.outs - remainder) / OUTS_PER_INNING;
    return `${String(whole)}.${String(remainder)}`;
  }

  /** Entradas como numero para formulas: outs / 3, sin redondear. */
  asInnings(): number {
    return this.outs / OUTS_PER_INNING;
  }
}
