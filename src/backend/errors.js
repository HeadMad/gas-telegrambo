
class EventContextError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EventContextError';
  }
}
class BotContextError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BotContextErrors';
  }
}


class PayloadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PayloadValidationError';
  }
}


class ResponseError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'ResponseError';
  }
}