import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(5, 20, { message: 'Title must be between 5 and 20 characters' })
  title: string;

  @IsNotEmpty({ message: 'Body is required' })
  @Length(10, 5000, { message: 'Body must be between 10 and 5000 characters' })
  body: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  comments?: string;
}

export class UpdatePostDto {
  @IsOptional()
  @Length(5, 20, { message: 'Title must be between 5 and 20 characters' })
  title?: string;

  @IsOptional()
  @Length(10, 5000, { message: 'Body must be between 10 and 5000 characters' })
  body?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  comments?: string;
}
