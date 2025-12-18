import React, { useState } from 'react';
import type { Message } from '../../types';
import { 
  Bot, 
  User, 
  RotateCw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Copy,
  Loader2,
  Sparkles,
  Share2, 
  Check, 
  AlertCircle,
  X, // 新增：关闭图标
  Image as ImageIcon // 新增：图片图标
} from 'lucide-react';
import api from '../../utils/api'; 
import { useAuth } from '../../contexts/AuthContext'; 

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.sender === 'AI';
  const { user } = useAuth();
  
  //原有状态
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // --- 新增状态：控制分享弹窗和表单数据 ---
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({
    title: '',
    content: ''
  });

  // 1. 点击分享按钮：打开弹窗，预填数据
  const handleOpenShareModal = () => {
    if (!user) {
      alert('请先登录');
      return;
    }
    if (!message.imageUrl) {
      alert('没有可发布的图片');
      return;
    }

    // 预填默认数据：标题为日期，内容为提示词
    setShareForm({
      title: `AI 灵感创作`,
      content: message.content || ''
    });
    
    setShowShareModal(true);
    setPublishError(null);
  };

  // 2. 确认发布：发送 API 请求
  const handleConfirmPublish = async () => {
    if (!shareForm.title.trim()) {
      setPublishError('请输入作品标题');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const postData = {
        title: shareForm.title,
        content: shareForm.content,
        imageUrl: message.cosPath || ""
      };

      const response: any = await api.post('/community/posts/create', postData);
      
      if (response && (response.id || response.userId)) {
        setPublishSuccess(true);
        // 关闭弹窗
        setShowShareModal(false);
        
        // 3秒后重置成功状态
        setTimeout(() => {
          setPublishSuccess(false);
        }, 3000);
      } else {
        throw new Error('发布成功但返回数据异常');
      }
    } catch (error: any) {
      console.error('发布失败:', error);
      let errorMsg = '发布失败，请重试';
      if (error.response?.data) {
        const result = error.response.data;
        errorMsg = result.message || `发布失败（错误码：${result.code})`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setPublishError(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  // 处理下载图片
  const handleDownloadImage = () => {
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = `AI创作-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 复制提示词
  const handleCopyPrompt = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content)
        .then(() => alert('提示词已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
    }
  };

  const showPublishButton = isAi && message.type === 'image' && message.imageUrl;

  return (
    <>
      <div className={`flex w-full py-8 ${isAi ? '' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
        <div className="max-w-4xl mx-auto w-full flex gap-4 md:gap-6 px-4">
          
          <div className="shrink-0 mt-1">
            {isAi ? (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50">
                <Sparkles size={20} />
              </div>
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <User size={20} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-sm md:text-base">
                {isAi ? 'AI Generating' : 'You'}
              </span>
              {isAi && message.type === 'image' && (
                <span className="text-xs text-purple-400 font-normal">
                   • 图像生成完毕
                </span>
              )}
            </div>

            {message.content && message.type !== 'image' && (
               <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                 {message.content}
               </div>
            )}

            {message.type === 'loading' && (
              <div className="flex items-center gap-3 text-purple-400 py-2">
                 <Loader2 size={20} className="animate-spin" />
                 <span className="text-sm font-medium">正在生成您的创意...</span>
              </div>
            )}

            {message.type === 'image' && message.imageUrl && (
              <div className="mt-2 space-y-4">
                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20 shadow-2xl max-w-2xl">
                  <img 
                    src={message.imageUrl} 
                    alt="AI Generated" 
                    className="w-full h-auto object-cover max-h-[500px]"
                    loading="lazy"
                  />
                </div>
                
                {/* 外部的发布成功提示*/}
                {publishSuccess && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 px-3 py-2 rounded-lg border border-green-500/20 animate-in fade-in slide-in-from-top-2">
                    <Check size={16} />
                    <span>作品已成功发布到社区！</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-slate-500">
                  <ActionButton 
                    icon={<RotateCw size={16} />} 
                    label="重试" 
                    onClick={() => console.log('重试生成')}
                  />
                  <ActionButton 
                    icon={<Download size={16} />} 
                    label="下载" 
                    onClick={handleDownloadImage}
                  />
                  
                  {/* 发布按钮 */}
                  {showPublishButton && (
                    <>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button
                        onClick={handleOpenShareModal}
                        disabled={isPublishing || publishSuccess}
                        className={`flex items-center gap-1.5 p-2 rounded-md transition-colors text-xs font-medium ${
                          publishSuccess
                            ? 'text-green-400 bg-green-900/20'
                            : 'hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                         {publishSuccess ? (
                          <>
                            <Check size={16} />
                            <span>已发布</span>
                          </>
                        ) : (
                          <>
                            <Share2 size={16} />
                            <span>分享到社区</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                  
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <ActionButton icon={<ThumbsUp size={16} />} />
                  <ActionButton icon={<ThumbsDown size={16} />} />
                  <div className="flex-1" />
                  <ActionButton 
                    icon={<Copy size={16} />} 
                    label="提示词" 
                    onClick={handleCopyPrompt}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/*分享弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Share2 size={18} className="text-blue-400" />
                分享到创意社区
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* 图片预览 */}
                <div className="w-full md:w-1/3 shrink-0">
                  <div className="aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black relative group">
                    <img 
                      src={message.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                      <ImageIcon size={12} />
                      预览
                    </div>
                  </div>
                </div>

                {/* 右侧：表单输入 */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      作品标题 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={shareForm.title}
                      onChange={(e) => setShareForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="给你的作品起个好听的名字"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      maxLength={50}
                    />
                  </div>

                  {/* 内容/描述输入 */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      创作心得 / 提示词
                    </label>
                    <textarea
                      value={shareForm.content}
                      onChange={(e) => setShareForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="分享一下这张图的创作灵感或提示词吧..."
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[120px] resize-none leading-relaxed"
                    />
                  </div>

                  {/* 错误提示 */}
                  {publishError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 p-3 rounded-lg border border-red-500/20">
                      <AlertCircle size={16} />
                      <span>{publishError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-800/30 flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                disabled={isPublishing}
              >
                取消
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isPublishing}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    正在发布...
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    确认发布
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ActionButton: React.FC<{ 
  icon: React.ReactNode; 
  label?: string;
  onClick?: () => void;
}> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-1.5 p-2 rounded-md hover:bg-white/5 hover:text-slate-200 transition-colors text-xs font-medium"
  >
    {icon}
    {label && <span>{label}</span>}
  </button>
);