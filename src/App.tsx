import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import WorkPage from './pages/WorkPage';
import LotteryPage from './pages/LotteryPage';
import MallPage from './pages/Mall';



import DefaultLayout from './layouts/DefaultLayout';
import NoNavbarLayout from './layouts/NoNavbarLayout';
import PayInfoPage from './pages/PayInfoPage';
import ChatWidget from './components/ChatWidget';


// 聊天组件包装器，根据路由控制显示
const ChatWidgetWrapper: React.FC = () => {
  const location = useLocation();
  
  // 定义不显示 ChatWidget 的路由路径
  const hiddenRoutes = ['/login', '/register'];
  
  // 检查当前路径是否在隐藏列表中
  const shouldHideChat = hiddenRoutes.includes(location.pathname);
  
  return shouldHideChat ? null : <ChatWidget />;
};

function App() {
  return (
    <Router>
      <ChatWidgetWrapper />
      <Routes>
        {/* ⭐ 默认带 Navbar 的页面 */}
        <Route
          path="/"
          element={
            <DefaultLayout>
              <HomePage />
            </DefaultLayout>
          }
        />
        <Route
          path="/mall"
          element={
            <DefaultLayout>
              <MallPage />
            </DefaultLayout>
          }
        />

        <Route
          path="/pay-info"
          element={
            <NoNavbarLayout>
              <PayInfoPage/>
            </NoNavbarLayout>
          }
        />

        <Route
          path="/login"
          element={
            <NoNavbarLayout>
              <LoginPage />
            </NoNavbarLayout>
          }
        />

        <Route
          path="/lottery"
          element={
            <DefaultLayout>
              <LotteryPage />
            </DefaultLayout>
          }
        />

        {/* ⭐ 不带 Navbar 的页面 */}
        <Route
          path="/work"
          element={
            <NoNavbarLayout>
              <WorkPage />
            </NoNavbarLayout>
          }
        />

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
