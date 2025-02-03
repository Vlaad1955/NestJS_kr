import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import {CreateUserDto} from "../user/dto/user.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/registration')
  create(@Body() Dto: CreateUserDto) {
    return this.authService.singUpUser(Dto);
  }

}
