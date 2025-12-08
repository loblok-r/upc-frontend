import React, { useState } from 'react';
import { TechBackground } from '../components/login/TechBackground';
import { LoginForm } from '../components/login/LoginForm';
import { RegisterForm } from '../components/login/RegisterForm';
import { ForgotPasswordForm } from '../components/login/ForgotPasswordForm';

function LoginPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [email, setEmail] = useState('');

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <TechBackground />
      
      <main className="w-full flex justify-center z-10">
        {view === 'login' && (
          <LoginForm 
            // 🔥 关键修改：加上 key，强制 React 彻底重新渲染组件
            key="login-form" 
            onSwitchToRegister={() => setView('register')}
            onSwitchToForgot={() => setView('forgot')} 
            initialEmail={email}
          />
        )}
        
        {view === 'register' && (
          <RegisterForm 
            // 🔥 关键修改：加上 key
            key="register-form"
            onSwitchToLogin={(registeredEmail) => {
              if (registeredEmail) setEmail(registeredEmail);
              setView('login');
            }} 
          />
        )}
  
        {view === 'forgot' && (
          <ForgotPasswordForm 
            // 🔥 关键修改：加上 key，确保之前的 Input 状态完全清空
            key="forgot-form"
            onSwitchToLogin={() => setView('login')} 
          />
        )}
      </main>
    </div>
  );
}

export default LoginPage;