import { Request } from 'express';

export interface AuthPayload {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

// export interface CreateGoogleUser extends CreateUserDto {}

export interface RequestWithUser extends Request {
  user: {
    _id: string;
    email: string;
    name: string;
    roles: string[];
  };
}
