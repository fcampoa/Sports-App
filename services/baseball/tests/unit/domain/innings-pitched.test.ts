import { describe, expect, it } from 'vitest';
import { InningsPitched } from '../../../src/domain/innings-pitched.js';
import { errorClass, inningsPitchedFixture } from '../../support/fixtures.js';

type Check = () => void;

function lookup(checks: Readonly<Record<string, Check>>, id: string): Check {
  const check = checks[id];
  if (check === undefined) {
    throw new Error(`Falta el test escrito a mano para ${id}`);
  }
  return check;
}

function construct(...args: readonly unknown[]): unknown {
  const built: unknown = Reflect.construct(InningsPitched, args);
  return built;
}

describe('InningsPitched', () => {
  describe('casos de los fixtures', () => {
    it.each(inningsPitchedFixture.cases)(
      '$rule_id: $id $test_name',
      ({ input, expect: expected }) => {
        const ip = new InningsPitched(input.outs);
        expect(ip.outs).toBe(input.outs);
        expect(ip.display()).toBe(expected.display);
        expect(Math.abs(ip.asInnings() - expected.as_innings_approx)).toBeLessThanOrEqual(
          expected.tolerance,
        );
      },
    );

    it.each(inningsPitchedFixture.error_cases)(
      '$rule_id: $id $test_name',
      ({ input, expect: expected }) => {
        expect(() => construct(input.outs)).toThrow(errorClass(expected.error));
      },
    );
  });

  describe('regression_guards (escritos a mano)', () => {
    const guards: Readonly<Record<string, Check>> = {
      'RN-GEN-004-G01': () => {
        const display = new InningsPitched(20).display();
        expect(display).toBe('6.2');
        expect(['6.7', '6.67', '6.6667']).not.toContain(display);
      },
      'RN-GEN-004-G02': () => {
        const innings = new InningsPitched(20).asInnings();
        expect(innings).not.toBe(6.67);
        expect(innings).not.toBe(6.6667);
        expect(Math.abs(innings - 20 / 3)).toBeLessThan(1e-12);
      },
      'RN-GEN-004-G03': () => {
        const summed =
          Number(new InningsPitched(20).display()) + Number(new InningsPitched(1).display());
        expect(summed).not.toBe(new InningsPitched(21).asInnings());
      },
      'RN-GEN-004-G04': () => {
        for (let outs = 0; outs <= 399; outs += 1) {
          const remainder = new InningsPitched(outs).display().split('.')[1];
          expect(['0', '1', '2']).toContain(remainder);
        }
      },
    };

    it.each(inningsPitchedFixture.regression_guards)('$rule_id: $id', ({ id }) => {
      lookup(guards, id)();
    });
  });

  describe('cases_outside_json (escritos a mano)', () => {
    const outside: Readonly<Record<string, Check>> = {
      'RN-GEN-004-X01': () => {
        expect(() => new InningsPitched(Number.NaN)).toThrow(RangeError);
      },
      'RN-GEN-004-X02': () => {
        expect(() => new InningsPitched(Number.POSITIVE_INFINITY)).toThrow(RangeError);
      },
      'RN-GEN-004-X03': () => {
        expect(() => new InningsPitched(Number.NEGATIVE_INFINITY)).toThrow(RangeError);
      },
      'RN-GEN-004-X04': () => {
        expect(() => new InningsPitched(Number.MAX_SAFE_INTEGER + 2)).toThrow(RangeError);
      },
      'RN-GEN-004-X05': () => {
        const ip = new InningsPitched(-0);
        expect(Object.is(ip.outs, 0)).toBe(true);
        expect(Object.is(ip.outs, -0)).toBe(false);
        expect(ip.display()).toBe('0.0');
      },
    };

    it.each(inningsPitchedFixture.cases_outside_json.cases)('RN-GEN-004: $id', ({ id }) => {
      lookup(outside, id)();
    });
  });

  describe('propiedades adicionales', () => {
    it('RN-GEN-004: display() no usa notacion cientifica en el maximo seguro', () => {
      expect(new InningsPitched(Number.MAX_SAFE_INTEGER).display()).toMatch(/^\d+\.[012]$/);
    });

    it('RN-GEN-004: la instancia es inmutable', () => {
      expect(Object.isFrozen(new InningsPitched(5))).toBe(true);
    });
  });
});
