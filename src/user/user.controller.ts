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
  NotFoundException,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDto, UserItemDto } from './dto/user.dto';
import { ApiPaginatedResponse } from '../common/interface/response.interface';
import { BaseQueryDto } from '../common/validator/base.query.validator';
import { User } from '../database/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private async verifyUserAccess(
    authHeader: string,
    id: string,
  ): Promise<string> {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is missing');
    }
    const userIdFromToken = this.userService.extractUserIdFromToken(authHeader);
    if (!userIdFromToken || userIdFromToken !== id) {
      throw new ForbiddenException(
        'You can only perform this action on your own account',
      );
    }
    return userIdFromToken;
  }

  @UseGuards(AuthGuard())
  @Delete('/delete/:id')
  async deleteUser(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    await this.verifyUserAccess(authHeader, id);
    return this.userService.deleteUser(id);
  }

  @UseGuards(AuthGuard())
  @Patch(`/update/:id`)
  async update(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
    @Body() updateUserDto: updateUserDto,
  ): Promise<{ message: string }> {
    await this.verifyUserAccess(authHeader, id);
    return this.userService.updateUser(id, updateUserDto);
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
