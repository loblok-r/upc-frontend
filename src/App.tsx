import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// @ts-ignore
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import WorkPage from './pages/WorkPage';
import LotteryPage from './pages/LotteryPage';
import MallPage from './pages/Mall';
import WalletPage from './pages/WalletPage';
import ExchangeRecordPage from './pages/ExchangeRecordPage';
import UpcPage from './pages/UpcPage';



import DefaultLayout from './layouts/DefaultLayout';
import NoNavbarLayout from './layouts/NoNavbarLayout';
import PayInfoPage from './pages/PayInfoPage';
import ChatWidget from './components/ChatWidget';

// 聊天组件包装器
const ChatWidgetWrapper: React.FC = () => {
  const location = useLocation();
  const hiddenRoutes = ['/login', '/register', '/exchange-record','/wallet'];
  const shouldHideChat = hiddenRoutes.includes(location.pathname);
  return shouldHideChat ? null : <ChatWidget />;
};

function App() {
  return (
    // 1. 这里只使用 Router (即 BrowserRouter)
    // 2. 去掉了外层的 <BrowserRouter> 标签
    <Router>
      {/* 3. ScrollToTop 必须在 Router 内部，才能监听到路由变化 */}
      <ScrollToTop /> 
      
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
          path="/upc"
          element={
            <DefaultLayout>
              <UpcPage />
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
          path="/exchange-record"
          element={
            <NoNavbarLayout>
              <ExchangeRecordPage />
            </NoNavbarLayout>
          }
        />
        <Route
          path="/wallet"
          element={
            <NoNavbarLayout>
              <WalletPage />
            </NoNavbarLayout>
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