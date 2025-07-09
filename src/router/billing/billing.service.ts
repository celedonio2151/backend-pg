import {
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Billing } from 'src/router/billing/entities/billing.entity';
import { PaginationDto } from 'src/shared/dto/pagination-query.dto';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto, UpdateBillingsDto } from './dto/update-billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing) private billingRepository: Repository<Billing>,
  ) {}
  async create(createBillingDto: CreateBillingDto) {
    const newBilling = this.billingRepository.create(createBillingDto);
    return await this.billingRepository.save(newBilling);
  }

  async findAll(pagination: PaginationDto) {
    const { limit, offset } = pagination;
    const [billings, total] = await this.billingRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { rate: 'ASC' },
    });
    return {
      limit,
      offset,
      total,
      billings,
    };
  }

  async findOneById(id: string) {
    const billing = await this.billingRepository.findOneBy({ _id: id });
    if (!billing) throw new NotFoundException(`Billing ${id} no encontrado`);
    return billing;
  }

  // ================================================================
  //          CALCULATE BALANCE
  // ================================================================
  async calculateBalance(
    cubicMeters: number,
  ): Promise<number | { message: string }> {
    if (cubicMeters === null || cubicMeters < 0) {
      throw new NotAcceptableException({
        message:
          'Debe enviar un número positivo en la URL, por ejemplo, /cubic=12',
      });
    }
    // Inicializa el monto base y metros cubicos base
    let total = 0;
    let min_cubic = 0;
    // Consulta todas las tarifas desde la base de datos
    const billings = await this.billingRepository.find({
      order: { rate: 'ASC' },
    });
    for (const billing of billings) {
      if (
        cubicMeters >= billing.min_cubic_meters &&
        cubicMeters <= billing.max_cubic_meters
      )
        total +=
          billing.base_rate + billing.rate * ((cubicMeters - min_cubic) * 1);
      min_cubic = billing.max_cubic_meters;
    }
    return total; // Devuelve el monto calculado
  }

  async update(id: string, body: UpdateBillingDto) {
    const billing = await this.findOneById(id);
    Object.assign(billing, body);
    return await this.billingRepository.save(billing);
  }

  async updateMultipleBillings(
    billings: UpdateBillingsDto[],
  ): Promise<Billing[]> {
    const updatedBillings: Billing[] = [];

    for (const billingDto of billings) {
      const { _id, ...updateData } = billingDto;

      // Buscar la tarifa por su ID
      const billing = await this.billingRepository.findOneBy({ _id });

      if (!billing) {
        throw new NotFoundException(
          `La tarifa con ID ${_id} no fue encontrada`,
        );
      }

      // Actualizar los datos
      const updatedBilling = this.billingRepository.merge(billing, updateData);

      // Guardar los cambios
      const savedBilling = await this.billingRepository.save(updatedBilling);
      updatedBillings.push(savedBilling);
    }

    return updatedBillings;
  }

  async remove(id: string) {
    const billing = await this.findOneById(id);
    return await this.billingRepository.remove(billing);
  }
}
