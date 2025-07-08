import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(userId: string, commentId: string) {
    const notification = this.notificationRepository.create({
      user_id: userId,
      comment_id: commentId,
    });

    return this.notificationRepository.save(notification);
  }

  async findByUser(userId: string) {
    return this.notificationRepository.find({
      where: { user_id: userId },
      relations: ['comment', 'comment.user'],
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepository.update(
      { id, user_id: userId },
      { is_read: true },
    );

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );

    return { message: 'All notifications marked as read' };
  }
}
