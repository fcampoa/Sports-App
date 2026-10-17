import { describe, expect, it } from 'vitest';
import { Rate } from '../../../src/domain/rate.js';
import { errorClass, rateFixture } from '../../support/fixtures.js';

type Check = () => void;

function lookup(checks: Readonly<Record<string, Check>>, id: string): Check {
  const check = checks[id];
  if (check === undefined) {
    throw new Error(`Falta el test escrito a mano para ${id}`);
  }
  return check;
}

// Construye con argumentos de tipo arbitrario para probar la validacion en tiempo de ejecucion.
function construct(...args: readonly unknown[]): unknown {
  const built: unknown = Reflect.construct(Rate, args);
  return built;
}

describe('Rate', () => {
  describe('casos de los fixtures', () => {
    it.each(rateFixture.cases)('$rule_id: $id $test_name', ({ input, expect: expected }) => {
      const rate = new Rate(input.numerator, input.denominator);
      if (expected.value === null) {
        expect(rate.value).toBeNull();
      } else if (expected.tolerance === undefined) {
        expect(rate.value).toBe(expected.value);
      } else {
        expect(rate.value).not.toBeNull();
        expect(Math.abs((rate.value ?? Number.NaN) - expected.value)).toBeLessThanOrEqual(
          expected.tolerance,
        );
      }
    });

    it.each(rateFixture.cases_fractional_denominator)(
      '$rule_id: $id $test_name',
      ({ input, expect: expected }) => {
        const rate = new Rate(input.numerator, input.denominator);
        if (expected.value === null) {
          expect(rate.value).toBeNull();
        } else {
          expect(rate.value).toBeCloseTo(expected.value, 9);
        }
      },
    );

    it.each(rateFixture.error_cases)('$rule_id: $id $test_name', ({ input, expect: expected }) => {
      expect(() => construct(input.numerator, input.denominator)).toThrow(
        errorClass(expected.error),
      );
    });
  });

  describe('regression_guards (escritos a mano)', () => {
    const guards: Readonly<Record<string, Check>> = {
      'RN-GEN-002-G01': () => {
        expect(new Rate(4, 0).value).toBeNull();
      },
      'RN-GEN-002-G02': () => {
        expect(() => new Rate(4, 0)).not.toThrow();
        const value = new Rate(4, 0).value;
        expect(value).not.toBe(Number.POSITIVE_INFINITY);
        expect(Number.isNaN(value)).toBe(false);
      },
      'RN-GEN-002-G03': () => {
        const value = new Rate(4, 12).value;
        expect(value).not.toBeNull();
        expect(value).not.toBe(0.333);
        expect(value).not.toBe(0.3333);
        expect(Math.abs((value ?? Number.NaN) - 1 / 3)).toBeLessThan(1e-12);
      },
    };

    it.each(rateFixture.regression_guards)('$rule_id: $id', ({ id }) => {
      lookup(guards, id)();
    });
  });

  describe('cases_outside_json (escritos a mano)', () => {
    const outside: Readonly<Record<string, Check>> = {
      'RN-GEN-002-X01': () => {
        expect(() => new Rate(Number.NaN, 12)).toThrow(RangeError);
      },
      'RN-GEN-002-X02': () => {
        expect(() => new Rate(4, Number.NaN)).toThrow(RangeError);
      },
      'RN-GEN-002-X03': () => {
        expect(() => new Rate(4, Number.POSITIVE_INFINITY)).toThrow(RangeError);
      },
      'RN-GEN-002-X04': () => {
        expect(() => new Rate(Number.POSITIVE_INFINITY, 0)).toThrow(RangeError);
      },
      'RN-GEN-002-X05': () => {
        expect(() => new Rate(Number.NaN, 0)).toThrow(RangeError);
      },
      'RN-GEN-002-X06': () => {
        expect(() => new Rate(Number.NEGATIVE_INFINITY, 5)).toThrow(RangeError);
      },
      'RN-GEN-002-X07': () => {
        const value = new Rate(-0, 5).value;
        expect(Object.is(value, 0)).toBe(true);
        expect(Object.is(value, -0)).toBe(false);
      },
      'RN-GEN-002-X08': () => {
        expect(new Rate(4, -0).value).toBeNull();
      },
      'RN-GEN-002-X09': () => {
        expect(new Rate(-0, -0).value).toBeNull();
      },
    };

    it.each(rateFixture.cases_outside_json.cases)('$rule_id: $id', ({ id }) => {
      lookup(outside, id)();
    });
  });

  describe('propiedades adicionales', () => {
    it('RN-GEN-007: el numerador y el denominador se exponen sin cambios', () => {
      const rate = new Rate(3, 8);
      expect(rate.numerator).toBe(3);
      expect(rate.denominator).toBe(8);
    });

    it('RN-GEN-007: -0 se normaliza tambien en numerador y denominador expuestos', () => {
      const rate = new Rate(-0, -0);
      expect(Object.is(rate.numerator, 0)).toBe(true);
      expect(Object.is(rate.denominator, 0)).toBe(true);
    });

    it('RN-GEN-007: el tipo se valida antes que el signo y que el atajo de denominador 0', () => {
      expect(() => construct(-1, 'x')).toThrow(TypeError);
    });

    it('RN-GEN-001: la tasa se calcula del total crudo y no del promedio de promedios', () => {
      const gameA = new Rate(1, 1);
      const gameB = new Rate(0, 4);
      const averageOfAverages = ((gameA.value ?? 0) + (gameB.value ?? 0)) / 2;
      const season = new Rate(1 + 0, 1 + 4);
      expect(season.value).toBe(0.2);
      expect(season.value).not.toBe(averageOfAverages);
    });
  });
});
