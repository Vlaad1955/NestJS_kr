import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { JwtService } from '@nestjs/jwt';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly jwtService: JwtService,
  ) {}

  // Функція для витягнення userId з токену
  private extractUserIdFromToken(authHeader: string): string | null {
    if (!authHeader) {
      throw new ForbiddenException('Authorization header is missing');
    }
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = this.jwtService.verify(token);
      return decoded?.id ? String(decoded.id) : null;
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }

  private async getUserIdFromAuthHeader(authHeader: string): Promise<string> {
    try {
      const userId = this.extractUserIdFromToken(authHeader);
      if (!userId) {
        throw new UnauthorizedException('User ID is missing from token');
      }
      return userId;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async createPost(createPostDto: CreatePostDto, authHeader: string) {
    try {
      const userId = await this.getUserIdFromAuthHeader(authHeader);

      const post = this.postRepository.create({
        ...createPostDto,
        user_id: userId,
      });

      const savedPost = await this.postRepository.save(post);

      return savedPost;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
    authHeader: string,
  ): Promise<Post> {
    try {
      const userId = await this.getUserIdFromAuthHeader(authHeader);
      const post = await this.postRepository.findOne({ where: { id: postId } });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.user_id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to update this post',
        );
      }

      Object.assign(post, updatePostDto);
      return await this.postRepository.save(post);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async deletePost(postId: string, authHeader: string): Promise<void> {
    try {
      const userId = await this.getUserIdFromAuthHeader(authHeader);
      const post = await this.postRepository.findOne({ where: { id: postId } });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.user_id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to delete this post',
        );
      }

      await this.postRepository.delete(post.id);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const posts = await this.postRepository.find({
        where: { user_id: userId },
      });

      if (!posts.length) {
        throw new NotFoundException('No posts found for this user');
      }

      return posts;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
