import React, { useEffect, useState } from 'react';
import { fetchComments, postComment } from '../services/apiService';

interface CommentSectionProps {
  imageId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ imageId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await fetchComments(imageId);
      setComments(data);
    } catch (err) {
      setError('Failed to load comments');
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
      loadComments();
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3>Comments</h3>
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {comments.map((c) => (
            <li key={c.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              <strong>{c.author}</strong>: {c.text}
              <div style={{ fontSize: 12, color: '#888' }}>{new Date(c.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          required
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          minLength={2}
          required
          style={{ marginRight: 8, width: 200 }}
        />
        <button type="submit" disabled={posting}>Post</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default CommentSection; 