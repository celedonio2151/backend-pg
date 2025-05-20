import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

export async function getTokenBankBNB(
  httpService: HttpService,
): Promise<object> {
  const accountId = 'gGWSdm1P1OFGseUS4t1HfQ==';
  const authorizationId = 'wB0Levl6ifXjM5DuioqABA==';
  const ulrToken =
    'http://test.bnb.com.bo/ClientAuthentication.API/api/v1/auth/token';
  const urlQr =
    'http://test.bnb.com.bo/QRSimple.API/api/v1/main/getQRWithImageAsync';

  const { data } = await firstValueFrom(
    httpService
      .post<AxiosResponse>(`${ulrToken}`, {
        accountId,
        authorizationId,
      })
      .pipe(
        catchError((error: AxiosError) => {
          // this.logger.error(error.response.data);
          throw new NotFoundException(`${error.response?.data}`);
        }),
      ),
  );
  return data.data;
}
