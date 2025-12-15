import React, { useState } from 'react';
import type { Post } from '../../types/community';
import { Heart, MoreHorizontal, Bell, User as UserIcon, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface ImageViewProps {
  post: Post;
  onClose: () => void;
  onUserClick: (userId: string) => void; // 新增
}

const ImageView: React.FC<ImageViewProps> = ({ post: initialPost, onClose, onUserClick }) => {
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState(initialPost);

  // 点赞逻辑 (预留接口)
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return;
    
    try {
        const isLiked = post.isLiked;
        await api.post(`/community/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`);
        
        setPost(prev => ({
            ...prev,
            isLiked: !isLiked,
            likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1
        }));
    } catch (error) {
        console.error("Failed to like post", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 fixed top-0 w-full z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 md:gap-4">
           {/* Back Button */}
           <button 
             onClick={onClose} 
             className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
           >
             <ArrowLeft size={24} />
           </button>

           <img 
             src={post.author.avatar} 
             alt="Avatar" 
             className="w-10 h-10 rounded-full border border-white/10 object-cover cursor-pointer hover:border-white/50" 
             onClick={() => onUserClick(post.author.id)}
           />
           
           <div className="flex flex-col cursor-pointer" onClick={() => onUserClick(post.author.id)}>
             <div className="flex items-center gap-2 text-sm md:text-base font-bold text-white shadow-black drop-shadow-md hover:underline">
               <span>{post.author.handle.replace('@', '')}</span>
               <span className="text-white/40">•</span>
               <span>{post.author.name}</span>
             </div>
             <span className="text-xs text-gray-400 font-medium">{post.createdAt || '刚刚'}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 text-white">
           <button 
             onClick={handleLike}
             className={`hover:scale-110 transition-all ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
           >
             <Heart size={26} className={post.isLiked ? "fill-red-500" : ""} />
           </button>
           <button className="hover:text-gray-300 transition-colors hidden sm:block">
             <MoreHorizontal size={26} />
           </button>
           <button className="hover:text-gray-300 transition-colors hidden sm:block">
             <Bell size={26} />
           </button>
           <button 
             onClick={() => onUserClick(post.author.id)}
             className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
           >
             <UserIcon size={18} />
           </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div 
        className="flex-1 flex items-center justify-center p-0 md:p-8 cursor-pointer"
        onClick={onClose} 
      >
        <img 
          src={post.imageUrl} 
          alt={post.content || "Image"} 
          className="max-h-full max-w-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()} 
        />
      </div>

      {/* Footer - Prompt/Content */}
      {post.content && (
        <div className="fixed bottom-0 w-full pb-8 pt-12 px-6 text-center bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
           <div className="inline-flex items-center gap-2 text-sm md:text-base pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 max-w-[90%]">
              <span className="text-gray-400 font-bold uppercase tracking-wide text-xs md:text-sm shrink-0">Prompt</span>
              <span className="text-white font-bold truncate">
                {post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageView;