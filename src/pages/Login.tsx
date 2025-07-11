import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth.ts';
import CenterLoader from '../components/CenterLoader.tsx';
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

  if (loading) {
    return <CenterLoader />;
  }

  // If already authenticated, redirect
  if (user) {
    return <Navigate replace to="/" />;
  }

  // Centered form thanks to LayoutCenter
  return (
    <Layout center>
      <form
        className="w-full max-w-md rounded bg-white p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        <h1 className="mb-6 text-center text-2xl font-bold">
          {t('pages.login.heading')}
        </h1>
        <div className="mb-4">
          <label className="mb-1 block font-medium" htmlFor="email">
            {t('pages.login.label.email')}
          </label>
          <input
            required
            className="w-full rounded border p-2"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block font-medium" htmlFor="password">
            {t('pages.login.label.password')}
          </label>
          <input
            required
            className="w-full rounded border p-2"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="w-full rounded bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
          type="submit"
        >
          {t('pages.login.submit')}
        </button>
      </form>
    </Layout>
  );
};

export default Login;
