import React from 'react';

const Gallery: React.FC = () => {
  const items = [
    {
      type: 'AI 视频',
      title: '清晨的活力果汁',
      image: 'https://picsum.photos/600/350?random=1',
      colSpan: 1
    },
    {
      type: 'AI 视频',
      title: '禅意庭院与红酒',
      image: 'https://picsum.photos/600/350?random=2',
      colSpan: 1
    },
    {
      type: 'AI 视频',
      title: '赛博朋克梦想家',
      image: 'https://picsum.photos/600/350?random=3',
      colSpan: 1
    },
    {
      type: 'AI 研究',
      title: '全球驱动力分析图表',
      image: 'https://picsum.photos/600/350?random=4',
      colSpan: 1,
      isLight: true
    },
     {
      type: 'AI 绘图',
      title: 'CRISPR 基因编辑机制',
      image: 'https://picsum.photos/600/350?random=5',
      colSpan: 1,
      isLight: true
    },
    {
      type: 'AI 幻灯片',
      title: '菲律宾学校设施项目',
      image: 'https://picsum.photos/600/350?random=6',
      colSpan: 1,
      isLight: true
    },
     {
      type: 'AI 视频',
      title: '未来地下车库',
      image: 'https://picsum.photos/600/350?random=7',
      colSpan: 1
    },
    {
      type: 'AI 研究',
      title: '电商渗透率策略',
      image: 'https://picsum.photos/600/350?random=8',
      colSpan: 1,
      isLight: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="group relative rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-orange-500/10 bg-slate-800"
        >
          {/* Tag */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
            <span className="text-xs font-bold text-white tracking-wide">{item.type}</span>
          </div>

          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
             <h3 className={`text-sm font-medium truncate ${item.isLight && false ? 'text-slate-900' : 'text-white'}`}>
               {item.title}
             </h3>
          </div>
        </div>
      ))}
      
      {/* Product Hunt Badge Mockup */}
      <div className="col-span-1 rounded-xl bg-gradient-to-br from-orange-100 to-white p-4 flex flex-col justify-center items-center shadow-lg border border-white/20">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">P</div>
          <div className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Product Hunt</div>
          <div className="text-lg font-bold text-slate-800">#1 Product of the Day</div>
      </div>
    </div>
  );
};

export default Gallery;
