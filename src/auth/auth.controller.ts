import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../user/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/registration')
  create(@Body() Dto: CreateUserDto): Promise<{ accessToken: string }> {
    return this.authService.signUpUser(Dto);
  }

  @Post('/login')
  async singInUser(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signInUser(loginDto);
  }

  @UseGuards(AuthGuard())
  @Post('/logout')
  async logOutUser(
    @Headers() headers: Record<string, string>,
  ): Promise<{ message: string }> {
    const authHeader = headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    return this.authService.logOutUser(authHeader);
  }
}
