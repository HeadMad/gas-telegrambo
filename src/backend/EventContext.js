/**
 * Creates a new EventContext object.
 *
 * @param {function} requestSender - The function used to send requests.
 * @param {Map} eventMethods - An Map object containing event methods.
 * @param {string} eventName - The name of the event.
 * @param {object} eventPayload - An object containing event data.
 * @return {object} The new EventContext object.
 */
const EventContext = (requestSender, eventMethods, eventName, eventPayload) => {
  const eventData = eventPayload[eventName];
  const contextPayload = EventContextPayload(eventName, eventData);

  const eventContextResult = new Proxy(eventData, {
    get(target, prop) {
      if (prop in target)
        return target[prop];

      if (prop === 'update')
        return eventPayload;

      if (prop === 'payload')
        return contextPayload;
     
      if (prop === 'has')
        return (field) => field in target;

      if (prop === 'result')
        return new Proxy({}, {
          get: (_, method) =>
            (requestPayload = {}) =>
              ({ method, ...contextPayload, ...requestPayload })
        });

      if (eventMethods.has(prop))
        return eventMethods.get(prop)(eventContextResult, eventName);

      return (requestPayload = {}) => requestSender(prop, { ...contextPayload, ...requestPayload });
    },
  });

  return eventContextResult;
}

/**
 * @callback requestSender - Synchronous function that accepts a method and payload.
 * @param {string} method - Telegram API method for the request.
 * @param {object} payload - The payload to send with the request.
 * @return {Object} - The response from the Telegram API.
 */