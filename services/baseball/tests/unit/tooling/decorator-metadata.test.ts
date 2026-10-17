import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

@Injectable()
class Dependency {
  readonly name = 'dependency';
}

@Injectable()
class Consumer {
  // Sin @Inject: la inyeccion por tipo exige emitDecoratorMetadata (unplugin-swc).
  constructor(readonly dependency: Dependency) {}
}

@Module({ providers: [Dependency, Consumer] })
class SampleModule {}

describe('Herramientas: decoradores de Nest bajo Vitest', () => {
  it('la inyeccion de dependencias por tipo funciona (metadata de decoradores emitida por SWC)', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [SampleModule] }).compile();
    const consumer = moduleRef.get(Consumer);
    expect(consumer.dependency).toBeInstanceOf(Dependency);
    await moduleRef.close();
  });
});
