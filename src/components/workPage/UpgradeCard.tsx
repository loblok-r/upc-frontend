import React from 'react';

interface UpgradeCardProps {
  openUpgradeModal: () => void;
  userStatus?: 'free' | 'member'; // 新增参数
  memberDaysLeft?: number; // 新增参数
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({  
  openUpgradeModal, 
  userStatus = 'free',
  memberDaysLeft  
}) => {

   // 根据用户状态显示不同内容
  const getCardContent = () => {
    if (userStatus === 'member') {
      // 会员用户看到的卡片
      return {
        title: '会员专属权益',
        buttonText: memberDaysLeft ? '续费会员' : '会员中心',
        showComparison: false,
      };
    }

     // 非会员用户看到的卡片
    return {
      title: '升级专业版',
      buttonText: '立即升级 Pro',
      showComparison: true,
    };
  };

  const cardContent = getCardContent();
  
  return (
    <div className="absolute left-full bottom-0 mb-4 pl-4 z-50 transform transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[-10px] pointer-events-none group-hover:pointer-events-auto">
      <div className="w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
        {/* 会员用户显示续费提醒 */}
        {userStatus === 'member' && memberDaysLeft !== undefined && memberDaysLeft <= 7 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <i className="fa-solid fa-clock text-orange-400"></i>
              <span className="text-orange-300 font-medium">会员即将到期</span>
            </div>
            <p className="text-xs text-orange-200 mt-1">
              您的会员剩余 <span className="font-bold">{memberDaysLeft}</span> 天，续费享优惠
            </p>
          </div>
        )}
        
        {cardContent.showComparison ? (
          // 非会员看到的对比卡片
          <>
            <div className="flex justify-between items-center mb-6">
              {/* 免费版卡片 */}
               <div className="bg-slate-800 p-4 rounded-lg w-[48%]">
            <h3 className="text-lg font-bold text-gray-300">免费版</h3>
            <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">基础功能</span>
            
            {/* 算力信息 */}
            <div className="mt-3 mb-4">
              <div className="flex items-center gap-1 text-xs">
                <i className="fa-solid fa-bolt text-yellow-400"></i>
                <span className="text-gray-400">初始算力</span>
              </div>
              <div className="text-white font-bold text-sm">100 点</div>
            </div>
            
            <ul className="space-y-3 text-sm text-gray-400">
              {/* 文字对话 */}
              <li className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-message text-blue-400 text-xs"></i>
                    <span>文字对话</span>
                  </span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="text-xs text-gray-500 pl-5">
                  每日 20 次 · 单次 1000 字
                </div>
              </li>
              
              {/* AI绘图 */}
              <li className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-image text-green-400 text-xs"></i>
                    <span>AI 绘图</span>
                  </span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="text-xs text-gray-500 pl-5">
                  每日 5 次 · 标准分辨率
                </div>
                <div className="text-xs text-gray-500 pl-5 flex items-center gap-1">
                  <i className="fa-solid fa-water"></i>
                  带平台水印
                </div>
              </li>
              
              {/* 历史记录 */}
              <li className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-clock text-purple-400 text-xs"></i>
                    <span>历史记录</span>
                  </span>
                </div>
                <div className="text-xs text-gray-500 pl-5">
                  保存 3 天
                </div>
              </li>
            </ul>
          </div>
              
              {/* 专业版卡片 */}
               <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/30 p-4 rounded-lg w-[48%] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-[10px] text-white px-2 py-0.5 rounded-bl-lg font-bold">
              推荐
            </div>
            <h3 className="text-lg font-bold text-white">专业版</h3>
            <span className="text-xs text-orange-200 bg-orange-500/20 px-2 py-0.5 rounded">无限使用</span>
            
            {/* 算力信息 */}
            <div className="mt-3 mb-4">
              <div className="flex items-center gap-1 text-xs">
                <i className="fa-solid fa-bolt text-yellow-300"></i>
                <span className="text-orange-100">每月赠送</span>
              </div>
              <div className="text-white font-bold text-sm">1000 点</div>
              <div className="text-xs text-orange-300 mt-1">+ 额外获取途径</div>
            </div>
            
            <ul className="space-y-3 text-sm text-white font-medium">
              {/* 文字对话 */}
              <li className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-message text-blue-300 text-xs"></i>
                    <span>文字对话</span>
                  </span>
                  <span className="text-orange-400">✓</span>
                </div>
                <div className="text-xs text-orange-200 pl-5">
                  无日限 · 单次 5000 字
                </div>
              </li>
              
              {/* AI绘图 */}
              <li className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-image text-green-300 text-xs"></i>
                    <span>AI 绘图</span>
                  </span>
                  <span className="text-orange-400">✓</span>
                </div>
                <div className="text-xs text-orange-200 pl-5">
                  无日限 · 高清分辨率
                </div>
                <div className="text-xs text-orange-200 pl-5 flex items-center gap-1">
                  <i className="fa-solid fa-water text-transparent"></i>
                  无水印输出
                </div>
                <div className="text-xs text-orange-200 pl-5">
                  批量生成（最多4张）
                </div>
              </li>
              
              {/* 专属特权 */}
              <li className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-crown text-yellow-300 text-xs"></i>
                    <span>专属特权</span>
                  </span>
                </div>
                <div className="text-xs text-orange-200 pl-5">
                  优先排队 · 30天历史记录
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 升级按钮 */}
        <button 
              onClick={openUpgradeModal}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-gem"></i>
              {cardContent.buttonText}
            </button>
          </>
        ) : (
          // 会员看到的权益卡片
          <>
            <h3 className="text-lg font-bold text-white mb-4">{cardContent.title}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <i className="fa-solid fa-infinity text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-white font-medium">无限制使用</div>
                  <div className="text-xs text-purple-300">AI对话和绘图无次数限制</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <i className="fa-solid fa-crown text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-white font-medium">高清特权</div>
                  <div className="text-xs text-purple-300">无水印高清图片 + 批量生成</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <i className="fa-solid fa-bolt text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-white font-medium">每月算力</div>
                  <div className="text-xs text-purple-300">每月1000点算力 + 额外获取</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={openUpgradeModal}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate"></i>
              {cardContent.buttonText}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UpgradeCard;