import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const { content, parent_comment_id } = createCommentDto;

    let parentComment: Comment | null = null;
    if (parent_comment_id) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parent_comment_id },
        relations: ['user'],
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = this.commentRepository.create({
      content,
      user_id: userId,
      parent_comment_id,
    });

    const savedComment = await this.commentRepository.save(comment);

    if (parentComment && parentComment.user_id !== userId) {
      await this.notificationsService.createNotification(
        parentComment.user_id,
        savedComment.id,
      );
    }

    return this.findOne(savedComment.id);
  }

  async findAll() {
    return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .where('comment.parent_comment_id IS NULL')
      .andWhere('comment.is_deleted = false')
      .orderBy('comment.created_at', 'DESC')
      .addOrderBy('replies.created_at', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'replies', 'replies.user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (!comment.canEdit) {
      throw new ForbiddenException('Comment can only be edited within 15 minutes of posting');
    }

    await this.commentRepository.update(id, {
      content: updateCommentDto.content,
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (!comment.canDelete) {
      throw new ForbiddenException('Comment can only be deleted within 15 minutes of posting');
    }

    await this.commentRepository.update(id, {
      is_deleted: true,
      deleted_at: new Date(),
    });

    return { message: 'Comment deleted successfully' };
  }

  async restore(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You can only restore your own comments');
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (!comment.deleted_at || comment.deleted_at < fifteenMinutesAgo) {
      throw new ForbiddenException('Comment can only be restored within 15 minutes of deletion');
    }

    await this.commentRepository.update(id, {
      is_deleted: false,
      deleted_at: undefined,
    });

    return this.findOne(id);
  }
}
