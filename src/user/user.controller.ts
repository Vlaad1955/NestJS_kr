import {
  Controller,
  Delete,
  Param,
  Headers,
  UnauthorizedException,
  Patch,
  Body,
  Get,
  Query,
  NotFoundException, UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDto, UserItemDto } from './dto/user.dto';
import { ApiPaginatedResponse } from '../common/interface/response.interface';
import { BaseQueryDto } from '../common/validator/base.query.validator';
import { User } from '../database/entities/user.entity';
import {AuthGuard} from "@nestjs/passport";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard())
  @Delete('/delete/:id')
  async deleteUser(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const userIdFromToken = this.userService.extractUserIdFromToken(authHeader);

    if (!userIdFromToken || userIdFromToken !== id) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    return this.userService.deleteUser(userIdFromToken);
  }

  @UseGuards(AuthGuard())
  @Patch(`/update/:id`)
  async update(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
    @Body() updateUserDto: updateUserDto,
  ): Promise<{ message: string }> {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const userIdFromToken = this.userService.extractUserIdFromToken(authHeader);

    if (!userIdFromToken || userIdFromToken !== id) {
      throw new UnauthorizedException('You can only update your own account');
    }

    return this.userService.updateUser(userIdFromToken, updateUserDto);
  }

  @UseGuards(AuthGuard())
  @ApiPaginatedResponse('entities', UserItemDto)
  @Get('/list')
  findAll(@Query() query: BaseQueryDto) {
    return this.userService.findAll(query);
  }

  @UseGuards(AuthGuard())
  @Get('find/id/:id')
  async findUserById(@Param('id') id: string): Promise<User | string> {
    const user = await this.userService.findUserById(id);

    if (!user) {
      throw new NotFoundException('No user found with this ID');
    }

    return user;
  }

  @UseGuards(AuthGuard())
  @Get('find/email')
  async findUserByEmail(@Query('email') email: string): Promise<User | string> {
    if (!email) {
      return 'Please provide an email for search';
    }

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      return 'No user with this email address found';
    }

    return user;
  }
}
