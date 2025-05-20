import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { Billing } from './entities/billing.entity';

@ApiTags('Billing | Facturación | Tarifa')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // =================== CREATE ===================
  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarifa de facturación' })
  @ApiBody({ type: CreateBillingDto })
  @ApiResponse({
    status: 201,
    description: 'Tarifa creada exitosamente',
    type: Billing,
  })
  create(@Body() createBillingDto: CreateBillingDto) {
    return this.billingService.create(createBillingDto);
  }

  // =================== FIND ALL ===================
  @Get()
  @ApiOperation({ summary: 'Listar todas las tarifas de facturación' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de resultados a devolver',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Cantidad de resultados a omitir',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de tarifas',
    type: [Billing],
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.billingService.findAll(pagination);
  }

  // =================== FIND ONE ===================
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarifa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la tarifa' })
  @ApiResponse({
    status: 200,
    description: 'Tarifa encontrada',
    type: Billing,
  })
  findOne(@Param('id') id: string) {
    return this.billingService.findOneById(id);
  }

  // =================== CALCULAR SALDO ===================
  @Get('/calculate-balance/:cubic')
  @ApiOperation({ summary: 'Calcular monto a pagar según consumo en m³' })
  @ApiParam({
    name: 'cubic',
    type: Number,
    description: 'Cantidad de metros cúbicos consumidos',
    example: 12.5,
  })
  @ApiResponse({
    status: 200,
    description: 'Monto calculado según las tarifas configuradas',
    schema: {
      example: {
        baseRate: 5,
        additionalRate: 1.5,
        total: 12.5,
      },
    },
  })
  calculateBalance(@Param('cubic') cubicMeters: string) {
    return this.billingService.calculateBalance(parseFloat(cubicMeters));
  }

  // =================== PATCH ===================
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una tarifa existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la tarifa' })
  @ApiBody({ type: UpdateBillingDto })
  @ApiResponse({
    status: 200,
    description: 'Tarifa actualizada parcialmente',
    type: Billing,
  })
  update(@Param('id') id: string, @Body() body: UpdateBillingDto) {
    return this.billingService.update(id, body);
  }

  // =================== PUT ===================
  @Put()
  @ApiOperation({
    summary: 'Actualizar múltiples tarifas de facturación',
  })
  @ApiBody({
    type: [UpdateBillingDto],
    description: 'Array de objetos con los datos de las tarifas a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarifas actualizadas exitosamente',
    type: [Billing],
  })
  updateMultipleBillings(@Body() billings: UpdateBillingDto[]) {
    return this.billingService.updateMultipleBillings(billings);
  }

  // =================== DELETE ===================
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarifa por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la tarifa' })
  @ApiResponse({ status: 200, description: 'Tarifa eliminada exitosamente' })
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }
}
