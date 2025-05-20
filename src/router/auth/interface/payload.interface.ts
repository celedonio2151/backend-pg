import { CreateUserDto } from 'src/router/user/dto/create-user.dto';

export interface AuthPayload {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

// export interface CreateGoogleUser extends CreateUserDto {}
