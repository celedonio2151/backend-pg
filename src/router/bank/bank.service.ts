import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
    CreateBankDto,
    GenerateQrDto,
    TokenRequestDto,
} from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import {
    GenerateQrResponse,
    TokenResponse,
} from './interfaces/bank_interfaces';

@Injectable()
export class BankService {
  private readonly endpoint =
    'http://test.bnb.com.bo/ClientAuthentication.API/api/v1/auth/token';
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  create(createBankDto: CreateBankDto) {
    console.log(createBankDto);
    return 'This action adds a new bank';
  }

  findAll() {
    return `This action returns all bank`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bank`;
  }

  // ================================================================
  //                GENERA UN CODIGO DE AUTENTICACION DESDE BNB
  // ================================================================
  async getTokenBNB(body?: TokenRequestDto): Promise<string> {
    console.log(body);
    const accountId = this.configService.get<string>('ACCOUNTID_BNB');
    const authorizationId = this.configService.get<string>(
      'AUTHORIZATIONID_BNB',
    );
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
        throw new HttpException(
          'Autenticación fallida',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return data.message; // JWT token
    } catch (error) {
      console.error(
        'Error al autenticar con el banco BNB:',
        error?.response?.data || error.message,
      );
      throw new HttpException(
        'Error al conectar con el banco BNB',
        HttpStatus.BAD_GATEWAY,
      );
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
        throw new HttpException(
          data.message || 'No se pudo generar el QR',
          HttpStatus.BAD_REQUEST,
        );
      }
      return data;
    } catch (error) {
      console.error(
        'Error al generar QR:',
        error?.response?.data || error.message,
      );
      throw new HttpException(
        'Error al conectar con el banco para generar QR',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    console.log(updateBankDto);
    return `This action updates a #${id} bank`;
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
