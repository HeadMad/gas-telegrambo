const isBlob = (value) => typeof value.copyBlob === 'function';


/**
 * Builds multipart/form-data options from payload
 * 
 * @param {Object} payloadEntries - Request payload
 * @returns {Object} Request options with multipart body
 */
const buildMultipartOptions = (payload) => {
  var boundary = '----Bot' + Date.now();
  var eol = '\r\n';
  var eolBites = Utilities.newBlob(eol).getBytes();
  var parts = [];
  var attachCounter = 0;


  const addText = (name, value) => {
    parts.push(Utilities.newBlob(
      '--' + boundary + eol +
      'Content-Disposition: form-data; name="' + name + '"' + eol + eol +
      value + eol
    ).getBytes());
  };

  const addFile = (name, blob) => {
    parts.push(Utilities.newBlob(
      '--' + boundary + eol +
      'Content-Disposition: form-data; name="' + name + '"; filename="' + (blob.getName() || 'file') + '"' + eol +
      'Content-Type: ' + (blob.getContentType() || 'application/octet-stream') + eol + eol
    ).getBytes(),
    blob.getBytes(),
    eolBites);
  };


  for (const [key, value] of Object.entries(payload)) {
    if (key === 'media') {
      var media = [];
      for (var i = 0; i < value.length; i++) {
        var item = { ...value[i] };

        if (isBlob(item.media)) {
          var name = 'attach_' + attachCounter++;
          addFile(name, item.media);
          item.media = 'attach://' + name;
        }
        media.push(item);
      }
      addText(key, JSON.stringify(media));
      continue;
    }

    // File field
    if (isBlob(value)) {
      addFile(key, value);
      continue;
    }

    // Regular field
    var text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    addText(key, text);
  }

  parts.push(Utilities.newBlob('--' + boundary + '--' + eol).getBytes());

  // Flatten bytes
  var bytes = parts.flat();

  return {
    method: 'POST',
    contentType: 'multipart/form-data; boundary=' + boundary,
    payload: bytes
  };
};

const prepareRequestPayload = (payload) => {
  const stringFields = new Set(['chat_id', 'from_chat_id', 'text']);
  const prepared = {};

  for (const [key, value] of Object.entries(payload)) {
    if (stringFields.has(key))
      prepared[key] = String(value);

    else if (typeof value === 'object')
      prepared[key] = JSON.stringify(value);

    else
      prepared[key] = value;
  }
  return {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(prepared)
  }
};


/**
 * Create a request sender function that sends a request to the Telegram API.
 *
 * @param {string} token - The authentication token for the Telegram API.
 * @param {object} options - advanced parameters of fetch https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#advanced-parameters
 * @return {function} - A function that sends a request to the Telegram API.
 */
const RequestSender = (token, options = {}) => {

  return function (method, payload) {
    let hasBlob = Object.values(payload).some(isBlob) || ('media' in payload && payload.media.length && payload.media.some((item) => isBlob(item?.media)));

    var fetchOptions = hasBlob ? buildMultipartOptions(payload) : prepareRequestPayload(payload);

    var url = `https://api.telegram.org/bot${token}/${method}`;

    try {
      var httpResponse = UrlFetchApp.fetch(url, Object.assign(options, fetchOptions));
      var response = JSON.parse(httpResponse.getContentText());

      if (!response.ok) {
        throw new ResponseError(response.error_code, response.description);
      }

      return response;
    } catch (e) {
      if (e instanceof ResponseError) throw e;
      throw new ResponseError(0, 'Network error: ' + e.message);
    }
  }
}


