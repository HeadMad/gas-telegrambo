/**
 * Creates a BotContext object that handles event handling and processing.
 *
 * @param {RequestSender} requestSender - Function that accepts a method and payload.
 * @param {object} params - Optional parameters.
 * @param {string} params.match_separator - The separator used for event matching. Default is '::'.
 * @return {object} The BotContext object.
 */
const BotContext = (requestSender) => {
  const EVENTS = createHandlerStorage();
  const EVENT_CONTEXT_METHODS = new Map();
  const self = {};


  self.event = new Proxy(EVENT_CONTEXT_METHODS, {
    set(target, prop, value) {
      if (prop in target)
        throw new EventContextError(`Can't rewrite method "${prop}"`);

      if (typeof value !== 'function')
        throw new EventContextError(`New method "${prop}" must be a function`);

      target.set(prop, value);
      return true;
    }
  });

  /**
   * Attaches an event handler for a specific event or event match.
   *
   * @param {string|function} eventName - The event or event match to attach the handler to.
   * @param {function} eventHandler - The handler function to attach.
   */
  self.on = (eventName, eventHandler) => {
    if (typeof eventName === 'function') {
      eventHandler = eventName;
      eventName = null;
    }

    if (typeof eventHandler !== 'function') {
      throw new BotContextError('Event handler must be a function');
    }
    EVENTS.add(eventName, eventHandler);
  };

  /**
   * Processes the event payload and returns the list of handlers to be executed.
   *
   * @param {object} eventPayload - The payload of the event.
   * @return {array} The list of handlers to be executed.
   */
  self.setUpdate = (eventPayload) => {
    const eventName = Object.keys(eventPayload).find(key => key !== 'update_id');
    const eventContext = EventContext(requestSender, EVENT_CONTEXT_METHODS, eventName, eventPayload);

    const handlers = [
      ...runEventHandlers(eventName, eventName, eventContext),
      ...runEventHandlers(null, eventName, eventContext)
    ];

    return handlers;
  };


  /**
   * Run event handlers for a given trigger, event name, and event payload.
   *
   * @param {string} trigger - The trigger to run event handlers for.
   * @param {string} eventName - The name of the event.
   * @param {any} eventContext - The context of the event.
   * @return {Array} - An array containing the results of running the event handlers.
   */
  function runEventHandlers(trigger, eventName, eventContext) {
    const result = [];
    if (EVENTS.has(trigger)) {
      for (let handler of EVENTS.get(trigger))
        result.push(handler(eventContext, eventName));
    }

    return result.flat();
  }


  const botContextResult = new Proxy(self, {
    get: (target, prop) => target[prop]
      ?? ((requestPayload = {}) => requestSender(prop, requestPayload)),

    set(target, prop, value) {
      if (prop in target)
        throw new BotContextError(`Can't rewrite method "${prop}"`);

      if (typeof value !== 'function')
        throw new BotContextError(`New method "${prop}" must be a function`);

      target[prop] = value(botContextResult);
      return true;
    },
  });

  return botContextResult;
}

/**
 * @callback RequestSender - Synchronous function that accepts a method and payload.
 * @param {string} method - Telegram API method for the request.
 * @param {object} payload - The payload to send with the request.
 * @return {object} - The response from the Telegram API.
 */