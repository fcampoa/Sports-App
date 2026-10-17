import { describe, expect, it } from 'vitest';
import { InningsPitched } from '../../../src/domain/innings-pitched.js';
import { Rate } from '../../../src/domain/rate.js';
import { goldenPitchingFixture } from '../../support/fixtures.js';

describe('Golden file: Felix Hernandez, juego perfecto 2012-08-15 (TBR @ SEA)', () => {
  const { outs_recorded: outs, ER, BB, K } = goldenPitchingFixture.pitching_line.raw_counts;

  it('RN-GEN-004: 27 outs se muestran como "9.0" y valen 9 entradas', () => {
    const ip = new InningsPitched(outs);
    const expectedDisplay = goldenPitchingFixture.expected_derived.find(
      (item) => item.metric === 'InningsPitched.display',
    );
    expect(expectedDisplay?.expected).toBe('9.0');
    expect(ip.display()).toBe('9.0');
    expect(ip.asInnings()).toBeCloseTo(9, 12);
  });

  it('RN-GEN-002: K/9 = 27 x K / outs = 12', () => {
    expect(new Rate(27 * K, outs).value).toBe(12);
  });

  it('RN-GEN-002: ERA con 0 ER es 0 y no null (el denominador no es 0)', () => {
    const era = new Rate(27 * ER, outs).value;
    expect(era).not.toBeNull();
    expect(Object.is(era, 0)).toBe(true);
  });

  it('RN-GEN-002: K/BB con 0 BB es null y no 0 ni error', () => {
    expect(new Rate(K, BB).value).toBeNull();
  });
});
