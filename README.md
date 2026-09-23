# MAX Chat

Минимальный интерфейс для отправки и получения текстовых сообщений в MAX через GREEN-API.

## Стек

- React
- TypeScript
- Vite
- Axios
- Feature-Sliced Design
- Vitest и Testing Library

## Требования

- Node.js 18 или выше
- npm
- Аккаунт GREEN-API и активный инстанс MAX
- `idInstance`
- `apiTokenInstance`

Рекомендуемая версия Node.js для проекта указана в файле [.nvmrc](./.nvmrc):

```text
20
```

Если используется `nvm`, переключите версию перед установкой зависимостей:

```bash
nvm install
nvm use
```

## Установка

Перейдите в директорию проекта и установите зависимости:

```bash
cd C:\front\test
npm install
```

Для PowerShell в Windows, если команда `npm` заблокирована политикой выполнения скриптов, используйте:

```powershell
npm.cmd install
```

## Запуск в режиме разработки

Запустите dev-сервер:

```bash
npm run dev
```

Или в PowerShell Windows:

```powershell
npm.cmd run dev
```

Приложение будет доступно по адресу:

```text
http://localhost:3000
```

Порт `3000` настроен в [vite.config.ts](./vite.config.ts). Если порт уже занят, Vite завершит запуск с ошибкой, не переключаясь на другой порт.

## Использование

1. Откройте `http://localhost:3000`.
2. Введите `idInstance` и `apiTokenInstance` из GREEN-API.
3. Нажмите **Войти в чат**.
4. Введите номер телефона получателя в формате `+7 900 000-00-00`.
5. Нажмите **Создать чат**.
6. Введите текст сообщения и нажмите кнопку отправки.
7. Ответы получателя появятся в текущем чате автоматически.

Приложение поддерживает только текстовые сообщения. Учетные данные не сохраняются в проекте и используются только в текущей сессии браузера.

## Настройка получения сообщений в GREEN-API

Для получения входящих сообщений через HTTP API в настройках инстанса GREEN-API необходимо:

- оставить `webhookUrl` пустым;
- включить получение входящих уведомлений (`incomingWebhook`);
- при необходимости включить уведомления об исходящих сообщениях (`outgoingWebhook`).

Настройки можно изменить в личном кабинете GREEN-API или методом `SetSettings`.

Документация:

- [GREEN-API MAX](https://green-api.com/max)
- [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- [Получение уведомлений через HTTP API](https://green-api.com/v3/docs/api/receiving/technology-http-api/)

## Проверка проекта

Запуск unit-тестов:

```bash
npm test
```

Запуск тестов в watch-режиме:

```bash
npm run test:watch
```

Проверка ESLint:

```bash
npm run lint
```

Сборка production-версии:

```bash
npm run build
```

Просмотр production-сборки:

```bash
npm run preview
```

После запуска preview-сервера откройте `http://localhost:3000`.
