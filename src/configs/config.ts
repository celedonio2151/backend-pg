// require('dotenv').config();

import { registerAs } from '@nestjs/config';

export const Config = () => ({
  DATABASE: process.env.DATABASE,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  // DB_PORT:  3050,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  PORT: process.env.PORT,
  FRONTEND: process.env.FRONTEND,

  IS_PUBLIC_KEY: process.env.IS_PUBLIC_KEY,

  ROLES_KEY: process.env.ROLES_KEY,

  JWT_KEY: process.env.JWT_KEY, //
  JWT_EXPIRATION_TIMEOUT: process.env.JWT_EXPIRATION_TIMEOUT,

  JWT_KEY_REFRESH: process.env.JWT_KEY_REFRESH, //
  JWT_EXPIRATION_TIMEOUT_REFRESH: process.env.JWT_EXPIRATION_TIMEOUT_REFRESH,

  HOST_ADMIN: process.env.HOST_ADMIN + '/',

  CODE_ADMIN: process.env.CODE_ADMIN,
  ADMIN_ROLE_NAME: process.env.ADMIN_ROLE_NAME,

  // Credentials from bank account BNB
  ACCOUNTID_BNB: process.env.ACCOUNTID_BNB,
  AUTHORIZATIONID_BNB: process.env.AUTHORIZATIONID_BNB,

  // Endpointds from API SERVER BNB
  URL_POST_TOKEN_BNB: process.env.URL_POST_TOKEN_BNB,
  URL_POST_QR_BNB: process.env.URL_POST_QR_BNB,

  DEFAULT_GOOGLE_ROLE: process.env.DEFAULT_GOOGLE_ROLE,
});

export default registerAs('var-env', () => ({
  DEFAULT_GOOGLE_ROLE: process.env.DEFAULT_GOOGLE_ROLE,
}));
