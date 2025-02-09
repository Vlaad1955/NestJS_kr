import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../database/entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), AuthModule, PassportModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
