import React, { useEffect, useState } from 'react';
import { fetchComments, postComment } from '../services/apiService';
import Toast from './Toast';

interface CommentSectionProps {
  imageId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ imageId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const sortedComments = [...comments].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? db - da : da - db;
  });

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await fetchComments(imageId);
      setComments(data);
    } catch (err) {
      setToast({ message: 'Failed to load comments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line
  }, [imageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 2 || !author) return;
    setPosting(true);
    try {
      await postComment(imageId, author, text);
      setText('');
      setAuthor('');
      setToast({ message: 'Comment posted!', type: 'success' });
      loadComments();
    } catch (err) {
      setToast({ message: 'Failed to post comment', type: 'error' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>
      {comments.length > 0 && (
        <div className="sort-toggle">
          <button
            className={`sort-btn ${sortOrder === 'newest' ? 'sort-active' : ''}`}
            onClick={() => setSortOrder('newest')}
          >Newest</button>
          <button
            className={`sort-btn ${sortOrder === 'oldest' ? 'sort-active' : ''}`}
            onClick={() => setSortOrder('oldest')}
          >Oldest</button>
        </div>
      )}
      {loading ? (
        <div className="comment-loading">Loading comments...</div>
      ) : (
        <ul className="comment-list">
          {sortedComments.length === 0 && (
            <li className="comment-empty">No comments yet. Be the first to share your thoughts.</li>
          )}
          {sortedComments.map((c) => (
            <li key={c.id} className="comment-item">
              <div className="comment-author">{c.author}</div>
              <div className="comment-text">{c.text}</div>
              <div className="comment-date">{new Date(c.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          minLength={2}
          required
        />
        <button type="submit" disabled={posting}>{posting ? 'Posting...' : 'Post'}</button>
      </form>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default CommentSection;
