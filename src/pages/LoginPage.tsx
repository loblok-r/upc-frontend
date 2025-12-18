import React, { useState } from 'react';
import { TechBackground } from '../components/login/TechBackground';
import { LoginForm } from '../components/login/LoginForm';
import { RegisterForm } from '../components/login/RegisterForm';
import { ForgotPasswordForm } from '../components/login/ForgotPasswordForm';

function LoginPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');

  return (
    // 修改点：min-h-screen -> min-h-[100dvh] 以适配移动端浏览器地址栏
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4">
      <TechBackground />
      
      <main className="w-full flex justify-center z-10">
        {view === 'login' && (
          <LoginForm 
            key="login-form" 
            onSwitchToRegister={() => setView('register')}
            onSwitchToForgot={() => setView('forgot')} 
            initialEmail={email}
          />
        )}
        
        {view === 'register' && (
          <RegisterForm 
            key="register-form"
            onSwitchToLogin={(registeredEmail) => {
              if (registeredEmail) setEmail(registeredEmail);
              setView('login');
            }} 
          />
        )}
  
        {view === 'forgot' && (
          <ForgotPasswordForm 
            key="forgot-form"
            onSwitchToLogin={() => setView('login')} 
          />
        )}
      </main>
    </div>
  );
}

export default LoginPage;