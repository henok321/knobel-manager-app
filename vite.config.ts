import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    mkcert(),
  ],
  server: {
    proxy: {
      '/api': {
        target:
          loadEnv(mode, process.cwd()).VITE_API_URL ?? 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}));
