import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { BnbQrPaymentDto, GenerateQrDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { GenerateQrResponse, TokenResponse } from './interfaces/bank_interfaces';
import { BnbQrPayment } from './entities/bank.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BankService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(BnbQrPayment)
    private readonly bankRepository: Repository<BnbQrPayment>,
  ) {}

  create(body: BnbQrPaymentDto) {
    Logger.log('Creating new bank');
    const newBank = this.bankRepository.create(body);
    return this.bankRepository.save(newBank);
  }

  findAll() {
    return `This action returns all bank`;
  }

  async findOne(_id: string) {
    const bank = await this.bankRepository.findOne({ where: { _id } });
    if (!bank) throw new NotFoundException(`QR de pago con ID ${_id} no encontrado`);
    return bank;
  }

  async findOneByInvoiceIdRaw(invoice_id: string) {
    return await this.bankRepository.findOne({ where: { invoice_id } });
  }

  // ================================================================
  //                GENERA UN CODIGO DE AUTENTICACION DESDE BNB
  // ================================================================
  async getTokenBNB(): Promise<string> {
    const accountId = this.configService.get<string>('ACCOUNTID_BNB');
    const authorizationId = this.configService.get<string>('AUTHORIZATIONID_BNB');
    const urlToken = this.configService.get<string>('URL_POST_TOKEN_BNB')!;
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          urlToken,
          {
            accountId,
            authorizationId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (!data.success) {
        throw new HttpException('Autenticación fallida', HttpStatus.UNAUTHORIZED);
      }

      return data.message; // JWT token
    } catch (error) {
      console.error('Error al autenticar con el banco BNB:', error?.response?.data || error.message);
      throw new HttpException('Error al conectar con el banco BNB', HttpStatus.BAD_GATEWAY);
    }
  }

  // ================================================================
  //                GENERA UN CODIGO QR DESDE BNB
  // ================================================================
  async generateQR(qrData: GenerateQrDto): Promise<GenerateQrResponse> {
    const urlQr = this.configService.get<string>('URL_POST_QR_BNB')!;
    const token = await this.getTokenBNB();
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<GenerateQrResponse>(urlQr, qrData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'cache-control': 'no-cache',
          },
        }),
      );

      if (!data.success) {
        throw new HttpException(data.message || 'No se pudo generar el QR', HttpStatus.BAD_REQUEST);
      }
      return data;
    } catch (error) {
      console.error('Error al generar QR:', error?.response?.data || error.message);
      throw new HttpException('Error al conectar con el banco para generar QR', HttpStatus.BAD_GATEWAY);
    }
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    return `This action updates a #${id} bank`;
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
