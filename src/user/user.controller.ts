import {
  Controller,
  Delete,
  Param,
  Headers,
  UnauthorizedException,
  Patch,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
