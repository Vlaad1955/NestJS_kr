import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from '../../redis/redis.service'; // Виправлено
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';
import { CreateUserDto, LoginDto } from '../user/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService, // Виправлено
    private readonly jwtService: JwtService,
  ) {}

  // Реєстрація користувача
  async signUpUser(
    createAuthDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    try {
      if (!createAuthDto.email || !createAuthDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: createAuthDto.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('User with this email already exists');
      }

      const password = await bcrypt.hash(createAuthDto.password, 10);
      const user: User = await this.userRepository.save(
        this.userRepository.create({ ...createAuthDto, password }),
      );

      const token = await this.signIn(user.id, user.email);
      await this.storeTokenInRedis(user.id, token);

      return { accessToken: token };
    } catch (e) {
      console.error('Error in signUpUser:', e);
      throw new InternalServerErrorException('Failed to sign up user');
    }
  }

  // Вхід користувача
  async signInUser(loginDto: LoginDto): Promise<{ accessToken: string }> {
    try {
      if (!loginDto.email || !loginDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.signIn(user.id, user.email);
      await this.storeTokenInRedis(user.id, token);

      return { accessToken: token };
    } catch (e) {
      throw new UnauthorizedException('Failed to log in');
    }
  }

  // Генерація JWT токену
  async signIn(userId: string, userEmail: string): Promise<string> {
    return this.jwtService.sign({ id: userId, email: userEmail });
  }

  // Вихід користувача
  async logOutUser(authHeader: string): Promise<{ message: string }> {
    try {
      if (!authHeader) {
        throw new UnauthorizedException('Authorization token is missing');
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }

      const decodedToken = this.jwtService.verify(token);
      const userId = decodedToken.id;

      await this.removeTokenFromRedis(userId);

      return { message: 'User logged out successfully' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Валідація користувача
  async validateUser(userId: string, userEmail: string): Promise<User> {
    if (!userId || !userEmail) {
      throw new UnauthorizedException('userId or userEmail not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId, email: userEmail },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  // Збереження токену в Redis
  private async storeTokenInRedis(
    userId: string,
    token: string,
  ): Promise<void> {
    try {
      const redisUserKey = process.env['Redis_UserKey'] || 'user-token';
      const redisUserTime = process.env['Redis_UserTime']
        ? parseInt(process.env['Redis_UserTime'], 10)
        : 3600; // 1 год

      await this.redisService.set(
        `${redisUserKey}-${userId}`,
        token,
        redisUserTime,
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  // Видалення токену з Redis
  private async removeTokenFromRedis(userId: string): Promise<void> {
    try {
      const redisUserKey = process.env['Redis_UserKey'] || 'user-token';
      await this.redisService.del(`${redisUserKey}-${userId}`);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
