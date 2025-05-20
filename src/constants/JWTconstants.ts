import { Config } from 'src/configs/config';

export const jwtConstants = {
  secret: Config().JWT_KEY,
};
