// 模拟使用本地图片的服务
const LOCAL_IMAGES = [
  '/sample-images/placeholder1.png',
  '/sample-images/placeholder2.png',
  '/sample-images/placeholder3.png'
];

let currentIndex = 0;

/**
 * 模拟图片生成器（支持参考图）
 * @param prompt 用户输入文案
 * @param referenceImage base64 的参考图，可为 null
 */
export const generateImageFromText = async (
  prompt: string, 
  referenceImage?: string | null
): Promise<string> => {
  
  console.log("模拟发送给后端的内容：", {
    prompt,
    referenceImagePreview: referenceImage ? referenceImage.slice(0, 50) + "..." : null
  });

  const imageUrl = LOCAL_IMAGES[currentIndex];
  currentIndex = (currentIndex + 1) % LOCAL_IMAGES.length;
  
  await new Promise(resolve => setTimeout(resolve, 800));

  return imageUrl;
};
