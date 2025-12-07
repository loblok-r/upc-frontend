import React from 'react';

const UpcPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#333] font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* 主要内容容器：限制宽度以获得最佳阅读体验 */}
      <main className="max-w-[900px] mx-auto px-6 py-16 md:py-24">

        {/* === 1. 文章头部 === */}
        <header className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4">
            UPC想法所见即所得
          </h1>
          <div className="text-sm md:text-base text-gray-500 font-medium tracking-wide">
            <span>upc.inc</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>2025-07-26</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>由 Universal Picture Compose 提供</span>
          </div>
        </header>

        {/* === 2. 核心大图 (Hero Section) === */}
        <section className="relative w-full aspect-video md:aspect-[2/1] rounded-lg overflow-hidden shadow-sm mb-12 group">
          {/* 背景图：使用 Unsplash 的宇宙星空图模拟原图背景 */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=2000&auto=format&fit=crop')`
            }}
          />

          {/* 遮罩层：增加一点暗度让文字更清晰 
          <div className="absolute inset-0 bg-black/20" />

          {/* 中心的 Logo 浮层 (完全用 CSS 绘制，无需图片) */}
          {/* <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl shadow-2xl transform transition-transform hover:scale-105"> */}

          {/* 左侧 Pi 图标 */}
          {/* <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1E293B] to-black rounded-xl border border-white/20 flex items-center justify-center shadow-lg">
                {/* 模拟 Logo 上的闪光点 */}
          {/* <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white] animate-pulse"></div>
                <span className="text-5xl md:text-6xl font-serif font-bold text-[#38BDF8] drop-shadow-lg" style={{ fontFamily: '"Times New Roman", serif' }}>
                  Upc
                </span>
              </div> */} */

          {/* 右侧文字 */}
          {/* <div className="flex flex-col justify-center">
                <h2 className="text-white text-2xl md:text-3xl font-bold leading-none tracking-wide uppercase drop-shadow-md">
                  Universal
                </h2>
                <h2 className="text-white text-2xl md:text-3xl font-bold leading-none tracking-wide uppercase drop-shadow-md mt-1">
                  Picture Composer
                </h2>
              </div>
            </div>
          </div> */}


          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-6 bg-black/70 backdrop-blur-lg border border-white/15 px-8 py-5 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]">

              {/* 左侧 Logo 容器 */}
              <div className="relative shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl border border-white/25 flex items-center justify-center shadow-xl group/logo">
                {/* Logo 上的动态光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl"></div>
                {/* 闪烁的光点 */}
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_#38BDF8] animate-pulse"></div>
                {/* Logo 文字 */}
                <span
                  className="text-5xl md:text-6xl font-serif font-bold text-[#38BDF8] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] group-hover/logo:drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all"
                  style={{ fontFamily: '"Times New Roman", Georgia, serif', letterSpacing: '-0.02em' }}
                >
                  UPC
                </span>
              </div>

              {/* 右侧文字区域 */}
              <div className="flex flex-col justify-center text-left space-y-2">
                <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight uppercase drop-shadow-md">
                  Universal
                </h2>
                <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight uppercase drop-shadow-md">
                  Picture Composer
                </h2>
                {/* 可选的副标题/标语 */}
                <p className="text-slate-300 text-sm font-medium tracking-wide mt-1 opacity-80 max-w-xs">
                  AI-Powered Visual Creation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* === 3. 文章正文 === */}
        <article className="prose prose-lg max-w-none text-[#2c2c2c] leading-relaxed md:text-justify">
          <p className="mb-6 text-[17px] md:text-[19px]">
            <span className="font-bold text-black">Upc (Universal Picture Compose)</span>
            是一个革命性的AI辅助创意平台，专门为产品创作者、设计师和营销人员打造。我们采用先进的多模态人工智能技术，
            将您的创意想法、文字描述或简单草图，在瞬间转化为专业级的产品视觉呈现。
          </p>

          <h3 className="text-2xl font-bold text-black mt-10 mb-4">
            几秒钟内生成演示文稿
          </h3>

          <p className="mb-6 text-[17px] md:text-[19px]">
            只需输入提示或文档（文本、pdf、ppt、word、网页），Pi 即可在一分钟内构建演示文稿的结构轮廓、设计布局、生成内容并渲染成最终样式。
          </p>

          <h3 className="text-2xl font-bold text-black mt-10 mb-4">
            多模态创作体验
          </h3>

          <p className="mb-6 text-[17px] md:text-[19px]">
            UPC深度融合文本理解、图像识别和设计原理，支持：

            文字转视觉：将产品描述直接转化为三维渲染效果图

            草图精修：将手绘草图优化为专业设计稿

            风格迁移：为现有产品图应用不同的视觉风格

            场景合成：将产品智能置入合适的应用场景
          </p>

          <h3 className="text-2xl font-bold text-black mt-10 mb-4">
            我们的使命
          </h3>

          <p className="mb-6 text-[17px] md:text-[19px]">
            UPC致力于重新定义数字时代的创意工作流程。我们相信，最伟大的产品创意应该轻松呈现给世界。通过降低视觉创作的技术门槛，我们赋能每一位产品创新者，让创意不再受制于专业技能，让每个优秀产品都能获得与之匹配的视觉表达。

            无论您是独立创业者打造首个产品原型，还是成熟品牌优化产品线视觉体系，UPC都能成为您最可靠的AI创作伙伴。我们持续学习最新的设计趋势和技术标准，确保生成的每一幅图像都兼具美学价值与商业实用性。

            让AI理解您的产品愿景，让视觉表达不再设限。
          </p>
        </article>

        {/* 底部留白 */}
        <div className="h-20"></div>

      </main>
    </div>
  );
};

export default UpcPage;
