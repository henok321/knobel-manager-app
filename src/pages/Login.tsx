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
      <div className="flex h-screen items-center justify-center text-xl">
        {t('LOADING')}
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="fixed top-0 flex w-full items-center justify-between bg-blue-500 p-4 text-white">
        <h1 className="text-2xl font-bold">{t('HEADER_TITLE')}</h1>
      </header>

      <main className="flex grow items-center justify-center px-4 pt-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded bg-white p-6 shadow-md"
        >
          <h1 className="mb-6 text-center text-2xl font-bold">
            {t('LOGIN_HEADING')}
          </h1>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block font-medium">
              {t('LOGIN_EMAIL_INPUT_LABEL')}
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded border p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block font-medium">
              {t('LOGIN_PASSWORD_INPUT_LABEL')}
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded border p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
          >
            {t('LOGIN_BUTTON')}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
