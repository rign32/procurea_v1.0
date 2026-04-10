import { type ReactNode, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';
import { t, isEN } from '@/i18n';
import { Trash2, Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentUser {
  id: string;
  name?: string;
  email: string;
}

interface Comment {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  content: string;
  mentions?: string[];
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

interface CommentThreadProps {
  entityType: string;
  entityId: string;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
  if (email) return email.substring(0, 2).toUpperCase();
  return '??';
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return isEN ? 'just now' : 'przed chwila';
  if (diffMin < 60) return isEN ? `${diffMin}m ago` : `${diffMin} min temu`;
  if (diffHr < 24) return isEN ? `${diffHr}h ago` : `${diffHr} godz. temu`;
  if (diffDay < 7) return isEN ? `${diffDay}d ago` : `${diffDay} dn. temu`;
  return date.toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    day: 'numeric',
    month: 'short',
  });
}

/** Parse @email mentions from text and render them as styled spans */
function renderContent(content: string) {
  const mentionRegex = /@([\w.+-]+@[\w.-]+\.\w+)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={match.index}
        className="font-medium text-primary bg-primary/10 rounded px-1"
      >
        @{match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

export function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');

  const queryKey = ['comments', entityType, entityId];

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get('/comments', {
        params: { entityType, entityId },
      });
      return data;
    },
    enabled: !!entityId,
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      // Extract @email mentions
      const mentionRegex = /@([\w.+-]+@[\w.-]+\.\w+)/g;
      const mentions: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }

      const { data } = await apiClient.post('/comments', {
        entityType,
        entityId,
        content,
        mentions: mentions.length > 0 ? mentions : undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setNewComment('');
    },
    onError: () => {
      toast.error(t.errors.generic);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiClient.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast.error(t.errors.generic);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const trimmed = newComment.trim();
      if (trimmed) createMutation.mutate(trimmed);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        {t.collaboration.comments}
        {comments.length > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
            {comments.length}
          </span>
        )}
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t.collaboration.noComments}
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3 group"
              >
                {/* Avatar (initials) */}
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {getInitials(comment.user.name, comment.user.email)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {comment.user.name || comment.user.email}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    {/* Delete button (own comments only) */}
                    {user?.id === comment.userId && (
                      <button
                        onClick={() => deleteMutation.mutate(comment.id)}
                        disabled={deleteMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title={t.collaboration.deleteComment}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
                    {renderContent(comment.content)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.collaboration.placeholder}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isEN
              ? 'Cmd+Enter to send. Use @email to mention.'
              : 'Cmd+Enter aby wyslac. Uzyj @email aby wspomniec.'}
          </p>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!newComment.trim() || createMutation.isPending}
          className="mb-4"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

export default CommentThread;
