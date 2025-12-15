import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Post, Comment } from '../../types/community';
import { X, Heart, MessageCircle, Share2, Send, MoreHorizontal, CornerDownRight, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface DetailViewProps {
  post: Post;
  onClose: () => void;
  onUserClick: (userId: string) => void;
  onPostUpdate?: (updatedPost: Post) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ post: initialPost, onClose, onUserClick, onPostUpdate }) => {
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<Post>(initialPost);
  const [comments, setComments] = useState<Comment[]>(initialPost.comments || []);
  const [commentText, setCommentText] = useState('');

  // 记录当前正在回复的评论对象
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 辅助函数：递归查找父节点并插入新回复
  // 这是一个纯函数，用于更新不可变状态
  const insertReplyIntoTree = useCallback((nodes: Comment[], parentId: string, newComment: Comment): Comment[] => {
    return nodes.map(node => {
      // 1. 找到目标父节点
      if (node.id === parentId) {
        return {
          ...node,
          // 将新回复追加到 replies 数组末尾
          replies: [...(node.replies || []), newComment]
        };
      }
      // 2. 如果当前节点有子节点，继续递归查找
      if (node.replies && node.replies.length > 0) {
        return {
          ...node,
          replies: insertReplyIntoTree(node.replies, parentId, newComment)
        };
      }
      // 3. 不是目标且无子节点，保持原样
      return node;
    });
  }, []);

  // 1. 获取评论列表
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const data = await api.get<any, Comment[]>(`/community/posts/${post.id}/comments`);
        if (Array.isArray(data)) {
          setComments(data);
        }
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    // 初始加载或强制刷新
    if (!initialPost.comments || initialPost.comments.length === 0) {
      fetchComments();
    } else {
      // 如果 props 传入了 comments，同步到 state
      setComments(initialPost.comments);
    }
  }, [post.id, initialPost.comments]);

  // 回复模式下自动聚焦输入框
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
  };

  // 2. 发送评论（核心修改）
  const handleSendComment = async () => {
    if (!commentText.trim() || !isLoggedIn) return;
    setIsSending(true);

    try {
      // 构建载荷：包含内容和父评论ID（如果有）
      const payload = {
        content: commentText, // 注意：后端通常字段叫 content 或 text
        parentId: replyingTo ? replyingTo.id : null
      };

      // 接口调用
      const newComment = await api.post<any, Comment>(`/community/posts/${post.id}/comments`, payload);

      // 乐观更新 UI
      if (payload.parentId) {
        // 情况 A: 嵌套回复，递归插入到对应父节点下
        setComments(prevComments => insertReplyIntoTree(prevComments, payload.parentId!, newComment));
      } else {
        // 情况 B: 根评论，直接加到列表顶部
        setComments(prev => [newComment, ...prev]);
      }

      // 关键：构建新的 post 对象并通知父组件
      const updatedPost = {
        ...post,
        commentsCount: post.commentsCount + 1
      };
      // 更新帖子评论计数
      setPost(updatedPost);
      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }
      // 重置输入状态
      setCommentText('');
      setReplyingTo(null);

    } catch (error) {
      console.error("Failed to send comment", error);
      // 这里可以加一个 Toast 提示失败
    } finally {
      setIsSending(false);
    }
  };

  const handleLikePost = async () => {
    if (!isLoggedIn) return;
    try {
      const isLiked = post.isLiked;
      const endpoint = `/community/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`;
      await api.post(endpoint);

      const updatedPost = {
        ...post,
        isLiked: !isLiked,
        likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1
      };

      setPost(updatedPost);

      // 通知父组件
      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isLoggedIn) return;
    try {
      // 接口预留
      await api.post(`/community/comments/${commentId}/like`);
      // 注意：这里如果要做乐观更新，同样需要一个递归函数来更新树状结构中的 likes 字段
      console.log(`Liked comment ${commentId}`);
    } catch (error) {
      console.error("Failed to like comment", error);
    }
  }

  const formatNumber = (num: number) => num ? num.toLocaleString() : '0';

  // 递归渲染评论组件
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 group ${isReply ? 'mt-3 pl-2' : 'mt-6'}`}>
      {/* Avatar */}
      <div className="flex flex-col items-center cursor-pointer" onClick={() => onUserClick(comment.userId)}>
        <img
          src={comment.user.avatar}
          className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full shrink-0 object-cover`}
          alt={comment.user.name}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <span
            className={`font-semibold text-gray-200 cursor-pointer hover:underline ${isReply ? 'text-xs' : 'text-sm'}`}
            onClick={() => onUserClick(comment.userId)}
          >
            {comment.user.handle}
          </span>
          <span className="text-[10px] text-gray-500">{comment.timeAgo || '刚刚'}</span>
        </div>

        <p className={`text-gray-300 mt-0.5 leading-relaxed break-words ${isReply ? 'text-xs' : 'text-sm'}`}>
          {comment.text}
        </p>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <button
            onClick={() => handleReplyClick(comment)}
            className="hover:text-white transition-colors font-medium"
          >
            回复
          </button>
          <button
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1 hover:text-red-400 transition-colors group/like ${comment.isLiked ? 'text-red-400' : ''}`}
          >
            <Heart size={12} className={`group-hover/like:fill-red-400 ${comment.isLiked ? 'fill-red-400' : ''}`} />
            <span>{comment.likes}</span>
          </button>
        </div>

        {/* 递归渲染子回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="relative">
            {/* 连线样式 */}
            <div className="absolute left-[-1.3rem] top-0 bottom-4 w-[1px] bg-white/10 rounded-b-lg">
              <div className="absolute bottom-0 left-0 w-3 h-[1px] bg-white/10"></div>
            </div>
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Close Button Mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full text-white md:hidden"
      >
        <X size={24} />
      </button>

      <div className="flex w-full h-full flex-col md:flex-row">

        {/* Left: Media Area (Image) */}
        <div className="flex-1 flex items-center justify-center bg-black relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
          <img
            src={post.imageUrl}
            alt={post.title || "Content"}
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
          {/* Overlay controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 px-6 py-3 rounded-full backdrop-blur-md text-white translate-y-4 group-hover:translate-y-0">
            <button
              onClick={handleLikePost}
              className={`hover:scale-110 transition-transform ${post.isLiked ? 'text-red-500 fill-red-500' : 'hover:text-red-500'}`}
            >
              <Heart size={28} className={post.isLiked ? "fill-red-500" : ""} />
            </button>
            <button className="hover:scale-110 transition-transform hover:text-blue-400"><MessageCircle size={28} /></button>
            <button className="hover:scale-110 transition-transform hover:text-green-400"><Share2 size={28} /></button>
          </div>
        </div>

        {/* Right: Comments & Info Sidebar */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col bg-[#121212] border-l border-white/10 h-full shadow-2xl relative">

          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121212] z-10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick(post.author.id)}>
              <img src={post.author.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-1 hover:underline">
                  {post.author.name}
                  {post.author.isVerified && <span className="text-blue-400 text-[10px]">●</span>}
                </h3>
                {post.title && <p className="text-sm font-bold text-white truncate">{post.title}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <MoreHorizontal size={20} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white hidden md:block transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <div className="px-4 pt-4 pb-2 text-sm text-gray-300 leading-relaxed border-b border-white/5 bg-[#121212]">
              {post.content}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-around py-3 border-b border-white/5 text-sm text-gray-400 shrink-0 bg-[#121212]">
            <div className="flex flex-col items-center cursor-pointer hover:text-white" onClick={handleLikePost}>
              <span className={`font-bold ${post.isLiked ? 'text-red-500' : 'text-white'}`}>{formatNumber(post.likesCount)}</span>
              <span className="text-xs">点赞</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white">{formatNumber(post.commentsCount)}</span>
              <span className="text-xs">评论</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white">{formatNumber(post.sharesCount || 0)}</span>
              <span className="text-xs">分享</span>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              共 {comments.length} 条评论
            </div>

            {isLoadingComments ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="pb-4">
                {comments.map((comment) => renderComment(comment))}
                {comments.length === 0 && (
                  <div className="text-center text-gray-600 py-10 text-sm">暂无评论，快来抢沙发</div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 shrink-0 bg-[#121212]">
            {/* 回复提示条 */}
            {replyingTo && (
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-t-lg text-xs text-gray-400 border-b border-white/5 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-1">
                  <CornerDownRight size={12} />
                  <span>回复 <span className="text-purple-400 font-bold">@{replyingTo.user.handle.replace('@', '')}</span>:</span>
                  <span className="truncate max-w-[150px] opacity-50">"{replyingTo.text}"</span>
                </div>
                <button onClick={() => setReplyingTo(null)} className="hover:text-white">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder={replyingTo ? `回复 @${replyingTo.user.handle}...` : "添加评论..."}
                disabled={isSending}
                className={`w-full bg-white/5 border border-white/10 ${replyingTo ? 'rounded-b-lg rounded-t-none' : 'rounded-full'} py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all disabled:opacity-50`}
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailView;