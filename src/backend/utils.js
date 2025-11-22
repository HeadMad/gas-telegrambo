/**
 * Creates a handler storage object.
 *
 * @return {Object} The handler storage object with the following methods:
 *   - has: a function that checks if a given type has any handlers
 *   - get: a function that retrieves the handlers for a given type
 *   - add: a function that adds a handler to the storage for a given type
 */
const createHandlerStorage = () => {
  var storage = new Map();

  return {
    has: type => storage.has(type),
    get: type => storage.get(type),
    add(type, handler) {
      if (storage.has(type))
        storage.get(type).push(handler);
      else
        storage.set(type, [handler]);
    }
  };
}