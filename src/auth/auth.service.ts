import { Injectable } from '@nestjs/common';
import {CreateUserDto} from "../user/dto/user.dto";
import {InjectRepository} from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import {User} from "../database/entities/user.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
  ) {}
  async singUpUser (Dto: CreateUserDto) {

    const password = await bcrypt.hash(Dto.password, 10);
    const user: User = await this.userRepository.save(
        this.userRepository.create({ ...Dto, password}),
    );
  }

}
