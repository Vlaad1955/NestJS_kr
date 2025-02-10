import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import * as process from 'process';
import { Strategy } from 'passport-http-bearer';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';  // Інжекція кастомного RedisService
import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, `bearer`) {
  constructor(
      private readonly jwtService: JwtService,
      private readonly redisService: RedisService,  // Використовуємо RedisService
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
      const decodedToken: any = this.jwtService.decode(token);

      // Перевірка на наявність токену в Redis
      const exists = await this.redisService.exists(`${redisUserKey}-${decodedToken.id}`);
      if (!exists) {
        throw new UnauthorizedException('Token not found in Redis');
      }

      // Перевірка валідності токену
      try {
        await this.jwtService.verifyAsync(token, {
          secret: process.env['Jwt_StrategyKey'],
        });
      } catch (e) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Отримуємо користувача
      const user = await this.authService.validateUser(decodedToken.id, decodedToken.email);
      return user; // Повертаємо користувача, якщо все добре
    } catch (e) {
      // Помилки при перевірці токену або Redis
      throw new UnauthorizedException('Authorization failed');
    }
  }
}
