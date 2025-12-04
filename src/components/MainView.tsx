import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { generateImageFromText } from '../services/localImageService';
import Gallery from './Gallery';

const MainView: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 新增：参考图（本地上传）
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleLoginClick = () => {
    navigate('/login');
  };

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
      const result = await generateImageFromText(prompt, base64);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("未能生成图片，请重试。");
      }
    } catch (err) {
      setError("生成过程中发生错误，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  const features = [
    { icon: 'fa-solid fa-pen-nib', label: 'AI 写作助手' },
    { icon: 'fa-solid fa-chart-pie', label: '智能演示' },
    { icon: 'fa-solid fa-magnifying-glass', label: '深度搜索' },
    { icon: 'fa-solid fa-image', label: 'AI 绘图', active: true },
    { icon: 'fa-solid fa-microphone-lines', label: '播客生成' },
    { icon: 'fa-solid fa-grip', label: '更多工具' },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto relative bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-4 sticky top-0 z-10 backdrop-blur-sm">
        <div className="text-sm text-gray-400">
          <span className="text-orange-400 font-semibold">Loblok UPC Pro</span> 现已上线 UINO，
          <a href="#" className="underline decoration-orange-400 underline-offset-4 hover:text-white transition-colors">免费试用</a>
        </div>
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <button className="hover:text-white"><i className="fa-solid fa-globe"></i> 中文</button>
          <button 
            onClick={handleLoginClick}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg transition-all">
              登录
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20 flex flex-col items-center">

        {/* Hero Section */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
            Hi, I am <span className="text-orange-500">UPC</span><span className="text-purple-400 text-2xl align-top">+</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            全能 AI 创意工作空间，让每个创意瞬间变现。
          </p>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-3xl relative mb-12 group">

          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
            
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要生成的画面..."
              className="w-full bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 resize-none min-h-[80px] max-h-[300px]"
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

            {/* Hidden file input */}
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
                  className="p-2 hover:bg-white/10 rounded-full transition-colors tooltip"
                  title="上传参考图"
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">{prompt.length} / 5000</span>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${prompt.trim() ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}
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

        {/* Feature Icons */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
            {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 border
                        ${feature.active 
                            ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                            : 'bg-white/5 border-white/10 text-gray-400 group-hover:bg-white/10 group-hover:scale-105 group-hover:text-white'}
                    `}>
                        <i className={feature.icon}></i>
                    </div>
                    <span className={`text-xs font-medium transition-colors ${feature.active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        {feature.label}
                    </span>
                </div>
            ))}
        </div>
        {/* Result Display Area */}
        {error && (
          <div className="w-full max-w-3xl mb-12 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Generated Image */}
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
