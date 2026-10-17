import { Module, type DynamicModule } from '@nestjs/common';
import { ApiModule } from './api/api.module.js';
import {
  InfrastructureModule,
  type InfrastructureOptions,
} from './infrastructure/infrastructure.module.js';

@Module({})
export class AppModule {
  static register(options: InfrastructureOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [InfrastructureModule.register(options), ApiModule],
    };
  }
}
