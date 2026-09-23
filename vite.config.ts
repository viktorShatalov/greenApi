import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Открывает dev-сервер на всех сетевых интерфейсах компьютера.
    host: '0.0.0.0',
    // Использует порт 3000 для локальной разработки.
    port: 3000,
    // Не позволяет Vite автоматически выбрать другой порт, если 3000 занят.
    strictPort: true,
  },
  preview: {
    // Использует порт 3000 для просмотра production-сборки.
    port: 3000,
    // Завершает запуск с ошибкой, если порт 3000 уже занят.
    strictPort: true,
  },
});
