# 📱 GAS Telegrambo

> Мощная и простая библиотека для создания Telegram ботов на Google Apps Script

## ✨ Особенности

- 🚀 **Простая инициализация** — создайте бота в 3 строки кода
- 🎯 **Событийная модель** — удобная обработка сообщений, кнопок и других событий
- 📦 **Поддержка медиа** — отправка фото, видео, документов, аудио
- ⌨️ **Клавиатуры** — inline и reply клавиатуры из коробки
- 🔄 **Автоматический контекст** — все необходимые параметры подставляются автоматически
- 🛡️ **Обработка ошибок** — встроенная валидация и информативные ошибки
- 📤 **Multipart/form-data** — корректная отправка файлов и медиа-групп

---
## 🚀 Установка и настройка

### Установите зависимости

```bash
npm install
```

### Настройте Clasp

Установите Clasp глобально и авторизуйтесь:
```bash
npm install -g @google/clasp
clasp login
```

### Свяжите с проектом Google
Создайте файл `.clasp.json` в корне проекта:
```json
{
  "scriptId": "ВАШ_SCRIPT_ID",
  "rootDir": "./dist"
}
```


### Команды (Scripts)

| Команда | Описание |
| :--- | :--- |
| `npm run dev` | Локальный сервер (Vite). Только фронтенд (HMR), вызовы к GAS заглушены. |
| `npm run build` | Полная сборка проекта в папку `dist/`. |
| `npm run push` | Сборка + загрузка кода на Google Drive (Режим разработки). |
| `npm run deploy` | **Полный цикл релиза:** Сборка → Загрузка → Создание новой версии (Versioned Deployment). |


### Подключение библиотеки в свой проект:

1. Откройте ваш проект Google Apps Script
2. Нажмите **Редактор** → **Библиотеки** (значок `+` слева)
3. Введите Script ID:
4. Нажмите **Найти**
5. Выберите последнюю версию
6. В поле "Идентификатор" оставьте `Telegrambo`
7. Нажмите **Добавить**



## 🚀 Быстрый старт

### 1. Создайте бота

Получите токен от [@BotFather](https://t.me/BotFather) в Telegram.

### 2. Напишите код

```javascript
// Токен вашего бота
const TOKEN = 'YOUR_BOT_TOKEN_HERE';

// Создаём экземпляр бота
const bot = Telegrambo.createBot(TOKEN);

// Обработчик входящих обновлений (webhook)
function doPost(e) {
  const update = JSON.parse(e.postData.contents);
  bot.setUpdate(update);
  return ContentService.createTextOutput('OK');
}

// Обработка сообщений
bot.on('message', (ctx) => {
  const text = ctx.text;
  const userName = ctx.from.first_name;
  
  ctx.sendMessage({
    text: `Привет, ${userName}! Ты написал: ${text}`
  });
});
```

### 3. Настройте Webhook

```javascript
function setWebhook() {
  // URL вашего веб-приложения (после деплоя)
  const url = ScriptApp.getService().getUrl();
  
  const bot = Telegrambo.createBot(TOKEN);
  const response = bot.setWebhook({ url: url });
  
  Logger.log(response);
}
```

### 4. Разверните как веб-приложение

1. Нажмите **Развернуть** → **Новое развертывание**
2. Тип: **Веб-приложение**
3. Выполнять как: **Я**
4. У кого есть доступ: **Все**
5. Скопируйте URL развертывания
6. Запустите функцию `setWebhook()`

✅ Готово! Бот работает!

---

## 📖 Документация

### API Reference

#### `Telegrambo.createBot(token, options)`

Создаёт экземпляр бота.

**Параметры:**
- `token` (string) — токен бота от BotFather
- `options` (object, optional) — дополнительные параметры для `UrlFetchApp.fetch()`

**Возвращает:** `BotContext`

```javascript
const bot = Telegrambo.createBot('123456:ABC-DEF...');

// С дополнительными параметрами
const bot = Telegrambo.createBot(TOKEN, {
  // Значения по умолчанию
  muteHttpExceptions: false,
  validateHttpsCertificates: true,
  followRedirects: true
});
```

---

### Обработка событий

#### `bot.on(eventName, handler)`

Регистрирует обработчик события.

**Типы событий:**
- `message` — входящее сообщение
- `edited_message` — редактирование сообщения
- `channel_post` — пост в канале
- `callback_query` — нажатие на inline кнопку
- `inline_query` — inline запрос
- `poll_answer` — ответ в опросе
- `chat_join_request` — запрос на вступление
- `business_message` — бизнес-сообщение
- и другие из списка [update](https://core.telegram.org/bots/api#update)...

```javascript
// Обработка текстовых сообщений
bot.on('message', (ctx) => {
  Logger.log('Получено:', ctx.text);
});

// Обработка нажатий на кнопки
bot.on('callback_query', (ctx) => {
  ctx.answerCallbackQuery({ text: 'Кнопка нажата!' });
});

// Универсальный обработчик
bot.on((ctx, eventName) => {
  Logger.log(`Событие: ${eventName}`);
});
```

---

### EventContext (ctx)

Объект контекста, передаваемый в обработчики.

#### Свойства

Экземпляр EventContext (ctx) получает в свойства все свойства соответствующего поля в объекте [update](https://core.telegram.org/bots/api#update)

```javascript
// например для поля message
bot.on('message', (ctx) => {
  // Информация о пользователе
  ctx.from.id              // ID пользователя
  ctx.from.first_name      // Имя
  ctx.from.username        // @username
  
  // Информация о чате
  ctx.chat.id              // ID чата
  ctx.chat.type            // 'private' | 'group' | 'supergroup'
  
  // Сообщение
  ctx.message_id           // ID сообщения
  ctx.text                 // Текст
  ctx.photo                // Фото (если есть)
  ctx.document             // Документ (если есть)
});
```

Кроме полученного набора свойств, получает ещё 2 обязательных свойства:
- ctx.`update` - вернет полностью объект [update](https://core.telegram.org/bots/api#update)
- ctx.`payload` - вернет объект предустановленных полей для обработки методов EventContext

#### Методы
У экземпляра EventContext будет весь набор методов что есть и у BotContext (как и в [официальной документации](https://core.telegram.org/bots/api#available-methods)). Но с той разницей что у EventContext есть уже некоторые предустановленные свойства: 


```javascript
// Отвечает на присланное сообщение
bot.on('message', (ctx) => {
  ctx.sendMessage({
    // chat_id - устанавливается автоматически, 
    // но можно переопределить вручную
    text: 'Привет! 👋',
    // message_thread_id - если чат является форумом
    // параметр добавляется автоматически
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: 'Кнопка', callback_data: 'btn' }
      ]]
    }
  });
})
```

## 💡 Примеры использования

### Простой эхо-бот

```javascript
const bot = Telegrambo.createBot(TOKEN);

bot.on('message', (ctx) => {
  ctx.sendMessage({
    text: ctx.text || 'Отправьте текст'
  });
});

function doPost(e) {
  const update = JSON.parse(e.postData.contents);
  bot.setUpdate(update);
  return ContentService.createTextOutput('OK');
}
```

### Бот с командами и кнопками

```javascript
const bot = Telegrambo.createBot(TOKEN);

bot.on('message', (ctx) => {
  const text = ctx.text;
  
  if (text === '/start') {
    ctx.sendMessage({
      text: `Привет, ${ctx.from.first_name}! 👋`,
      reply_markup: {
        keyboard: [
          [{ text: '📊 Статистика' }, { text: '❓ Помощь' }]
        ],
        resize_keyboard: true
      }
    });
  }
  
  else if (text === '/menu') {
    ctx.sendMessage({
      text: 'Выберите раздел:',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📰 Новости', callback_data: 'news' }],
          [{ text: '⚙️ Настройки', callback_data: 'settings' }]
        ]
      }
    });
  }
  
  else {
    ctx.sendMessage({ text: `Эхо: ${text}` });
  }
});

bot.on('callback_query', (ctx) => {
  if (ctx.data === 'news') {
    ctx.answerCallbackQuery({ text: 'Загрузка...' });
    ctx.editMessageText({
      text: '📰 Последние новости:\n\n• Новость 1\n• Новость 2'
    });
  }
  
  if (ctx.data === 'settings') {
    ctx.answerCallbackQuery({ text: 'Настройки' });
    ctx.editMessageText({
      text: '⚙️ Настройки:\n\nЯзык: Русский'
    });
  }
});
```

### Многошаговая форма

```javascript
const bot = Telegrambo.createBot(TOKEN);
const userStates = new Map();

bot.on('message', (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.text;
  const state = userStates.get(userId) || { step: 'idle' };
  
  if (text === '/register') {
    state.step = 'awaiting_name';
    state.data = {};
    userStates.set(userId, state);
    
    ctx.sendMessage({
      text: '📝 Регистрация\n\nКак вас зовут?',
      reply_markup: { force_reply: true }
    });
    return;
  }
  
  switch (state.step) {
    case 'awaiting_name':
      state.data.name = text;
      state.step = 'awaiting_age';
      userStates.set(userId, state);
      ctx.sendMessage({ text: 'Сколько вам лет?' });
      break;
      
    case 'awaiting_age':
      const age = parseInt(text);
      if (isNaN(age)) {
        ctx.sendMessage({ text: '❌ Введите число' });
        return;
      }
      
      state.data.age = age;
      ctx.sendMessage({
        text: `✅ Регистрация завершена!\n\nИмя: ${state.data.name}\nВозраст: ${state.data.age}`
      });
      
      userStates.delete(userId);
      break;
  }
});
```

### Отправка файлов из Google Drive

```javascript
bot.on('message', (ctx) => {
  if (ctx.text === '/report') {
    // PDF из Google Sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const blob = ss.getAs('application/pdf');
    blob.setName('report.pdf');
    
    ctx.sendDocument({
      document: blob,
      caption: '📊 Ваш отчет'
    });
  }
  
  if (ctx.text === '/photo') {
    // Фото из Drive
    const file = DriveApp.getFileById('FILE_ID');
    ctx.sendPhoto({
      photo: file.getBlob(),
      caption: '📷 Фото из Google Drive'
    });
  }
});
```

### Проверка подписки на канал

```javascript
const CHANNEL = '@your_channel';

bot.on('message', (ctx) => {
  const member = bot.getChatMember({
    chat_id: CHANNEL,
    user_id: ctx.from.id
  });
  
  if (['left', 'kicked'].includes(member.result.status)) {
    ctx.sendMessage({
      text: '⚠️ Подпишитесь на канал:',
      reply_markup: {
        inline_keyboard: [[
          { text: 'Подписаться', url: `https://t.me/${CHANNEL.slice(1)}` }
        ]]
      }
    });
    return;
  }
  
  ctx.sendMessage({ text: 'Добро пожаловать! 🎉' });
});
```

---

## 🔧 Дополнительные методы

### Управление Webhook

```javascript
// Установить webhook
bot.setWebhook({ 
  url: 'YOUR_URL',
  drop_pending_updates: true 
});

// Удалить webhook
bot.deleteWebhook();

// Информация о webhook
const info = bot.getWebhookInfo();
Logger.log(info);
```

### Получение информации

```javascript
// О боте
const me = bot.getMe();
Logger.log(me.result.username);

// О чате
const chat = bot.getChat({ chat_id: 123456789 });

// О пользователе в чате
const member = bot.getChatMember({
  chat_id: 123456789,
  user_id: 987654321
});
```

### Работа с файлами

```javascript
// Получить файл
const fileInfo = bot.getFile({ file_id: 'FILE_ID' });
const filePath = fileInfo.result.file_path;

// Скачать файл
const url = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
const blob = UrlFetchApp.fetch(url).getBlob();

// Сохранить в Drive
DriveApp.createFile(blob);
```

---

## ⚠️ Обработка ошибок

Библиотека выбрасывает специальные ошибки:

- `ResponseError` — ошибка Telegram API
- `PayloadValidationError` — неверные параметры запроса
- `BotContextError` — ошибка контекста бота
- `EventContextError` — ошибка контекста события

```javascript
bot.on('message', (ctx) => {
  try {
    ctx.sendMessage({ text: 'OK' });
  } catch (e) {
    if (e.name === 'ResponseError') {
      Logger.log(`API Error ${e.code}: ${e.message}`);
      ctx.sendMessage({ text: '⚠️ Произошла ошибка' });
    } else {
      throw e;
    }
  }
});
```

---

## 📋 Поддерживаемые методы Telegram Bot API

Библиотека поддерживает все методы [Telegram Bot API](https://core.telegram.org/bots/api#available-methods). Любой метод можно вызвать через контекст или напрямую через бота:

```javascript
bot.on('message', (ctx) => {
  // Через контекст (автоматически добавляется chat_id)
  ctx.sendMessage({ text: 'Hello' });
  ctx.sendPhoto({ photo: blob });
})

// Через бота (нужно указать chat_id)
bot.sendMessage({ 
  chat_id: 123456789,
  text: 'Hello' 
});
```
---

## 🎨 Форматирование текста

### Markdown

```javascript
ctx.sendMessage({
  text: '*Жирный* _курсив_ `код` [ссылка](https://google.com)',
  parse_mode: 'MarkdownV2'
});
```

### HTML

```javascript
ctx.sendMessage({
  text: '<b>Жирный</b> <i>курсив</i> <code>код</code> <a href="https://google.com">ссылка</a>',
  parse_mode: 'HTML'
});
```

---

## 🔐 Безопасность

### Защита токена

Не храните токен в коде! Используйте Properties Service:

```javascript
// Сохранить токен (один раз)
function saveToken() {
  PropertiesService.getScriptProperties()
    .setProperty('BOT_TOKEN', 'YOUR_TOKEN');
}

// Использовать
const TOKEN = PropertiesService.getScriptProperties()
  .getProperty('BOT_TOKEN');

const bot = Telegrambo.createBot(TOKEN);
```

### Проверка отправителя

```javascript
const ADMIN_IDS = [123456789];

bot.on('message', (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.sendMessage({ text: '⛔ Доступ запрещён' });
  }
  
  // Код для админов
});
```

---

## 🐛 Отладка

### Логирование

```javascript
bot.on('message', (ctx) => {
  Logger.log('Update:', ctx.update);
  Logger.log('User:', ctx.from);
  Logger.log('Text:', ctx.text);
});
```

### Проверка webhook

```javascript
function debugWebhook() {
  const bot = Telegrambo.createBot(TOKEN);
  const info = bot.getWebhookInfo();
  
  Logger.log('URL:', info.result.url);
  Logger.log('Pending updates:', info.result.pending_update_count);
  Logger.log('Last error:', info.result.last_error_message);
}
```

---

## 📄 Лицензия

MIT License

---

## 🔗 Полезные ссылки

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [BotFather](https://t.me/BotFather) — создание ботов
- [Telegram Bot API Updates](https://core.telegram.org/bots/api#recent-changes)

---

## 💬 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [примеры](#-примеры-использования)
2. Изучите [документацию API](#api-reference)
3. Создайте Issue в репозитории

---

<p align="center">
  Сделано с ❤️ для сообщества Google Apps Script
</p>