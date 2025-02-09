import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'Email must not exceed 20 characters' })
  @ApiProperty({ required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one number, and one special character',
    },
  )
  @ApiProperty({ required: true })
  password: string;
}

export class ReturnUserDto {
  @ApiProperty()
  id: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  firstName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  lastName: string;

  @ApiProperty({
    default: 'Lviv',
    required: false,
    description: 'User city',
    example: 'Poltava',
  })
  @IsOptional()
  city: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  age: number;

  @ApiProperty()
  createdAt: Date;
}

export class updateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  firstName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  lastName: string;

  @ApiProperty({
    default: 'Lviv',
    required: false,
    description: 'User city',
    example: 'Poltava',
  })
  @IsOptional()
  city: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  age: number;
}

export class CreateUserDto extends ReturnUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.trim().toLowerCase())
  @MaxLength(20, { message: 'Email must not exceed 20 characters' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one number, and one special character',
    },
  )
  @ApiProperty({ required: true })
  password: string;
}

export class UserItemDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty({ required: false })
  lastName: string;
  @ApiProperty()
  age: number;
  @ApiProperty()
  @IsOptional()
  city: string;
  @ApiProperty()
  createdAt: Date;
}
