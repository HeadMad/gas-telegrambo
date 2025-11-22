/**
 * Creates a bot with the given token.
 *
 * @param {string} token - The token used to authenticate the bot.
 * @param {object} params - advanced parameters of fetch https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#advanced-parameters
 * @return {BotContext} The created bot context.
 */
function createBot(token, params) {
  const requestSender = RequestSender(token, params);
  return BotContext(requestSender);
}
