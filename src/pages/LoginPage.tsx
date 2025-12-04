// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { TechBackground } from '../components/login/TechBackground';
import { LoginForm } from '../components/login/LoginForm';
import { RegisterForm } from '../components/login/RegisterForm';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [view, setView] = useState<'login' | 'register'>('login');

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <TechBackground />
      
      {/* 返回首页按钮
      <Link 
        to="/" 
        className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors z-20"
      >
        ← 返回首页
      </Link> */}
      
      <main className="w-full flex justify-center z-10">
        {view === 'login' ? (
          <LoginForm onSwitchToRegister={() => setView('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView('login')} />
        )}
      </main>
    </div>
  );
}

export default LoginPage;