import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';

export class HealthResponse {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok';
}

@ApiTags('operations')
@Controller()
export class HealthController {
  /** Liveness: no toca la base de datos. */
  @Get('health')
  @ApiOkResponse({ description: 'The process is alive.', type: HealthResponse })
  health(): HealthResponse {
    return { status: 'ok' };
  }
}
