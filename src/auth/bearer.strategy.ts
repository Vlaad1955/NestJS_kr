import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import * as process from 'process';
import { Strategy } from 'passport-http-bearer';
import { JwtService } from '@nestjs/jwt';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, `bearer`) {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRedisClient() private readonly redisClient: RedisClient,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['Jwt_StrategyKey'],
    });
  }

  async validate(token: string) {
    try {
      const redisUserKey = process.env['Redis_UserKey'];
      const decodeToken: any = this.jwtService.decode(token);
      if (
        !(await this.redisClient.exists(`${redisUserKey}-${decodeToken.id}`))
      ) {
        throw new UnauthorizedException();
      }
      try {
        await this.jwtService.verifyAsync(token);
      } catch (e) {
        console.error(e);
      }
      const user = await this.authService.validateUser(
        decodeToken.id,
        decodeToken.email,
      );
      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
