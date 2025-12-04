import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import WorkPage from './pages/WorkPage';
import LotteryPage from './pages/LotteryPage';

import DefaultLayout from './layouts/DefaultLayout';
import NoNavbarLayout from './layouts/NoNavbarLayout';
import PayInfoPage from './pages/PayInfoPage';

function App() {
  return (
    <Router>
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
