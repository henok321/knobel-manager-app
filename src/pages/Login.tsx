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
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4">{t('LOGIN_HEADING')}</h1>
        <div className="mb-4">
          <label className="block mb-1">{t('LOGIN_EMAIL_INPUT_LABEL')}</label>
          <input
            type="email"
            className="border w-full p-2"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">
            {t('LOGIN_PASSWORD_INPUT_LABEL')}
          </label>
          <input
            type="password"
            className="border w-full p-2"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {t('LOGIN_SIGN_IN_BUTTON')}
        </button>
      </form>
    </div>
  );
};

export default Login;
