import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const FIXTURES_DIR = join(import.meta.dirname, '..', 'fixtures');

function readJson(name: string): unknown {
  const parsed: unknown = JSON.parse(readFileSync(join(FIXTURES_DIR, name), 'utf8'));
  return parsed;
}

const errorName = z.enum(['RangeError', 'TypeError']);

const rateCase = z.object({
  id: z.string(),
  rule_id: z.string(),
  test_name: z.string(),
  input: z.object({ numerator: z.number(), denominator: z.number() }),
  expect: z.object({ value: z.number().nullable(), tolerance: z.number().optional() }),
});

const rateErrorCase = z.object({
  id: z.string(),
  rule_id: z.string(),
  test_name: z.string(),
  input: z.object({ numerator: z.unknown(), denominator: z.unknown() }),
  expect: z.object({ error: errorName }),
});

const rateFixtureSchema = z.object({
  cases: z.array(rateCase),
  cases_fractional_denominator: z.array(rateCase),
  error_cases: z.array(rateErrorCase),
  regression_guards: z.array(z.object({ id: z.string(), rule_id: z.string() })),
  cases_outside_json: z.object({
    cases: z.array(z.object({ id: z.string(), rule_id: z.string() })),
  }),
});

const ipCase = z.object({
  id: z.string(),
  rule_id: z.string(),
  test_name: z.string(),
  input: z.object({ outs: z.number() }),
  expect: z.object({
    display: z.string(),
    as_innings_approx: z.number(),
    tolerance: z.number(),
  }),
});

const ipErrorCase = z.object({
  id: z.string(),
  rule_id: z.string(),
  test_name: z.string(),
  input: z.object({ outs: z.unknown() }),
  expect: z.object({ error: errorName }),
});

const ipFixtureSchema = z.object({
  cases: z.array(ipCase),
  error_cases: z.array(ipErrorCase),
  regression_guards: z.array(z.object({ id: z.string(), rule_id: z.string() })),
  cases_outside_json: z.object({
    cases: z.array(z.object({ id: z.string() })),
  }),
});

const goldenSchema = z.object({
  pitching_line: z.object({
    raw_counts: z.object({
      outs_recorded: z.number(),
      ER: z.number(),
      BB: z.number(),
      K: z.number(),
    }),
  }),
  expected_derived: z.array(
    z.object({
      metric: z.string(),
      expected: z.union([z.string(), z.number()]).optional(),
      expected_value: z.number().nullable().optional(),
    }),
  ),
});

export const rateFixture = rateFixtureSchema.parse(readJson('rn_gen_002_rate.json'));
export const inningsPitchedFixture = ipFixtureSchema.parse(
  readJson('rn_gen_004_innings_pitched.json'),
);
export const goldenPitchingFixture = goldenSchema.parse(
  readJson('golden_boxscore_2012-08-15_tbr_sea_pitching.json'),
);

export type ErrorName = z.infer<typeof errorName>;

export function errorClass(name: ErrorName): typeof RangeError | typeof TypeError {
  return name === 'RangeError' ? RangeError : TypeError;
}
