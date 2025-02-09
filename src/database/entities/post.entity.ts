import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  @IsNotEmpty({ message: 'Title is required' })
  @Length(5, 20, { message: 'Title must be between 5 and 20 characters' })
  title: string;

  @Column({ type: 'text', nullable: false })
  @IsNotEmpty({ message: 'Body is required' })
  @Length(10, 5000, { message: 'Body must be between 10 and 5000 characters' })
  body: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  comments?: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @ManyToOne(() => User, (entity) => entity.post, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: `user_id` })
  user?: User;
}
