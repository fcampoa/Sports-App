function validateCount(name: string, value: number): number {
  if (typeof value !== 'number') {
    throw new TypeError(`Rate: ${name} must be a number, received ${typeof value}`);
  }
  if (!Number.isFinite(value)) {
    throw new RangeError(`Rate: ${name} must be finite`);
  }
  if (value < 0) {
    throw new RangeError(`Rate: ${name} must be >= 0`);
  }
  // RN-GEN-007: -0 no se rechaza, se normaliza a 0.
  return value === 0 ? 0 : value;
}

/**
 * Tasa calculada desde conteos crudos (RN-GEN-001), sin redondear (RN-GEN-003).
 * Tipo y rango se validan antes del atajo de denominador 0 (RN-GEN-007);
 * denominador 0 -> `value === null` (RN-GEN-002).
 */
export class Rate {
  readonly numerator: number;
  readonly denominator: number;
  readonly value: number | null;

  constructor(numerator: number, denominator: number) {
    // Se valida el tipo de ambos antes de mirar rangos.
    if (typeof numerator !== 'number') {
      throw new TypeError(`Rate: numerator must be a number, received ${typeof numerator}`);
    }
    if (typeof denominator !== 'number') {
      throw new TypeError(`Rate: denominator must be a number, received ${typeof denominator}`);
    }
    this.numerator = validateCount('numerator', numerator);
    this.denominator = validateCount('denominator', denominator);
    this.value = this.denominator === 0 ? null : this.numerator / this.denominator;
    Object.freeze(this);
  }
}
