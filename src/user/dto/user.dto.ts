import { ApiProperty } from '@nestjs/swagger';

import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

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


export class CreateUserDto extends ReturnUserDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ required: true })
    @Transform(({ value }) => value.trim())
    email: string;

    @IsString()
    @Matches(/^\S*(?=\S{8,})(?=\S*[A-Z])(?=\S*[\d])\S*$/, {
        message: 'Password must have 1 upper case',
    })

    @IsNotEmpty()
    password: string;
}
