import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HealthController } from './health.controller.js';
import { ProblemDetailsFilter } from './problem-details.filter.js';
import { ReadyController } from './ready.controller.js';

@Module({
  controllers: [HealthController, ReadyController],
  providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
})
export class ApiModule {}
