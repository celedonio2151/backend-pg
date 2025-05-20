import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import googleOauthConfig from 'src/configs/google-oauth.config';
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfig: ConfigType<typeof googleOauthConfig>,
  ) {
    super({
      clientID: googleConfig.clientId!,
      clientSecret: googleConfig.clientSecret!,
      callbackURL: googleConfig.redirectUri!,
      // passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      console.log('🚀 ~ GoogleStrategy ~ profile:', profile);

      const user: GoogleUser = {
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        emailVerified: profile.emails[0].verified,
        profileImg: profile.photos[0].value,
      };
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}

interface GoogleUser {
  name: string;
  surname: string;
  email: string;
  emailVerified: boolean;
  profileImg: string;
}
