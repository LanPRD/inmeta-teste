import {
  GetAllEmployeesSchema,
  type GetAllEmployeesDto
} from "@/application/dtos";
import { GetAllEmployeesUseCase } from "@/application/use-cases/employees";
import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { EmployeeResponseSwaggerDto } from "../../docs/employee-response.swagger.dto";
import { ZodValidationPipe } from "../../pipes/zod-validation.pipe";
import { EmployeePresenter } from "../../presenters/employee-presenter";
import { ApiResponse } from "../../response";

@ApiTags("Employees")
@Controller("employees")
export class GetAllEmployeesController {
  constructor(private readonly getAllEmployees: GetAllEmployeesUseCase) {}

  @Get()
  @ApiOperation({ summary: "Lista colaboradores paginados" })
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 20 })
  @ApiQuery({ name: "name", required: false, example: "John" })
  @ApiQuery({ name: "includeDeleted", required: false, example: false })
  @ApiOkResponse({
    description: "Lista paginada",
    type: [EmployeeResponseSwaggerDto]
  })
  @ApiInternalServerErrorResponse({ description: "Erro interno" })
  async handle(
    @Query(new ZodValidationPipe(GetAllEmployeesSchema))
    query: GetAllEmployeesDto
  ) {
    const result = await this.getAllEmployees.execute(query);

    if (result.isLeft()) {
      throw result.value;
    }

    const { employees, meta } = result.value;

    return ApiResponse.paginated(employees.map(EmployeePresenter.toHTTP), meta);
  }
}
