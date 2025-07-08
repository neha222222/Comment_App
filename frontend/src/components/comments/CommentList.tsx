import React, { useState, useEffect } from 'react';
import { Comment } from '../../types';
import { commentsApi } from '../../services/api';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const CommentList: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const data = await commentsApi.getAll();
      setComments(data);
    } catch (err: any) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleCreateComment = async (content: string) => {
    try {
      const newComment = await commentsApi.create({ content });
      setComments([newComment, ...comments]);
    } catch (err: any) {
      console.error('Error creating comment:', err);
      throw err;
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await commentsApi.create({ content, parent_comment_id: parentId });
      await fetchComments(); // Refresh to get updated nested structure
    } catch (err: any) {
      console.error('Error creating reply:', err);
      throw err;
    }
  };

  const handleEdit = async (id: string, content: string) => {
    try {
      await commentsApi.update(id, { content });
      await fetchComments(); // Refresh to get updated comment
    } catch (err: any) {
      console.error('Error updating comment:', err);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await commentsApi.delete(id);
      await fetchComments(); // Refresh to get updated state
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await commentsApi.restore(id);
      await fetchComments(); // Refresh to get updated state
    } catch (err: any) {
      console.error('Error restoring comment:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p>Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Start a Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentForm onSubmit={handleCreateComment} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          ))
        )}
      </div>
    </div>
  );
};
