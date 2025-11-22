# 📱 GAS Telegrambo

> A powerful and simple library for creating Telegram bots on Google Apps Script

## ✨ Features

- 🚀 **Simple Initialization** — create a bot in 3 lines of code
- 🎯 **Event-driven Model** — convenient handling of messages, buttons, and other events
- 📦 **Media Support** — send photos, videos, documents, audio
- ⌨️ **Keyboards** — inline and reply keyboards out of the box
- 🔄 **Automatic Context** — all necessary parameters are automatically supplied
- 🛡️ **Error Handling** — built-in validation and informative errors
- 📤 **Multipart/form-data** — correct sending of files and media groups

---
## 🚀 Installation and Setup

### Install Dependencies

```bash
npm install
```

### Configure Clasp

Install Clasp globally and log in:
```bash
npm install -g @google/clasp
clasp login
```

### Link to Google Project
Create a `.clasp.json` file in the project root:
```json
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./dist"
}
```


### Commands (Scripts)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Local server (Vite). Frontend only (HMR), GAS calls are stubbed. |
| `npm run build` | Full project build into the `dist/` folder. |
| `npm run push` | Build + upload code to Google Drive (Development mode). |
| `npm run deploy` | **Full Release Cycle:** Build → Upload → Create new version (Versioned Deployment). |


### Add the library to your project:

1. Open your Google Apps Script project
2. Click **Editor** → **Libraries** (the `+` icon on the left)
3. Enter Script ID:
4. Click **Find**
5. Select the latest version
6. In the "Identifier" field, leave `Telegrambo`
7. Click **Add**



## 🚀 Quick Start

### 1. Create a bot

Get a token from [@BotFather](https://t.me/BotFather) in Telegram.

### 2. Write the code

```javascript
// Your bot's token
const TOKEN = 'YOUR_BOT_TOKEN_HERE';

// Create a bot instance
const bot = Telegrambo.createBot(TOKEN);

// Incoming update handler (webhook)
function doPost(e) {
  const update = JSON.parse(e.postData.contents);
  bot.setUpdate(update);
  return ContentService.createTextOutput('OK');
}

// Message handling
bot.on('message', (ctx) => {
  const text = ctx.text;
  const userName = ctx.from.first_name;
  
  ctx.sendMessage({
    text: `Hello, ${userName}! You wrote: ${text}`
  });
});
```

### 3. Set up the Webhook

```javascript
function setWebhook() {
  // Your web application's URL (after deployment)
  const url = ScriptApp.getService().getUrl();
  
  const bot = Telegrambo.createBot(TOKEN);
  const response = bot.setWebhook({ url: url });
  
  Logger.log(response);
}
```

### 4. Deploy as a web app

1. Click **Deploy** → **New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Copy the deployment URL
6. Run the `setWebhook()` function

✅ Done! The bot is working!

---

## 📖 Documentation

### API Reference

#### `Telegrambo.createBot(token, options)`

Creates a bot instance.

**Parameters:**
- `token` (string) — bot token from BotFather
- `options` (object, optional) — additional parameters for `UrlFetchApp.fetch()`

**Returns:** `BotContext`

```javascript
const bot = Telegrambo.createBot('123456:ABC-DEF...');

// With additional parameters
const bot = Telegrambo.createBot(TOKEN, {
  // Default values
  muteHttpExceptions: false,
  validateHttpsCertificates: true,
  followRedirects: true
});
```

---

### Event Handling

#### `bot.on(eventName, handler)`

Registers an event handler.

**Event Types:**
- `message` — incoming message
- `edited_message` — message editing
- `channel_post` — channel post
- `callback_query` — inline button press
- `inline_query` — inline query
- `poll_answer` — poll answer
- `chat_join_request` — chat join request
- `business_message` — business message
- and others from the [update](https://core.telegram.org/bots/api#update) list...

```javascript
// Handling text messages
bot.on('message', (ctx) => {
  Logger.log('Received:', ctx.text);
});

// Handling button presses
bot.on('callback_query', (ctx) => {
  ctx.answerCallbackQuery({ text: 'Button pressed!' });
});

// Universal handler
bot.on((ctx, eventName) => {
  Logger.log(`Event: ${eventName}`);
});
```

---

### EventContext (ctx)

The context object passed to handlers.

#### Properties

An EventContext (ctx) instance receives all properties of the corresponding field in the [update](https://core.telegram.org/bots/api#update) object.

```javascript
// for example, for the message field
bot.on('message', (ctx) => {
  // User information
  ctx.from.id              // User ID
  ctx.from.first_name      // Name
  ctx.from.username        // @username
  
  // Chat information
  ctx.chat.id              // Chat ID
  ctx.chat.type            // 'private' | 'group' | 'supergroup'
  
  // Message
  ctx.message_id           // Message ID
  ctx.text                 // Text
  ctx.photo                // Photo (if present)
  ctx.document             // Document (if present)
});
```

In addition to the received set of properties, it also gets 2 mandatory properties:
- `ctx.update` - returns the complete [update](https://core.telegram.org/bots/api#update) object
- `ctx.payload` - returns an object of pre-set fields for processing EventContext methods

#### Methods
An EventContext instance will have the full set of methods available to BotContext (as in the [official documentation](https://core.telegram.org/bots/api#available-methods)). But with the difference that EventContext already has some pre-set properties: 


```javascript
// Responds to the sent message
bot.on('message', (ctx) => {
  ctx.sendMessage({
    // chat_id - set automatically, 
    // but can be overridden manually
    text: 'Hello! 👋',
    // message_thread_id - if the chat is a forum
    // parameter is added automatically
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: 'Button', callback_data: 'btn' }
      ]]
    }
  });
})
```

## 💡 Usage Examples

### Simple echo bot

```javascript
const bot = Telegrambo.createBot(TOKEN);

bot.on('message', (ctx) => {
  ctx.sendMessage({
    text: ctx.text || 'Send text'
  });
});

function doPost(e) {
  const update = JSON.parse(e.postData.contents);
  bot.setUpdate(update);
  return ContentService.createTextOutput('OK');
}
```

### Bot with commands and buttons

```javascript
const bot = Telegrambo.createBot(TOKEN);

bot.on('message', (ctx) => {
  const text = ctx.text;
  
  if (text === '/start') {
    ctx.sendMessage({
      text: `Hello, ${ctx.from.first_name}! 👋`,
      reply_markup: {
        keyboard: [
          [{ text: '📊 Statistics' }, { text: '❓ Help' }]
        ],
        resize_keyboard: true
      }
    });
  }
  
  else if (text === '/menu') {
    ctx.sendMessage({
      text: 'Select a section:',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📰 News', callback_data: 'news' }],
          [{ text: '⚙️ Settings', callback_data: 'settings' }]
        ]
      }
    });
  }
  
  else {
    ctx.sendMessage({ text: `Echo: ${text}` });
  }
});

bot.on('callback_query', (ctx) => {
  if (ctx.data === 'news') {
    ctx.answerCallbackQuery({ text: 'Loading...' });
    ctx.editMessageText({
      text: '📰 Latest news:\n\n• News 1\n• News 2'
    });
  }
  
  if (ctx.data === 'settings') {
    ctx.answerCallbackQuery({ text: 'Settings' });
    ctx.editMessageText({
      text: '⚙️ Settings:\n\nLanguage: English'
    });
  }
});
```

### Multi-step form

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
      text: '📝 Registration\n\nWhat is your name?',
      reply_markup: { force_reply: true }
    });
    return;
  }
  
  switch (state.step) {
    case 'awaiting_name':
      state.data.name = text;
      state.step = 'awaiting_age';
      userStates.set(userId, state);
      ctx.sendMessage({ text: 'How old are you?' });
      break;
      
    case 'awaiting_age':
      const age = parseInt(text);
      if (isNaN(age)) {
        ctx.sendMessage({ text: '❌ Please enter a number' });
        return;
      }
      
      state.data.age = age;
      ctx.sendMessage({
        text: `✅ Registration complete!\n\nName: ${state.data.name}\nAge: ${state.data.age}`
      });
      
      userStates.delete(userId);
      break;
  }
});
```

### Sending files from Google Drive

```javascript
bot.on('message', (ctx) => {
  if (ctx.text === '/report') {
    // PDF from Google Sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const blob = ss.getAs('application/pdf');
    blob.setName('report.pdf');
    
    ctx.sendDocument({
      document: blob,
      caption: '📊 Your report'
    });
  }
  
  if (ctx.text === '/photo') {
    // Photo from Drive
    const file = DriveApp.getFileById('FILE_ID');
    ctx.sendPhoto({
      photo: file.getBlob(),
      caption: '📷 Photo from Google Drive'
    });
  }
});
```

### Channel subscription check

```javascript
const CHANNEL = '@your_channel';

bot.on('message', (ctx) => {
  const member = bot.getChatMember({
    chat_id: CHANNEL,
    user_id: ctx.from.id
  });
  
  if (['left', 'kicked'].includes(member.result.status)) {
    ctx.sendMessage({
      text: '⚠️ Subscribe to the channel:',
      reply_markup: {
        inline_keyboard: [[
          { text: 'Subscribe', url: `https://t.me/${CHANNEL.slice(1)}` }
        ]]
      }
    });
    return;
  }
  
  ctx.sendMessage({ text: 'Welcome! 🎉' });
});
```

---

## 🔧 Additional Methods

### Webhook Management

```javascript
// Set webhook
bot.setWebhook({ 
  url: 'YOUR_URL',
  drop_pending_updates: true 
});

// Delete webhook
bot.deleteWebhook();

// Webhook information
const info = bot.getWebhookInfo();
Logger.log(info);
```

### Getting Information

```javascript
// About the bot
const me = bot.getMe();
Logger.log(me.result.username);

// About the chat
const chat = bot.getChat({ chat_id: 123456789 });

// About the user in the chat
const member = bot.getChatMember({
  chat_id: 123456789,
  user_id: 987654321
});
```

### Working with files

```javascript
// Get file
const fileInfo = bot.getFile({ file_id: 'FILE_ID' });
const filePath = fileInfo.result.file_path;

// Download file
const url = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
const blob = UrlFetchApp.fetch(url).getBlob();

// Save to Drive
DriveApp.createFile(blob);
```

---

## ⚠️ Error Handling

The library throws specific errors:

- `ResponseError` — Telegram API error
- `PayloadValidationError` — invalid request parameters
- `BotContextError` — bot context error
- `EventContextError` — event context error

```javascript
bot.on('message', (ctx) => {
  try {
    ctx.sendMessage({ text: 'OK' });
  } catch (e) {
    if (e.name === 'ResponseError') {
      Logger.log(`API Error ${e.code}: ${e.message}`);
      ctx.sendMessage({ text: '⚠️ An error occurred' });
    } else {
      throw e;
    }
  }
});
```

---

## 📋 Supported Telegram Bot API Methods

The library supports all [Telegram Bot API](https://core.telegram.org/bots/api#available-methods) methods. Any method can be called through the context or directly through the bot:

```javascript
bot.on('message', (ctx) => {
  // Through context (chat_id is automatically added)
  ctx.sendMessage({ text: 'Hello' });
  ctx.sendPhoto({ photo: blob });
})

// Through the bot (chat_id needs to be specified)
bot.sendMessage({ 
  chat_id: 123456789,
  text: 'Hello' 
});
```
---

## 🎨 Text Formatting

### Markdown

```javascript
ctx.sendMessage({
  text: '*Bold* _italic_ `code` [link](https://google.com)',
  parse_mode: 'MarkdownV2'
});
```

### HTML

```javascript
ctx.sendMessage({
  text: '<b>Bold</b> <i>italic</i> <code>code</code> <a href="https://google.com">link</a>',
  parse_mode: 'HTML'
});
```

---

## 🔐 Security

### Token Protection

Do not store the token in the code! Use Properties Service:

```javascript
// Save token (once)
function saveToken() {
  PropertiesService.getScriptProperties()
    .setProperty('BOT_TOKEN', 'YOUR_TOKEN');
}

// Use
const TOKEN = PropertiesService.getScriptProperties()
  .getProperty('BOT_TOKEN');

const bot = Telegrambo.createBot(TOKEN);
```

### Sender Verification

```javascript
const ADMIN_IDS = [123456789];

bot.on('message', (ctx) => {
  if (!ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.sendMessage({ text: '⛔ Access denied' });
  }
  
  // Code for admins
});
```

---

## 🐛 Debugging

### Logging

```javascript
bot.on('message', (ctx) => {
  Logger.log('Update:', ctx.update);
  Logger.log('User:', ctx.from);
  Logger.log('Text:', ctx.text);
});
```

### Webhook Check

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

## 📄 License

MIT License

---

## 🔗 Useful Links

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [BotFather](https://t.me/BotFather) — creating bots
- [Telegram Bot API Updates](https://core.telegram.org/bots/api#recent-changes)

---

## 💬 Support

If you have questions or issues:

1. Check the [examples](#-usage-examples)
2. Review the [API documentation](#api-reference)
3. Create an Issue in the repository

---

<p align="center">
  Made with ❤️ for the Google Apps Script community
</p>
