import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.ts';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout.tsx';

const Login: React.FC = () => {
  const { user, loading, loginAction } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginAction({ email, password });
  };

  // Loading spinner, or text
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        {t('pages.login.loading')}
      </div>
    );
  }

  // If already authenticated, redirect
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Centered form thanks to LayoutCenter
  return (
    <Layout center>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-6 shadow-md"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">
          {t('pages.login.heading')}
        </h1>
        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block font-medium">
            {t('pages.login.label.email')}
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
            {t('pages.login.label.password')}
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
          {t('pages.login.submit')}
        </button>
      </form>
    </Layout>
  );
};

export default Login;
