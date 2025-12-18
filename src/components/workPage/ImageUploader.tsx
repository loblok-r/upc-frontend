import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file: File) => {
    setError('');

    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      setError(`仅支持 ${allowedTypes.map(t => t.split('/')[1]).join(', ')} 格式`);
      return;
    }

    // 检查文件大小
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`文件大小不能超过 ${maxSizeMB}MB`);
      return;
    }

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    onImageSelect(file, previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        className="hidden"
      />
      
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          p-2 hover:bg-white/10 rounded-full transition-colors
          ${isDragging ? 'bg-blue-500/20 border-2 border-blue-500 border-dashed' : ''}
        `}
        title="上传参考图"
      >
        <i className="fa-solid fa-paperclip"></i>
      </button>

      {error && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-red-500 text-white text-xs p-2 rounded shadow-lg z-50">
          {error}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;