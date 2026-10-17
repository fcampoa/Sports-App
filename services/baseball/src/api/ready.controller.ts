import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { READINESS_CHECK, type ReadinessCheck } from '../application/ports/readiness-check.js';
import { ApiProblemResponse } from './problem-details.js';

export class ReadyResponse {
  @ApiProperty({ enum: ['ready'], example: 'ready' })
  status!: 'ready';
}

@ApiTags('operations')
@Controller()
export class ReadyController {
  constructor(@Inject(READINESS_CHECK) private readonly readiness: ReadinessCheck) {}

  /** Readiness: comprueba PostgreSQL. */
  @Get('ready')
  @ApiOkResponse({ description: 'The service and its database are ready.', type: ReadyResponse })
  @ApiProblemResponse(503, 'The database is not reachable.')
  async ready(): Promise<ReadyResponse> {
    try {
      await this.readiness.check();
    } catch (error: unknown) {
      // La causa solo se registra (filtro); nunca llega al cliente.
      throw new ServiceUnavailableException(undefined, { cause: error });
    }
    return { status: 'ready' };
  }
}
