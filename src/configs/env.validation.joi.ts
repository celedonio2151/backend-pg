import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  PORT: Joi.number().default(3000),
  FRONTEND: Joi.string().default('http://localhost:3000'),
  HOST_ADMIN: Joi.string().required(),
  CODE_ADMIN: Joi.string().required(),

  // JWT
  JWT_KEY: Joi.string().required(),
  JWT_EXPIRATION_TIMEOUT: Joi.string().required(),
  JWT_KEY_REFRESH: Joi.string().required(),
  JWT_EXPIRATION_TIMEOUT_REFRESH: Joi.string().required(),

  // DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Otros
  IS_PUBLIC_KEY: Joi.string().required(),
  ROLES_KEY: Joi.string().required(),
  ADMIN_ROLE_NAME: Joi.string()
    .required()
    .description('Nombre del rol de administrador'),

  // Google OAuth
  GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_OAUTH_REDIRECT_URI: Joi.string().required(),
  DEFAULT_GOOGLE_ROLE: Joi.string().required().default('USER'),

  // Credentials from bank account BNB
  ACCOUNTID_BNB: Joi.string().required(),
  AUTHORIZATIONID_BNB: Joi.string().required(),

  // Endpointds from API SERVER BNB
  URL_POST_TOKEN_BNB: Joi.string().required(),
  URL_POST_QR_BNB: Joi.string().required(),
});
