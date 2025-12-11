import React, { useState, useRef, useEffect } from 'react';
import type { Post, Comment } from '../../types/community';
import { X, Heart, MessageCircle, Share2, Send, MoreHorizontal, CornerDownRight } from 'lucide-react';

interface DetailViewProps {
  post: Post;
  onClose: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ post, onClose }) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 回复时自动聚焦输入框
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleReplyClick = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    console.log(`Sending comment: "${commentText}" ${replyingTo ? `in reply to ${replyingTo.id}` : ''}`);
    setCommentText('');
    setReplyingTo(null);
  };

  // 数字格式化
  const formatNumber = (num: number) => num ? num.toLocaleString() : '0';

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 group ${isReply ? 'mt-3 pl-2' : 'mt-6'}`}>
      {/* Avatar */}
      <div className="flex flex-col items-center">
         <img 
           src={comment.user.avatar} 
           className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full shrink-0 object-cover`} 
           alt={comment.user.name}
         />
      </div>

      <div className="flex-1">
        <div className="flex items-baseline justify-between">
           <span className={`font-semibold text-gray-200 ${isReply ? 'text-xs' : 'text-sm'}`}>
             {comment.user.handle}
           </span>
           <span className="text-[10px] text-gray-500">{comment.timeAgo}</span>
        </div>
        
        <p className={`text-gray-300 mt-0.5 leading-relaxed ${isReply ? 'text-xs' : 'text-sm'}`}>
          {comment.text}
        </p>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
           <button 
             onClick={() => handleReplyClick(comment)}
             className="hover:text-white transition-colors font-medium"
           >
             回复
           </button>
           <button className="flex items-center gap-1 hover:text-red-400 transition-colors group/like">
              <Heart size={12} className="group-hover/like:fill-red-400" />
              <span>{comment.likes}</span>
           </button>
        </div>

        {/* Nested Replies Rendering */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="relative">
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
        
        {/* Left: Media Area */}
        <div className="flex-1 flex items-center justify-center bg-black relative group overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
           {/* 更新字段: imageUrl */}
           <img 
            src={post.imageUrl} 
            alt={post.title || "Content"} 
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
          {/* Overlay controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 px-6 py-3 rounded-full backdrop-blur-md text-white translate-y-4 group-hover:translate-y-0">
             <button className="hover:scale-110 transition-transform hover:text-red-500"><Heart size={28} /></button>
             <button className="hover:scale-110 transition-transform hover:text-blue-400"><MessageCircle size={28} /></button>
             <button className="hover:scale-110 transition-transform hover:text-green-400"><Share2 size={28} /></button>
          </div>
        </div>

        {/* Right: Comments & Info Sidebar */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col bg-[#121212] border-l border-white/10 h-full shadow-2xl relative">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121212] z-10">
             <div className="flex items-center gap-3">
                <img src={post.author.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1">
                    {post.author.name}
                    {post.author.isVerified && <span className="text-blue-400 text-[10px]">●</span>} 
                  </h3>
                  {/* 更新字段: title 或 content */}
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
          
          {/* Post Content (Description) Area - 新增区域 */}
          {post.content && (
            <div className="px-4 pt-4 pb-2 text-sm text-gray-300 leading-relaxed border-b border-white/5 bg-[#121212]">
              {post.content}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-around py-3 border-b border-white/5 text-sm text-gray-400 shrink-0 bg-[#121212]">
             <div className="flex flex-col items-center">
               {/* 更新字段: likesCount */}
               <span className="font-bold text-white">{formatNumber(post.likesCount)}</span>
               <span className="text-xs">点赞</span>
             </div>
             <div className="flex flex-col items-center">
               {/* 更新字段: commentsCount */}
               <span className="font-bold text-white">{formatNumber(post.commentsCount)}</span>
               <span className="text-xs">评论</span>
             </div>
             <div className="flex flex-col items-center">
               {/* 假设 shares 暂时没有，显示 0 或保留字段 */}
               <span className="font-bold text-white">{formatNumber(post.shares || 0)}</span>
               <span className="text-xs">分享</span>
             </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              共 {post.comments ? post.comments.length : 0} 条评论
            </div>
            
            <div className="pb-4">
              {post.comments && post.comments.map((comment) => renderComment(comment))}
            </div>
            
            {/* Fake extra comments/loader */}
            <div className="border-t border-white/5 pt-6 mt-4 opacity-50 space-y-4">
               {Array.from({length: 3}).map((_, i) => (
                  <div key={`dummy-${i}`} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
               ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 shrink-0 bg-[#121212]">
             {replyingTo && (
               <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-t-lg text-xs text-gray-400 border-b border-white/5 animate-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-1">
                   <CornerDownRight size={12} />
                   <span>回复 <span className="text-purple-400 font-bold">@{replyingTo.user.handle.replace('@','')}</span>:</span>
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
                  className={`w-full bg-white/5 border border-white/10 ${replyingTo ? 'rounded-b-lg rounded-t-none' : 'rounded-full'} py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all`}
                />
                <button 
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <Send size={16} />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetailView;