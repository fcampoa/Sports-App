import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export const PROBLEM_JSON = 'application/problem+json';

/** Cuerpo de error segun RFC 9457. */
export class ProblemDetails {
  @ApiProperty({ example: 'about:blank' })
  type!: string;

  @ApiProperty({ example: 'Not Found' })
  title!: string;

  @ApiProperty({ type: 'integer', example: 404 })
  status!: number;

  @ApiProperty({ example: 'The requested resource was not found.' })
  detail!: string;
}

/** Documenta una respuesta de error solo como application/problem+json. */
export function ApiProblemResponse(status: number, description: string): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ProblemDetails),
    ApiResponse({
      status,
      description,
      content: { [PROBLEM_JSON]: { schema: { $ref: getSchemaPath(ProblemDetails) } } },
    }),
  );
}
