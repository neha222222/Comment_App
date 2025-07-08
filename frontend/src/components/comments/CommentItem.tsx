import React, { useState } from 'react';
import { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CommentForm } from './CommentForm';
import { MessageCircle, Edit, Trash2, RotateCcw } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onRestore,
  level = 0,
}) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const canEdit = isOwner && comment.canEdit && !comment.is_deleted;
  const canDelete = isOwner && comment.canDelete && !comment.is_deleted;
  const canRestore = isOwner && comment.is_deleted;

  const handleReply = async (content: string) => {
    setIsLoading(true);
    try {
      await onReply(comment.id, content);
      setShowReplyForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (content: string) => {
    setIsLoading(true);
    try {
      await onEdit(comment.id, content);
      setShowEditForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsLoading(true);
      try {
        await onDelete(comment.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await onRestore(comment.id);
    } finally {
      setIsLoading(false);
    }
  };

  const marginLeft = level * 24;

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="mb-4">
      <Card className={comment.is_deleted ? 'opacity-50' : ''}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-medium">{comment.user.username}</span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(comment.created_at).toLocaleString()}
                {comment.updated_at !== comment.created_at && ' (edited)'}
              </span>
            </div>
          </div>

          {showEditForm ? (
            <CommentForm
              onSubmit={handleEdit}
              placeholder="Edit your comment..."
              buttonText="Update Comment"
              onCancel={() => setShowEditForm(false)}
              initialValue={comment.content}
            />
          ) : (
            <>
              <p className="mb-3 whitespace-pre-wrap">
                {comment.is_deleted ? '[Comment deleted]' : comment.content}
              </p>

              <div className="flex gap-2">
                {!comment.is_deleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                )}

                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}

                {canRestore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRestore}
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </>
          )}

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                onSubmit={handleReply}
                placeholder="Write a reply..."
                buttonText="Post Reply"
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
