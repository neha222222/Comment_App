import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Notification])],
  providers: [CommentsService, NotificationsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
