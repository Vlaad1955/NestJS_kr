import {
  Controller,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Headers,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard())
  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.postsService.createPost(createPostDto, authHeader);
  }

  @UseGuards(AuthGuard())
  @Patch('/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.postsService.updatePost(postId, updatePostDto, authHeader);
  }

  @UseGuards(AuthGuard())
  @Delete('/:id')
  async deletePost(
    @Param('id') postId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    return this.postsService.deletePost(postId, authHeader);
  }

  @Get('/:userId')
  async getUserPosts(@Param('userId') userId: string) {
    return this.postsService.getUserPosts(userId);
  }
}
