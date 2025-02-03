import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { RedisModule } from '@webeleon/nestjs-redis';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BearerStrategy } from './bearer.strategy';
import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RedisModule.forFeature()),
    PassportModule.register({
      defaultStrategy: `bearer`,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.Jwt_StrategyKey,
      signOptions: { expiresIn: `1d` },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BearerStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
