import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { updateUserDto } from './dto/user.dto';
import { BaseQueryDto } from '../common/validator/base.query.validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  extractUserIdFromToken(authHeader: string): string | null {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      return decoded?.id ? String(decoded.id) : null;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      await this.userRepository.delete(userId);
      return { message: 'User successfully deleted' };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: updateUserDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    try {
      user.firstName = updateUserDto.firstName ?? user.firstName;
      user.lastName = updateUserDto.lastName ?? user.lastName;
      user.city = updateUserDto.city ?? user.city;
      user.age = updateUserDto.age ?? user.age;

      await this.userRepository.save(user);

      return { message: 'User successfully updated' };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async findAll(query: BaseQueryDto = {} as BaseQueryDto): Promise<any> {
    try {
      const options = {
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 10),
      };

      const filters: FindOptionsWhere<User> = {};

      if (query.email) filters.email = ILike(`%${query.email}%`);
      if (query.firstName) filters.firstName = ILike(`%${query.firstName}%`);
      if (query.lastName) filters.lastName = ILike(`%${query.lastName}%`);
      if (query.city) filters.city = ILike(`%${query.city}%`);
      if (query.age) filters.age = Number(query.age);

      const order = {};
      if (query.sort) {
        order[query.sort] = query.order ?? 'ASC';
      }

      const [entities, total] = await this.userRepository.findAndCount({
        where: filters,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          city: true,
          age: true,
          createdAt: true,
          updatedAt: true,
        },
        relations: {
          post: true,
        },
        order: order,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      });

      return {
        page: options.page,
        pages: Math.ceil(total / options.limit),
        countItems: total,
        entities: entities,
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['post'],
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['post'],
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
