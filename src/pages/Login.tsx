import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.ts';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { user, loading, loginAction } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginAction({ email, password });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        {t('LOADING')}
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-500 text-white p-4 w-full flex justify-between items-center fixed top-0">
        <h1 className="text-2xl font-bold">{t('HEADER_TITLE')}</h1>
      </header>

      <main className="flex-grow flex items-center justify-center pt-20 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            {t('LOGIN_HEADING')}
          </h1>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">
              {t('LOGIN_EMAIL_INPUT_LABEL')}
            </label>
            <input
              id="email"
              type="email"
              className="border w-full p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-1 font-medium">
              {t('LOGIN_PASSWORD_INPUT_LABEL')}
            </label>
            <input
              id="password"
              type="password"
              className="border w-full p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-3 rounded hover:bg-blue-700 transition-colors"
          >
            {t('LOGIN_BUTTON')}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
