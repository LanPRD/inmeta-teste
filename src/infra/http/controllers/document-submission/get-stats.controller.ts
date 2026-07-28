import { GetStatsUseCase } from "@/application/use-cases/document-submissions";
import { Controller, Get } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { StatsResponseSwaggerDto } from "../../docs/stats-response.swagger.dto";
import { ApiResponse } from "../../response";

@ApiTags("Stats")
@Controller("stats")
export class GetStatsController {
  constructor(private readonly getStats: GetStatsUseCase) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Estatísticas gerais do sistema" })
  @ApiOkResponse({
    description: "Dashboard de estatísticas",
    type: StatsResponseSwaggerDto
  })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle() {
    const result = await this.getStats.execute();

    if (result.isLeft()) {
      throw result.value;
    }

    return ApiResponse.ok(result.value);
  }
}
