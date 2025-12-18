import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Gallery from './Gallery';
import { AppMode } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MainViewProps {
  onSendMessage: (prompt: string, base64?: string, mode?: AppMode) => void;
  onModeChange: (mode: AppMode) => void;
  currentMode: AppMode;
}

const MainView: React.FC<MainViewProps> = ({ onSendMessage, onModeChange, currentMode }) => {

  const { isLoggedIn, user, checkGenerationPermission, calculateCost } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null); // 当前激活的功能

  // 参考图
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  // 点击上传按钮
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 当用户选择文件
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReferenceImage(file);
    setReferenceImagePreview(URL.createObjectURL(file)); // 生成本地预览图
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    setReferenceImagePreview(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    //检查登录状态
    if (!isLoggedIn) {
      alert("请先登录");
      navigate('/login', {
        state: { from: '/work', returnTab: 'chat' }
      });
      return;
    }

    // 检查权限
    const permission = checkGenerationPermission(currentMode, {
      requireHD: false,
      estimatedCost: calculateCost(currentMode, { wordCount: prompt.length })
    });

    if (!permission.allowed) {
      alert(permission.reason);
      // 如果是算力不足，可以跳转到充值页面
      if (permission.insufficientComputingPower) {
        console.log("需要充值算力");
      }
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 将 File 转成 base64 字符串再传入
      const base64 = referenceImage
        ? await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(referenceImage);
        })
        : null;

      onSendMessage(prompt, base64 ?? undefined, currentMode);
    } catch (err) {
      setError("生成过程中发生错误，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const features = [
    {
      id: 'ai-writing', icon: 'fa-solid fa-pen-nib', label: 'AI 写作助手',
      available: false,
      placeholder: '描述你想写的内容，我会帮你创作文章、文案、故事...', subtitle: '笔尖化思想，让创意成为文字。'
    },
    {
      id: 'smart-presentation', icon: 'fa-solid fa-chart-pie', label: '智能演示',
      available: false,
      placeholder: '告诉我演示的主题，我会为你生成专业的演示文稿...', subtitle: '数据有声音，让演示更生动有力。'
    },
    {
      id: 'deep-search', icon: 'fa-solid fa-magnifying-glass', label: '深度搜索',
      available: false,
      placeholder: '输入你想搜索的问题，我会为你深度挖掘答案...', subtitle: '深度探索信息，找到你真正需要的答案。'
    },
    {
      id: 'ai-drawing', icon: 'fa-solid fa-image', label: 'AI 绘图',
      available: true,
      placeholder: '描述你想要生成的画面...', subtitle: '创作直观视觉呈现，让创意跃然眼前。'
    },
    {
      id: 'podcast', icon: 'fa-solid fa-microphone-lines', label: '播客生成',
      available: false,
      placeholder: '告诉我播客的主题和风格，我会帮你生成音频内容...', subtitle: '声音承载故事，让你的想法被听见。'
    },
    {
      id: 'more-tools', icon: 'fa-solid fa-grip', label: '更多工具',
      available: false,
      placeholder: '正在开发更多 AI 功能...', subtitle: '无限可能，尽在你的掌握之中。'
    },
  ];

  // 功能ID到AppMode的映射
  const featureToModeMap: Record<string, AppMode> = {
    'ai-writing': AppMode.AI_WRITING,
    'smart-presentation': AppMode.SMART_PRESENTATION,
    'deep-search': AppMode.DEEP_SEARCH,
    'ai-drawing': AppMode.AI_DRAWING,
    'podcast': AppMode.PODCAST,
    'more-tools': AppMode.MORE_TOOLS,
  };

  // 获取当前 placeholder
  const getCurrentPlaceholder = () => {
    if (!activeFeature) {
      return '有什么想问的，或者想聊什么话题，都可以提。';
    }
    const feature = features.find(f => f.id === activeFeature);
    return feature?.placeholder || '有什么想问的，或者想聊什么话题，都可以提。';
  };

  // 获取当前副标题
  const getCurrentSubtitle = () => {
    if (!activeFeature) {
      return '全能 AI 创意工作空间，让每个创意瞬间变现。';
    }
    const feature = features.find(f => f.id === activeFeature);
    return feature?.subtitle || '全能 AI 创意工作空间，让每个创意瞬间变现。';
  };

  // 在功能点击时也检查权限
  const handleFeatureClick = (featureId: string) => {
    const feature = features.find(f => f.id === featureId);

    if (!feature) return;

    // 检查登录状态
    if (!isLoggedIn) {
      alert("请先登录才能使用此功能");
      navigate('/login', {
        state: { from: '/work', returnTab: 'landing' }
      });
      return;
    }

    // 检查是否可用
    if (!feature.available) {
      setError(`${feature.label}功能正在开发中，敬请期待！\n 当前可用功能：通用问答/AI绘图`);

      setTimeout(() => {
        setError(null);
      }, 3000);

      return;
    }

    // 检查权限
    const mode = featureToModeMap[featureId] || AppMode.TEXT_CHAT;
    const permission = checkGenerationPermission(mode);

    if (!permission.allowed && !permission.dailyLimitReached) {
      // 如果不是日限问题，直接提示
      alert(permission.reason);
      return;
    }

    setActiveFeature(featureId);
    setPrompt('');
    setGeneratedImage(null);
    setError(null);

    onModeChange(mode);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto relative bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">



      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20 flex flex-col items-center">

        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            Hi, I am <span className="text-orange-500">UPC</span><span className="text-purple-400 text-2xl align-top">+</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto transition-all duration-300">
            {getCurrentSubtitle()}
          </p>
        </div>

        <div className="w-full max-w-3xl relative mb-12 group">

          {activeFeature && (
            <button
              onClick={() => {
                setActiveFeature(null);
                setPrompt('');
                setGeneratedImage(null);
                setError(null);
              }}
              className="fixed top-24 left-80 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all duration-300 flex items-center gap-2 group/return z-30"
            >
              <i className="fa-solid fa-arrow-left text-xs group-hover/return:translate-x-[-2px] transition-transform"></i>
              返回
            </button>
          )}

          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getCurrentPlaceholder()}
              disabled={activeFeature === 'more-tools'}
              className={`w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 resize-none min-h-[80px] max-h-[300px] ${activeFeature === 'more-tools' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              rows={1}
            />

            {/* 上传图片预览 */}
            {referenceImagePreview && (
              <div className="mt-3 relative w-32">
                <img
                  src={referenceImagePreview}
                  alt="reference"
                  className="rounded-lg border border-white/10"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-400"
                >
                  ✕
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex justify-between items-end mt-4 pt-2 border-t border-white/5">

              <div className="flex gap-2 text-gray-400">
                <button
                  onClick={handleUploadClick}
                  disabled={activeFeature === 'more-tools'}
                  className={`p-2 rounded-full transition-colors tooltip ${activeFeature === 'more-tools'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-white/10'
                    }`}
                  title="上传参考图"
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">{prompt.length} / 5000</span>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || activeFeature === 'more-tools'}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${activeFeature === 'more-tools'
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : prompt.trim() ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
                    ${isGenerating ? 'animate-spin' : ''}
                  `}
                >
                  {isGenerating ? (
                    <i className="fa-solid fa-circle-notch"></i>
                  ) : (
                    <i className="fa-solid fa-arrow-up"></i>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onClick={() => handleFeatureClick(feature.id)}
            >
              <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 border
                        ${activeFeature === feature.id
                  ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 border-white/10 text-gray-400 group-hover:bg-white/10 group-hover:scale-105 group-hover:text-white'}
                    `}>
                <i className={feature.icon}></i>
              </div>
              <span className={`text-xs font-medium transition-colors ${activeFeature === feature.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {feature.label}
              </span>
            </div>
          ))}
        </div>
        {error && (
          <div className="w-full max-w-3xl mb-12 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center">
            {error}
          </div>
        )}

        {generatedImage && (
          <div className="w-full max-w-3xl mb-12 animate-fade-in">
            <div className="bg-slate-800/50 rounded-2xl p-2 border border-white/10 shadow-2xl">
              <img src={generatedImage} alt="Generated result" className="w-full h-auto rounded-xl" />
              <div className="p-4 flex justify-between items-center">
                <p className="text-sm text-gray-300 line-clamp-1 italic">"{prompt}"</p>
                <button className="text-sm text-orange-400 hover:text-orange-300">
                  <i className="fa-solid fa-download mr-1"></i> 下载
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          <div className="flex items-center gap-6 mb-6 border-b border-white/5 pb-2 overflow-x-auto">
            {['精选推荐', '商业应用', '教育学术', '创意设计', '职业发展'].map((tab, i) => (
              <button key={tab} className={`
                pb-2 text-sm font-medium transition-colors whitespace-nowrap
                ${i === 0 ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'}
              `}>
                {tab}
              </button>
            ))}
          </div>

          <Gallery />
        </div>

      </div>
    </div>
  );
};

export default MainView;
