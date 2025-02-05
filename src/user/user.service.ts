import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { updateUserDto } from './dto/user.dto';

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

    await this.userRepository.delete(userId);
    return { message: 'User successfully deleted' };
  }

  async updateUser(
    userId: string,
    updateUserDto: updateUserDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.firstName = updateUserDto.firstName ?? user.firstName;
    user.lastName = updateUserDto.lastName ?? user.lastName;
    user.city = updateUserDto.city ?? user.city;
    user.age = updateUserDto.age ?? user.age;

    await this.userRepository.save(user);

    return { message: 'User successfully updated' };
  }
}
