/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var pkg = __webpack_require__(/*! ./../../package.json */ "./node_modules/axios/package.json");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};
var currentVerArr = pkg.version.split('.');

/**
 * Compare package versions
 * @param {string} version
 * @param {string?} thanVersion
 * @returns {boolean}
 */
function isOlderVersion(version, thanVersion) {
  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
  var destVer = version.split('.');
  for (var i = 0; i < 3; i++) {
    if (pkgVersionArr[i] > destVer[i]) {
      return true;
    } else if (pkgVersionArr[i] < destVer[i]) {
      return false;
    }
  }
  return false;
}

/**
 * Transitional option validator
 * @param {function|boolean?} validator
 * @param {string?} version
 * @param {string} message
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  var isDeprecated = version && isOlderVersion(version);

  function formatMessage(opt, desc) {
    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed in ' + version));
    }

    if (isDeprecated && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  isOlderVersion: isOlderVersion,
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/css/style.scss":
/*!*********************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/css/style.scss ***!
  \*********************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@700&display=swap);"]);
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  background-color: #8ec5fc;\n}\n\n@keyframes preloader {\n  0% {\n    opacity: 100%;\n  }\n  100% {\n    opacity: 0%;\n  }\n}\n#preloader {\n  animation-name: preloader;\n  animation-duration: 3s;\n  animation-iteration-count: 1;\n}\n\n.logo-container {\n  margin: calc((100vh - 420px) / 2) auto 10px;\n  width: 170px;\n  height: 170px;\n}\n\nh1 {\n  font: 50px \"Josefin Sans\", sans-serif;\n  font-weight: bold;\n  text-align: center;\n  color: #3e5d75;\n  width: 90%;\n  margin: auto;\n}\n\nh3 {\n  font: 25px \"Montserrat\";\n  text-align: center;\n  margin: 10px auto;\n  color: #3e5d75;\n}\n\n.form-container {\n  border-radius: 50px;\n  display: flex;\n  align-items: center;\n  padding: 7.5px 15px;\n  border-radius: 25px;\n  border: none;\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\n  transition: all 0.3s ease;\n  width: 85%;\n  min-width: 100px;\n  max-width: 800px;\n  height: 50px;\n  background-color: white;\n  margin: 100px auto;\n}\n.form-container .form {\n  width: calc(100% - 50px);\n  height: 25px;\n}\n.form-container .form input {\n  width: 100%;\n  height: 100%;\n  border: none;\n  padding-left: 10px;\n  font: 16px \"Montserrat\";\n}\n.form-container .form input:focus {\n  outline: none;\n}\n\n.blur {\n  transition: all 0.25s ease;\n  transform: translate(0, 0);\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\n}\n\n.focus {\n  transition: all 0.25s ease;\n  transform: translate(0, -6px);\n  box-shadow: 0px 15px 25px 0px rgba(0, 0, 0, 0.25);\n}\n\n.search-icon {\n  transition: all 0.25s ease;\n  opacity: 0.7;\n  width: 25px;\n  height: 25px;\n}\n\n.pin-icon {\n  transition: all 0.3s ease;\n  opacity: 0.6;\n  margin-left: 1vmin;\n  width: 25px;\n  height: 25px;\n  cursor: pointer;\n}\n\n.pin-icon:hover {\n  transition: all 0.25s ease;\n  transform: translate(0, -6px);\n  opacity: 1;\n}\n\n.logo-result {\n  width: 70px;\n  height: 70px;\n  margin: 20px 20px 50px 20px;\n  cursor: pointer;\n}\n\n.form-result {\n  position: absolute;\n  top: 30px;\n  right: 20px;\n  width: calc(100% - 130px);\n  max-width: none;\n  margin: 0px;\n  transition: all 0.5s ease;\n}\n\n.scale-container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;\n  grid-template-rows: 1fr;\n  gap: 0px 0px;\n  width: 90%;\n  max-width: 500px;\n  height: 40px;\n  border-radius: 20px;\n  border: 3px solid #3e5d75;\n  margin: 0px auto;\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\n}\n\n.scale-hidden,\n.scale-unit-hidden {\n  visibility: hidden;\n  width: 0px;\n  height: 0px;\n}\n\n.scale-unit {\n  visibility: visible;\n  width: 100%;\n  height: 100%;\n}\n\n.scale-value {\n  width: 90%;\n  max-width: 500px;\n  display: flex;\n  justify-content: space-between;\n  margin: 40px auto 10px;\n}\n.scale-value p {\n  font: 20px \"Montserrat\";\n  color: #3e5d75;\n}\n\n.arrow-container {\n  width: calc(90% - 6px);\n  max-width: 494px;\n  margin: 10px auto;\n}\n.arrow-container .arrow-up {\n  width: 0;\n  height: 0;\n  border-left: 15px solid transparent;\n  border-right: 15px solid transparent;\n  border-bottom: 15px solid #3e5d75;\n}\n\n.result-container {\n  width: 90%;\n  margin: auto;\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 0px 0px;\n}\n.result-container .result {\n  border-radius: 20px;\n  border: 3px solid #3e5d75;\n  height: 150px;\n  width: 80%;\n  max-width: 500px;\n  margin: 20px auto;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\n}\n.result-container .result #aqi {\n  font: 60px \"Josefin Sans\", sans-serif;\n  color: #292e31;\n  text-align: center;\n}\n.result-container .result #quality {\n  font: 30px \"Montserrat\";\n  color: #292e31;\n  text-align: center;\n}\n\n.composition {\n  border-radius: 20px;\n  border: 3px solid #3e5d75;\n  padding: 20px;\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\n  margin-top: 40px;\n  background-color: #eeeeee;\n}\n.composition h3 {\n  font: 25px \"Montserrat\";\n  color: #292e31;\n  text-align: center;\n}\n\n.composition-div {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  margin: 20px auto;\n  border-bottom: 1px solid #c4ced3;\n  padding-bottom: 10px;\n  padding-top: 10px;\n}\n.composition-div p {\n  font: 20px \"Montserrat\";\n  color: #292e31;\n}\n\n.composition-div:last-of-type {\n  border-bottom: none;\n  padding-bottom: 0px;\n}\n\n.health {\n  border-radius: 20px;\n  border: 3px solid #3e5d75;\n  padding: 0px 20px 20px 20px;\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\n  margin: 40px auto;\n  background-color: #eeeeea;\n}\n.health strong {\n  font-size: 25px;\n  margin-left: calc(50% - 131px);\n}\n.health p {\n  font: 20px \"Montserrat\";\n  color: #292e31;\n  padding-top: 30px;\n}\n.health p:first-of-type {\n  border-bottom: 1px solid #c4ced3;\n  padding-bottom: 20px;\n}\n\n.notification {\n  position: absolute;\n  bottom: 20px;\n  right: 20px;\n  max-width: 300px;\n  padding: 20px;\n  background-color: #900;\n  border-radius: 20px;\n  transition: all 1s ease;\n}\n.notification p {\n  font: 18px \"Montserrat\";\n  color: #ffffff;\n}\n\n@media only screen and (min-width: 1080px) {\n  .logo-result {\n    width: 90px;\n    height: 90px;\n    margin: 20px 20px 50px 50px;\n  }\n\n  .form-container {\n    margin: 50px auto 150px;\n  }\n\n  .form-result {\n    margin: 0px;\n    left: 190px;\n    top: 40px;\n    width: calc(100% - 240px);\n  }\n\n  .result-container {\n    grid-template-columns: repeat(2, 1fr);\n    grid-column-gap: 30px;\n    margin-bottom: 60px;\n  }\n  .result-container .result {\n    grid-area: 1/1/2/3;\n  }\n  .result-container .composition {\n    grid-area: 2/1/3/2;\n  }\n  .result-container .health {\n    grid-area: 2/2/3/3;\n  }\n\n  .health {\n    margin-bottom: 0px;\n  }\n}", "",{"version":3,"sources":["webpack://./src/css/style.scss"],"names":[],"mappings":"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","sourcesContent":["$regular: \"Montserrat\";\r\n$bold: \"Josefin Sans\", sans-serif;\r\n\r\n@import url(\"https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@700&display=swap\");\r\n@import url(\"https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap\");\r\n\r\n* {\r\n  margin: 0;\r\n  padding: 0;\r\n  box-sizing: border-box;\r\n}\r\n\r\nbody {\r\n  background-color: #8ec5fc;\r\n  //background: linear-gradient(#e0c3fc, #8ec5fc);\r\n}\r\n\r\n@keyframes preloader {\r\n  0% {\r\n    opacity: 100%;\r\n  }\r\n  100% {\r\n    opacity: 0%;\r\n  }\r\n}\r\n#preloader {\r\n  animation-name: preloader;\r\n  animation-duration: 3s;\r\n  animation-iteration-count: 1;\r\n}\r\n\r\n.logo-container {\r\n  margin: calc((100vh - 420px) / 2) auto 10px;\r\n  width: 170px;\r\n  height: 170px;\r\n}\r\n\r\nh1 {\r\n  font: 50px $bold;\r\n  font-weight: bold;\r\n  text-align: center;\r\n  color: #3e5d75;\r\n  width: 90%;\r\n  margin: auto;\r\n}\r\n\r\nh3 {\r\n  font: 25px $regular;\r\n  text-align: center;\r\n  margin: 10px auto;\r\n  color: #3e5d75;\r\n}\r\n\r\n.form-container {\r\n  border-radius: 50px;\r\n  display: flex;\r\n  align-items: center;\r\n  padding: 7.5px 15px;\r\n  border-radius: 25px;\r\n  border: none;\r\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\r\n  transition: all 0.3s ease;\r\n  width: 85%;\r\n  min-width: 100px;\r\n  max-width: 800px;\r\n  height: 50px;\r\n  background-color: white;\r\n  margin: 100px auto;\r\n\r\n  .form {\r\n    width: calc(100% - 50px);\r\n    height: 25px;\r\n\r\n    input {\r\n      width: 100%;\r\n      height: 100%;\r\n      border: none;\r\n      padding-left: 10px;\r\n      font: 16px $regular;\r\n    }\r\n    input:focus {\r\n      outline: none;\r\n    }\r\n  }\r\n}\r\n\r\n.blur {\r\n  transition: all 0.25s ease;\r\n  transform: translate(0, 0);\r\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\r\n}\r\n.focus {\r\n  transition: all 0.25s ease;\r\n  transform: translate(0, -6px);\r\n  box-shadow: 0px 15px 25px 0px rgba(0, 0, 0, 0.25);\r\n}\r\n.search-icon {\r\n  transition: all 0.25s ease;\r\n  opacity: 0.7;\r\n  width: 25px;\r\n  height: 25px;\r\n}\r\n.pin-icon {\r\n  transition: all 0.3s ease;\r\n  opacity: 0.6;\r\n  margin-left: 1vmin;\r\n  width: 25px;\r\n  height: 25px;\r\n  cursor: pointer;\r\n}\r\n.pin-icon:hover {\r\n  transition: all 0.25s ease;\r\n  transform: translate(0, -6px);\r\n  opacity: 1;\r\n}\r\n\r\n.logo-result {\r\n  width: 70px;\r\n  height: 70px;\r\n  margin: 20px 20px 50px 20px;\r\n  cursor: pointer;\r\n}\r\n.form-result {\r\n  position: absolute;\r\n  top: 30px;\r\n  right: 20px;\r\n  width: calc(100% - 130px);\r\n  max-width: none;\r\n  margin: 0px;\r\n  transition: all 0.5s ease;\r\n}\r\n\r\n.scale-container {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;\r\n  grid-template-rows: 1fr;\r\n  gap: 0px 0px;\r\n  width: 90%;\r\n  max-width: 500px;\r\n  height: 40px;\r\n  border-radius: 20px;\r\n  border: 3px solid #3e5d75;\r\n  margin: 0px auto;\r\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\r\n}\r\n\r\n.scale-hidden,\r\n.scale-unit-hidden {\r\n  visibility: hidden;\r\n  width: 0px;\r\n  height: 0px;\r\n}\r\n\r\n.scale-unit {\r\n  visibility: visible;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n\r\n.scale-value {\r\n  width: 90%;\r\n  max-width: 500px;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  margin: 40px auto 10px;\r\n\r\n  p {\r\n    font: 20px $regular;\r\n    color: #3e5d75;\r\n  }\r\n}\r\n\r\n.arrow-container {\r\n  width: calc(90% - 6px);\r\n  max-width: 494px;\r\n  margin: 10px auto;\r\n\r\n  .arrow-up {\r\n    width: 0;\r\n    height: 0;\r\n    border-left: 15px solid transparent;\r\n    border-right: 15px solid transparent;\r\n    border-bottom: 15px solid #3e5d75;\r\n  }\r\n}\r\n\r\n.result-container {\r\n  width: 90%;\r\n  margin: auto;\r\n  display: grid;\r\n  grid-template-columns: 1fr;\r\n  gap: 0px 0px;\r\n\r\n  .result {\r\n    border-radius: 20px;\r\n    border: 3px solid #3e5d75;\r\n    height: 150px;\r\n    width: 80%;\r\n    max-width: 500px;\r\n    margin: 20px auto;\r\n    display: flex;\r\n    flex-direction: column;\r\n    align-items: center;\r\n    justify-content: center;\r\n    box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\r\n\r\n    #aqi {\r\n      font: 60px $bold;\r\n      color: #292e31;\r\n      text-align: center;\r\n    }\r\n    #quality {\r\n      font: 30px $regular;\r\n      color: #292e31;\r\n      text-align: center;\r\n    }\r\n  }\r\n}\r\n\r\n.composition {\r\n  border-radius: 20px;\r\n  border: 3px solid #3e5d75;\r\n  padding: 20px;\r\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\r\n  margin-top: 40px;\r\n  background-color: #eeeeee;\r\n\r\n  h3 {\r\n    font: 25px $regular;\r\n    color: #292e31;\r\n    text-align: center;\r\n  }\r\n}\r\n\r\n.composition-div {\r\n  display: flex;\r\n  flex-direction: row;\r\n  justify-content: space-between;\r\n  margin: 20px auto;\r\n  border-bottom: 1px solid #c4ced3;\r\n  padding-bottom: 10px;\r\n  padding-top: 10px;\r\n\r\n  p {\r\n    font: 20px $regular;\r\n    color: #292e31;\r\n  }\r\n}\r\n.composition-div:last-of-type {\r\n  border-bottom: none;\r\n  padding-bottom: 0px;\r\n}\r\n\r\n.health {\r\n  border-radius: 20px;\r\n  border: 3px solid #3e5d75;\r\n  padding: 0px 20px 20px 20px;\r\n  box-shadow: 0px 8px 25px 0px rgba(0, 0, 0, 0.15);\r\n  margin: 40px auto;\r\n  background-color: #eeeeea;\r\n\r\n  strong {\r\n    font-size: 25px;\r\n    margin-left: calc(50% - 131px);\r\n  }\r\n  p {\r\n    font: 20px $regular;\r\n    color: #292e31;\r\n    padding-top: 30px;\r\n  }\r\n  p:first-of-type {\r\n    border-bottom: 1px solid #c4ced3;\r\n    padding-bottom: 20px;\r\n  }\r\n}\r\n\r\n.notification {\r\n  position: absolute;\r\n  bottom: 20px;\r\n  right: 20px;\r\n  max-width: 300px;\r\n  padding: 20px;\r\n  background-color: #900;\r\n  border-radius: 20px;\r\n  transition: all 1s ease;\r\n\r\n  p {\r\n    font: 18px $regular;\r\n    color: #ffffff;\r\n  }\r\n}\r\n\r\n//media queries\r\n\r\n@media only screen and (min-width: 1080px) {\r\n  .logo-result {\r\n    width: 90px;\r\n    height: 90px;\r\n    margin: 20px 20px 50px 50px;\r\n  }\r\n  .form-container {\r\n    margin: 50px auto 150px;\r\n  }\r\n  .form-result {\r\n    margin: 0px;\r\n    left: 190px;\r\n    top: 40px;\r\n    width: calc(100% - 240px);\r\n  }\r\n\r\n  .result-container {\r\n    grid-template-columns: repeat(2, 1fr);\r\n    grid-column-gap: 30px;\r\n    margin-bottom: 60px;\r\n\r\n    .result {\r\n      grid-area: 1 / 1 / 2 / 3;\r\n    }\r\n\r\n    .composition {\r\n      grid-area: 2 / 1 / 3 / 2;\r\n    }\r\n\r\n    .health {\r\n      grid-area: 2 / 2 / 3 / 3;\r\n    }\r\n  }\r\n  .health {\r\n    margin-bottom: 0px;\r\n  }\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var _i = 0; _i < this.length; _i++) {
        var id = this[_i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i2 = 0; _i2 < modules.length; _i2++) {
      var item = [].concat(modules[_i2]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/css/style.scss":
/*!****************************!*\
  !*** ./src/css/style.scss ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/sass-loader/dist/cjs.js!./style.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/css/style.scss");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/img/air-quality-blue.svg":
/*!**************************************!*\
  !*** ./src/img/air-quality-blue.svg ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNS40LjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCIgWw0KCTwhRU5USVRZIG5zX2V4dGVuZCAiaHR0cDovL25zLmFkb2JlLmNvbS9FeHRlbnNpYmlsaXR5LzEuMC8iPg0KCTwhRU5USVRZIG5zX2FpICJodHRwOi8vbnMuYWRvYmUuY29tL0Fkb2JlSWxsdXN0cmF0b3IvMTAuMC8iPg0KCTwhRU5USVRZIG5zX2dyYXBocyAiaHR0cDovL25zLmFkb2JlLmNvbS9HcmFwaHMvMS4wLyI+DQoJPCFFTlRJVFkgbnNfdmFycyAiaHR0cDovL25zLmFkb2JlLmNvbS9WYXJpYWJsZXMvMS4wLyI+DQoJPCFFTlRJVFkgbnNfaW1yZXAgImh0dHA6Ly9ucy5hZG9iZS5jb20vSW1hZ2VSZXBsYWNlbWVudC8xLjAvIj4NCgk8IUVOVElUWSBuc19zZncgImh0dHA6Ly9ucy5hZG9iZS5jb20vU2F2ZUZvcldlYi8xLjAvIj4NCgk8IUVOVElUWSBuc19jdXN0b20gImh0dHA6Ly9ucy5hZG9iZS5jb20vR2VuZXJpY0N1c3RvbU5hbWVzcGFjZS8xLjAvIj4NCgk8IUVOVElUWSBuc19hZG9iZV94cGF0aCAiaHR0cDovL25zLmFkb2JlLmNvbS9YUGF0aC8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxpdmVsbG9fMSIgeG1sbnM6eD0iJm5zX2V4dGVuZDsiIHhtbG5zOmk9IiZuc19haTsiIHhtbG5zOmdyYXBoPSImbnNfZ3JhcGhzOyINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0MDAwIDQwMDAiDQoJIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQwMDAgNDAwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuT21icmFfeDAwMjBfZXN0ZXJuYXtmaWxsOm5vbmU7fQ0KCS5CYWdsaW9yZV94MDAyMF9lc3Rlcm5vX3gwMDIwXzVfeDAwMjBfcHR7ZmlsbDpub25lO30NCgkuSml2ZV9HU3tmaWxsOiNBNkQwRTQ7fQ0KCS5zdDB7ZmlsbDojMDU1MTU5O30NCjwvc3R5bGU+DQo8bWV0YWRhdGE+DQoJPHNmdyAgeG1sbnM9IiZuc19zZnc7Ij4NCgkJPHNsaWNlcz48L3NsaWNlcz4NCgkJPHNsaWNlU291cmNlQm91bmRzICBib3R0b21MZWZ0T3JpZ2luPSJ0cnVlIiBoZWlnaHQ9IjM5OTcuOCIgd2lkdGg9IjM5NzUuOSIgeD0iMTgiIHk9Ii00MDA2LjgiPjwvc2xpY2VTb3VyY2VCb3VuZHM+DQoJPC9zZnc+DQo8L21ldGFkYXRhPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zNjcwLjEsMjAwOGMtMC4xLDgzLjgtNS43LDE2Ny41LTE2LjgsMjUwLjVjMS45LTE0LjQsMy45LTI4LjcsNS44LTQzLjFjLTIyLDE2MC45LTY1LjEsMzE4LjMtMTI4LjEsNDY3LjkNCgkJCWM1LjQtMTIuOSwxMC45LTI1LjgsMTYuMy0zOC43Yy02MS45LDE0NS45LTE0Mi40LDI4My40LTIzOS4yLDQwOC45YzguNC0xMC45LDE2LjktMjEuOSwyNS4zLTMyLjgNCgkJCWMtOTUuNCwxMjMtMjA1LjksMjMzLjctMzI4LjksMzI5LjFjMTAuOS04LjQsMjEuOS0xNi45LDMyLjgtMjUuM2MtMTI1LjEsOTYuNi0yNjIuMiwxNzctNDA3LjgsMjM4LjYNCgkJCWMxMi45LTUuNCwyNS44LTEwLjksMzguNy0xNi4zYy0xNDcuNSw2MS45LTMwMi42LDEwNC4yLTQ2MS4xLDEyNS43YzE0LjQtMS45LDI4LjctMy45LDQzLjEtNS44Yy0xNjEuOSwyMS41LTMyNi4yLDIxLjUtNDg4LjEsMA0KCQkJYzE0LjQsMS45LDI4LjcsMy45LDQzLjEsNS44Yy0xNTguNS0yMS41LTMxMy42LTYzLjgtNDYxLjEtMTI1LjdjMTIuOSw1LjQsMjUuOCwxMC45LDM4LjcsMTYuMw0KCQkJYy0xNDUuNi02MS42LTI4Mi43LTE0MS45LTQwNy44LTIzOC42YzEwLjksOC40LDIxLjksMTYuOSwzMi44LDI1LjNjLTEyMi45LTk1LjUtMjMzLjUtMjA2LjEtMzI4LjktMzI5LjENCgkJCWM4LjQsMTAuOSwxNi45LDIxLjksMjUuMywzMi44Yy05Ni44LTEyNS41LTE3Ny4zLTI2My0yMzkuMi00MDguOWM1LjQsMTIuOSwxMC45LDI1LjgsMTYuMywzOC43Yy02My0xNDkuNi0xMDYuMS0zMDctMTI4LjEtNDY3LjkNCgkJCWMxLjksMTQuNCwzLjksMjguNyw1LjgsNDMuMWMtMjIuMy0xNjYuMi0yMi4zLTMzNC45LDAtNTAxYy0xLjksMTQuNC0zLjksMjguNy01LjgsNDMuMWMyMi0xNjAuOSw2NS4xLTMxOC4zLDEyOC4xLTQ2Ny45DQoJCQljLTUuNCwxMi45LTEwLjksMjUuOC0xNi4zLDM4LjdjNjEuOS0xNDUuOSwxNDIuNC0yODMuNCwyMzkuMi00MDguOWMtOC40LDEwLjktMTYuOSwyMS45LTI1LjMsMzIuOA0KCQkJYzk1LjQtMTIzLDIwNS45LTIzMy43LDMyOC45LTMyOS4xYy0xMC45LDguNC0yMS45LDE2LjktMzIuOCwyNS4zYzEyNS4xLTk2LjYsMjYyLjItMTc3LDQwNy44LTIzOC42DQoJCQljLTEyLjksNS40LTI1LjgsMTAuOS0zOC43LDE2LjNjMTQ3LjUtNjEuOSwzMDIuNi0xMDQuMiw0NjEuMS0xMjUuN2MtMTQuNCwxLjktMjguNywzLjktNDMuMSw1LjhjMTYxLjktMjEuNSwzMjYuMi0yMS41LDQ4OC4xLDANCgkJCWMtMTQuNC0xLjktMjguNy0zLjktNDMuMS01LjhjMTU4LjUsMjEuNSwzMTMuNiw2My44LDQ2MS4xLDEyNS43Yy0xMi45LTUuNC0yNS44LTEwLjktMzguNy0xNi4zDQoJCQljMTQ1LjYsNjEuNiwyODIuNywxNDEuOSw0MDcuOCwyMzguNmMtMTAuOS04LjQtMjEuOS0xNi45LTMyLjgtMjUuM2MxMjIuOSw5NS41LDIzMy41LDIwNi4xLDMyOC45LDMyOS4xDQoJCQljLTguNC0xMC45LTE2LjktMjEuOS0yNS4zLTMyLjhjOTYuOCwxMjUuNSwxNzcuMywyNjMsMjM5LjIsNDA4LjljLTUuNC0xMi45LTEwLjktMjUuOC0xNi4zLTM4LjdjNjMsMTQ5LjYsMTA2LjEsMzA3LDEyOC4xLDQ2Ny45DQoJCQljLTEuOS0xNC40LTMuOS0yOC43LTUuOC00My4xQzM2NjQuNCwxODQwLjUsMzY2OS45LDE5MjQuMiwzNjcwLjEsMjAwOGMwLjEsNDEuNiwxOCw4NS4xLDQ3LjQsMTE0LjUNCgkJCWMyOC4xLDI4LjEsNzQuMiw0OS4yLDExNC41LDQ3LjRjODcuNi0zLjksMTYyLjEtNzEuMiwxNjEuOS0xNjEuOWMtMC4zLTIwNi40LTMxLjUtNDE1LjUtOTUtNjEyDQoJCQljLTYxLjQtMTg5LjctMTQ5LjktMzcyLjMtMjY1LjMtNTM1LjFjLTYwLjMtODUuMS0xMjYuMi0xNjctMTk4LjQtMjQyLjNjLTcyLjUtNzUuNi0xNTEuNi0xNDMtMjM0LjUtMjA2LjkNCgkJCWMtMTU4LjEtMTIxLjktMzM0LjMtMjE1LjMtNTIxLjQtMjg0LjVjLTE5MS45LTcxLTM5Ny0xMDguOC02MDEuMy0xMTYuOGMtMjA2LjEtOC4xLTQxNi41LDE3LjQtNjE0LjgsNzQNCgkJCWMtMTkxLjIsNTQuNi0zNzYuNywxMzguOC01NDIuNCwyNDguN2MtMTY0LjQsMTA5LTMxNC43LDI0MC43LTQzOS43LDM5My41Yy02Ni4zLDgxLTEyOC4yLDE2NS44LTE4MS44LDI1NS44DQoJCQljLTU0LjMsOTEtOTguOSwxODYuNS0xMzksMjg0LjVDODIuNiwxNDU3LDM5LjQsMTY1OS4yLDIzLjYsMTg2My43Yy0xNi4xLDIwNy45LDIuOSw0MjAuMiw1MS44LDYyMi43DQoJCQljNDcsMTk0LjUsMTI1LjUsMzg0LjIsMjI4LjgsNTU1LjRjMTAxLjcsMTY4LjYsMjI5LjMsMzI0LjUsMzc2LjMsNDU1LjZjMTQ3LDEzMS4xLDMxMi4zLDI0My4yLDQ5MS44LDMyNC44DQoJCQljOTcuNCw0NC4zLDE5Ny40LDgzLDMwMC41LDExMS45YzEwNC42LDI5LjMsMjExLjQsNDcuNiwzMTkuMiw2MC4yYzIwNy4xLDI0LjMsNDE3LjksMTEuNyw2MjItMzANCgkJCWMxOTYuMS00MCwzODcuMy0xMTMuMyw1NjEuOC0yMTEuMmMxNzEuNS05Ni4yLDMzMC42LTIyMC4yLDQ2Ni0zNjIuOWMxMzUuMy0xNDIuNywyNTItMzA2LjIsMzM5LjMtNDgyLjUNCgkJCWM5MC0xODEuNywxNTUuMi0zNzUuNywxODUuOC01NzYuM2MxNi40LTEwNy4zLDI2LjgtMjE1LDI2LjktMzIzLjZjMC4xLTQxLjUtMTguMS04NS4yLTQ3LjQtMTE0LjUNCgkJCWMtMjguMS0yOC4xLTc0LjItNDkuMi0xMTQuNS00Ny40QzM3NDQuMiwxODUwLDM2NzAuMiwxOTE3LjIsMzY3MC4xLDIwMDh6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik02MjcuMiwyNzE5LjJjNy41LTEyLjIsMTUtMjQuNCwyMi41LTM2LjZjMjAuNC0zMy4yLDQwLjktNjYuNCw2MS4zLTk5LjZjMzAuMi00OS4xLDYwLjUtOTguMiw5MC43LTE0Ny4zDQoJCQljMzYuOS01OS45LDczLjgtMTE5LjgsMTEwLjctMTc5LjdjNDAuNC02NS42LDgwLjgtMTMxLjIsMTIxLjItMTk2LjhjNDAuOC02Ni4yLDgxLjYtMTMyLjUsMTIyLjQtMTk4LjcNCgkJCWMzOC02MS44LDc2LjEtMTIzLjUsMTE0LjEtMTg1LjNjMzIuMi01Mi4yLDY0LjMtMTA0LjQsOTYuNS0xNTYuNmMyMy4xLTM3LjUsNDYuMi03NS4xLDY5LjQtMTEyLjZjMTEtMTcuOCwyMi0zNS42LDMyLjktNTMuNA0KCQkJYzAuNS0wLjgsMC45LTEuNSwxLjQtMi4zYzEyLjctMjAsMTkuNi00MS41LDIwLjYtNjQuN2M1LjItMjMuMSw0LjEtNDYuMy0zLjEtNjkuNGMtNS40LTIyLjYtMTUuOC00Mi40LTMxLjEtNTkuMg0KCQkJYy0xMi4zLTE4LjktMjguNS0zMy45LTQ4LjgtNDQuOGMtMTMuOS01LjgtMjcuNy0xMS43LTQxLjYtMTcuNWMtMzAuOC04LjMtNjEuNy04LjMtOTIuNSwwYy0xMy45LDUuOC0yNy43LDExLjctNDEuNiwxNy41DQoJCQljLTI2LjEsMTUuNS00NywzNi4zLTYyLjQsNjIuNGMtNy41LDEyLjItMTUsMjQuNC0yMi41LDM2LjZjLTIwLjQsMzMuMi00MC45LDY2LjQtNjEuMyw5OS42Yy0zMC4yLDQ5LjEtNjAuNSw5OC4yLTkwLjcsMTQ3LjMNCgkJCWMtMzYuOSw1OS45LTczLjgsMTE5LjgtMTEwLjcsMTc5LjdjLTQwLjQsNjUuNi04MC44LDEzMS4yLTEyMS4yLDE5Ni44Yy00MC44LDY2LjItODEuNiwxMzIuNS0xMjIuNCwxOTguNw0KCQkJYy0zOCw2MS44LTc2LjEsMTIzLjUtMTE0LjEsMTg1LjNjLTMyLjIsNTIuMi02NC4zLDEwNC40LTk2LjUsMTU2LjZjLTIzLjEsMzcuNS00Ni4yLDc1LjEtNjkuNCwxMTIuNmMtMTEsMTcuOC0yMiwzNS42LTMyLjksNTMuNA0KCQkJYy0wLjUsMC44LTAuOSwxLjUtMS40LDIuM2MtMTIuNywyMC0xOS42LDQxLjUtMjAuNiw2NC43Yy01LjIsMjMuMS00LjEsNDYuMywzLjEsNjkuNGM1LjQsMjIuNiwxNS44LDQyLjQsMzEuMSw1OS4yDQoJCQljMTIuMywxOC45LDI4LjUsMzMuOSw0OC44LDQ0LjhjMTMuOSw1LjgsMjcuNywxMS43LDQxLjYsMTcuNWMzMC44LDguMyw2MS43LDguMyw5Mi41LDBjMTMuOS01LjgsMjcuNy0xMS43LDQxLjYtMTcuNQ0KCQkJQzU5MSwyNzY2LjIsNjExLjgsMjc0NS4zLDYyNy4yLDI3MTkuMkw2MjcuMiwyNzE5LjJ6Ii8+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMTY5LjksMTM1MC41YzYsOS42LDEyLDE5LjIsMTgsMjguOGMxNi4yLDI2LDMyLjMsNTEuOSw0OC41LDc3LjljMjQsMzguNiw0OC4xLDc3LjIsNzIuMSwxMTUuOA0KCQkJYzI5LjIsNDYuOCw1OC4zLDkzLjcsODcuNSwxNDAuNWMzMi4xLDUxLjYsNjQuMiwxMDMuMiw5Ni4zLDE1NC44YzMyLjIsNTEuOCw2NC41LDEwMy41LDk2LjcsMTU1LjMNCgkJCWMzMC4yLDQ4LjUsNjAuNCw5Ny4xLDkwLjcsMTQ1LjZjMjUuNCw0MC44LDUwLjgsODEuNiw3Ni4yLDEyMi40YzE4LjQsMjkuNSwzNi43LDU5LDU1LjEsODguNWM4LjYsMTMuOSwxNy4yLDI3LjgsMjUuOSw0MS42DQoJCQljMC40LDAuNiwwLjcsMS4yLDEuMSwxLjhjMTAuOSwyMC4zLDI1LjksMzYuNiw0NC44LDQ4LjhjMTYuOCwxNS40LDM2LjUsMjUuOCw1OS4yLDMxLjFjMjMuMSw3LjMsNDYuMyw4LjMsNjkuNCwzLjENCgkJCWMyMy4yLTEuMSw0NC43LTcuOSw2NC43LTIwLjZjMTEuNy05LjEsMjMuNS0xOC4xLDM1LjItMjcuMmMyMS42LTIxLjcsMzYuNS00Ny4zLDQ0LjctNzYuOGMyLjEtMTUuNCw0LjEtMzAuOCw2LjItNDYuMw0KCQkJYy0wLjEtMzEuNC04LTYwLjctMjMuOC04Ny44Yy02LTkuNi0xMi0xOS4yLTE4LTI4LjhjLTE2LjItMjYtMzIuMy01MS45LTQ4LjUtNzcuOWMtMjQtMzguNi00OC4xLTc3LjItNzIuMS0xMTUuOA0KCQkJYy0yOS4yLTQ2LjgtNTguMy05My43LTg3LjUtMTQwLjVjLTMyLjEtNTEuNi02NC4yLTEwMy4yLTk2LjMtMTU0LjhjLTMyLjItNTEuOC02NC41LTEwMy41LTk2LjctMTU1LjMNCgkJCWMtMzAuMi00OC41LTYwLjQtOTcuMS05MC43LTE0NS42Yy0yNS40LTQwLjgtNTAuOC04MS42LTc2LjItMTIyLjRjLTE4LjQtMjkuNS0zNi43LTU5LTU1LjEtODguNWMtOC42LTEzLjktMTcuMi0yNy44LTI1LjktNDEuNg0KCQkJYy0wLjQtMC42LTAuNy0xLjItMS4xLTEuOGMtMTAuOS0yMC4zLTI1LjktMzYuNi00NC44LTQ4LjhjLTE2LjgtMTUuNC0zNi41LTI1LjgtNTkuMi0zMS4xYy0yMy4xLTcuMy00Ni4zLTguMy02OS40LTMuMQ0KCQkJYy0yMy4yLDEuMS00NC43LDcuOS02NC43LDIwLjZjLTExLjcsOS4xLTIzLjUsMTguMS0zNS4yLDI3LjJjLTIxLjYsMjEuNy0zNi41LDQ3LjMtNDQuNyw3Ni44Yy0yLjEsMTUuNC00LjEsMzAuOC02LjIsNDYuMw0KCQkJQzExNDYuMiwxMjk0LjEsMTE1NC4xLDEzMjMuNCwxMTY5LjksMTM1MC41TDExNjkuOSwxMzUwLjV6Ii8+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zNDQzLjEsMTkwOC43Yy0wLjEtNTMuMi02LjctMTA2LjEtMTUtMTU4LjZjLTUuOC0zNi41LTE0LjQtNzIuNS0yNS45LTEwNy43Yy01LjctMTcuNS0xMi0zNC43LTE5LjEtNTEuNw0KCQkJYy0xMi41LTMwLjItMjQuOS02MC41LTM5LjYtODkuNmMtMTYuMi0zMi4xLTM0LjgtNjMtNTUuNy05Mi4zYy0yOS4xLTQwLjgtNjAuMy04MC45LTk1LjEtMTE3Yy0zNS4xLTM2LjQtNzQuMy02Ny4zLTExNC40LTk4DQoJCQljLTY5LjMtNTMuMS0xNDcuNy05MS4xLTIyOS41LTEyMS4xYy0zNC41LTEyLjctNzAtMjIuNi0xMDYuMS0yOS44Yy0zMy4xLTYuNi02Ni43LTEwLjgtMTAwLjItMTQuOGMtMTktMi4zLTM4LjEtMy44LTU3LjItNC41DQoJCQljLTM4LjQtMS41LTc3LDAuMS0xMTUuMiw0LjdjLTUxLjksNi4zLTEwMy4yLDEzLjYtMTUzLjUsMjcuOGMtNDkuMiwxMy45LTk2LjgsMzMuNy0xNDMuMiw1NWMtMzIuOCwxNS02NC40LDMyLjUtOTQuNSw1Mi4zDQoJCQljLTQxLjksMjcuNi04Mi4xLDU4LjYtMTE5LjUsOTIuMWMtMjYuOSwyNC4xLTUxLjksNTAuMi03NC44LDc4Yy0zMS43LDM4LjUtNjIuNCw3OC42LTg4LjEsMTIxLjVjLTI2LjMsNDMuOC00Ni4zLDkwLjItNjUuNywxMzcuNQ0KCQkJYy0zNCw4Mi44LTUwLjIsMTcxLjUtNTcuMSwyNjAuNWMtMywzOC40LTIuOSw3Ny4xLDAuMywxMTUuNmMyLjgsMzMuNyw3LjUsNjcuNCwxMi45LDEwMC44YzIuOSwxOC4yLDYuNiwzNi4yLDEwLjksNTQuMQ0KCQkJYzguNywzNS45LDIwLjMsNzEsMzQuNCwxMDUuMWMxOS41LDQ2LjksMzkuMyw5Mi45LDY1LjcsMTM2LjRjMjYuMSw0Myw1Ni45LDgzLjMsODkuMSwxMjEuOWMyMy4xLDI3LjcsNDguMiw1My43LDc1LjIsNzcuNg0KCQkJYzI0LjEsMjEuNCw0OS45LDQwLjksNzUuNiw2MC40YzE0LjEsMTAuOCwyOC42LDIxLDQzLjUsMzAuN2MzMC41LDE5LjksNjIuNCwzNy40LDk1LjYsNTIuM2M0Ni4zLDIwLjksOTMuNSw0MC41LDE0Mi41LDU0LjINCgkJCWM1MC42LDE0LjEsMTAyLjUsMjEuNCwxNTQuNiwyNy41YzkwLjQsMTAuNSwxODIuNiwyLjUsMjcxLjUtMTUuNmMzNi4zLTcuNCw3Mi4xLTE3LjYsMTA2LjgtMzAuNWM0Ny4yLTE3LjYsOTQuMi0zNy43LDEzOC40LTYyLjINCgkJCWM0NC40LTI0LjcsODQuMi01NC44LDEyNC4yLTg1LjljMjguNS0yMi4xLDU1LjQtNDYuMiw4MC4zLTcyLjRjMzQuNC0zNi4xLDY1LjQtNzUuOSw5NC4xLTExNi42YzIwLjktMjkuNiwzOS42LTYwLjksNTUuNy05My40DQoJCQljMTQuNS0yOS4yLDI3LTU5LjYsMzkuMy04OS44YzYuOC0xNi43LDEzLTMzLjcsMTguNS01MC45YzExLjQtMzUuNSwxOS45LTcyLDI1LjYtMTA4LjhDMzQzNi41LDIwMTIuMSwzNDQzLDE5NjAuNywzNDQzLjEsMTkwOC43DQoJCQljMC45LTI0LTQuMS00Ni4zLTE1LTY3Yy03LTIxLjYtMTktNDAuMi0zNi01NmMtMTUuOC0xNy0zNC40LTI5LTU2LTM2Yy0yMC43LTEwLjktNDMuMS0xNS45LTY3LTE1Yy0xNS40LDIuMS0zMC44LDQuMS00Ni4zLDYuMg0KCQkJYy0yOS41LDguMy01NS4xLDIzLjItNzYuOCw0NC43Yy05LjEsMTEuNy0xOC4xLDIzLjUtMjcuMiwzNS4yYy0xNS43LDI3LjEtMjMuNyw1Ni40LTIzLjgsODcuOGMwLDMxLjgtMi4xLDYzLjUtNi4zLDk1DQoJCQljMi4xLTE1LjQsNC4xLTMwLjgsNi4yLTQ2LjNjLTguNCw2Mi4zLTI1LDEyMy4yLTQ5LjMsMTgxLjJjNS44LTEzLjksMTEuNy0yNy43LDE3LjUtNDEuNmMtMjMuOSw1Ni42LTU1LjEsMTA5LjgtOTIuNSwxNTguNQ0KCQkJYzkuMS0xMS43LDE4LjEtMjMuNSwyNy4yLTM1LjJjLTM3LjQsNDguMi04MC43LDkxLjYtMTI4LjksMTI4LjljMTEuNy05LjEsMjMuNS0xOC4xLDM1LjItMjcuMmMtNDguNywzNy41LTEwMS45LDY4LjYtMTU4LjUsOTIuNQ0KCQkJYzEzLjktNS44LDI3LjctMTEuNyw0MS42LTE3LjVjLTU4LDI0LjMtMTE4LjksNDAuOS0xODEuMiw0OS4zYzE1LjQtMi4xLDMwLjgtNC4xLDQ2LjMtNi4yYy02Myw4LjMtMTI2LjksOC4zLTE4OS45LDANCgkJCWMxNS40LDIuMSwzMC44LDQuMSw0Ni4zLDYuMmMtNjIuMy04LjQtMTIzLjItMjUtMTgxLjItNDkuM2MxMy45LDUuOCwyNy43LDExLjcsNDEuNiwxNy41Yy01Ni42LTIzLjktMTA5LjgtNTUuMS0xNTguNS05Mi41DQoJCQljMTEuNyw5LjEsMjMuNSwxOC4xLDM1LjIsMjcuMmMtNDguMi0zNy40LTkxLjYtODAuNy0xMjguOS0xMjguOWM5LjEsMTEuNywxOC4xLDIzLjUsMjcuMiwzNS4yYy0zNy41LTQ4LjctNjguNi0xMDEuOS05Mi41LTE1OC41DQoJCQljNS44LDEzLjksMTEuNywyNy43LDE3LjUsNDEuNmMtMjQuMy01OC00MC45LTExOC45LTQ5LjMtMTgxLjJjMi4xLDE1LjQsNC4xLDMwLjgsNi4yLDQ2LjNjLTguMy02My04LjMtMTI2LjksMC0xODkuOQ0KCQkJYy0yLjEsMTUuNC00LjEsMzAuOC02LjIsNDYuM2M4LjQtNjIuMywyNS0xMjMuMiw0OS4zLTE4MS4yYy01LjgsMTMuOS0xMS43LDI3LjctMTcuNSw0MS42YzIzLjktNTYuNiw1NS4xLTEwOS44LDkyLjUtMTU4LjUNCgkJCWMtOS4xLDExLjctMTguMSwyMy41LTI3LjIsMzUuMmMzNy40LTQ4LjIsODAuNy05MS42LDEyOC45LTEyOC45Yy0xMS43LDkuMS0yMy41LDE4LjEtMzUuMiwyNy4yYzQ4LjctMzcuNSwxMDEuOS02OC42LDE1OC41LTkyLjUNCgkJCWMtMTMuOSw1LjgtMjcuNywxMS43LTQxLjYsMTcuNWM1OC0yNC4zLDExOC45LTQwLjksMTgxLjItNDkuM2MtMTUuNCwyLjEtMzAuOCw0LjEtNDYuMyw2LjJjNjMtOC4zLDEyNi45LTguMywxODkuOSwwDQoJCQljLTE1LjQtMi4xLTMwLjgtNC4xLTQ2LjMtNi4yYzYyLjMsOC40LDEyMy4yLDI1LDE4MS4yLDQ5LjNjLTEzLjktNS44LTI3LjctMTEuNy00MS42LTE3LjVjNTYuNiwyMy45LDEwOS44LDU1LjEsMTU4LjUsOTIuNQ0KCQkJYy0xMS43LTkuMS0yMy41LTE4LjEtMzUuMi0yNy4yYzQ4LjIsMzcuNCw5MS42LDgwLjcsMTI4LjksMTI4LjljLTkuMS0xMS43LTE4LjEtMjMuNS0yNy4yLTM1LjJjMzcuNSw0OC43LDY4LjYsMTAxLjksOTIuNSwxNTguNQ0KCQkJYy01LjgtMTMuOS0xMS43LTI3LjctMTcuNS00MS42YzI0LjMsNTgsNDAuOSwxMTguOSw0OS4zLDE4MS4yYy0yLjEtMTUuNC00LjEtMzAuOC02LjItNDYuM2M0LjIsMzEuNSw2LjIsNjMuMiw2LjMsOTUNCgkJCWMtMC45LDI0LDQuMSw0Ni4zLDE1LDY3YzcsMjEuNiwxOSw0MC4yLDM2LDU2YzE1LjgsMTcsMzQuNCwyOSw1NiwzNmMyMC43LDEwLjksNDMuMSwxNS45LDY3LDE1YzE1LjQtMi4xLDMwLjgtNC4xLDQ2LjMtNi4yDQoJCQljMjkuNS04LjMsNTUuMS0yMy4yLDc2LjgtNDQuN2M5LjEtMTEuNywxOC4xLTIzLjUsMjcuMi0zNS4yQzM0MzUuMSwxOTY5LjQsMzQ0MywxOTQwLjEsMzQ0My4xLDE5MDguN3oiLz4NCgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTI1NDYuNCwyNzkzLjljOC42LDAsMTcuMSwwLDI1LjcsMGMyMy40LDAsNDYuOCwwLDcwLjMsMGMzNC41LDAsNjkuMSwwLDEwMy42LDBjNDIuMywwLDg0LjUsMCwxMjYuOCwwDQoJCQljNDYuMSwwLDkyLjMsMCwxMzguNCwwYzQ2LjYsMCw5My4xLDAsMTM5LjcsMGM0My40LDAsODYuOSwwLDEzMC4zLDBjMzYuNywwLDczLjQsMCwxMTAuMSwwYzI2LjUsMCw1MywwLDc5LjUsMA0KCQkJYzEyLjUsMCwyNSwwLDM3LjUsMGMwLjUsMCwxLjEsMCwxLjYsMGMyNCwwLjksNDYuMy00LjEsNjctMTVjMjEuNi03LDQwLjItMTksNTYtMzZjMTctMTUuOCwyOS0zNC40LDM2LTU2DQoJCQljMTAuOS0yMC43LDE1LjktNDMuMSwxNS02N2MtMi4xLTE1LjQtNC4xLTMwLjgtNi4yLTQ2LjNjLTguMy0yOS41LTIzLjItNTUuMS00NC43LTc2LjhjLTExLjctOS4xLTIzLjUtMTguMS0zNS4yLTI3LjINCgkJCWMtMjcuMS0xNS43LTU2LjQtMjMuNy04Ny44LTIzLjhjLTguNiwwLTE3LjEsMC0yNS43LDBjLTIzLjQsMC00Ni44LDAtNzAuMywwYy0zNC41LDAtNjkuMSwwLTEwMy42LDBjLTQyLjMsMC04NC41LDAtMTI2LjgsMA0KCQkJYy00Ni4xLDAtOTIuMywwLTEzOC40LDBjLTQ2LjYsMC05My4xLDAtMTM5LjcsMGMtNDMuNCwwLTg2LjksMC0xMzAuMywwYy0zNi43LDAtNzMuNCwwLTExMC4xLDBjLTI2LjUsMC01MywwLTc5LjUsMA0KCQkJYy0xMi41LDAtMjUsMC0zNy41LDBjLTAuNSwwLTEuMSwwLTEuNiwwYy0yNC0wLjktNDYuMyw0LjEtNjcsMTVjLTIxLjYsNy00MC4yLDE5LTU2LDM2Yy0xNywxNS44LTI5LDM0LjQtMzYsNTYNCgkJCWMtMTAuOSwyMC43LTE1LjksNDMuMS0xNSw2N2MyLjEsMTUuNCw0LjEsMzAuOCw2LjIsNDYuM2M4LjMsMjkuNSwyMy4yLDU1LjEsNDQuNyw3Ni44YzExLjcsOS4xLDIzLjUsMTguMSwzNS4yLDI3LjINCgkJCUMyNDg1LjgsMjc4NS45LDI1MTUsMjc5My44LDI1NDYuNCwyNzkzLjlMMjU0Ni40LDI3OTMuOXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=");

/***/ }),

/***/ "./src/img/pin-black.svg":
/*!*******************************!*\
  !*** ./src/img/pin-black.svg ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCIgWw0KCTwhRU5USVRZIG5zX2V4dGVuZCAiaHR0cDovL25zLmFkb2JlLmNvbS9FeHRlbnNpYmlsaXR5LzEuMC8iPg0KCTwhRU5USVRZIG5zX2FpICJodHRwOi8vbnMuYWRvYmUuY29tL0Fkb2JlSWxsdXN0cmF0b3IvMTAuMC8iPg0KCTwhRU5USVRZIG5zX2dyYXBocyAiaHR0cDovL25zLmFkb2JlLmNvbS9HcmFwaHMvMS4wLyI+DQoJPCFFTlRJVFkgbnNfdmFycyAiaHR0cDovL25zLmFkb2JlLmNvbS9WYXJpYWJsZXMvMS4wLyI+DQoJPCFFTlRJVFkgbnNfaW1yZXAgImh0dHA6Ly9ucy5hZG9iZS5jb20vSW1hZ2VSZXBsYWNlbWVudC8xLjAvIj4NCgk8IUVOVElUWSBuc19zZncgImh0dHA6Ly9ucy5hZG9iZS5jb20vU2F2ZUZvcldlYi8xLjAvIj4NCgk8IUVOVElUWSBuc19jdXN0b20gImh0dHA6Ly9ucy5hZG9iZS5jb20vR2VuZXJpY0N1c3RvbU5hbWVzcGFjZS8xLjAvIj4NCgk8IUVOVElUWSBuc19hZG9iZV94cGF0aCAiaHR0cDovL25zLmFkb2JlLmNvbS9YUGF0aC8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zOng9IiZuc19leHRlbmQ7IiB4bWxuczppPSImbnNfYWk7IiB4bWxuczpncmFwaD0iJm5zX2dyYXBoczsiDQoJIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTMyLjYgMTMyLjYiDQoJIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEzMi42IDEzMi42OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPg0KCS5zdDB7ZmlsbDojMDIwMjAyO3N0cm9rZTojNzA3MDcwO3N0cm9rZS13aWR0aDoyO3N0cm9rZS1taXRlcmxpbWl0OjEwO30NCgkuc3Qxe2ZpbGw6I0UxRTFFMTt9DQo8L3N0eWxlPg0KPG1ldGFkYXRhPg0KCTxzZncgIHhtbG5zPSImbnNfc2Z3OyI+DQoJCTxzbGljZXM+PC9zbGljZXM+DQoJCTxzbGljZVNvdXJjZUJvdW5kcyAgYm90dG9tTGVmdE9yaWdpbj0idHJ1ZSIgaGVpZ2h0PSIxMzIuNiIgd2lkdGg9IjEzMi42IiB4PSIxNTcuMSIgeT0iMjEwLjEiPjwvc2xpY2VTb3VyY2VCb3VuZHM+DQoJPC9zZnc+DQo8L21ldGFkYXRhPg0KPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iNjYuMyIgY3k9IjY2LjMiIHI9IjY1LjMiLz4NCjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik04OC43LDQxLjRjLTQuNi03LjktMTIuNy0xMi44LTIxLjgtMTIuOWMtMC40LDAtMC44LDAtMS4yLDBjLTkuMSwwLjItMTcuMiw1LTIxLjgsMTIuOQ0KCWMtNC43LDguMS00LjgsMTcuOC0wLjMsMjZsMTguOCwzNC4zYzAsMCwwLDAsMCwwYzAuOCwxLjQsMi4zLDIuMyw0LDIuM2MxLjcsMCwzLjEtMC45LDQtMi4zYzAsMCwwLDAsMCwwTDg5LDY3LjQNCglDOTMuNSw1OS4yLDkzLjQsNDkuNSw4OC43LDQxLjRMODguNyw0MS40eiBNNjYuMyw2Mi43Yy01LjksMC0xMC42LTQuOC0xMC42LTEwLjZzNC44LTEwLjYsMTAuNi0xMC42czEwLjYsNC44LDEwLjYsMTAuNg0KCVM3Mi4xLDYyLjcsNjYuMyw2Mi43eiIvPg0KPC9zdmc+DQo=");

/***/ }),

/***/ "./src/img/search-without-border.svg":
/*!*******************************************!*\
  !*** ./src/img/search-without-border.svg ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyNS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCIgWw0KCTwhRU5USVRZIG5zX2V4dGVuZCAiaHR0cDovL25zLmFkb2JlLmNvbS9FeHRlbnNpYmlsaXR5LzEuMC8iPg0KCTwhRU5USVRZIG5zX2FpICJodHRwOi8vbnMuYWRvYmUuY29tL0Fkb2JlSWxsdXN0cmF0b3IvMTAuMC8iPg0KCTwhRU5USVRZIG5zX2dyYXBocyAiaHR0cDovL25zLmFkb2JlLmNvbS9HcmFwaHMvMS4wLyI+DQoJPCFFTlRJVFkgbnNfdmFycyAiaHR0cDovL25zLmFkb2JlLmNvbS9WYXJpYWJsZXMvMS4wLyI+DQoJPCFFTlRJVFkgbnNfaW1yZXAgImh0dHA6Ly9ucy5hZG9iZS5jb20vSW1hZ2VSZXBsYWNlbWVudC8xLjAvIj4NCgk8IUVOVElUWSBuc19zZncgImh0dHA6Ly9ucy5hZG9iZS5jb20vU2F2ZUZvcldlYi8xLjAvIj4NCgk8IUVOVElUWSBuc19jdXN0b20gImh0dHA6Ly9ucy5hZG9iZS5jb20vR2VuZXJpY0N1c3RvbU5hbWVzcGFjZS8xLjAvIj4NCgk8IUVOVElUWSBuc19hZG9iZV94cGF0aCAiaHR0cDovL25zLmFkb2JlLmNvbS9YUGF0aC8xLjAvIj4NCl0+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxpdmVsbG9fMSIgeG1sbnM6eD0iJm5zX2V4dGVuZDsiIHhtbG5zOmk9IiZuc19haTsiIHhtbG5zOmdyYXBoPSImbnNfZ3JhcGhzOyINCgkgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA0OCA0OCINCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDggNDg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLk9tYnJhX3gwMDIwX2VzdGVybmF7ZmlsbDpub25lO30NCgkuQW5nb2xpX3gwMDIwX2Fycm90b25kYXRpX3gwMDIwXzJfeDAwMjBfcHR7ZmlsbDojRkZGRkZGO3N0cm9rZTojMDAwMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO30NCgkuUmlmbGVzc2lvbmVfeDAwMjBfWF94MDAyMF9kaW5hbWljYXtmaWxsOm5vbmU7fQ0KCS5TbXVzc29feDAwMjBfbW9yYmlkb3tmaWxsOnVybCgjU1ZHSURfMV8pO30NCgkuQ3JlcHVzY29sb3tmaWxsOiNGRkZGRkY7fQ0KCS5Gb2dsaWFtZV9HU3tmaWxsOiNGRkREMDA7fQ0KCS5Qb21wYWRvdXJfR1N7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojNTFBRUUyO30NCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9DQoJLnN0MXtmaWxsOiMwMjAyMDM7fQ0KPC9zdHlsZT4NCjxtZXRhZGF0YT4NCgk8c2Z3ICB4bWxucz0iJm5zX3NmdzsiPg0KCQk8c2xpY2VzPjwvc2xpY2VzPg0KCQk8c2xpY2VTb3VyY2VCb3VuZHMgIGJvdHRvbUxlZnRPcmlnaW49InRydWUiIGhlaWdodD0iNDciIHdpZHRoPSI0NyIgeD0iMTczLjIiIHk9Ii0yOTEuMSI+PC9zbGljZVNvdXJjZUJvdW5kcz4NCgk8L3Nmdz4NCjwvbWV0YWRhdGE+DQo8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9Ii0xNzIuNzI3NiIgeTE9Ii0yNDMuNTc0NSIgeDI9Ii0xNzIuMDIwNSIgeTI9Ii0yNDIuODY3NCI+DQoJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0U2RTZFQiIvPg0KCTxzdG9wICBvZmZzZXQ9IjAuMTczOCIgc3R5bGU9InN0b3AtY29sb3I6I0UyRTJFNiIvPg0KCTxzdG9wICBvZmZzZXQ9IjAuMzUyIiBzdHlsZT0ic3RvcC1jb2xvcjojRDVENEQ4Ii8+DQoJPHN0b3AgIG9mZnNldD0iMC41MzIzIiBzdHlsZT0ic3RvcC1jb2xvcjojQzBCRkMyIi8+DQoJPHN0b3AgIG9mZnNldD0iMC43MTM5IiBzdHlsZT0ic3RvcC1jb2xvcjojQTRBMkE0Ii8+DQoJPHN0b3AgIG9mZnNldD0iMC44OTQ5IiBzdHlsZT0ic3RvcC1jb2xvcjojODI4MjgyIi8+DQoJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzZCNkU2RSIvPg0KPC9saW5lYXJHcmFkaWVudD4NCjxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjI0IiBjeT0iMjQiIHI9IjIzLjUiLz4NCjxnPg0KCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yOS4xLDEyLjRjLTQuNi00LjYtMTIuMS00LjYtMTYuNywwYy00LjYsNC42LTQuNiwxMi4xLDAsMTYuN2M0LjEsNC4xLDEwLjUsNC41LDE1LjEsMS4zDQoJCWMwLjEsMC41LDAuMywwLjksMC43LDEuM2w2LjcsNi43YzEsMSwyLjYsMSwzLjUsMGMxLTEsMS0yLjYsMC0zLjVsLTYuNy02LjdjLTAuNC0wLjQtMC44LTAuNi0xLjMtMC43DQoJCUMzMy42LDIyLjksMzMuMiwxNi41LDI5LjEsMTIuNHogTTI3LDI3Yy0zLjQsMy40LTksMy40LTEyLjUsMGMtMy40LTMuNC0zLjQtOSwwLTEyLjVjMy40LTMuNCw5LTMuNCwxMi41LDANCgkJQzMwLjQsMTcuOSwzMC40LDIzLjUsMjcsMjd6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==");

/***/ }),

/***/ "./src/js/fetch-data.js":
/*!******************************!*\
  !*** ./src/js/fetch-data.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FetchData)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);


//const api_key = process.env.API_KEY;

/*export default async function fetchData(city) {
  try {
    const response = await get(
      `https://api.waqi.info/feed/${city}/?token=${api_key}`
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}*/

class FetchData {
  constructor(input) {
    this.key = "2f6082b409aa3bf7e22a83e8473bf124dab74b22";

    this.city = async function () {
      try {
        const response = await (0,axios__WEBPACK_IMPORTED_MODULE_0__.get)(
          `https://api.waqi.info/feed/${input}/?token=${this.key}`
        );
        //console.log(response.data);
        return response.data.data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };
    this.geo = async function () {
      try {
        const response = await (0,axios__WEBPACK_IMPORTED_MODULE_0__.get)(
          `https://api.waqi.info/feed/geo:${input}/?token=${this.key}` // lat; long
        );
        //console.log(response);
        return response.data.data;
      } catch (error) {
        console.error(error);
        return error;
      }
    };
  }
}


/***/ }),

/***/ "./node_modules/axios/package.json":
/*!*****************************************!*\
  !*** ./node_modules/axios/package.json ***!
  \*****************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"_from":"axios","_id":"axios@0.21.4","_inBundle":false,"_integrity":"sha512-ut5vewkiu8jjGBdqpM44XxjuCjq9LAKeHVmoVfHVzy8eHgxxq8SbAVQNovDA8mVi05kP0Ea/n/UzcSHcTJQfNg==","_location":"/axios","_phantomChildren":{},"_requested":{"type":"tag","registry":true,"raw":"axios","name":"axios","escapedName":"axios","rawSpec":"","saveSpec":null,"fetchSpec":"latest"},"_requiredBy":["#USER","/"],"_resolved":"https://registry.npmjs.org/axios/-/axios-0.21.4.tgz","_shasum":"c67b90dc0568e5c1cf2b0b858c43ba28e2eda575","_spec":"axios","_where":"C:\\\\Users\\\\sirga\\\\Desktop\\\\DEV\\\\PROJECTS\\\\Studies and Incomplete\\\\air-quality","author":{"name":"Matt Zabriskie"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"bugs":{"url":"https://github.com/axios/axios/issues"},"bundleDependencies":false,"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}],"dependencies":{"follow-redirects":"^1.14.0"},"deprecated":false,"description":"Promise based HTTP client for the browser and node.js","devDependencies":{"coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.3.0","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^23.0.0","grunt-karma":"^4.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^4.0.2","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^6.3.2","karma-chrome-launcher":"^3.1.0","karma-firefox-launcher":"^2.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^4.3.6","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.8","karma-webpack":"^4.0.2","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^8.2.1","sinon":"^4.5.0","terser-webpack-plugin":"^4.2.3","typescript":"^4.0.5","url-search-params":"^0.10.0","webpack":"^4.44.2","webpack-dev-server":"^3.11.0"},"homepage":"https://axios-http.com","jsdelivr":"dist/axios.min.js","keywords":["xhr","http","ajax","promise","node"],"license":"MIT","main":"index.js","name":"axios","repository":{"type":"git","url":"git+https://github.com/axios/axios.git"},"scripts":{"build":"NODE_ENV=production grunt build","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","examples":"node ./examples/server.js","fix":"eslint --fix lib/**/*.js","postversion":"git push && git push --tags","preversion":"npm test","start":"node ./sandbox/server.js","test":"grunt test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json"},"typings":"./index.d.ts","unpkg":"dist/axios.min.js","version":"0.21.4"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _fetch_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./fetch-data */ "./src/js/fetch-data.js");
/* harmony import */ var _img_air_quality_blue_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../img/air-quality-blue.svg */ "./src/img/air-quality-blue.svg");
/* harmony import */ var _img_pin_black_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../img/pin-black.svg */ "./src/img/pin-black.svg");
/* harmony import */ var _img_search_without_border_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../img/search-without-border.svg */ "./src/img/search-without-border.svg");
__webpack_require__(/*! ../css/style.scss */ "./src/css/style.scss");





let data;
let input = document.querySelector(".input");
let form_container = document.querySelector(".form-container");
let logo_container = document.querySelector(".logo-container");
let result_container = document.querySelector("#result-container");
let composition = document.querySelector("#composition");
let h1 = document.querySelector("#h1");
let h3 = document.querySelector("#h3");
let latitude;
let longitude;
let scale = document.querySelector(".scale-hidden");
let scale_unit = document.querySelectorAll(".scale-unit-hidden");

function preloader() {
  let preloader = document.getElementById("preloader");

  setTimeout(() => {
    preloader.remove();
  }, 2500);
}
preloader();

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      },
      (error) => {
        console.log(error.message);
        latitude = undefined;
        longitude = undefined;
        errorNotification("geo");
      }
    );
  }
}
geolocate();

class ImportImage {
  constructor(src, target, cls) {
    this.target = document.querySelector(target);
    this.img = document.createElement("img");
    this.img.src = src;
    this.img.classList.add(cls);

    this.child = function () {
      this.target.appendChild(this.img);
    };
    this.before = function () {
      this.target.before(this.img);
    };
    this.after = function () {
      this.target.after(this.img);
    };
  }
}

const logo = new ImportImage(_img_air_quality_blue_svg__WEBPACK_IMPORTED_MODULE_1__["default"], ".logo-container", "logo");
logo.child();
logo.img.addEventListener("click", () => {
  location.reload();
});

const search = new ImportImage(_img_search_without_border_svg__WEBPACK_IMPORTED_MODULE_3__["default"], ".form", "search-icon");
search.before();

const pin = new ImportImage(_img_pin_black_svg__WEBPACK_IMPORTED_MODULE_2__["default"], ".form", "pin-icon");
pin.after();

input.addEventListener("focus", () => {
  form_container.classList.add("focus");
});
input.addEventListener("blur", () => {
  form_container.classList.replace("focus", "blur");
});

function errorNotification(input) {
  let notification = document.createElement("div");
  let notification_msg = document.createElement("p");

  input === "city"
    ? (notification_msg.innerHTML = "<strong>Error:</strong>\nCity not found")
    : (notification_msg.innerHTML =
        "<strong>Geolocation Error:</strong>\nGeolocation needs to be enabled in order to use this feature. ");

  document.body.appendChild(notification);
  notification.appendChild(notification_msg);
  notification.classList.add("notification");

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

//Fetch data
document.querySelector(".form").addEventListener("submit", () => {
  if (input.value === "") {
    errorNotification("city");
  } else {
    const searchCity = new _fetch_data__WEBPACK_IMPORTED_MODULE_0__["default"](input.value);
    async function getData() {
      data = await searchCity.city();
      if (typeof data !== "string") {
        updateData();
        showResults(data);
      } else {
        errorNotification("city");
      }
      console.log(data);
    }
    getData();
    input.value = "";
  }
});

pin.img.addEventListener("click", () => {
  const cityCoord = new _fetch_data__WEBPACK_IMPORTED_MODULE_0__["default"](latitude + "; " + longitude);
  async function getData() {
    data = await cityCoord.geo();
    if (typeof data !== "string") {
      updateData();
      showResults(data);
    } else {
      errorNotification("geo");
    }
    console.log(data);
  }
  getData();
});

// Show results
function showResults(data) {
  logo_container.classList.add("logo-result");
  form_container.classList.add("form-result");
  //form_container.classList.remove("form-container");

  h1.innerHTML = data.city.name;
  h1.style.fontSize = "35px";
  h3.remove();

  scale.classList.add("scale-container");
  scale.classList.remove("scale-hidden");
  scale_unit.forEach((item) => {
    item.classList.add("scale-unit");
    item.classList.remove("scale-unit-hidden");
  });
  scaleColor();
  scaleValue();
  arrowPosition(data.aqi);
  quality(data.aqi);
  airComposition(data.iaqi, data.dominentpol);
  healthImplications(data.aqi);
}

function scaleColor() {
  let green = document.getElementById("green");
  let yellow = document.getElementById("yellow");
  let orange = document.getElementById("orange");
  let red = document.getElementById("red");
  let purple = document.getElementById("purple");
  let brown = document.getElementById("brown");

  green.style.cssText = `
    background-color: #009966;
    border-radius: 20px 0 0 20px;
  `;
  yellow.style.backgroundColor = "#ffde33";
  orange.style.backgroundColor = "#ff9933";
  red.style.backgroundColor = "#cc0033";
  purple.style.backgroundColor = "#660099";
  brown.style.cssText = `
    background-color: #7e0023;
    border-radius:  0 20px 20px 0;
  `;
}

function scaleValue() {
  let scale_value = document.querySelector(".scale-value");
  let scale_value_p = document.querySelectorAll(".scale-value > p");

  scale_value.removeAttribute("hidden");
  scale_value_p.forEach((item) => item.removeAttribute("hidden"));
}

function arrowPosition(value) {
  let w = scale.offsetWidth;
  let arrow = document.querySelector(".arrow-up");
  let x = (w - 6) / 6;

  function position() {
    if (value >= 0 && value <= 50) {
      return x / 2;
    } else if (value >= 51 && value <= 100) {
      return x + x / 2;
    } else if (value >= 101 && value <= 150) {
      return x * 2 + x / 2;
    } else if (value >= 151 && value <= 200) {
      return x * 3 + x / 2;
    } else if (value >= 201 && value <= 300) {
      return x * 4 + x / 2;
    } else {
      return x * 5 + x / 2;
    }
  }

  arrow.style.marginLeft = `${position() - 15}px`;
  arrow.removeAttribute("hidden");
}

function quality(value) {
  let aqi = document.getElementById("aqi");
  let quality = document.getElementById("quality");
  let result = document.querySelector("#result-container > div");
  aqi.innerHTML = value;

  if (value >= 0 && value <= 50) {
    quality.innerHTML = "Good";
  } else if (value >= 51 && value <= 100) {
    quality.innerHTML = "Moderate";
  } else if (value >= 101 && value <= 150) {
    quality.innerHTML = "Unhealthy for Sensitive Groups";
  } else if (value >= 151 && value <= 200) {
    quality.innerHTML = "Unhealthy";
  } else if (value >= 201 && value <= 300) {
    quality.innerHTML = "Very Unhealthy";
  } else {
    quality.innerHTML = "Hazardous";
  }

  result.style.backgroundColor = sectionColor(value);
  aqi.removeAttribute("hidden");
  quality.removeAttribute("hidden");
  result.classList.add("result");
  result_container.classList.add("result-container");
}

function sectionColor(value) {
  if (value >= 0 && value <= 50) {
    return "#009966";
  } else if (value >= 51 && value <= 100) {
    return "#ffde33";
  } else if (value >= 101 && value <= 150) {
    return "#ff9933";
  } else if (value >= 151 && value <= 200) {
    return "#cc0033";
  } else if (value >= 201 && value <= 300) {
    return "#660099";
  } else {
    return "#7e0023";
  }
}

function airComposition(obj, dom) {
  let h3 = document.querySelector("#composition > h3");
  composition.classList.add("composition");
  h3.removeAttribute("hidden");

  let remove = ["t", "h", "p", "w", "wg", "dew"];
  for (let i = 0; i < remove.length; i++) {
    delete obj[remove[i]];
  }
  console.log(obj);
  let key_arr = [];
  let value_arr = [];
  for (let key in obj) {
    key_arr.push(key);
    value_arr.push(obj[key].v);
  }

  key_arr.forEach((value, index) => {
    processData(key_arr, value_arr, index, dom);
  });
}

function processData(arr1, arr2, index, dom) {
  let container = document.getElementById("composition");
  let container_div = document.createElement("div");
  let key = document.createElement("p");
  let value = document.createElement("p");

  function unitOfMeasure(x) {
    if (x === "pm25" || x === "pm10") {
      return "µg/m3";
    } else {
      return "ppb";
    }
  }

  function dominant(x, target) {
    if (x === arr1[index]) {
      let dom = document.createElement("p");
      dom.innerHTML = "DOMINANT";
      dom.style.fontSize = "15px";
      target.appendChild(dom);
    }
  }

  key.innerHTML = arr1[index];
  value.innerHTML = arr2[index] + " " + unitOfMeasure(arr1[index]);
  container.appendChild(container_div);
  container_div.classList.add("composition-div");
  container_div.appendChild(key);
  dominant(dom, container_div);
  container_div.appendChild(value);
}

function updateData() {
  let obsolete = document.querySelectorAll(".composition-div");
  obsolete.forEach((value) => {
    value.remove();
  });
}

function healthImplications(value) {
  let health_container = document.querySelector("#health");
  let health_1 = document.querySelector("#health > p:first-of-type");
  let health_2 = document.querySelector("#health > p:last-of-type");

  if (value >= 0 && value <= 50) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Air quality is considered satisfactory, and air pollution poses little or no risk.";
    health_2.innerHTML = "";
  } else if (value >= 51 && value <= 100) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.";
  } else if (value >= 101 && value <= 150) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.";
  } else if (value >= 151 && value <= 200) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion.";
  } else if (value >= 201 && value <= 300) {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Health warnings of emergency conditions. The entire population is more likely to be affected.";
    health_2.innerHTML =
      "Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.";
  } else {
    health_1.innerHTML =
      "<strong>Health implications:</strong><br><br>Health alert! everyone may experience more serious health effects.";
    health_2.innerHTML = "Everyone should avoid all outdoor exertion.";
  }

  health_container.classList.add("health");
  if (health_2.innerHTML === "") {
    health_1.style.borderBottom = "none";
    health_1.style.paddingBottom = "0px";
    health_2.style.paddingTop = "0px";
  } else {
    health_1.style.borderBottom = "1px solid #c4ced3";
    health_1.style.paddingBottom = "20px";
    health_2.style.paddingTop = "20px";
  }
}

/*<div id="dom_5"></div>
  <div id="dom_4"></div>
  <div id="dom_2"></div>
  <div id="dom_1"></div>*/

/*function airComposition(obj, dom) {
  let h3 = document.querySelector("#composition > h3");

  composition.classList.add("composition");
  h3.removeAttribute("hidden");

  let key_arr = [];
  let value_arr = [];
  for (let key in obj) {
    key_arr.push(key);
    value_arr.push(obj[key].v);
  }
  console.log(key_arr);
  console.log(value_arr);
  processData(key_arr, value_arr, 5, dom);
  processData(key_arr, value_arr, 4, dom);
  processData(key_arr, value_arr, 2, dom);
  processData(key_arr, value_arr, 1, dom);
}

function processData(arr1, arr2, index, dom) {
  let key = document.createElement("p");
  let value = document.createElement("p");
  let container = document.getElementById(`dom_${index}`);

  function unitOfMeasure(x) {
    if (x === "pm25" || x === "pm10") {
      return "µg/m3";
    } else {
      return "ppb";
    }
  }

  function dominant(x, target) {
    if (x === arr1[index]) {
      let dom = document.createElement("p");
      dom.innerHTML = "Dominant";
      target.appendChild(dom);
    }
  }

  key.innerHTML = arr1[index];
  value.innerHTML = arr2[index] + " " + unitOfMeasure(arr1[index]);

  container.classList.add("composition-div");
  container.appendChild(key);
  dominant(dom, container);
  container.appendChild(value);
} */

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUssV0FBVyxVQUFVLFVBQVUsVUFBVSxNQUFNLEtBQUssV0FBVyxVQUFVLFdBQVcsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsV0FBVyxVQUFVLE1BQU0sS0FBSyxXQUFXLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxXQUFXLE1BQU0sS0FBSyxVQUFVLFdBQVcsV0FBVyxVQUFVLFVBQVUsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsTUFBTSxNQUFNLFdBQVcsVUFBVSxVQUFVLE1BQU0sS0FBSyxXQUFXLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLEtBQUssS0FBSyxXQUFXLFVBQVUsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxVQUFVLFVBQVUsV0FBVyxXQUFXLFdBQVcsTUFBTSxLQUFLLFVBQVUsVUFBVSxVQUFVLFdBQVcsVUFBVSxLQUFLLEtBQUssV0FBVyxXQUFXLFVBQVUsVUFBVSxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxXQUFXLFVBQVUsV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFdBQVcsTUFBTSxLQUFLLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxXQUFXLFVBQVUsV0FBVyxNQUFNLEtBQUssVUFBVSxXQUFXLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLE1BQU0sS0FBSyxXQUFXLFdBQVcsTUFBTSxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxVQUFVLFdBQVcsS0FBSyxLQUFLLFdBQVcsVUFBVSxXQUFXLEtBQUssS0FBSyxXQUFXLFdBQVcsTUFBTSxLQUFLLFdBQVcsVUFBVSxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLE1BQU0sS0FBSyxLQUFLLFVBQVUsVUFBVSxXQUFXLE1B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Q0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLHFHQUFxRztBQUNyRztBQUNBLGlJQUFpSTtBQUNqSSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsMkhBQTJIO0FBQzNILElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxNQUFNO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vc3JjL2Nzcy9zdHlsZS5zY3NzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vc3JjL2Nzcy9zdHlsZS5zY3NzPzNmZjAiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS8uL3NyYy9pbWcvYWlyLXF1YWxpdHktYmx1ZS5zdmciLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9zcmMvaW1nL3Bpbi1ibGFjay5zdmciLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9zcmMvaW1nL3NlYXJjaC13aXRob3V0LWJvcmRlci5zdmciLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvLi9zcmMvanMvZmV0Y2gtZGF0YS5qcyIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYWlyLXF1YWxpdHkvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9haXItcXVhbGl0eS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2Fpci1xdWFsaXR5Ly4vc3JjL2pzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCc7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGNvbmZpZy50cmFuc2l0aW9uYWwgJiYgY29uZmlnLnRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIG9uQ2FuY2VsZWQoY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVqZWN0KGNhbmNlbCk7XG4gICAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbmF4aW9zLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoYXhpb3MuZGVmYXVsdHMsIGluc3RhbmNlQ29uZmlnKSk7XG59O1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJylcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgdmFyIHZhbHVlRnJvbUNvbmZpZzJLZXlzID0gWyd1cmwnLCAnbWV0aG9kJywgJ2RhdGEnXTtcbiAgdmFyIG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzID0gWydoZWFkZXJzJywgJ2F1dGgnLCAncHJveHknLCAncGFyYW1zJ107XG4gIHZhciBkZWZhdWx0VG9Db25maWcyS2V5cyA9IFtcbiAgICAnYmFzZVVSTCcsICd0cmFuc2Zvcm1SZXF1ZXN0JywgJ3RyYW5zZm9ybVJlc3BvbnNlJywgJ3BhcmFtc1NlcmlhbGl6ZXInLFxuICAgICd0aW1lb3V0JywgJ3RpbWVvdXRNZXNzYWdlJywgJ3dpdGhDcmVkZW50aWFscycsICdhZGFwdGVyJywgJ3Jlc3BvbnNlVHlwZScsICd4c3JmQ29va2llTmFtZScsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJywgJ29uVXBsb2FkUHJvZ3Jlc3MnLCAnb25Eb3dubG9hZFByb2dyZXNzJywgJ2RlY29tcHJlc3MnLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJywgJ21heEJvZHlMZW5ndGgnLCAnbWF4UmVkaXJlY3RzJywgJ3RyYW5zcG9ydCcsICdodHRwQWdlbnQnLFxuICAgICdodHRwc0FnZW50JywgJ2NhbmNlbFRva2VuJywgJ3NvY2tldFBhdGgnLCAncmVzcG9uc2VFbmNvZGluZydcbiAgXTtcbiAgdmFyIGRpcmVjdE1lcmdlS2V5cyA9IFsndmFsaWRhdGVTdGF0dXMnXTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHV0aWxzLmZvckVhY2godmFsdWVGcm9tQ29uZmlnMktleXMsIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICB1dGlscy5mb3JFYWNoKGRlZmF1bHRUb0NvbmZpZzJLZXlzLCBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChkaXJlY3RNZXJnZUtleXMsIGZ1bmN0aW9uIG1lcmdlKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBheGlvc0tleXMgPSB2YWx1ZUZyb21Db25maWcyS2V5c1xuICAgIC5jb25jYXQobWVyZ2VEZWVwUHJvcGVydGllc0tleXMpXG4gICAgLmNvbmNhdChkZWZhdWx0VG9Db25maWcyS2V5cylcbiAgICAuY29uY2F0KGRpcmVjdE1lcmdlS2V5cyk7XG5cbiAgdmFyIG90aGVyS2V5cyA9IE9iamVjdFxuICAgIC5rZXlzKGNvbmZpZzEpXG4gICAgLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIGZpbHRlckF4aW9zS2V5cyhrZXkpIHtcbiAgICAgIHJldHVybiBheGlvc0tleXMuaW5kZXhPZihrZXkpID09PSAtMTtcbiAgICB9KTtcblxuICB1dGlscy5mb3JFYWNoKG90aGVyS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHBrZyA9IHJlcXVpcmUoJy4vLi4vLi4vcGFja2FnZS5qc29uJyk7XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG52YXIgY3VycmVudFZlckFyciA9IHBrZy52ZXJzaW9uLnNwbGl0KCcuJyk7XG5cbi8qKlxuICogQ29tcGFyZSBwYWNrYWdlIHZlcnNpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSB0aGFuVmVyc2lvblxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24sIHRoYW5WZXJzaW9uKSB7XG4gIHZhciBwa2dWZXJzaW9uQXJyID0gdGhhblZlcnNpb24gPyB0aGFuVmVyc2lvbi5zcGxpdCgnLicpIDogY3VycmVudFZlckFycjtcbiAgdmFyIGRlc3RWZXIgPSB2ZXJzaW9uLnNwbGl0KCcuJyk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgaWYgKHBrZ1ZlcnNpb25BcnJbaV0gPiBkZXN0VmVyW2ldKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHBrZ1ZlcnNpb25BcnJbaV0gPCBkZXN0VmVyW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICB2YXIgaXNEZXByZWNhdGVkID0gdmVyc2lvbiAmJiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uKTtcblxuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgcGtnLnZlcnNpb24gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQgaW4gJyArIHZlcnNpb24pKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEZXByZWNhdGVkICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc09sZGVyVmVyc2lvbjogaXNPbGRlclZlcnNpb24sXG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAaW1wb3J0IHVybChodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PUpvc2VmaW4rU2Fuczp3Z2h0QDcwMCZkaXNwbGF5PXN3YXApO1wiXSk7XG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGltcG9ydCB1cmwoaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1Nb250c2VycmF0OndnaHRANDAwOzcwMCZkaXNwbGF5PXN3YXApO1wiXSk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIqIHtcXG4gIG1hcmdpbjogMDtcXG4gIHBhZGRpbmc6IDA7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5ib2R5IHtcXG4gIGJhY2tncm91bmQtY29sb3I6ICM4ZWM1ZmM7XFxufVxcblxcbkBrZXlmcmFtZXMgcHJlbG9hZGVyIHtcXG4gIDAlIHtcXG4gICAgb3BhY2l0eTogMTAwJTtcXG4gIH1cXG4gIDEwMCUge1xcbiAgICBvcGFjaXR5OiAwJTtcXG4gIH1cXG59XFxuI3ByZWxvYWRlciB7XFxuICBhbmltYXRpb24tbmFtZTogcHJlbG9hZGVyO1xcbiAgYW5pbWF0aW9uLWR1cmF0aW9uOiAzcztcXG4gIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IDE7XFxufVxcblxcbi5sb2dvLWNvbnRhaW5lciB7XFxuICBtYXJnaW46IGNhbGMoKDEwMHZoIC0gNDIwcHgpIC8gMikgYXV0byAxMHB4O1xcbiAgd2lkdGg6IDE3MHB4O1xcbiAgaGVpZ2h0OiAxNzBweDtcXG59XFxuXFxuaDEge1xcbiAgZm9udDogNTBweCBcXFwiSm9zZWZpbiBTYW5zXFxcIiwgc2Fucy1zZXJpZjtcXG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgY29sb3I6ICMzZTVkNzU7XFxuICB3aWR0aDogOTAlO1xcbiAgbWFyZ2luOiBhdXRvO1xcbn1cXG5cXG5oMyB7XFxuICBmb250OiAyNXB4IFxcXCJNb250c2VycmF0XFxcIjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIG1hcmdpbjogMTBweCBhdXRvO1xcbiAgY29sb3I6ICMzZTVkNzU7XFxufVxcblxcbi5mb3JtLWNvbnRhaW5lciB7XFxuICBib3JkZXItcmFkaXVzOiA1MHB4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBwYWRkaW5nOiA3LjVweCAxNXB4O1xcbiAgYm9yZGVyLXJhZGl1czogMjVweDtcXG4gIGJvcmRlcjogbm9uZTtcXG4gIGJveC1zaGFkb3c6IDBweCA4cHggMjVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcXG4gIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XFxuICB3aWR0aDogODUlO1xcbiAgbWluLXdpZHRoOiAxMDBweDtcXG4gIG1heC13aWR0aDogODAwcHg7XFxuICBoZWlnaHQ6IDUwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXG4gIG1hcmdpbjogMTAwcHggYXV0bztcXG59XFxuLmZvcm0tY29udGFpbmVyIC5mb3JtIHtcXG4gIHdpZHRoOiBjYWxjKDEwMCUgLSA1MHB4KTtcXG4gIGhlaWdodDogMjVweDtcXG59XFxuLmZvcm0tY29udGFpbmVyIC5mb3JtIGlucHV0IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgYm9yZGVyOiBub25lO1xcbiAgcGFkZGluZy1sZWZ0OiAxMHB4O1xcbiAgZm9udDogMTZweCBcXFwiTW9udHNlcnJhdFxcXCI7XFxufVxcbi5mb3JtLWNvbnRhaW5lciAuZm9ybSBpbnB1dDpmb2N1cyB7XFxuICBvdXRsaW5lOiBub25lO1xcbn1cXG5cXG4uYmx1ciB7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4yNXMgZWFzZTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApO1xcbiAgYm94LXNoYWRvdzogMHB4IDhweCAyNXB4IDBweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xcbn1cXG5cXG4uZm9jdXMge1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMjVzIGVhc2U7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAtNnB4KTtcXG4gIGJveC1zaGFkb3c6IDBweCAxNXB4IDI1cHggMHB4IHJnYmEoMCwgMCwgMCwgMC4yNSk7XFxufVxcblxcbi5zZWFyY2gtaWNvbiB7XFxuICB0cmFuc2l0aW9uOiBhbGwgMC4yNXMgZWFzZTtcXG4gIG9wYWNpdHk6IDAuNztcXG4gIHdpZHRoOiAyNXB4O1xcbiAgaGVpZ2h0OiAyNXB4O1xcbn1cXG5cXG4ucGluLWljb24ge1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuM3MgZWFzZTtcXG4gIG9wYWNpdHk6IDAuNjtcXG4gIG1hcmdpbi1sZWZ0OiAxdm1pbjtcXG4gIHdpZHRoOiAyNXB4O1xcbiAgaGVpZ2h0OiAyNXB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4ucGluLWljb246aG92ZXIge1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuMjVzIGVhc2U7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAtNnB4KTtcXG4gIG9wYWNpdHk6IDE7XFxufVxcblxcbi5sb2dvLXJlc3VsdCB7XFxuICB3aWR0aDogNzBweDtcXG4gIGhlaWdodDogNzBweDtcXG4gIG1hcmdpbjogMjBweCAyMHB4IDUwcHggMjBweDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuXFxuLmZvcm0tcmVzdWx0IHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMzBweDtcXG4gIHJpZ2h0OiAyMHB4O1xcbiAgd2lkdGg6IGNhbGMoMTAwJSAtIDEzMHB4KTtcXG4gIG1heC13aWR0aDogbm9uZTtcXG4gIG1hcmdpbjogMHB4O1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuNXMgZWFzZTtcXG59XFxuXFxuLnNjYWxlLWNvbnRhaW5lciB7XFxuICBkaXNwbGF5OiBncmlkO1xcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnIgMWZyIDFmciAxZnIgMWZyIDFmcjtcXG4gIGdyaWQtdGVtcGxhdGUtcm93czogMWZyO1xcbiAgZ2FwOiAwcHggMHB4O1xcbiAgd2lkdGg6IDkwJTtcXG4gIG1heC13aWR0aDogNTAwcHg7XFxuICBoZWlnaHQ6IDQwcHg7XFxuICBib3JkZXItcmFkaXVzOiAyMHB4O1xcbiAgYm9yZGVyOiAzcHggc29saWQgIzNlNWQ3NTtcXG4gIG1hcmdpbjogMHB4IGF1dG87XFxuICBib3gtc2hhZG93OiAwcHggOHB4IDI1cHggMHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XFxufVxcblxcbi5zY2FsZS1oaWRkZW4sXFxuLnNjYWxlLXVuaXQtaGlkZGVuIHtcXG4gIHZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIHdpZHRoOiAwcHg7XFxuICBoZWlnaHQ6IDBweDtcXG59XFxuXFxuLnNjYWxlLXVuaXQge1xcbiAgdmlzaWJpbGl0eTogdmlzaWJsZTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbn1cXG5cXG4uc2NhbGUtdmFsdWUge1xcbiAgd2lkdGg6IDkwJTtcXG4gIG1heC13aWR0aDogNTAwcHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgbWFyZ2luOiA0MHB4IGF1dG8gMTBweDtcXG59XFxuLnNjYWxlLXZhbHVlIHAge1xcbiAgZm9udDogMjBweCBcXFwiTW9udHNlcnJhdFxcXCI7XFxuICBjb2xvcjogIzNlNWQ3NTtcXG59XFxuXFxuLmFycm93LWNvbnRhaW5lciB7XFxuICB3aWR0aDogY2FsYyg5MCUgLSA2cHgpO1xcbiAgbWF4LXdpZHRoOiA0OTRweDtcXG4gIG1hcmdpbjogMTBweCBhdXRvO1xcbn1cXG4uYXJyb3ctY29udGFpbmVyIC5hcnJvdy11cCB7XFxuICB3aWR0aDogMDtcXG4gIGhlaWdodDogMDtcXG4gIGJvcmRlci1sZWZ0OiAxNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLXJpZ2h0OiAxNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xcbiAgYm9yZGVyLWJvdHRvbTogMTVweCBzb2xpZCAjM2U1ZDc1O1xcbn1cXG5cXG4ucmVzdWx0LWNvbnRhaW5lciB7XFxuICB3aWR0aDogOTAlO1xcbiAgbWFyZ2luOiBhdXRvO1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xcbiAgZ2FwOiAwcHggMHB4O1xcbn1cXG4ucmVzdWx0LWNvbnRhaW5lciAucmVzdWx0IHtcXG4gIGJvcmRlci1yYWRpdXM6IDIwcHg7XFxuICBib3JkZXI6IDNweCBzb2xpZCAjM2U1ZDc1O1xcbiAgaGVpZ2h0OiAxNTBweDtcXG4gIHdpZHRoOiA4MCU7XFxuICBtYXgtd2lkdGg6IDUwMHB4O1xcbiAgbWFyZ2luOiAyMHB4IGF1dG87XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGJveC1zaGFkb3c6IDBweCA4cHggMjVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcXG59XFxuLnJlc3VsdC1jb250YWluZXIgLnJlc3VsdCAjYXFpIHtcXG4gIGZvbnQ6IDYwcHggXFxcIkpvc2VmaW4gU2Fuc1xcXCIsIHNhbnMtc2VyaWY7XFxuICBjb2xvcjogIzI5MmUzMTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuLnJlc3VsdC1jb250YWluZXIgLnJlc3VsdCAjcXVhbGl0eSB7XFxuICBmb250OiAzMHB4IFxcXCJNb250c2VycmF0XFxcIjtcXG4gIGNvbG9yOiAjMjkyZTMxO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4uY29tcG9zaXRpb24ge1xcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcXG4gIGJvcmRlcjogM3B4IHNvbGlkICMzZTVkNzU7XFxuICBwYWRkaW5nOiAyMHB4O1xcbiAgYm94LXNoYWRvdzogMHB4IDhweCAyNXB4IDBweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xcbiAgbWFyZ2luLXRvcDogNDBweDtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlZWVlZWU7XFxufVxcbi5jb21wb3NpdGlvbiBoMyB7XFxuICBmb250OiAyNXB4IFxcXCJNb250c2VycmF0XFxcIjtcXG4gIGNvbG9yOiAjMjkyZTMxO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG4uY29tcG9zaXRpb24tZGl2IHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogcm93O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgbWFyZ2luOiAyMHB4IGF1dG87XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2M0Y2VkMztcXG4gIHBhZGRpbmctYm90dG9tOiAxMHB4O1xcbiAgcGFkZGluZy10b3A6IDEwcHg7XFxufVxcbi5jb21wb3NpdGlvbi1kaXYgcCB7XFxuICBmb250OiAyMHB4IFxcXCJNb250c2VycmF0XFxcIjtcXG4gIGNvbG9yOiAjMjkyZTMxO1xcbn1cXG5cXG4uY29tcG9zaXRpb24tZGl2Omxhc3Qtb2YtdHlwZSB7XFxuICBib3JkZXItYm90dG9tOiBub25lO1xcbiAgcGFkZGluZy1ib3R0b206IDBweDtcXG59XFxuXFxuLmhlYWx0aCB7XFxuICBib3JkZXItcmFkaXVzOiAyMHB4O1xcbiAgYm9yZGVyOiAzcHggc29saWQgIzNlNWQ3NTtcXG4gIHBhZGRpbmc6IDBweCAyMHB4IDIwcHggMjBweDtcXG4gIGJveC1zaGFkb3c6IDBweCA4cHggMjVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcXG4gIG1hcmdpbjogNDBweCBhdXRvO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2VlZWVlYTtcXG59XFxuLmhlYWx0aCBzdHJvbmcge1xcbiAgZm9udC1zaXplOiAyNXB4O1xcbiAgbWFyZ2luLWxlZnQ6IGNhbGMoNTAlIC0gMTMxcHgpO1xcbn1cXG4uaGVhbHRoIHAge1xcbiAgZm9udDogMjBweCBcXFwiTW9udHNlcnJhdFxcXCI7XFxuICBjb2xvcjogIzI5MmUzMTtcXG4gIHBhZGRpbmctdG9wOiAzMHB4O1xcbn1cXG4uaGVhbHRoIHA6Zmlyc3Qtb2YtdHlwZSB7XFxuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2M0Y2VkMztcXG4gIHBhZGRpbmctYm90dG9tOiAyMHB4O1xcbn1cXG5cXG4ubm90aWZpY2F0aW9uIHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIGJvdHRvbTogMjBweDtcXG4gIHJpZ2h0OiAyMHB4O1xcbiAgbWF4LXdpZHRoOiAzMDBweDtcXG4gIHBhZGRpbmc6IDIwcHg7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjOTAwO1xcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcXG4gIHRyYW5zaXRpb246IGFsbCAxcyBlYXNlO1xcbn1cXG4ubm90aWZpY2F0aW9uIHAge1xcbiAgZm9udDogMThweCBcXFwiTW9udHNlcnJhdFxcXCI7XFxuICBjb2xvcjogI2ZmZmZmZjtcXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAxMDgwcHgpIHtcXG4gIC5sb2dvLXJlc3VsdCB7XFxuICAgIHdpZHRoOiA5MHB4O1xcbiAgICBoZWlnaHQ6IDkwcHg7XFxuICAgIG1hcmdpbjogMjBweCAyMHB4IDUwcHggNTBweDtcXG4gIH1cXG5cXG4gIC5mb3JtLWNvbnRhaW5lciB7XFxuICAgIG1hcmdpbjogNTBweCBhdXRvIDE1MHB4O1xcbiAgfVxcblxcbiAgLmZvcm0tcmVzdWx0IHtcXG4gICAgbWFyZ2luOiAwcHg7XFxuICAgIGxlZnQ6IDE5MHB4O1xcbiAgICB0b3A6IDQwcHg7XFxuICAgIHdpZHRoOiBjYWxjKDEwMCUgLSAyNDBweCk7XFxuICB9XFxuXFxuICAucmVzdWx0LWNvbnRhaW5lciB7XFxuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDFmcik7XFxuICAgIGdyaWQtY29sdW1uLWdhcDogMzBweDtcXG4gICAgbWFyZ2luLWJvdHRvbTogNjBweDtcXG4gIH1cXG4gIC5yZXN1bHQtY29udGFpbmVyIC5yZXN1bHQge1xcbiAgICBncmlkLWFyZWE6IDEvMS8yLzM7XFxuICB9XFxuICAucmVzdWx0LWNvbnRhaW5lciAuY29tcG9zaXRpb24ge1xcbiAgICBncmlkLWFyZWE6IDIvMS8zLzI7XFxuICB9XFxuICAucmVzdWx0LWNvbnRhaW5lciAuaGVhbHRoIHtcXG4gICAgZ3JpZC1hcmVhOiAyLzIvMy8zO1xcbiAgfVxcblxcbiAgLmhlYWx0aCB7XFxuICAgIG1hcmdpbi1ib3R0b206IDBweDtcXG4gIH1cXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2Nzcy9zdHlsZS5zY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQU1BO0VBQ0UsU0FBQTtFQUNBLFVBQUE7RUFDQSxzQkFBQTtBQUhGOztBQU1BO0VBQ0UseUJBQUE7QUFIRjs7QUFPQTtFQUNFO0lBQ0UsYUFBQTtFQUpGO0VBTUE7SUFDRSxXQUFBO0VBSkY7QUFDRjtBQU1BO0VBQ0UseUJBQUE7RUFDQSxzQkFBQTtFQUNBLDRCQUFBO0FBSkY7O0FBT0E7RUFDRSwyQ0FBQTtFQUNBLFlBQUE7RUFDQSxhQUFBO0FBSkY7O0FBT0E7RUFDRSxxQ0FBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSxjQUFBO0VBQ0EsVUFBQTtFQUNBLFlBQUE7QUFKRjs7QUFPQTtFQUNFLHVCQUFBO0VBQ0Esa0JBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7QUFKRjs7QUFPQTtFQUNFLG1CQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0VBQ0EsbUJBQUE7RUFDQSxtQkFBQTtFQUNBLFlBQUE7RUFDQSxnREFBQTtFQUNBLHlCQUFBO0VBQ0EsVUFBQTtF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QVNFO0VBQ0UsdUJBQUE7RUFDQSxjQUFBO0FBUEo7O0FBYUE7RUFDRTtJQUNFLFdBQUE7SUFDQSxZQUFBO0lBQ0EsMkJBQUE7RUFWRjs7RUFZQTtJQUNFLHVCQUFBO0VBVEY7O0VBV0E7SUFDRSxXQUFBO0lBQ0EsV0FBQTtJQUNBLFNBQUE7SUFDQSx5QkFBQTtFQVJGOztFQVdBO0lBQ0UscUNBQUE7SUFDQSxxQkFBQTtJQUNBLG1CQUFBO0VBUkY7RUFVRTtJQUNFLGtCQUFBO0VBUko7RUFXRTtJQUNFLGtCQUFBO0VBVEo7RUFZRTtJQUNFLGtCQUFBO0VBVko7O0VBYUE7SUFDRSxrQkFBQTtFQVZGO0FBQ0ZcIixcInNvdXJjZXNDb250ZW50XCI6W1wiJHJlZ3VsYXI6IFxcXCJNb250c2VycmF0XFxcIjtcXHJcXG4kYm9sZDogXFxcIkpvc2VmaW4gU2Fuc1xcXCIsIHNhbnMtc2VyaWY7XFxyXFxuXFxyXFxuQGltcG9ydCB1cmwoXFxcImh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9Sm9zZWZpbitTYW5zOndnaHRANzAwJmRpc3BsYXk9c3dhcFxcXCIpO1xcclxcbkBpbXBvcnQgdXJsKFxcXCJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU1vbnRzZXJyYXQ6d2dodEA0MDA7NzAwJmRpc3BsYXk9c3dhcFxcXCIpO1xcclxcblxcclxcbioge1xcclxcbiAgbWFyZ2luOiAwO1xcclxcbiAgcGFkZGluZzogMDtcXHJcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxyXFxufVxcclxcblxcclxcbmJvZHkge1xcclxcbiAgYmFja2dyb3VuZC1jb2xvcjogIzhlYzVmYztcXHJcXG4gIC8vYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KCNlMGMzZmMsICM4ZWM1ZmMpO1xcclxcbn1cXHJcXG5cXHJcXG5Aa2V5ZnJhbWVzIHByZWxvYWRlciB7XFxyXFxuICAwJSB7XFxyXFxuICAgIG9wYWNpdHk6IDEwMCU7XFxyXFxuICB9XFxyXFxuICAxMDAlIHtcXHJcXG4gICAgb3BhY2l0eTogMCU7XFxyXFxuICB9XFxyXFxufVxcclxcbiNwcmVsb2FkZXIge1xcclxcbiAgYW5pbWF0aW9uLW5hbWU6IHByZWxvYWRlcjtcXHJcXG4gIGFuaW1hdGlvbi1kdXJhdGlvbjogM3M7XFxyXFxuICBhbmltYXRpb24taXRlcmF0aW9uLWNvdW50OiAxO1xcclxcbn1cXHJcXG5cXHJcXG4ubG9nby1jb250YWluZXIge1xcclxcbiAgbWFyZ2luOiBjYWxjKCgxMDB2aCAtIDQyMHB4KSAvIDIpIGF1dG8gMTBweDtcXHJcXG4gIHdpZHRoOiAxNzBweDtcXHJcXG4gIGhlaWdodDogMTcwcHg7XFxyXFxufVxcclxcblxcclxcbmgxIHtcXHJcXG4gIGZvbnQ6IDUwcHggJGJvbGQ7XFxyXFxuICBmb250LXdlaWdodDogYm9sZDtcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIGNvbG9yOiAjM2U1ZDc1O1xcclxcbiAgd2lkdGg6IDkwJTtcXHJcXG4gIG1hcmdpbjogYXV0bztcXHJcXG59XFxyXFxuXFxyXFxuaDMge1xcclxcbiAgZm9udDogMjVweCAkcmVndWxhcjtcXHJcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gIG1hcmdpbjogMTBweCBhdXRvO1xcclxcbiAgY29sb3I6ICMzZTVkNzU7XFxyXFxufVxcclxcblxcclxcbi5mb3JtLWNvbnRhaW5lciB7XFxyXFxuICBib3JkZXItcmFkaXVzOiA1MHB4O1xcclxcbiAgZGlzcGxheTogZmxleDtcXHJcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxyXFxuICBwYWRkaW5nOiA3LjVweCAxNXB4O1xcclxcbiAgYm9yZGVyLXJhZGl1czogMjVweDtcXHJcXG4gIGJvcmRlcjogbm9uZTtcXHJcXG4gIGJveC1zaGFkb3c6IDBweCA4cHggMjVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcXHJcXG4gIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2U7XFxyXFxuICB3aWR0aDogODUlO1xcclxcbiAgbWluLXdpZHRoOiAxMDBweDtcXHJcXG4gIG1heC13aWR0aDogODAwcHg7XFxyXFxuICBoZWlnaHQ6IDUwcHg7XFxyXFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcXHJcXG4gIG1hcmdpbjogMTAwcHggYXV0bztcXHJcXG5cXHJcXG4gIC5mb3JtIHtcXHJcXG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtIDUwcHgpO1xcclxcbiAgICBoZWlnaHQ6IDI1cHg7XFxyXFxuXFxyXFxuICAgIGlucHV0IHtcXHJcXG4gICAgICB3aWR0aDogMTAwJTtcXHJcXG4gICAgICBoZWlnaHQ6IDEwMCU7XFxyXFxuICAgICAgYm9yZGVyOiBub25lO1xcclxcbiAgICAgIHBhZGRpbmctbGVmdDogMTBweDtcXHJcXG4gICAgICBmb250OiAxNnB4ICRyZWd1bGFyO1xcclxcbiAgICB9XFxyXFxuICAgIGlucHV0OmZvY3VzIHtcXHJcXG4gICAgICBvdXRsaW5lOiBub25lO1xcclxcbiAgICB9XFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi5ibHVyIHtcXHJcXG4gIHRyYW5zaXRpb246IGFsbCAwLjI1cyBlYXNlO1xcclxcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMCk7XFxyXFxuICBib3gtc2hhZG93OiAwcHggOHB4IDI1cHggMHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XFxyXFxufVxcclxcbi5mb2N1cyB7XFxyXFxuICB0cmFuc2l0aW9uOiBhbGwgMC4yNXMgZWFzZTtcXHJcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIC02cHgpO1xcclxcbiAgYm94LXNoYWRvdzogMHB4IDE1cHggMjVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjI1KTtcXHJcXG59XFxyXFxuLnNlYXJjaC1pY29uIHtcXHJcXG4gIHRyYW5zaXRpb246IGFsbCAwLjI1cyBlYXNlO1xcclxcbiAgb3BhY2l0eTogMC43O1xcclxcbiAgd2lkdGg6IDI1cHg7XFxyXFxuICBoZWlnaHQ6IDI1cHg7XFxyXFxufVxcclxcbi5waW4taWNvbiB7XFxyXFxuICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlO1xcclxcbiAgb3BhY2l0eTogMC42O1xcclxcbiAgbWFyZ2luLWxlZnQ6IDF2bWluO1xcclxcbiAgd2lkdGg6IDI1cHg7XFxyXFxuICBoZWlnaHQ6IDI1cHg7XFxyXFxuICBjdXJzb3I6IHBvaW50ZXI7XFxyXFxufVxcclxcbi5waW4taWNvbjpob3ZlciB7XFxyXFxuICB0cmFuc2l0aW9uOiBhbGwgMC4yNXMgZWFzZTtcXHJcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIC02cHgpO1xcclxcbiAgb3BhY2l0eTogMTtcXHJcXG59XFxyXFxuXFxyXFxuLmxvZ28tcmVzdWx0IHtcXHJcXG4gIHdpZHRoOiA3MHB4O1xcclxcbiAgaGVpZ2h0OiA3MHB4O1xcclxcbiAgbWFyZ2luOiAyMHB4IDIwcHggNTBweCAyMHB4O1xcclxcbiAgY3Vyc29yOiBwb2ludGVyO1xcclxcbn1cXHJcXG4uZm9ybS1yZXN1bHQge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgdG9wOiAzMHB4O1xcclxcbiAgcmlnaHQ6IDIwcHg7XFxyXFxuICB3aWR0aDogY2FsYygxMDAlIC0gMTMwcHgpO1xcclxcbiAgbWF4LXdpZHRoOiBub25lO1xcclxcbiAgbWFyZ2luOiAwcHg7XFxyXFxuICB0cmFuc2l0aW9uOiBhbGwgMC41cyBlYXNlO1xcclxcbn1cXHJcXG5cXHJcXG4uc2NhbGUtY29udGFpbmVyIHtcXHJcXG4gIGRpc3BsYXk6IGdyaWQ7XFxyXFxuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciAxZnIgMWZyIDFmciAxZnIgMWZyO1xcclxcbiAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiAxZnI7XFxyXFxuICBnYXA6IDBweCAwcHg7XFxyXFxuICB3aWR0aDogOTAlO1xcclxcbiAgbWF4LXdpZHRoOiA1MDBweDtcXHJcXG4gIGhlaWdodDogNDBweDtcXHJcXG4gIGJvcmRlci1yYWRpdXM6IDIwcHg7XFxyXFxuICBib3JkZXI6IDNweCBzb2xpZCAjM2U1ZDc1O1xcclxcbiAgbWFyZ2luOiAwcHggYXV0bztcXHJcXG4gIGJveC1zaGFkb3c6IDBweCA4cHggMjVweCAwcHggcmdiYSgwLCAwLCAwLCAwLjE1KTtcXHJcXG59XFxyXFxuXFxyXFxuLnNjYWxlLWhpZGRlbixcXHJcXG4uc2NhbGUtdW5pdC1oaWRkZW4ge1xcclxcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xcclxcbiAgd2lkdGg6IDBweDtcXHJcXG4gIGhlaWdodDogMHB4O1xcclxcbn1cXHJcXG5cXHJcXG4uc2NhbGUtdW5pdCB7XFxyXFxuICB2aXNpYmlsaXR5OiB2aXNpYmxlO1xcclxcbiAgd2lkdGg6IDEwMCU7XFxyXFxuICBoZWlnaHQ6IDEwMCU7XFxyXFxufVxcclxcblxcclxcbi5zY2FsZS12YWx1ZSB7XFxyXFxuICB3aWR0aDogOTAlO1xcclxcbiAgbWF4LXdpZHRoOiA1MDBweDtcXHJcXG4gIGRpc3BsYXk6IGZsZXg7XFxyXFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxyXFxuICBtYXJnaW46IDQwcHggYXV0byAxMHB4O1xcclxcblxcclxcbiAgcCB7XFxyXFxuICAgIGZvbnQ6IDIwcHggJHJlZ3VsYXI7XFxyXFxuICAgIGNvbG9yOiAjM2U1ZDc1O1xcclxcbiAgfVxcclxcbn1cXHJcXG5cXHJcXG4uYXJyb3ctY29udGFpbmVyIHtcXHJcXG4gIHdpZHRoOiBjYWxjKDkwJSAtIDZweCk7XFxyXFxuICBtYXgtd2lkdGg6IDQ5NHB4O1xcclxcbiAgbWFyZ2luOiAxMHB4IGF1dG87XFxyXFxuXFxyXFxuICAuYXJyb3ctdXAge1xcclxcbiAgICB3aWR0aDogMDtcXHJcXG4gICAgaGVpZ2h0OiAwO1xcclxcbiAgICBib3JkZXItbGVmdDogMTVweCBzb2xpZCB0cmFuc3BhcmVudDtcXHJcXG4gICAgYm9yZGVyLXJpZ2h0OiAxNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xcclxcbiAgICBib3JkZXItYm90dG9tOiAxNXB4IHNvbGlkICMzZTVkNzU7XFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi5yZXN1bHQtY29udGFpbmVyIHtcXHJcXG4gIHdpZHRoOiA5MCU7XFxyXFxuICBtYXJnaW46IGF1dG87XFxyXFxuICBkaXNwbGF5OiBncmlkO1xcclxcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XFxyXFxuICBnYXA6IDBweCAwcHg7XFxyXFxuXFxyXFxuICAucmVzdWx0IHtcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogMjBweDtcXHJcXG4gICAgYm9yZGVyOiAzcHggc29saWQgIzNlNWQ3NTtcXHJcXG4gICAgaGVpZ2h0OiAxNTBweDtcXHJcXG4gICAgd2lkdGg6IDgwJTtcXHJcXG4gICAgbWF4LXdpZHRoOiA1MDBweDtcXHJcXG4gICAgbWFyZ2luOiAyMHB4IGF1dG87XFxyXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxyXFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxyXFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxyXFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcclxcbiAgICBib3gtc2hhZG93OiAwcHggOHB4IDI1cHggMHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XFxyXFxuXFxyXFxuICAgICNhcWkge1xcclxcbiAgICAgIGZvbnQ6IDYwcHggJGJvbGQ7XFxyXFxuICAgICAgY29sb3I6ICMyOTJlMzE7XFxyXFxuICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xcclxcbiAgICB9XFxyXFxuICAgICNxdWFsaXR5IHtcXHJcXG4gICAgICBmb250OiAzMHB4ICRyZWd1bGFyO1xcclxcbiAgICAgIGNvbG9yOiAjMjkyZTMxO1xcclxcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXHJcXG4gICAgfVxcclxcbiAgfVxcclxcbn1cXHJcXG5cXHJcXG4uY29tcG9zaXRpb24ge1xcclxcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcXHJcXG4gIGJvcmRlcjogM3B4IHNvbGlkICMzZTVkNzU7XFxyXFxuICBwYWRkaW5nOiAyMHB4O1xcclxcbiAgYm94LXNoYWRvdzogMHB4IDhweCAyNXB4IDBweCByZ2JhKDAsIDAsIDAsIDAuMTUpO1xcclxcbiAgbWFyZ2luLXRvcDogNDBweDtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlZWVlZWU7XFxyXFxuXFxyXFxuICBoMyB7XFxyXFxuICAgIGZvbnQ6IDI1cHggJHJlZ3VsYXI7XFxyXFxuICAgIGNvbG9yOiAjMjkyZTMxO1xcclxcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi5jb21wb3NpdGlvbi1kaXYge1xcclxcbiAgZGlzcGxheTogZmxleDtcXHJcXG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxyXFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxyXFxuICBtYXJnaW46IDIwcHggYXV0bztcXHJcXG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjYzRjZWQzO1xcclxcbiAgcGFkZGluZy1ib3R0b206IDEwcHg7XFxyXFxuICBwYWRkaW5nLXRvcDogMTBweDtcXHJcXG5cXHJcXG4gIHAge1xcclxcbiAgICBmb250OiAyMHB4ICRyZWd1bGFyO1xcclxcbiAgICBjb2xvcjogIzI5MmUzMTtcXHJcXG4gIH1cXHJcXG59XFxyXFxuLmNvbXBvc2l0aW9uLWRpdjpsYXN0LW9mLXR5cGUge1xcclxcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXHJcXG4gIHBhZGRpbmctYm90dG9tOiAwcHg7XFxyXFxufVxcclxcblxcclxcbi5oZWFsdGgge1xcclxcbiAgYm9yZGVyLXJhZGl1czogMjBweDtcXHJcXG4gIGJvcmRlcjogM3B4IHNvbGlkICMzZTVkNzU7XFxyXFxuICBwYWRkaW5nOiAwcHggMjBweCAyMHB4IDIwcHg7XFxyXFxuICBib3gtc2hhZG93OiAwcHggOHB4IDI1cHggMHB4IHJnYmEoMCwgMCwgMCwgMC4xNSk7XFxyXFxuICBtYXJnaW46IDQwcHggYXV0bztcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICNlZWVlZWE7XFxyXFxuXFxyXFxuICBzdHJvbmcge1xcclxcbiAgICBmb250LXNpemU6IDI1cHg7XFxyXFxuICAgIG1hcmdpbi1sZWZ0OiBjYWxjKDUwJSAtIDEzMXB4KTtcXHJcXG4gIH1cXHJcXG4gIHAge1xcclxcbiAgICBmb250OiAyMHB4ICRyZWd1bGFyO1xcclxcbiAgICBjb2xvcjogIzI5MmUzMTtcXHJcXG4gICAgcGFkZGluZy10b3A6IDMwcHg7XFxyXFxuICB9XFxyXFxuICBwOmZpcnN0LW9mLXR5cGUge1xcclxcbiAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgI2M0Y2VkMztcXHJcXG4gICAgcGFkZGluZy1ib3R0b206IDIwcHg7XFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi5ub3RpZmljYXRpb24ge1xcclxcbiAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgYm90dG9tOiAyMHB4O1xcclxcbiAgcmlnaHQ6IDIwcHg7XFxyXFxuICBtYXgtd2lkdGg6IDMwMHB4O1xcclxcbiAgcGFkZGluZzogMjBweDtcXHJcXG4gIGJhY2tncm91bmQtY29sb3I6ICM5MDA7XFxyXFxuICBib3JkZXItcmFkaXVzOiAyMHB4O1xcclxcbiAgdHJhbnNpdGlvbjogYWxsIDFzIGVhc2U7XFxyXFxuXFxyXFxuICBwIHtcXHJcXG4gICAgZm9udDogMThweCAkcmVndWxhcjtcXHJcXG4gICAgY29sb3I6ICNmZmZmZmY7XFxyXFxuICB9XFxyXFxufVxcclxcblxcclxcbi8vbWVkaWEgcXVlcmllc1xcclxcblxcclxcbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogMTA4MHB4KSB7XFxyXFxuICAubG9nby1yZXN1bHQge1xcclxcbiAgICB3aWR0aDogOTBweDtcXHJcXG4gICAgaGVpZ2h0OiA5MHB4O1xcclxcbiAgICBtYXJnaW46IDIwcHggMjBweCA1MHB4IDUwcHg7XFxyXFxuICB9XFxyXFxuICAuZm9ybS1jb250YWluZXIge1xcclxcbiAgICBtYXJnaW46IDUwcHggYXV0byAxNTBweDtcXHJcXG4gIH1cXHJcXG4gIC5mb3JtLXJlc3VsdCB7XFxyXFxuICAgIG1hcmdpbjogMHB4O1xcclxcbiAgICBsZWZ0OiAxOTBweDtcXHJcXG4gICAgdG9wOiA0MHB4O1xcclxcbiAgICB3aWR0aDogY2FsYygxMDAlIC0gMjQwcHgpO1xcclxcbiAgfVxcclxcblxcclxcbiAgLnJlc3VsdC1jb250YWluZXIge1xcclxcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xcclxcbiAgICBncmlkLWNvbHVtbi1nYXA6IDMwcHg7XFxyXFxuICAgIG1hcmdpbi1ib3R0b206IDYwcHg7XFxyXFxuXFxyXFxuICAgIC5yZXN1bHQge1xcclxcbiAgICAgIGdyaWQtYXJlYTogMSAvIDEgLyAyIC8gMztcXHJcXG4gICAgfVxcclxcblxcclxcbiAgICAuY29tcG9zaXRpb24ge1xcclxcbiAgICAgIGdyaWQtYXJlYTogMiAvIDEgLyAzIC8gMjtcXHJcXG4gICAgfVxcclxcblxcclxcbiAgICAuaGVhbHRoIHtcXHJcXG4gICAgICBncmlkLWFyZWE6IDIgLyAyIC8gMyAvIDM7XFxyXFxuICAgIH1cXHJcXG4gIH1cXHJcXG4gIC5oZWFsdGgge1xcclxcbiAgICBtYXJnaW4tYm90dG9tOiAwcHg7XFxyXFxuICB9XFxyXFxufVxcclxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCB0aGlzLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW19pXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IG1vZHVsZXMubGVuZ3RoOyBfaTIrKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfaTJdKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblxuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICB2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIFwiLyojIHNvdXJjZVVSTD1cIi5jb25jYXQoY3NzTWFwcGluZy5zb3VyY2VSb290IHx8IFwiXCIpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuc2Nzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLnNjc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiZXhwb3J0IGRlZmF1bHQgXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQmxibU52WkdsdVp6MGlkWFJtTFRnaVB6NE5DandoTFMwZ1IyVnVaWEpoZEc5eU9pQkJaRzlpWlNCSmJHeDFjM1J5WVhSdmNpQXlOUzQwTGpFc0lGTldSeUJGZUhCdmNuUWdVR3gxWnkxSmJpQXVJRk5XUnlCV1pYSnphVzl1T2lBMkxqQXdJRUoxYVd4a0lEQXBJQ0F0TFQ0TkNqd2hSRTlEVkZsUVJTQnpkbWNnVUZWQ1RFbERJQ0l0THk5WE0wTXZMMFJVUkNCVFZrY2dNUzR4THk5RlRpSWdJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5MMGR5WVhCb2FXTnpMMU5XUnk4eExqRXZSRlJFTDNOMlp6RXhMbVIwWkNJZ1d3MEtDVHdoUlU1VVNWUlpJRzV6WDJWNGRHVnVaQ0FpYUhSMGNEb3ZMMjV6TG1Ga2IySmxMbU52YlM5RmVIUmxibk5wWW1sc2FYUjVMekV1TUM4aVBnMEtDVHdoUlU1VVNWUlpJRzV6WDJGcElDSm9kSFJ3T2k4dmJuTXVZV1J2WW1VdVkyOXRMMEZrYjJKbFNXeHNkWE4wY21GMGIzSXZNVEF1TUM4aVBnMEtDVHdoUlU1VVNWUlpJRzV6WDJkeVlYQm9jeUFpYUhSMGNEb3ZMMjV6TG1Ga2IySmxMbU52YlM5SGNtRndhSE12TVM0d0x5SStEUW9KUENGRlRsUkpWRmtnYm5OZmRtRnljeUFpYUhSMGNEb3ZMMjV6TG1Ga2IySmxMbU52YlM5V1lYSnBZV0pzWlhNdk1TNHdMeUkrRFFvSlBDRkZUbFJKVkZrZ2JuTmZhVzF5WlhBZ0ltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZTVzFoWjJWU1pYQnNZV05sYldWdWRDOHhMakF2SWo0TkNnazhJVVZPVkVsVVdTQnVjMTl6Wm5jZ0ltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZVMkYyWlVadmNsZGxZaTh4TGpBdklqNE5DZ2s4SVVWT1ZFbFVXU0J1YzE5amRYTjBiMjBnSW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdlIyVnVaWEpwWTBOMWMzUnZiVTVoYldWemNHRmpaUzh4TGpBdklqNE5DZ2s4SVVWT1ZFbFVXU0J1YzE5aFpHOWlaVjk0Y0dGMGFDQWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlZVUdGMGFDOHhMakF2SWo0TkNsMCtEUW84YzNabklIWmxjbk5wYjI0OUlqRXVNU0lnYVdROUlreHBkbVZzYkc5Zk1TSWdlRzFzYm5NNmVEMGlKbTV6WDJWNGRHVnVaRHNpSUhodGJHNXpPbWs5SWladWMxOWhhVHNpSUhodGJHNXpPbWR5WVhCb1BTSW1ibk5mWjNKaGNHaHpPeUlOQ2drZ2VHMXNibk05SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpJd01EQXZjM1puSWlCNGJXeHVjenA0YkdsdWF6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNVGs1T1M5NGJHbHVheUlnZUQwaU1IQjRJaUI1UFNJd2NIZ2lJSFpwWlhkQ2IzZzlJakFnTUNBME1EQXdJRFF3TURBaURRb0pJSE4wZVd4bFBTSmxibUZpYkdVdFltRmphMmR5YjNWdVpEcHVaWGNnTUNBd0lEUXdNREFnTkRBd01Ec2lJSGh0YkRwemNHRmpaVDBpY0hKbGMyVnlkbVVpUGcwS1BITjBlV3hsSUhSNWNHVTlJblJsZUhRdlkzTnpJajROQ2drdVQyMWljbUZmZURBd01qQmZaWE4wWlhKdVlYdG1hV3hzT201dmJtVTdmUTBLQ1M1Q1lXZHNhVzl5WlY5NE1EQXlNRjlsYzNSbGNtNXZYM2d3TURJd1h6VmZlREF3TWpCZmNIUjdabWxzYkRwdWIyNWxPMzBOQ2drdVNtbDJaVjlIVTN0bWFXeHNPaU5CTmtRd1JUUTdmUTBLQ1M1emREQjdabWxzYkRvak1EVTFNVFU1TzMwTkNqd3ZjM1I1YkdVK0RRbzhiV1YwWVdSaGRHRStEUW9KUEhObWR5QWdlRzFzYm5NOUlpWnVjMTl6Wm5jN0lqNE5DZ2tKUEhOc2FXTmxjejQ4TDNOc2FXTmxjejROQ2drSlBITnNhV05sVTI5MWNtTmxRbTkxYm1SeklDQmliM1IwYjIxTVpXWjBUM0pwWjJsdVBTSjBjblZsSWlCb1pXbG5hSFE5SWpNNU9UY3VPQ0lnZDJsa2RHZzlJak01TnpVdU9TSWdlRDBpTVRnaUlIazlJaTAwTURBMkxqZ2lQand2YzJ4cFkyVlRiM1Z5WTJWQ2IzVnVaSE0rRFFvSlBDOXpabmMrRFFvOEwyMWxkR0ZrWVhSaFBnMEtQR2MrRFFvSlBHYytEUW9KQ1R4d1lYUm9JR05zWVhOelBTSnpkREFpSUdROUlrMHpOamN3TGpFc01qQXdPR010TUM0eExEZ3pMamd0TlM0M0xERTJOeTQxTFRFMkxqZ3NNalV3TGpWak1TNDVMVEUwTGpRc015NDVMVEk0TGpjc05TNDRMVFF6TGpGakxUSXlMREUyTUM0NUxUWTFMakVzTXpFNExqTXRNVEk0TGpFc05EWTNMamtOQ2drSkNXTTFMalF0TVRJdU9Td3hNQzQ1TFRJMUxqZ3NNVFl1TXkwek9DNDNZeTAyTVM0NUxERTBOUzQ1TFRFME1pNDBMREk0TXk0MExUSXpPUzR5TERRd09DNDVZemd1TkMweE1DNDVMREUyTGprdE1qRXVPU3d5TlM0ekxUTXlMamdOQ2drSkNXTXRPVFV1TkN3eE1qTXRNakExTGprc01qTXpMamN0TXpJNExqa3NNekk1TGpGak1UQXVPUzA0TGpRc01qRXVPUzB4Tmk0NUxETXlMamd0TWpVdU0yTXRNVEkxTGpFc09UWXVOaTB5TmpJdU1pd3hOemN0TkRBM0xqZ3NNak00TGpZTkNna0pDV014TWk0NUxUVXVOQ3d5TlM0NExURXdMamtzTXpndU55MHhOaTR6WXkweE5EY3VOU3cyTVM0NUxUTXdNaTQyTERFd05DNHlMVFEyTVM0eExERXlOUzQzWXpFMExqUXRNUzQ1TERJNExqY3RNeTQ1TERRekxqRXROUzQ0WXkweE5qRXVPU3d5TVM0MUxUTXlOaTR5TERJeExqVXRORGc0TGpFc01BMEtDUWtKWXpFMExqUXNNUzQ1TERJNExqY3NNeTQ1TERRekxqRXNOUzQ0WXkweE5UZ3VOUzB5TVM0MUxUTXhNeTQyTFRZekxqZ3RORFl4TGpFdE1USTFMamRqTVRJdU9TdzFMalFzTWpVdU9Dd3hNQzQ1TERNNExqY3NNVFl1TXcwS0NRa0pZeTB4TkRVdU5pMDJNUzQyTFRJNE1pNDNMVEUwTVM0NUxUUXdOeTQ0TFRJek9DNDJZekV3TGprc09DNDBMREl4TGprc01UWXVPU3d6TWk0NExESTFMak5qTFRFeU1pNDVMVGsxTGpVdE1qTXpMalV0TWpBMkxqRXRNekk0TGprdE16STVMakVOQ2drSkNXTTRMalFzTVRBdU9Td3hOaTQ1TERJeExqa3NNalV1TXl3ek1pNDRZeTA1Tmk0NExURXlOUzQxTFRFM055NHpMVEkyTXkweU16a3VNaTAwTURndU9XTTFMalFzTVRJdU9Td3hNQzQ1TERJMUxqZ3NNVFl1TXl3ek9DNDNZeTAyTXkweE5Ea3VOaTB4TURZdU1TMHpNRGN0TVRJNExqRXRORFkzTGprTkNna0pDV014TGprc01UUXVOQ3d6TGprc01qZ3VOeXcxTGpnc05ETXVNV010TWpJdU15MHhOall1TWkweU1pNHpMVE16TkM0NUxEQXROVEF4WXkweExqa3NNVFF1TkMwekxqa3NNamd1TnkwMUxqZ3NORE11TVdNeU1pMHhOakF1T1N3Mk5TNHhMVE14T0M0ekxERXlPQzR4TFRRMk55NDVEUW9KQ1FsakxUVXVOQ3d4TWk0NUxURXdMamtzTWpVdU9DMHhOaTR6TERNNExqZGpOakV1T1MweE5EVXVPU3d4TkRJdU5DMHlPRE11TkN3eU16a3VNaTAwTURndU9XTXRPQzQwTERFd0xqa3RNVFl1T1N3eU1TNDVMVEkxTGpNc016SXVPQTBLQ1FrSll6azFMalF0TVRJekxESXdOUzQ1TFRJek15NDNMRE15T0M0NUxUTXlPUzR4WXkweE1DNDVMRGd1TkMweU1TNDVMREUyTGprdE16SXVPQ3d5TlM0ell6RXlOUzR4TFRrMkxqWXNNall5TGpJdE1UYzNMRFF3Tnk0NExUSXpPQzQyRFFvSkNRbGpMVEV5TGprc05TNDBMVEkxTGpnc01UQXVPUzB6T0M0M0xERTJMak5qTVRRM0xqVXROakV1T1N3ek1ESXVOaTB4TURRdU1pdzBOakV1TVMweE1qVXVOMk10TVRRdU5Dd3hMamt0TWpndU55d3pMamt0TkRNdU1TdzFMamhqTVRZeExqa3RNakV1TlN3ek1qWXVNaTB5TVM0MUxEUTRPQzR4TERBTkNna0pDV010TVRRdU5DMHhMamt0TWpndU55MHpMamt0TkRNdU1TMDFMamhqTVRVNExqVXNNakV1TlN3ek1UTXVOaXcyTXk0NExEUTJNUzR4TERFeU5TNDNZeTB4TWk0NUxUVXVOQzB5TlM0NExURXdMamt0TXpndU55MHhOaTR6RFFvSkNRbGpNVFExTGpZc05qRXVOaXd5T0RJdU55d3hOREV1T1N3ME1EY3VPQ3d5TXpndU5tTXRNVEF1T1MwNExqUXRNakV1T1MweE5pNDVMVE15TGpndE1qVXVNMk14TWpJdU9TdzVOUzQxTERJek15NDFMREl3Tmk0eExETXlPQzQ1TERNeU9TNHhEUW9KQ1FsakxUZ3VOQzB4TUM0NUxURTJMamt0TWpFdU9TMHlOUzR6TFRNeUxqaGpPVFl1T0N3eE1qVXVOU3d4TnpjdU15d3lOak1zTWpNNUxqSXNOREE0TGpsakxUVXVOQzB4TWk0NUxURXdMamt0TWpVdU9DMHhOaTR6TFRNNExqZGpOak1zTVRRNUxqWXNNVEEyTGpFc016QTNMREV5T0M0eExEUTJOeTQ1RFFvSkNRbGpMVEV1T1MweE5DNDBMVE11T1MweU9DNDNMVFV1T0MwME15NHhRek0yTmpRdU5Dd3hPRFF3TGpVc016WTJPUzQ1TERFNU1qUXVNaXd6Tmpjd0xqRXNNakF3T0dNd0xqRXNOREV1Tml3eE9DdzROUzR4TERRM0xqUXNNVEUwTGpVTkNna0pDV015T0M0eExESTRMakVzTnpRdU1pdzBPUzR5TERFeE5DNDFMRFEzTGpSak9EY3VOaTB6TGprc01UWXlMakV0TnpFdU1pd3hOakV1T1MweE5qRXVPV010TUM0ekxUSXdOaTQwTFRNeExqVXROREUxTGpVdE9UVXROakV5RFFvSkNRbGpMVFl4TGpRdE1UZzVMamN0TVRRNUxqa3RNemN5TGpNdE1qWTFMak10TlRNMUxqRmpMVFl3TGpNdE9EVXVNUzB4TWpZdU1pMHhOamN0TVRrNExqUXRNalF5TGpOakxUY3lMalV0TnpVdU5pMHhOVEV1TmkweE5ETXRNak0wTGpVdE1qQTJMamtOQ2drSkNXTXRNVFU0TGpFdE1USXhMamt0TXpNMExqTXRNakUxTGpNdE5USXhMalF0TWpnMExqVmpMVEU1TVM0NUxUY3hMVE01TnkweE1EZ3VPQzAyTURFdU15MHhNVFl1T0dNdE1qQTJMakV0T0M0eExUUXhOaTQxTERFM0xqUXROakUwTGpnc056UU5DZ2tKQ1dNdE1Ua3hMaklzTlRRdU5pMHpOell1Tnl3eE16Z3VPQzAxTkRJdU5Dd3lORGd1TjJNdE1UWTBMalFzTVRBNUxUTXhOQzQzTERJME1DNDNMVFF6T1M0M0xETTVNeTQxWXkwMk5pNHpMRGd4TFRFeU9DNHlMREUyTlM0NExURTRNUzQ0TERJMU5TNDREUW9KQ1FsakxUVTBMak1zT1RFdE9UZ3VPU3d4T0RZdU5TMHhNemtzTWpnMExqVkRPREl1Tml3eE5EVTNMRE01TGpRc01UWTFPUzR5TERJekxqWXNNVGcyTXk0M1l5MHhOaTR4TERJd055NDVMREl1T1N3ME1qQXVNaXcxTVM0NExEWXlNaTQzRFFvSkNRbGpORGNzTVRrMExqVXNNVEkxTGpVc016ZzBMaklzTWpJNExqZ3NOVFUxTGpSak1UQXhMamNzTVRZNExqWXNNakk1TGpNc016STBMalVzTXpjMkxqTXNORFUxTGpaak1UUTNMREV6TVM0eExETXhNaTR6TERJME15NHlMRFE1TVM0NExETXlOQzQ0RFFvSkNRbGpPVGN1TkN3ME5DNHpMREU1Tnk0MExEZ3pMRE13TUM0MUxERXhNUzQ1WXpFd05DNDJMREk1TGpNc01qRXhMalFzTkRjdU5pd3pNVGt1TWl3Mk1DNHlZekl3Tnk0eExESTBMak1zTkRFM0xqa3NNVEV1Tnl3Mk1qSXRNekFOQ2drSkNXTXhPVFl1TVMwME1Dd3pPRGN1TXkweE1UTXVNeXcxTmpFdU9DMHlNVEV1TW1NeE56RXVOUzA1Tmk0eUxETXpNQzQyTFRJeU1DNHlMRFEyTmkwek5qSXVPV014TXpVdU15MHhOREl1Tnl3eU5USXRNekEyTGpJc016TTVMak10TkRneUxqVU5DZ2tKQ1dNNU1DMHhPREV1Tnl3eE5UVXVNaTB6TnpVdU55d3hPRFV1T0MwMU56WXVNMk14Tmk0MExURXdOeTR6TERJMkxqZ3RNakUxTERJMkxqa3RNekl6TGpaak1DNHhMVFF4TGpVdE1UZ3VNUzA0TlM0eUxUUTNMalF0TVRFMExqVU5DZ2tKQ1dNdE1qZ3VNUzB5T0M0eExUYzBMakl0TkRrdU1pMHhNVFF1TlMwME55NDBRek0zTkRRdU1pd3hPRFV3TERNMk56QXVNaXd4T1RFM0xqSXNNelkzTUM0eExESXdNRGg2SWk4K0RRb0pQQzluUGcwS1BDOW5QZzBLUEdjK0RRb0pQR2MrRFFvSkNUeHdZWFJvSUdOc1lYTnpQU0p6ZERBaUlHUTlJazAyTWpjdU1pd3lOekU1TGpKak55NDFMVEV5TGpJc01UVXRNalF1TkN3eU1pNDFMVE0yTGpaak1qQXVOQzB6TXk0eUxEUXdMamt0TmpZdU5DdzJNUzR6TFRrNUxqWmpNekF1TWkwME9TNHhMRFl3TGpVdE9UZ3VNaXc1TUM0M0xURTBOeTR6RFFvSkNRbGpNell1T1MwMU9TNDVMRGN6TGpndE1URTVMamdzTVRFd0xqY3RNVGM1TGpkak5EQXVOQzAyTlM0MkxEZ3dMamd0TVRNeExqSXNNVEl4TGpJdE1UazJMamhqTkRBdU9DMDJOaTR5TERneExqWXRNVE15TGpVc01USXlMalF0TVRrNExqY05DZ2tKQ1dNek9DMDJNUzQ0TERjMkxqRXRNVEl6TGpVc01URTBMakV0TVRnMUxqTmpNekl1TWkwMU1pNHlMRFkwTGpNdE1UQTBMalFzT1RZdU5TMHhOVFl1Tm1NeU15NHhMVE0zTGpVc05EWXVNaTAzTlM0eExEWTVMalF0TVRFeUxqWmpNVEV0TVRjdU9Dd3lNaTB6TlM0MkxETXlMamt0TlRNdU5BMEtDUWtKWXpBdU5TMHdMamdzTUM0NUxURXVOU3d4TGpRdE1pNHpZekV5TGpjdE1qQXNNVGt1TmkwME1TNDFMREl3TGpZdE5qUXVOMk0xTGpJdE1qTXVNU3cwTGpFdE5EWXVNeTB6TGpFdE5qa3VOR010TlM0MExUSXlMall0TVRVdU9DMDBNaTQwTFRNeExqRXROVGt1TWcwS0NRa0pZeTB4TWk0ekxURTRMamt0TWpndU5TMHpNeTQ1TFRRNExqZ3RORFF1T0dNdE1UTXVPUzAxTGpndE1qY3VOeTB4TVM0M0xUUXhMall0TVRjdU5XTXRNekF1T0MwNExqTXROakV1TnkwNExqTXRPVEl1TlN3d1l5MHhNeTQ1TERVdU9DMHlOeTQzTERFeExqY3ROREV1Tml3eE55NDFEUW9KQ1FsakxUSTJMakVzTVRVdU5TMDBOeXd6Tmk0ekxUWXlMalFzTmpJdU5HTXROeTQxTERFeUxqSXRNVFVzTWpRdU5DMHlNaTQxTERNMkxqWmpMVEl3TGpRc016TXVNaTAwTUM0NUxEWTJMalF0TmpFdU15dzVPUzQyWXkwek1DNHlMRFE1TGpFdE5qQXVOU3c1T0M0eUxUa3dMamNzTVRRM0xqTU5DZ2tKQ1dNdE16WXVPU3cxT1M0NUxUY3pMamdzTVRFNUxqZ3RNVEV3TGpjc01UYzVMamRqTFRRd0xqUXNOalV1TmkwNE1DNDRMREV6TVM0eUxURXlNUzR5TERFNU5pNDRZeTAwTUM0NExEWTJMakl0T0RFdU5pd3hNekl1TlMweE1qSXVOQ3d4T1RndU53MEtDUWtKWXkwek9DdzJNUzQ0TFRjMkxqRXNNVEl6TGpVdE1URTBMakVzTVRnMUxqTmpMVE15TGpJc05USXVNaTAyTkM0ekxERXdOQzQwTFRrMkxqVXNNVFUyTGpaakxUSXpMakVzTXpjdU5TMDBOaTR5TERjMUxqRXROamt1TkN3eE1USXVObU10TVRFc01UY3VPQzB5TWl3ek5TNDJMVE15TGprc05UTXVOQTBLQ1FrSll5MHdMalVzTUM0NExUQXVPU3d4TGpVdE1TNDBMREl1TTJNdE1USXVOeXd5TUMweE9TNDJMRFF4TGpVdE1qQXVOaXcyTkM0M1l5MDFMaklzTWpNdU1TMDBMakVzTkRZdU15d3pMakVzTmprdU5HTTFMalFzTWpJdU5pd3hOUzQ0TERReUxqUXNNekV1TVN3MU9TNHlEUW9KQ1Fsak1USXVNeXd4T0M0NUxESTRMalVzTXpNdU9TdzBPQzQ0TERRMExqaGpNVE11T1N3MUxqZ3NNamN1Tnl3eE1TNDNMRFF4TGpZc01UY3VOV016TUM0NExEZ3VNeXcyTVM0M0xEZ3VNeXc1TWk0MUxEQmpNVE11T1MwMUxqZ3NNamN1TnkweE1TNDNMRFF4TGpZdE1UY3VOUTBLQ1FrSlF6VTVNU3d5TnpZMkxqSXNOakV4TGpnc01qYzBOUzR6TERZeU55NHlMREkzTVRrdU1rdzJNamN1TWl3eU56RTVMako2SWk4K0RRb0pDVHh3WVhSb0lHTnNZWE56UFNKemREQWlJR1E5SWsweE1UWTVMamtzTVRNMU1DNDFZellzT1M0MkxERXlMREU1TGpJc01UZ3NNamd1T0dNeE5pNHlMREkyTERNeUxqTXNOVEV1T1N3ME9DNDFMRGMzTGpsak1qUXNNemd1Tml3ME9DNHhMRGMzTGpJc056SXVNU3d4TVRVdU9BMEtDUWtKWXpJNUxqSXNORFl1T0N3MU9DNHpMRGt6TGpjc09EY3VOU3d4TkRBdU5XTXpNaTR4TERVeExqWXNOalF1TWl3eE1ETXVNaXc1Tmk0ekxERTFOQzQ0WXpNeUxqSXNOVEV1T0N3Mk5DNDFMREV3TXk0MUxEazJMamNzTVRVMUxqTU5DZ2tKQ1dNek1DNHlMRFE0TGpVc05qQXVOQ3c1Tnk0eExEa3dMamNzTVRRMUxqWmpNalV1TkN3ME1DNDRMRFV3TGpnc09ERXVOaXczTmk0eUxERXlNaTQwWXpFNExqUXNNamt1TlN3ek5pNDNMRFU1TERVMUxqRXNPRGd1TldNNExqWXNNVE11T1N3eE55NHlMREkzTGpnc01qVXVPU3cwTVM0MkRRb0pDUWxqTUM0MExEQXVOaXd3TGpjc01TNHlMREV1TVN3eExqaGpNVEF1T1N3eU1DNHpMREkxTGprc016WXVOaXcwTkM0NExEUTRMamhqTVRZdU9Dd3hOUzQwTERNMkxqVXNNalV1T0N3MU9TNHlMRE14TGpGak1qTXVNU3czTGpNc05EWXVNeXc0TGpNc05qa3VOQ3d6TGpFTkNna0pDV015TXk0eUxURXVNU3cwTkM0M0xUY3VPU3cyTkM0M0xUSXdMalpqTVRFdU55MDVMakVzTWpNdU5TMHhPQzR4TERNMUxqSXRNamN1TW1NeU1TNDJMVEl4TGpjc016WXVOUzAwTnk0ekxEUTBMamN0TnpZdU9HTXlMakV0TVRVdU5DdzBMakV0TXpBdU9DdzJMakl0TkRZdU13MEtDUWtKWXkwd0xqRXRNekV1TkMwNExUWXdMamN0TWpNdU9DMDROeTQ0WXkwMkxUa3VOaTB4TWkweE9TNHlMVEU0TFRJNExqaGpMVEUyTGpJdE1qWXRNekl1TXkwMU1TNDVMVFE0TGpVdE56Y3VPV010TWpRdE16Z3VOaTAwT0M0eExUYzNMakl0TnpJdU1TMHhNVFV1T0EwS0NRa0pZeTB5T1M0eUxUUTJMamd0TlRndU15MDVNeTQzTFRnM0xqVXRNVFF3TGpWakxUTXlMakV0TlRFdU5pMDJOQzR5TFRFd015NHlMVGsyTGpNdE1UVTBMamhqTFRNeUxqSXROVEV1T0MwMk5DNDFMVEV3TXk0MUxUazJMamN0TVRVMUxqTU5DZ2tKQ1dNdE16QXVNaTAwT0M0MUxUWXdMalF0T1RjdU1TMDVNQzQzTFRFME5TNDJZeTB5TlM0MExUUXdMamd0TlRBdU9DMDRNUzQyTFRjMkxqSXRNVEl5TGpSakxURTRMalF0TWprdU5TMHpOaTQzTFRVNUxUVTFMakV0T0RndU5XTXRPQzQyTFRFekxqa3RNVGN1TWkweU55NDRMVEkxTGprdE5ERXVOZzBLQ1FrSll5MHdMalF0TUM0MkxUQXVOeTB4TGpJdE1TNHhMVEV1T0dNdE1UQXVPUzB5TUM0ekxUSTFMamt0TXpZdU5pMDBOQzQ0TFRRNExqaGpMVEUyTGpndE1UVXVOQzB6Tmk0MUxUSTFMamd0TlRrdU1pMHpNUzR4WXkweU15NHhMVGN1TXkwME5pNHpMVGd1TXkwMk9TNDBMVE11TVEwS0NRa0pZeTB5TXk0eUxERXVNUzAwTkM0M0xEY3VPUzAyTkM0M0xESXdMalpqTFRFeExqY3NPUzR4TFRJekxqVXNNVGd1TVMwek5TNHlMREkzTGpKakxUSXhMallzTWpFdU55MHpOaTQxTERRM0xqTXRORFF1Tnl3M05pNDRZeTB5TGpFc01UVXVOQzAwTGpFc016QXVPQzAyTGpJc05EWXVNdzBLQ1FrSlF6RXhORFl1TWl3eE1qazBMakVzTVRFMU5DNHhMREV6TWpNdU5Dd3hNVFk1TGprc01UTTFNQzQxVERFeE5qa3VPU3d4TXpVd0xqVjZJaTgrRFFvSkNUeHdZWFJvSUdOc1lYTnpQU0p6ZERBaUlHUTlJazB6TkRRekxqRXNNVGt3T0M0M1l5MHdMakV0TlRNdU1pMDJMamN0TVRBMkxqRXRNVFV0TVRVNExqWmpMVFV1T0Mwek5pNDFMVEUwTGpRdE56SXVOUzB5TlM0NUxURXdOeTQzWXkwMUxqY3RNVGN1TlMweE1pMHpOQzQzTFRFNUxqRXROVEV1TncwS0NRa0pZeTB4TWk0MUxUTXdMakl0TWpRdU9TMDJNQzQxTFRNNUxqWXRPRGt1Tm1NdE1UWXVNaTB6TWk0eExUTTBMamd0TmpNdE5UVXVOeTA1TWk0ell5MHlPUzR4TFRRd0xqZ3ROakF1TXkwNE1DNDVMVGsxTGpFdE1URTNZeTB6TlM0eExUTTJMalF0TnpRdU15MDJOeTR6TFRFeE5DNDBMVGs0RFFvSkNRbGpMVFk1TGpNdE5UTXVNUzB4TkRjdU55MDVNUzR4TFRJeU9TNDFMVEV5TVM0eFl5MHpOQzQxTFRFeUxqY3ROekF0TWpJdU5pMHhNRFl1TVMweU9TNDRZeTB6TXk0eExUWXVOaTAyTmk0M0xURXdMamd0TVRBd0xqSXRNVFF1T0dNdE1Ua3RNaTR6TFRNNExqRXRNeTQ0TFRVM0xqSXROQzQxRFFvSkNRbGpMVE00TGpRdE1TNDFMVGMzTERBdU1TMHhNVFV1TWl3MExqZGpMVFV4TGprc05pNHpMVEV3TXk0eUxERXpMall0TVRVekxqVXNNamN1T0dNdE5Ea3VNaXd4TXk0NUxUazJMamdzTXpNdU55MHhORE11TWl3MU5XTXRNekl1T0N3eE5TMDJOQzQwTERNeUxqVXRPVFF1TlN3MU1pNHpEUW9KQ1FsakxUUXhMamtzTWpjdU5pMDRNaTR4TERVNExqWXRNVEU1TGpVc09USXVNV010TWpZdU9Td3lOQzR4TFRVeExqa3NOVEF1TWkwM05DNDRMRGM0WXkwek1TNDNMRE00TGpVdE5qSXVOQ3czT0M0MkxUZzRMakVzTVRJeExqVmpMVEkyTGpNc05ETXVPQzAwTmk0ekxEa3dMakl0TmpVdU55d3hNemN1TlEwS0NRa0pZeTB6TkN3NE1pNDRMVFV3TGpJc01UY3hMalV0TlRjdU1Td3lOakF1TldNdE15d3pPQzQwTFRJdU9TdzNOeTR4TERBdU15d3hNVFV1Tm1NeUxqZ3NNek11Tnl3M0xqVXNOamN1TkN3eE1pNDVMREV3TUM0NFl6SXVPU3d4T0M0eUxEWXVOaXd6Tmk0eUxERXdMamtzTlRRdU1RMEtDUWtKWXpndU55d3pOUzQ1TERJd0xqTXNOekVzTXpRdU5Dd3hNRFV1TVdNeE9TNDFMRFEyTGprc016a3VNeXc1TWk0NUxEWTFMamNzTVRNMkxqUmpNall1TVN3ME15dzFOaTQ1TERnekxqTXNPRGt1TVN3eE1qRXVPV015TXk0eExESTNMamNzTkRndU1pdzFNeTQzTERjMUxqSXNOemN1TmcwS0NRa0pZekkwTGpFc01qRXVOQ3cwT1M0NUxEUXdMamtzTnpVdU5pdzJNQzQwWXpFMExqRXNNVEF1T0N3eU9DNDJMREl4TERRekxqVXNNekF1TjJNek1DNDFMREU1TGprc05qSXVOQ3d6Tnk0MExEazFMallzTlRJdU0yTTBOaTR6TERJd0xqa3NPVE11TlN3ME1DNDFMREUwTWk0MUxEVTBMaklOQ2drSkNXTTFNQzQyTERFMExqRXNNVEF5TGpVc01qRXVOQ3d4TlRRdU5pd3lOeTQxWXprd0xqUXNNVEF1TlN3eE9ESXVOaXd5TGpVc01qY3hMalV0TVRVdU5tTXpOaTR6TFRjdU5DdzNNaTR4TFRFM0xqWXNNVEEyTGpndE16QXVOV00wTnk0eUxURTNMallzT1RRdU1pMHpOeTQzTERFek9DNDBMVFl5TGpJTkNna0pDV00wTkM0MExUSTBMamNzT0RRdU1pMDFOQzQ0TERFeU5DNHlMVGcxTGpsak1qZ3VOUzB5TWk0eExEVTFMalF0TkRZdU1pdzRNQzR6TFRjeUxqUmpNelF1TkMwek5pNHhMRFkxTGpRdE56VXVPU3c1TkM0eExURXhOaTQyWXpJd0xqa3RNamt1Tml3ek9TNDJMVFl3TGprc05UVXVOeTA1TXk0MERRb0pDUWxqTVRRdU5TMHlPUzR5TERJM0xUVTVMallzTXprdU15MDRPUzQ0WXpZdU9DMHhOaTQzTERFekxUTXpMamNzTVRndU5TMDFNQzQ1WXpFeExqUXRNelV1TlN3eE9TNDVMVGN5TERJMUxqWXRNVEE0TGpoRE16UXpOaTQxTERJd01USXVNU3d6TkRRekxERTVOakF1Tnl3ek5EUXpMakVzTVRrd09DNDNEUW9KQ1Fsak1DNDVMVEkwTFRRdU1TMDBOaTR6TFRFMUxUWTNZeTAzTFRJeExqWXRNVGt0TkRBdU1pMHpOaTAxTm1NdE1UVXVPQzB4Tnkwek5DNDBMVEk1TFRVMkxUTTJZeTB5TUM0M0xURXdMamt0TkRNdU1TMHhOUzQ1TFRZM0xURTFZeTB4TlM0MExESXVNUzB6TUM0NExEUXVNUzAwTmk0ekxEWXVNZzBLQ1FrSll5MHlPUzQxTERndU15MDFOUzR4TERJekxqSXROell1T0N3ME5DNDNZeTA1TGpFc01URXVOeTB4T0M0eExESXpMalV0TWpjdU1pd3pOUzR5WXkweE5TNDNMREkzTGpFdE1qTXVOeXcxTmk0MExUSXpMamdzT0RjdU9HTXdMRE14TGpndE1pNHhMRFl6TGpVdE5pNHpMRGsxRFFvSkNRbGpNaTR4TFRFMUxqUXNOQzR4TFRNd0xqZ3NOaTR5TFRRMkxqTmpMVGd1TkN3Mk1pNHpMVEkxTERFeU15NHlMVFE1TGpNc01UZ3hMakpqTlM0NExURXpMamtzTVRFdU55MHlOeTQzTERFM0xqVXROREV1Tm1NdE1qTXVPU3cxTmk0MkxUVTFMakVzTVRBNUxqZ3RPVEl1TlN3eE5UZ3VOUTBLQ1FrSll6a3VNUzB4TVM0M0xERTRMakV0TWpNdU5Td3lOeTR5TFRNMUxqSmpMVE0zTGpRc05EZ3VNaTA0TUM0M0xEa3hMall0TVRJNExqa3NNVEk0TGpsak1URXVOeTA1TGpFc01qTXVOUzB4T0M0eExETTFMakl0TWpjdU1tTXRORGd1Tnl3ek55NDFMVEV3TVM0NUxEWTRMall0TVRVNExqVXNPVEl1TlEwS0NRa0pZekV6TGprdE5TNDRMREkzTGpjdE1URXVOeXcwTVM0MkxURTNMalZqTFRVNExESTBMak10TVRFNExqa3NOREF1T1MweE9ERXVNaXcwT1M0ell6RTFMalF0TWk0eExETXdMamd0TkM0eExEUTJMak10Tmk0eVl5MDJNeXc0TGpNdE1USTJMamtzT0M0ekxURTRPUzQ1TERBTkNna0pDV014TlM0MExESXVNU3d6TUM0NExEUXVNU3cwTmk0ekxEWXVNbU10TmpJdU15MDRMalF0TVRJekxqSXRNalV0TVRneExqSXRORGt1TTJNeE15NDVMRFV1T0N3eU55NDNMREV4TGpjc05ERXVOaXd4Tnk0MVl5MDFOaTQyTFRJekxqa3RNVEE1TGpndE5UVXVNUzB4TlRndU5TMDVNaTQxRFFvSkNRbGpNVEV1Tnl3NUxqRXNNak11TlN3eE9DNHhMRE0xTGpJc01qY3VNbU10TkRndU1pMHpOeTQwTFRreExqWXRPREF1TnkweE1qZ3VPUzB4TWpndU9XTTVMakVzTVRFdU55d3hPQzR4TERJekxqVXNNamN1TWl3ek5TNHlZeTB6Tnk0MUxUUTRMamN0TmpndU5pMHhNREV1T1MwNU1pNDFMVEUxT0M0MURRb0pDUWxqTlM0NExERXpMamtzTVRFdU55d3lOeTQzTERFM0xqVXNOREV1Tm1NdE1qUXVNeTAxT0MwME1DNDVMVEV4T0M0NUxUUTVMak10TVRneExqSmpNaTR4TERFMUxqUXNOQzR4TERNd0xqZ3NOaTR5TERRMkxqTmpMVGd1TXkwMk15MDRMak10TVRJMkxqa3NNQzB4T0RrdU9RMEtDUWtKWXkweUxqRXNNVFV1TkMwMExqRXNNekF1T0MwMkxqSXNORFl1TTJNNExqUXROakl1TXl3eU5TMHhNak11TWl3ME9TNHpMVEU0TVM0eVl5MDFMamdzTVRNdU9TMHhNUzQzTERJM0xqY3RNVGN1TlN3ME1TNDJZekl6TGprdE5UWXVOaXcxTlM0eExURXdPUzQ0TERreUxqVXRNVFU0TGpVTkNna0pDV010T1M0eExERXhMamN0TVRndU1Td3lNeTQxTFRJM0xqSXNNelV1TW1Nek55NDBMVFE0TGpJc09EQXVOeTA1TVM0MkxERXlPQzQ1TFRFeU9DNDVZeTB4TVM0M0xEa3VNUzB5TXk0MUxERTRMakV0TXpVdU1pd3lOeTR5WXpRNExqY3RNemN1TlN3eE1ERXVPUzAyT0M0MkxERTFPQzQxTFRreUxqVU5DZ2tKQ1dNdE1UTXVPU3cxTGpndE1qY3VOeXd4TVM0M0xUUXhMallzTVRjdU5XTTFPQzB5TkM0ekxERXhPQzQ1TFRRd0xqa3NNVGd4TGpJdE5Ea3VNMk10TVRVdU5Dd3lMakV0TXpBdU9DdzBMakV0TkRZdU15dzJMakpqTmpNdE9DNHpMREV5Tmk0NUxUZ3VNeXd4T0RrdU9Td3dEUW9KQ1FsakxURTFMalF0TWk0eExUTXdMamd0TkM0eExUUTJMak10Tmk0eVl6WXlMak1zT0M0MExERXlNeTR5TERJMUxERTRNUzR5TERRNUxqTmpMVEV6TGprdE5TNDRMVEkzTGpjdE1URXVOeTAwTVM0MkxURTNMalZqTlRZdU5pd3lNeTQ1TERFd09TNDRMRFUxTGpFc01UVTRMalVzT1RJdU5RMEtDUWtKWXkweE1TNDNMVGt1TVMweU15NDFMVEU0TGpFdE16VXVNaTB5Tnk0eVl6UTRMaklzTXpjdU5DdzVNUzQyTERnd0xqY3NNVEk0TGprc01USTRMamxqTFRrdU1TMHhNUzQzTFRFNExqRXRNak11TlMweU55NHlMVE0xTGpKak16Y3VOU3cwT0M0M0xEWTRMallzTVRBeExqa3NPVEl1TlN3eE5UZ3VOUTBLQ1FrSll5MDFMamd0TVRNdU9TMHhNUzQzTFRJM0xqY3RNVGN1TlMwME1TNDJZekkwTGpNc05UZ3NOREF1T1N3eE1UZ3VPU3cwT1M0ekxERTRNUzR5WXkweUxqRXRNVFV1TkMwMExqRXRNekF1T0MwMkxqSXRORFl1TTJNMExqSXNNekV1TlN3MkxqSXNOak11TWl3MkxqTXNPVFVOQ2drSkNXTXRNQzQ1TERJMExEUXVNU3cwTmk0ekxERTFMRFkzWXpjc01qRXVOaXd4T1N3ME1DNHlMRE0yTERVMll6RTFMamdzTVRjc016UXVOQ3d5T1N3MU5pd3pObU15TUM0M0xERXdMamtzTkRNdU1Td3hOUzQ1TERZM0xERTFZekUxTGpRdE1pNHhMRE13TGpndE5DNHhMRFEyTGpNdE5pNHlEUW9KQ1Fsak1qa3VOUzA0TGpNc05UVXVNUzB5TXk0eUxEYzJMamd0TkRRdU4yTTVMakV0TVRFdU55d3hPQzR4TFRJekxqVXNNamN1TWkwek5TNHlRek0wTXpVdU1Td3hPVFk1TGpRc016UTBNeXd4T1RRd0xqRXNNelEwTXk0eExERTVNRGd1TjNvaUx6NE5DZ2tKUEhCaGRHZ2dZMnhoYzNNOUluTjBNQ0lnWkQwaVRUSTFORFl1TkN3eU56a3pMamxqT0M0MkxEQXNNVGN1TVN3d0xESTFMamNzTUdNeU15NDBMREFzTkRZdU9Dd3dMRGN3TGpNc01HTXpOQzQxTERBc05qa3VNU3d3TERFd015NDJMREJqTkRJdU15d3dMRGcwTGpVc01Dd3hNall1T0N3d0RRb0pDUWxqTkRZdU1Td3dMRGt5TGpNc01Dd3hNemd1TkN3d1l6UTJMallzTUN3NU15NHhMREFzTVRNNUxqY3NNR00wTXk0MExEQXNPRFl1T1N3d0xERXpNQzR6TERCak16WXVOeXd3TERjekxqUXNNQ3d4TVRBdU1Td3dZekkyTGpVc01DdzFNeXd3TERjNUxqVXNNQTBLQ1FrSll6RXlMalVzTUN3eU5Td3dMRE0zTGpVc01HTXdMalVzTUN3eExqRXNNQ3d4TGpZc01HTXlOQ3d3TGprc05EWXVNeTAwTGpFc05qY3RNVFZqTWpFdU5pMDNMRFF3TGpJdE1Ua3NOVFl0TXpaak1UY3RNVFV1T0N3eU9TMHpOQzQwTERNMkxUVTJEUW9KQ1Fsak1UQXVPUzB5TUM0M0xERTFMamt0TkRNdU1Td3hOUzAyTjJNdE1pNHhMVEUxTGpRdE5DNHhMVE13TGpndE5pNHlMVFEyTGpOakxUZ3VNeTB5T1M0MUxUSXpMakl0TlRVdU1TMDBOQzQzTFRjMkxqaGpMVEV4TGpjdE9TNHhMVEl6TGpVdE1UZ3VNUzB6TlM0eUxUSTNMaklOQ2drSkNXTXRNamN1TVMweE5TNDNMVFUyTGpRdE1qTXVOeTA0Tnk0NExUSXpMamhqTFRndU5pd3dMVEUzTGpFc01DMHlOUzQzTERCakxUSXpMalFzTUMwME5pNDRMREF0TnpBdU15d3dZeTB6TkM0MUxEQXROamt1TVN3d0xURXdNeTQyTERCakxUUXlMak1zTUMwNE5DNDFMREF0TVRJMkxqZ3NNQTBLQ1FrSll5MDBOaTR4TERBdE9USXVNeXd3TFRFek9DNDBMREJqTFRRMkxqWXNNQzA1TXk0eExEQXRNVE01TGpjc01HTXRORE11TkN3d0xUZzJMamtzTUMweE16QXVNeXd3WXkwek5pNDNMREF0TnpNdU5Dd3dMVEV4TUM0eExEQmpMVEkyTGpVc01DMDFNeXd3TFRjNUxqVXNNQTBLQ1FrSll5MHhNaTQxTERBdE1qVXNNQzB6Tnk0MUxEQmpMVEF1TlN3d0xURXVNU3d3TFRFdU5pd3dZeTB5TkMwd0xqa3RORFl1TXl3MExqRXROamNzTVRWakxUSXhMallzTnkwME1DNHlMREU1TFRVMkxETTJZeTB4Tnl3eE5TNDRMVEk1TERNMExqUXRNellzTlRZTkNna0pDV010TVRBdU9Td3lNQzQzTFRFMUxqa3NORE11TVMweE5TdzJOMk15TGpFc01UVXVOQ3cwTGpFc016QXVPQ3cyTGpJc05EWXVNMk00TGpNc01qa3VOU3d5TXk0eUxEVTFMakVzTkRRdU55dzNOaTQ0WXpFeExqY3NPUzR4TERJekxqVXNNVGd1TVN3ek5TNHlMREkzTGpJTkNna0pDVU15TkRnMUxqZ3NNamM0TlM0NUxESTFNVFVzTWpjNU15NDRMREkxTkRZdU5Dd3lOemt6TGpsTU1qVTBOaTQwTERJM09UTXVPWG9pTHo0TkNnazhMMmMrRFFvOEwyYytEUW84Wno0TkNqd3ZaejROQ2p4blBnMEtQQzluUGcwS1BHYytEUW84TDJjK0RRbzhaejROQ2p3dlp6NE5DanhuUGcwS1BDOW5QZzBLUEM5emRtYytEUW89XCIiLCJleHBvcnQgZGVmYXVsdCBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaWRYUm1MVGdpUHo0TkNqd2hMUzBnUjJWdVpYSmhkRzl5T2lCQlpHOWlaU0JKYkd4MWMzUnlZWFJ2Y2lBeU5TNHdMakFzSUZOV1J5QkZlSEJ2Y25RZ1VHeDFaeTFKYmlBdUlGTldSeUJXWlhKemFXOXVPaUEyTGpBd0lFSjFhV3hrSURBcElDQXRMVDROQ2p3aFJFOURWRmxRUlNCemRtY2dVRlZDVEVsRElDSXRMeTlYTTBNdkwwUlVSQ0JUVmtjZ01TNHhMeTlGVGlJZ0ltaDBkSEE2THk5M2QzY3Vkek11YjNKbkwwZHlZWEJvYVdOekwxTldSeTh4TGpFdlJGUkVMM04yWnpFeExtUjBaQ0lnV3cwS0NUd2hSVTVVU1ZSWklHNXpYMlY0ZEdWdVpDQWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlGZUhSbGJuTnBZbWxzYVhSNUx6RXVNQzhpUGcwS0NUd2hSVTVVU1ZSWklHNXpYMkZwSUNKb2RIUndPaTh2Ym5NdVlXUnZZbVV1WTI5dEwwRmtiMkpsU1d4c2RYTjBjbUYwYjNJdk1UQXVNQzhpUGcwS0NUd2hSVTVVU1ZSWklHNXpYMmR5WVhCb2N5QWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlIY21Gd2FITXZNUzR3THlJK0RRb0pQQ0ZGVGxSSlZGa2dibk5mZG1GeWN5QWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlXWVhKcFlXSnNaWE12TVM0d0x5SStEUW9KUENGRlRsUkpWRmtnYm5OZmFXMXlaWEFnSW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdlNXMWhaMlZTWlhCc1lXTmxiV1Z1ZEM4eExqQXZJajROQ2drOElVVk9WRWxVV1NCdWMxOXpabmNnSW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdlUyRjJaVVp2Y2xkbFlpOHhMakF2SWo0TkNnazhJVVZPVkVsVVdTQnVjMTlqZFhOMGIyMGdJbWgwZEhBNkx5OXVjeTVoWkc5aVpTNWpiMjB2UjJWdVpYSnBZME4xYzNSdmJVNWhiV1Z6Y0dGalpTOHhMakF2SWo0TkNnazhJVVZPVkVsVVdTQnVjMTloWkc5aVpWOTRjR0YwYUNBaWFIUjBjRG92TDI1ekxtRmtiMkpsTG1OdmJTOVlVR0YwYUM4eExqQXZJajROQ2wwK0RRbzhjM1puSUhabGNuTnBiMjQ5SWpFdU1TSWdhV1E5SWt4aGVXVnlYekVpSUhodGJHNXpPbmc5SWladWMxOWxlSFJsYm1RN0lpQjRiV3h1Y3pwcFBTSW1ibk5mWVdrN0lpQjRiV3h1Y3pwbmNtRndhRDBpSm01elgyZHlZWEJvY3pzaURRb0pJSGh0Ykc1elBTSm9kSFJ3T2k4dmQzZDNMbmN6TG05eVp5OHlNREF3TDNOMlp5SWdlRzFzYm5NNmVHeHBibXM5SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpFNU9Ua3ZlR3hwYm1zaUlIZzlJakJ3ZUNJZ2VUMGlNSEI0SWlCMmFXVjNRbTk0UFNJd0lEQWdNVE15TGpZZ01UTXlMallpRFFvSklITjBlV3hsUFNKbGJtRmliR1V0WW1GamEyZHliM1Z1WkRwdVpYY2dNQ0F3SURFek1pNDJJREV6TWk0Mk95SWdlRzFzT25Od1lXTmxQU0p3Y21WelpYSjJaU0krRFFvOGMzUjViR1VnZEhsd1pUMGlkR1Y0ZEM5amMzTWlQZzBLQ1M1emREQjdabWxzYkRvak1ESXdNakF5TzNOMGNtOXJaVG9qTnpBM01EY3dPM04wY205clpTMTNhV1IwYURveU8zTjBjbTlyWlMxdGFYUmxjbXhwYldsME9qRXdPMzBOQ2drdWMzUXhlMlpwYkd3NkkwVXhSVEZGTVR0OURRbzhMM04wZVd4bFBnMEtQRzFsZEdGa1lYUmhQZzBLQ1R4elpuY2dJSGh0Ykc1elBTSW1ibk5mYzJaM095SStEUW9KQ1R4emJHbGpaWE0rUEM5emJHbGpaWE0rRFFvSkNUeHpiR2xqWlZOdmRYSmpaVUp2ZFc1a2N5QWdZbTkwZEc5dFRHVm1kRTl5YVdkcGJqMGlkSEoxWlNJZ2FHVnBaMmgwUFNJeE16SXVOaUlnZDJsa2RHZzlJakV6TWk0MklpQjRQU0l4TlRjdU1TSWdlVDBpTWpFd0xqRWlQand2YzJ4cFkyVlRiM1Z5WTJWQ2IzVnVaSE0rRFFvSlBDOXpabmMrRFFvOEwyMWxkR0ZrWVhSaFBnMEtQR05wY21Oc1pTQmpiR0Z6Y3owaWMzUXdJaUJqZUQwaU5qWXVNeUlnWTNrOUlqWTJMak1pSUhJOUlqWTFMak1pTHo0TkNqeHdZWFJvSUdOc1lYTnpQU0p6ZERFaUlHUTlJazA0T0M0M0xEUXhMalJqTFRRdU5pMDNMamt0TVRJdU55MHhNaTQ0TFRJeExqZ3RNVEl1T1dNdE1DNDBMREF0TUM0NExEQXRNUzR5TERCakxUa3VNU3d3TGpJdE1UY3VNaXcxTFRJeExqZ3NNVEl1T1EwS0NXTXROQzQzTERndU1TMDBMamdzTVRjdU9DMHdMak1zTWpac01UZ3VPQ3d6TkM0ell6QXNNQ3d3TERBc01Dd3dZekF1T0N3eExqUXNNaTR6TERJdU15dzBMREl1TTJNeExqY3NNQ3d6TGpFdE1DNDVMRFF0TWk0ell6QXNNQ3d3TERBc01Dd3dURGc1TERZM0xqUU5DZ2xET1RNdU5TdzFPUzR5TERrekxqUXNORGt1TlN3NE9DNDNMRFF4TGpSTU9EZ3VOeXcwTVM0MGVpQk5Oall1TXl3Mk1pNDNZeTAxTGprc01DMHhNQzQyTFRRdU9DMHhNQzQyTFRFd0xqWnpOQzQ0TFRFd0xqWXNNVEF1TmkweE1DNDJjekV3TGpZc05DNDRMREV3TGpZc01UQXVOZzBLQ1ZNM01pNHhMRFl5TGpjc05qWXVNeXcyTWk0M2VpSXZQZzBLUEM5emRtYytEUW89XCIiLCJleHBvcnQgZGVmYXVsdCBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEQ5NGJXd2dkbVZ5YzJsdmJqMGlNUzR3SWlCbGJtTnZaR2x1WnowaWRYUm1MVGdpUHo0TkNqd2hMUzBnUjJWdVpYSmhkRzl5T2lCQlpHOWlaU0JKYkd4MWMzUnlZWFJ2Y2lBeU5TNHdMakFzSUZOV1J5QkZlSEJ2Y25RZ1VHeDFaeTFKYmlBdUlGTldSeUJXWlhKemFXOXVPaUEyTGpBd0lFSjFhV3hrSURBcElDQXRMVDROQ2p3aFJFOURWRmxRUlNCemRtY2dVRlZDVEVsRElDSXRMeTlYTTBNdkwwUlVSQ0JUVmtjZ01TNHhMeTlGVGlJZ0ltaDBkSEE2THk5M2QzY3Vkek11YjNKbkwwZHlZWEJvYVdOekwxTldSeTh4TGpFdlJGUkVMM04yWnpFeExtUjBaQ0lnV3cwS0NUd2hSVTVVU1ZSWklHNXpYMlY0ZEdWdVpDQWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlGZUhSbGJuTnBZbWxzYVhSNUx6RXVNQzhpUGcwS0NUd2hSVTVVU1ZSWklHNXpYMkZwSUNKb2RIUndPaTh2Ym5NdVlXUnZZbVV1WTI5dEwwRmtiMkpsU1d4c2RYTjBjbUYwYjNJdk1UQXVNQzhpUGcwS0NUd2hSVTVVU1ZSWklHNXpYMmR5WVhCb2N5QWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlIY21Gd2FITXZNUzR3THlJK0RRb0pQQ0ZGVGxSSlZGa2dibk5mZG1GeWN5QWlhSFIwY0RvdkwyNXpMbUZrYjJKbExtTnZiUzlXWVhKcFlXSnNaWE12TVM0d0x5SStEUW9KUENGRlRsUkpWRmtnYm5OZmFXMXlaWEFnSW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdlNXMWhaMlZTWlhCc1lXTmxiV1Z1ZEM4eExqQXZJajROQ2drOElVVk9WRWxVV1NCdWMxOXpabmNnSW1oMGRIQTZMeTl1Y3k1aFpHOWlaUzVqYjIwdlUyRjJaVVp2Y2xkbFlpOHhMakF2SWo0TkNnazhJVVZPVkVsVVdTQnVjMTlqZFhOMGIyMGdJbWgwZEhBNkx5OXVjeTVoWkc5aVpTNWpiMjB2UjJWdVpYSnBZME4xYzNSdmJVNWhiV1Z6Y0dGalpTOHhMakF2SWo0TkNnazhJVVZPVkVsVVdTQnVjMTloWkc5aVpWOTRjR0YwYUNBaWFIUjBjRG92TDI1ekxtRmtiMkpsTG1OdmJTOVlVR0YwYUM4eExqQXZJajROQ2wwK0RRbzhjM1puSUhabGNuTnBiMjQ5SWpFdU1TSWdhV1E5SWt4cGRtVnNiRzlmTVNJZ2VHMXNibk02ZUQwaUptNXpYMlY0ZEdWdVpEc2lJSGh0Ykc1ek9tazlJaVp1YzE5aGFUc2lJSGh0Ykc1ek9tZHlZWEJvUFNJbWJuTmZaM0poY0doek95SU5DZ2tnZUcxc2JuTTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5Mekl3TURBdmMzWm5JaUI0Yld4dWN6cDRiR2x1YXowaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1UazVPUzk0YkdsdWF5SWdlRDBpTUhCNElpQjVQU0l3Y0hnaUlIWnBaWGRDYjNnOUlqQWdNQ0EwT0NBME9DSU5DZ2tnYzNSNWJHVTlJbVZ1WVdKc1pTMWlZV05yWjNKdmRXNWtPbTVsZHlBd0lEQWdORGdnTkRnN0lpQjRiV3c2YzNCaFkyVTlJbkJ5WlhObGNuWmxJajROQ2p4emRIbHNaU0IwZVhCbFBTSjBaWGgwTDJOemN5SStEUW9KTGs5dFluSmhYM2d3TURJd1gyVnpkR1Z5Ym1GN1ptbHNiRHB1YjI1bE8zME5DZ2t1UVc1bmIyeHBYM2d3TURJd1gyRnljbTkwYjI1a1lYUnBYM2d3TURJd1h6SmZlREF3TWpCZmNIUjdabWxzYkRvalJrWkdSa1pHTzNOMGNtOXJaVG9qTURBd01EQXdPM04wY205clpTMXRhWFJsY214cGJXbDBPakV3TzMwTkNna3VVbWxtYkdWemMybHZibVZmZURBd01qQmZXRjk0TURBeU1GOWthVzVoYldsallYdG1hV3hzT201dmJtVTdmUTBLQ1M1VGJYVnpjMjlmZURBd01qQmZiVzl5WW1sa2IzdG1hV3hzT25WeWJDZ2pVMVpIU1VSZk1WOHBPMzBOQ2drdVEzSmxjSFZ6WTI5c2IzdG1hV3hzT2lOR1JrWkdSa1k3ZlEwS0NTNUdiMmRzYVdGdFpWOUhVM3RtYVd4c09pTkdSa1JFTURBN2ZRMEtDUzVRYjIxd1lXUnZkWEpmUjFON1ptbHNiQzF5ZFd4bE9tVjJaVzV2WkdRN1kyeHBjQzF5ZFd4bE9tVjJaVzV2WkdRN1ptbHNiRG9qTlRGQlJVVXlPMzBOQ2drdWMzUXdlMlpwYkd3NkkwWkdSa1pHUmp0OURRb0pMbk4wTVh0bWFXeHNPaU13TWpBeU1ETTdmUTBLUEM5emRIbHNaVDROQ2p4dFpYUmhaR0YwWVQ0TkNnazhjMlozSUNCNGJXeHVjejBpSm01elgzTm1kenNpUGcwS0NRazhjMnhwWTJWelBqd3ZjMnhwWTJWelBnMEtDUWs4YzJ4cFkyVlRiM1Z5WTJWQ2IzVnVaSE1nSUdKdmRIUnZiVXhsWm5SUGNtbG5hVzQ5SW5SeWRXVWlJR2hsYVdkb2REMGlORGNpSUhkcFpIUm9QU0kwTnlJZ2VEMGlNVGN6TGpJaUlIazlJaTB5T1RFdU1TSStQQzl6YkdsalpWTnZkWEpqWlVKdmRXNWtjejROQ2drOEwzTm1kejROQ2p3dmJXVjBZV1JoZEdFK0RRbzhiR2x1WldGeVIzSmhaR2xsYm5RZ2FXUTlJbE5XUjBsRVh6RmZJaUJuY21Ga2FXVnVkRlZ1YVhSelBTSjFjMlZ5VTNCaFkyVlBibFZ6WlNJZ2VERTlJaTB4TnpJdU56STNOaUlnZVRFOUlpMHlORE11TlRjME5TSWdlREk5SWkweE56SXVNREl3TlNJZ2VUSTlJaTB5TkRJdU9EWTNOQ0krRFFvSlBITjBiM0FnSUc5bVpuTmxkRDBpTUNJZ2MzUjViR1U5SW5OMGIzQXRZMjlzYjNJNkkwVTJSVFpGUWlJdlBnMEtDVHh6ZEc5d0lDQnZabVp6WlhROUlqQXVNVGN6T0NJZ2MzUjViR1U5SW5OMGIzQXRZMjlzYjNJNkkwVXlSVEpGTmlJdlBnMEtDVHh6ZEc5d0lDQnZabVp6WlhROUlqQXVNelV5SWlCemRIbHNaVDBpYzNSdmNDMWpiMnh2Y2pvalJEVkVORVE0SWk4K0RRb0pQSE4wYjNBZ0lHOW1abk5sZEQwaU1DNDFNekl6SWlCemRIbHNaVDBpYzNSdmNDMWpiMnh2Y2pvalF6QkNSa015SWk4K0RRb0pQSE4wYjNBZ0lHOW1abk5sZEQwaU1DNDNNVE01SWlCemRIbHNaVDBpYzNSdmNDMWpiMnh2Y2pvalFUUkJNa0UwSWk4K0RRb0pQSE4wYjNBZ0lHOW1abk5sZEQwaU1DNDRPVFE1SWlCemRIbHNaVDBpYzNSdmNDMWpiMnh2Y2pvak9ESTRNamd5SWk4K0RRb0pQSE4wYjNBZ0lHOW1abk5sZEQwaU1TSWdjM1I1YkdVOUluTjBiM0F0WTI5c2IzSTZJelpDTmtVMlJTSXZQZzBLUEM5c2FXNWxZWEpIY21Ga2FXVnVkRDROQ2p4amFYSmpiR1VnWTJ4aGMzTTlJbk4wTUNJZ1kzZzlJakkwSWlCamVUMGlNalFpSUhJOUlqSXpMalVpTHo0TkNqeG5QZzBLQ1R4d1lYUm9JR05zWVhOelBTSnpkREVpSUdROUlrMHlPUzR4TERFeUxqUmpMVFF1TmkwMExqWXRNVEl1TVMwMExqWXRNVFl1Tnl3d1l5MDBMallzTkM0MkxUUXVOaXd4TWk0eExEQXNNVFl1TjJNMExqRXNOQzR4TERFd0xqVXNOQzQxTERFMUxqRXNNUzR6RFFvSkNXTXdMakVzTUM0MUxEQXVNeXd3TGprc01DNDNMREV1TTJ3MkxqY3NOaTQzWXpFc01Td3lMallzTVN3ekxqVXNNR014TFRFc01TMHlMallzTUMwekxqVnNMVFl1TnkwMkxqZGpMVEF1TkMwd0xqUXRNQzQ0TFRBdU5pMHhMak10TUM0M0RRb0pDVU16TXk0MkxESXlMamtzTXpNdU1pd3hOaTQxTERJNUxqRXNNVEl1TkhvZ1RUSTNMREkzWXkwekxqUXNNeTQwTFRrc015NDBMVEV5TGpVc01HTXRNeTQwTFRNdU5DMHpMalF0T1N3d0xURXlMalZqTXk0MExUTXVOQ3c1TFRNdU5Dd3hNaTQxTERBTkNna0pRek13TGpRc01UY3VPU3d6TUM0MExESXpMalVzTWpjc01qZDZJaTgrRFFvOEwyYytEUW84TDNOMlp6NE5DZz09XCIiLCJpbXBvcnQgeyBnZXQgfSBmcm9tIFwiYXhpb3NcIjtcclxuXHJcbi8vY29uc3QgYXBpX2tleSA9IHByb2Nlc3MuZW52LkFQSV9LRVk7XHJcblxyXG4vKmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGZldGNoRGF0YShjaXR5KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2V0KFxyXG4gICAgICBgaHR0cHM6Ly9hcGkud2FxaS5pbmZvL2ZlZWQvJHtjaXR5fS8/dG9rZW49JHthcGlfa2V5fWBcclxuICAgICk7XHJcbiAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gIH1cclxufSovXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZXRjaERhdGEge1xyXG4gIGNvbnN0cnVjdG9yKGlucHV0KSB7XHJcbiAgICB0aGlzLmtleSA9IHByb2Nlc3MuZW52LkFQSV9LRVk7XHJcblxyXG4gICAgdGhpcy5jaXR5ID0gYXN5bmMgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2V0KFxyXG4gICAgICAgICAgYGh0dHBzOi8vYXBpLndhcWkuaW5mby9mZWVkLyR7aW5wdXR9Lz90b2tlbj0ke3RoaXMua2V5fWBcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZGF0YTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICByZXR1cm4gZXJyb3I7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLmdlbyA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGdldChcclxuICAgICAgICAgIGBodHRwczovL2FwaS53YXFpLmluZm8vZmVlZC9nZW86JHtpbnB1dH0vP3Rva2VuPSR7dGhpcy5rZXl9YCAvLyBsYXQ7IGxvbmdcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2cocmVzcG9uc2UpO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLmRhdGE7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgcmV0dXJuIGVycm9yO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwicmVxdWlyZShcIi4uL2Nzcy9zdHlsZS5zY3NzXCIpO1xyXG5pbXBvcnQgRmV0Y2hEYXRhIGZyb20gXCIuL2ZldGNoLWRhdGFcIjtcclxuaW1wb3J0IGltZ19sb2dvIGZyb20gXCIuLi9pbWcvYWlyLXF1YWxpdHktYmx1ZS5zdmdcIjtcclxuaW1wb3J0IGltZ19waW4gZnJvbSBcIi4uL2ltZy9waW4tYmxhY2suc3ZnXCI7XHJcbmltcG9ydCBpbWdfc2VhcmNoIGZyb20gXCIuLi9pbWcvc2VhcmNoLXdpdGhvdXQtYm9yZGVyLnN2Z1wiO1xyXG5cclxubGV0IGRhdGE7XHJcbmxldCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaW5wdXRcIik7XHJcbmxldCBmb3JtX2NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZm9ybS1jb250YWluZXJcIik7XHJcbmxldCBsb2dvX2NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9nby1jb250YWluZXJcIik7XHJcbmxldCByZXN1bHRfY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXN1bHQtY29udGFpbmVyXCIpO1xyXG5sZXQgY29tcG9zaXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbXBvc2l0aW9uXCIpO1xyXG5sZXQgaDEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2gxXCIpO1xyXG5sZXQgaDMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2gzXCIpO1xyXG5sZXQgbGF0aXR1ZGU7XHJcbmxldCBsb25naXR1ZGU7XHJcbmxldCBzY2FsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2NhbGUtaGlkZGVuXCIpO1xyXG5sZXQgc2NhbGVfdW5pdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NhbGUtdW5pdC1oaWRkZW5cIik7XHJcblxyXG5mdW5jdGlvbiBwcmVsb2FkZXIoKSB7XHJcbiAgbGV0IHByZWxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJlbG9hZGVyXCIpO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgIHByZWxvYWRlci5yZW1vdmUoKTtcclxuICB9LCAyNTAwKTtcclxufVxyXG5wcmVsb2FkZXIoKTtcclxuXHJcbmZ1bmN0aW9uIGdlb2xvY2F0ZSgpIHtcclxuICBpZiAobmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XHJcbiAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAocG9zaXRpb24pID0+IHtcclxuICAgICAgICBsYXRpdHVkZSA9IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZTtcclxuICAgICAgICBsb25naXR1ZGUgPSBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlO1xyXG4gICAgICB9LFxyXG4gICAgICAoZXJyb3IpID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICBsYXRpdHVkZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICBsb25naXR1ZGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZXJyb3JOb3RpZmljYXRpb24oXCJnZW9cIik7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG59XHJcbmdlb2xvY2F0ZSgpO1xyXG5cclxuY2xhc3MgSW1wb3J0SW1hZ2Uge1xyXG4gIGNvbnN0cnVjdG9yKHNyYywgdGFyZ2V0LCBjbHMpIHtcclxuICAgIHRoaXMudGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xyXG4gICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xyXG4gICAgdGhpcy5pbWcuc3JjID0gc3JjO1xyXG4gICAgdGhpcy5pbWcuY2xhc3NMaXN0LmFkZChjbHMpO1xyXG5cclxuICAgIHRoaXMuY2hpbGQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudGFyZ2V0LmFwcGVuZENoaWxkKHRoaXMuaW1nKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmJlZm9yZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy50YXJnZXQuYmVmb3JlKHRoaXMuaW1nKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmFmdGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnRhcmdldC5hZnRlcih0aGlzLmltZyk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgbG9nbyA9IG5ldyBJbXBvcnRJbWFnZShpbWdfbG9nbywgXCIubG9nby1jb250YWluZXJcIiwgXCJsb2dvXCIpO1xyXG5sb2dvLmNoaWxkKCk7XHJcbmxvZ28uaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbn0pO1xyXG5cclxuY29uc3Qgc2VhcmNoID0gbmV3IEltcG9ydEltYWdlKGltZ19zZWFyY2gsIFwiLmZvcm1cIiwgXCJzZWFyY2gtaWNvblwiKTtcclxuc2VhcmNoLmJlZm9yZSgpO1xyXG5cclxuY29uc3QgcGluID0gbmV3IEltcG9ydEltYWdlKGltZ19waW4sIFwiLmZvcm1cIiwgXCJwaW4taWNvblwiKTtcclxucGluLmFmdGVyKCk7XHJcblxyXG5pbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKCkgPT4ge1xyXG4gIGZvcm1fY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJmb2N1c1wiKTtcclxufSk7XHJcbmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsICgpID0+IHtcclxuICBmb3JtX2NvbnRhaW5lci5jbGFzc0xpc3QucmVwbGFjZShcImZvY3VzXCIsIFwiYmx1clwiKTtcclxufSk7XHJcblxyXG5mdW5jdGlvbiBlcnJvck5vdGlmaWNhdGlvbihpbnB1dCkge1xyXG4gIGxldCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gIGxldCBub3RpZmljYXRpb25fbXNnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcblxyXG4gIGlucHV0ID09PSBcImNpdHlcIlxyXG4gICAgPyAobm90aWZpY2F0aW9uX21zZy5pbm5lckhUTUwgPSBcIjxzdHJvbmc+RXJyb3I6PC9zdHJvbmc+XFxuQ2l0eSBub3QgZm91bmRcIilcclxuICAgIDogKG5vdGlmaWNhdGlvbl9tc2cuaW5uZXJIVE1MID1cclxuICAgICAgICBcIjxzdHJvbmc+R2VvbG9jYXRpb24gRXJyb3I6PC9zdHJvbmc+XFxuR2VvbG9jYXRpb24gbmVlZHMgdG8gYmUgZW5hYmxlZCBpbiBvcmRlciB0byB1c2UgdGhpcyBmZWF0dXJlLiBcIik7XHJcblxyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uKTtcclxuICBub3RpZmljYXRpb24uYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uX21zZyk7XHJcbiAgbm90aWZpY2F0aW9uLmNsYXNzTGlzdC5hZGQoXCJub3RpZmljYXRpb25cIik7XHJcblxyXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgbm90aWZpY2F0aW9uLnJlbW92ZSgpO1xyXG4gIH0sIDMwMDApO1xyXG59XHJcblxyXG4vL0ZldGNoIGRhdGFcclxuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgKCkgPT4ge1xyXG4gIGlmIChpbnB1dC52YWx1ZSA9PT0gXCJcIikge1xyXG4gICAgZXJyb3JOb3RpZmljYXRpb24oXCJjaXR5XCIpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zdCBzZWFyY2hDaXR5ID0gbmV3IEZldGNoRGF0YShpbnB1dC52YWx1ZSk7XHJcbiAgICBhc3luYyBmdW5jdGlvbiBnZXREYXRhKCkge1xyXG4gICAgICBkYXRhID0gYXdhaXQgc2VhcmNoQ2l0eS5jaXR5KCk7XHJcbiAgICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIHVwZGF0ZURhdGEoKTtcclxuICAgICAgICBzaG93UmVzdWx0cyhkYXRhKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlcnJvck5vdGlmaWNhdGlvbihcImNpdHlcIik7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICB9XHJcbiAgICBnZXREYXRhKCk7XHJcbiAgICBpbnB1dC52YWx1ZSA9IFwiXCI7XHJcbiAgfVxyXG59KTtcclxuXHJcbnBpbi5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICBjb25zdCBjaXR5Q29vcmQgPSBuZXcgRmV0Y2hEYXRhKGxhdGl0dWRlICsgXCI7IFwiICsgbG9uZ2l0dWRlKTtcclxuICBhc3luYyBmdW5jdGlvbiBnZXREYXRhKCkge1xyXG4gICAgZGF0YSA9IGF3YWl0IGNpdHlDb29yZC5nZW8oKTtcclxuICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICB1cGRhdGVEYXRhKCk7XHJcbiAgICAgIHNob3dSZXN1bHRzKGRhdGEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZXJyb3JOb3RpZmljYXRpb24oXCJnZW9cIik7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICB9XHJcbiAgZ2V0RGF0YSgpO1xyXG59KTtcclxuXHJcbi8vIFNob3cgcmVzdWx0c1xyXG5mdW5jdGlvbiBzaG93UmVzdWx0cyhkYXRhKSB7XHJcbiAgbG9nb19jb250YWluZXIuY2xhc3NMaXN0LmFkZChcImxvZ28tcmVzdWx0XCIpO1xyXG4gIGZvcm1fY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJmb3JtLXJlc3VsdFwiKTtcclxuICAvL2Zvcm1fY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXCJmb3JtLWNvbnRhaW5lclwiKTtcclxuXHJcbiAgaDEuaW5uZXJIVE1MID0gZGF0YS5jaXR5Lm5hbWU7XHJcbiAgaDEuc3R5bGUuZm9udFNpemUgPSBcIjM1cHhcIjtcclxuICBoMy5yZW1vdmUoKTtcclxuXHJcbiAgc2NhbGUuY2xhc3NMaXN0LmFkZChcInNjYWxlLWNvbnRhaW5lclwiKTtcclxuICBzY2FsZS5jbGFzc0xpc3QucmVtb3ZlKFwic2NhbGUtaGlkZGVuXCIpO1xyXG4gIHNjYWxlX3VuaXQuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgaXRlbS5jbGFzc0xpc3QuYWRkKFwic2NhbGUtdW5pdFwiKTtcclxuICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcInNjYWxlLXVuaXQtaGlkZGVuXCIpO1xyXG4gIH0pO1xyXG4gIHNjYWxlQ29sb3IoKTtcclxuICBzY2FsZVZhbHVlKCk7XHJcbiAgYXJyb3dQb3NpdGlvbihkYXRhLmFxaSk7XHJcbiAgcXVhbGl0eShkYXRhLmFxaSk7XHJcbiAgYWlyQ29tcG9zaXRpb24oZGF0YS5pYXFpLCBkYXRhLmRvbWluZW50cG9sKTtcclxuICBoZWFsdGhJbXBsaWNhdGlvbnMoZGF0YS5hcWkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzY2FsZUNvbG9yKCkge1xyXG4gIGxldCBncmVlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ3JlZW5cIik7XHJcbiAgbGV0IHllbGxvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwieWVsbG93XCIpO1xyXG4gIGxldCBvcmFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9yYW5nZVwiKTtcclxuICBsZXQgcmVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWRcIik7XHJcbiAgbGV0IHB1cnBsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHVycGxlXCIpO1xyXG4gIGxldCBicm93biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnJvd25cIik7XHJcblxyXG4gIGdyZWVuLnN0eWxlLmNzc1RleHQgPSBgXHJcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA5OTY2O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMjBweCAwIDAgMjBweDtcclxuICBgO1xyXG4gIHllbGxvdy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNmZmRlMzNcIjtcclxuICBvcmFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCIjZmY5OTMzXCI7XHJcbiAgcmVkLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2NjMDAzM1wiO1xyXG4gIHB1cnBsZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiM2NjAwOTlcIjtcclxuICBicm93bi5zdHlsZS5jc3NUZXh0ID0gYFxyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzdlMDAyMztcclxuICAgIGJvcmRlci1yYWRpdXM6ICAwIDIwcHggMjBweCAwO1xyXG4gIGA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNjYWxlVmFsdWUoKSB7XHJcbiAgbGV0IHNjYWxlX3ZhbHVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zY2FsZS12YWx1ZVwiKTtcclxuICBsZXQgc2NhbGVfdmFsdWVfcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NhbGUtdmFsdWUgPiBwXCIpO1xyXG5cclxuICBzY2FsZV92YWx1ZS5yZW1vdmVBdHRyaWJ1dGUoXCJoaWRkZW5cIik7XHJcbiAgc2NhbGVfdmFsdWVfcC5mb3JFYWNoKChpdGVtKSA9PiBpdGVtLnJlbW92ZUF0dHJpYnV0ZShcImhpZGRlblwiKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFycm93UG9zaXRpb24odmFsdWUpIHtcclxuICBsZXQgdyA9IHNjYWxlLm9mZnNldFdpZHRoO1xyXG4gIGxldCBhcnJvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXJyb3ctdXBcIik7XHJcbiAgbGV0IHggPSAodyAtIDYpIC8gNjtcclxuXHJcbiAgZnVuY3Rpb24gcG9zaXRpb24oKSB7XHJcbiAgICBpZiAodmFsdWUgPj0gMCAmJiB2YWx1ZSA8PSA1MCkge1xyXG4gICAgICByZXR1cm4geCAvIDI7XHJcbiAgICB9IGVsc2UgaWYgKHZhbHVlID49IDUxICYmIHZhbHVlIDw9IDEwMCkge1xyXG4gICAgICByZXR1cm4geCArIHggLyAyO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA+PSAxMDEgJiYgdmFsdWUgPD0gMTUwKSB7XHJcbiAgICAgIHJldHVybiB4ICogMiArIHggLyAyO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA+PSAxNTEgJiYgdmFsdWUgPD0gMjAwKSB7XHJcbiAgICAgIHJldHVybiB4ICogMyArIHggLyAyO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA+PSAyMDEgJiYgdmFsdWUgPD0gMzAwKSB7XHJcbiAgICAgIHJldHVybiB4ICogNCArIHggLyAyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHggKiA1ICsgeCAvIDI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhcnJvdy5zdHlsZS5tYXJnaW5MZWZ0ID0gYCR7cG9zaXRpb24oKSAtIDE1fXB4YDtcclxuICBhcnJvdy5yZW1vdmVBdHRyaWJ1dGUoXCJoaWRkZW5cIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHF1YWxpdHkodmFsdWUpIHtcclxuICBsZXQgYXFpID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcWlcIik7XHJcbiAgbGV0IHF1YWxpdHkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1YWxpdHlcIik7XHJcbiAgbGV0IHJlc3VsdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdWx0LWNvbnRhaW5lciA+IGRpdlwiKTtcclxuICBhcWkuaW5uZXJIVE1MID0gdmFsdWU7XHJcblxyXG4gIGlmICh2YWx1ZSA+PSAwICYmIHZhbHVlIDw9IDUwKSB7XHJcbiAgICBxdWFsaXR5LmlubmVySFRNTCA9IFwiR29vZFwiO1xyXG4gIH0gZWxzZSBpZiAodmFsdWUgPj0gNTEgJiYgdmFsdWUgPD0gMTAwKSB7XHJcbiAgICBxdWFsaXR5LmlubmVySFRNTCA9IFwiTW9kZXJhdGVcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDEwMSAmJiB2YWx1ZSA8PSAxNTApIHtcclxuICAgIHF1YWxpdHkuaW5uZXJIVE1MID0gXCJVbmhlYWx0aHkgZm9yIFNlbnNpdGl2ZSBHcm91cHNcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDE1MSAmJiB2YWx1ZSA8PSAyMDApIHtcclxuICAgIHF1YWxpdHkuaW5uZXJIVE1MID0gXCJVbmhlYWx0aHlcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDIwMSAmJiB2YWx1ZSA8PSAzMDApIHtcclxuICAgIHF1YWxpdHkuaW5uZXJIVE1MID0gXCJWZXJ5IFVuaGVhbHRoeVwiO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBxdWFsaXR5LmlubmVySFRNTCA9IFwiSGF6YXJkb3VzXCI7XHJcbiAgfVxyXG5cclxuICByZXN1bHQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gc2VjdGlvbkNvbG9yKHZhbHVlKTtcclxuICBhcWkucmVtb3ZlQXR0cmlidXRlKFwiaGlkZGVuXCIpO1xyXG4gIHF1YWxpdHkucmVtb3ZlQXR0cmlidXRlKFwiaGlkZGVuXCIpO1xyXG4gIHJlc3VsdC5jbGFzc0xpc3QuYWRkKFwicmVzdWx0XCIpO1xyXG4gIHJlc3VsdF9jb250YWluZXIuY2xhc3NMaXN0LmFkZChcInJlc3VsdC1jb250YWluZXJcIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlY3Rpb25Db2xvcih2YWx1ZSkge1xyXG4gIGlmICh2YWx1ZSA+PSAwICYmIHZhbHVlIDw9IDUwKSB7XHJcbiAgICByZXR1cm4gXCIjMDA5OTY2XCI7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZSA+PSA1MSAmJiB2YWx1ZSA8PSAxMDApIHtcclxuICAgIHJldHVybiBcIiNmZmRlMzNcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDEwMSAmJiB2YWx1ZSA8PSAxNTApIHtcclxuICAgIHJldHVybiBcIiNmZjk5MzNcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDE1MSAmJiB2YWx1ZSA8PSAyMDApIHtcclxuICAgIHJldHVybiBcIiNjYzAwMzNcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDIwMSAmJiB2YWx1ZSA8PSAzMDApIHtcclxuICAgIHJldHVybiBcIiM2NjAwOTlcIjtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIFwiIzdlMDAyM1wiO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYWlyQ29tcG9zaXRpb24ob2JqLCBkb20pIHtcclxuICBsZXQgaDMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbXBvc2l0aW9uID4gaDNcIik7XHJcbiAgY29tcG9zaXRpb24uY2xhc3NMaXN0LmFkZChcImNvbXBvc2l0aW9uXCIpO1xyXG4gIGgzLnJlbW92ZUF0dHJpYnV0ZShcImhpZGRlblwiKTtcclxuXHJcbiAgbGV0IHJlbW92ZSA9IFtcInRcIiwgXCJoXCIsIFwicFwiLCBcIndcIiwgXCJ3Z1wiLCBcImRld1wiXTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbW92ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgZGVsZXRlIG9ialtyZW1vdmVbaV1dO1xyXG4gIH1cclxuICBjb25zb2xlLmxvZyhvYmopO1xyXG4gIGxldCBrZXlfYXJyID0gW107XHJcbiAgbGV0IHZhbHVlX2FyciA9IFtdO1xyXG4gIGZvciAobGV0IGtleSBpbiBvYmopIHtcclxuICAgIGtleV9hcnIucHVzaChrZXkpO1xyXG4gICAgdmFsdWVfYXJyLnB1c2gob2JqW2tleV0udik7XHJcbiAgfVxyXG5cclxuICBrZXlfYXJyLmZvckVhY2goKHZhbHVlLCBpbmRleCkgPT4ge1xyXG4gICAgcHJvY2Vzc0RhdGEoa2V5X2FyciwgdmFsdWVfYXJyLCBpbmRleCwgZG9tKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJvY2Vzc0RhdGEoYXJyMSwgYXJyMiwgaW5kZXgsIGRvbSkge1xyXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBvc2l0aW9uXCIpO1xyXG4gIGxldCBjb250YWluZXJfZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICBsZXQga2V5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcbiAgbGV0IHZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcblxyXG4gIGZ1bmN0aW9uIHVuaXRPZk1lYXN1cmUoeCkge1xyXG4gICAgaWYgKHggPT09IFwicG0yNVwiIHx8IHggPT09IFwicG0xMFwiKSB7XHJcbiAgICAgIHJldHVybiBcIsK1Zy9tM1wiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIFwicHBiXCI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb21pbmFudCh4LCB0YXJnZXQpIHtcclxuICAgIGlmICh4ID09PSBhcnIxW2luZGV4XSkge1xyXG4gICAgICBsZXQgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcbiAgICAgIGRvbS5pbm5lckhUTUwgPSBcIkRPTUlOQU5UXCI7XHJcbiAgICAgIGRvbS5zdHlsZS5mb250U2l6ZSA9IFwiMTVweFwiO1xyXG4gICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoZG9tKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGtleS5pbm5lckhUTUwgPSBhcnIxW2luZGV4XTtcclxuICB2YWx1ZS5pbm5lckhUTUwgPSBhcnIyW2luZGV4XSArIFwiIFwiICsgdW5pdE9mTWVhc3VyZShhcnIxW2luZGV4XSk7XHJcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNvbnRhaW5lcl9kaXYpO1xyXG4gIGNvbnRhaW5lcl9kaXYuY2xhc3NMaXN0LmFkZChcImNvbXBvc2l0aW9uLWRpdlwiKTtcclxuICBjb250YWluZXJfZGl2LmFwcGVuZENoaWxkKGtleSk7XHJcbiAgZG9taW5hbnQoZG9tLCBjb250YWluZXJfZGl2KTtcclxuICBjb250YWluZXJfZGl2LmFwcGVuZENoaWxkKHZhbHVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlRGF0YSgpIHtcclxuICBsZXQgb2Jzb2xldGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNvbXBvc2l0aW9uLWRpdlwiKTtcclxuICBvYnNvbGV0ZS5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xyXG4gICAgdmFsdWUucmVtb3ZlKCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhlYWx0aEltcGxpY2F0aW9ucyh2YWx1ZSkge1xyXG4gIGxldCBoZWFsdGhfY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNoZWFsdGhcIik7XHJcbiAgbGV0IGhlYWx0aF8xID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNoZWFsdGggPiBwOmZpcnN0LW9mLXR5cGVcIik7XHJcbiAgbGV0IGhlYWx0aF8yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNoZWFsdGggPiBwOmxhc3Qtb2YtdHlwZVwiKTtcclxuXHJcbiAgaWYgKHZhbHVlID49IDAgJiYgdmFsdWUgPD0gNTApIHtcclxuICAgIGhlYWx0aF8xLmlubmVySFRNTCA9XHJcbiAgICAgIFwiPHN0cm9uZz5IZWFsdGggaW1wbGljYXRpb25zOjwvc3Ryb25nPjxicj48YnI+QWlyIHF1YWxpdHkgaXMgY29uc2lkZXJlZCBzYXRpc2ZhY3RvcnksIGFuZCBhaXIgcG9sbHV0aW9uIHBvc2VzIGxpdHRsZSBvciBubyByaXNrLlwiO1xyXG4gICAgaGVhbHRoXzIuaW5uZXJIVE1MID0gXCJcIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDUxICYmIHZhbHVlIDw9IDEwMCkge1xyXG4gICAgaGVhbHRoXzEuaW5uZXJIVE1MID1cclxuICAgICAgXCI8c3Ryb25nPkhlYWx0aCBpbXBsaWNhdGlvbnM6PC9zdHJvbmc+PGJyPjxicj5BaXIgcXVhbGl0eSBpcyBhY2NlcHRhYmxlOyBob3dldmVyLCBmb3Igc29tZSBwb2xsdXRhbnRzIHRoZXJlIG1heSBiZSBhIG1vZGVyYXRlIGhlYWx0aCBjb25jZXJuIGZvciBhIHZlcnkgc21hbGwgbnVtYmVyIG9mIHBlb3BsZSB3aG8gYXJlIHVudXN1YWxseSBzZW5zaXRpdmUgdG8gYWlyIHBvbGx1dGlvbi5cIjtcclxuICAgIGhlYWx0aF8yLmlubmVySFRNTCA9XHJcbiAgICAgIFwiQWN0aXZlIGNoaWxkcmVuIGFuZCBhZHVsdHMsIGFuZCBwZW9wbGUgd2l0aCByZXNwaXJhdG9yeSBkaXNlYXNlLCBzdWNoIGFzIGFzdGhtYSwgc2hvdWxkIGxpbWl0IHByb2xvbmdlZCBvdXRkb29yIGV4ZXJ0aW9uLlwiO1xyXG4gIH0gZWxzZSBpZiAodmFsdWUgPj0gMTAxICYmIHZhbHVlIDw9IDE1MCkge1xyXG4gICAgaGVhbHRoXzEuaW5uZXJIVE1MID1cclxuICAgICAgXCI8c3Ryb25nPkhlYWx0aCBpbXBsaWNhdGlvbnM6PC9zdHJvbmc+PGJyPjxicj5NZW1iZXJzIG9mIHNlbnNpdGl2ZSBncm91cHMgbWF5IGV4cGVyaWVuY2UgaGVhbHRoIGVmZmVjdHMuIFRoZSBnZW5lcmFsIHB1YmxpYyBpcyBub3QgbGlrZWx5IHRvIGJlIGFmZmVjdGVkLlwiO1xyXG4gICAgaGVhbHRoXzIuaW5uZXJIVE1MID1cclxuICAgICAgXCJBY3RpdmUgY2hpbGRyZW4gYW5kIGFkdWx0cywgYW5kIHBlb3BsZSB3aXRoIHJlc3BpcmF0b3J5IGRpc2Vhc2UsIHN1Y2ggYXMgYXN0aG1hLCBzaG91bGQgbGltaXQgcHJvbG9uZ2VkIG91dGRvb3IgZXhlcnRpb24uXCI7XHJcbiAgfSBlbHNlIGlmICh2YWx1ZSA+PSAxNTEgJiYgdmFsdWUgPD0gMjAwKSB7XHJcbiAgICBoZWFsdGhfMS5pbm5lckhUTUwgPVxyXG4gICAgICBcIjxzdHJvbmc+SGVhbHRoIGltcGxpY2F0aW9uczo8L3N0cm9uZz48YnI+PGJyPkV2ZXJ5b25lIG1heSBiZWdpbiB0byBleHBlcmllbmNlIGhlYWx0aCBlZmZlY3RzOyBtZW1iZXJzIG9mIHNlbnNpdGl2ZSBncm91cHMgbWF5IGV4cGVyaWVuY2UgbW9yZSBzZXJpb3VzIGhlYWx0aCBlZmZlY3RzLlwiO1xyXG4gICAgaGVhbHRoXzIuaW5uZXJIVE1MID1cclxuICAgICAgXCJBY3RpdmUgY2hpbGRyZW4gYW5kIGFkdWx0cywgYW5kIHBlb3BsZSB3aXRoIHJlc3BpcmF0b3J5IGRpc2Vhc2UsIHN1Y2ggYXMgYXN0aG1hLCBzaG91bGQgYXZvaWQgcHJvbG9uZ2VkIG91dGRvb3IgZXhlcnRpb247IGV2ZXJ5b25lIGVsc2UsIGVzcGVjaWFsbHkgY2hpbGRyZW4sIHNob3VsZCBsaW1pdCBwcm9sb25nZWQgb3V0ZG9vciBleGVydGlvbi5cIjtcclxuICB9IGVsc2UgaWYgKHZhbHVlID49IDIwMSAmJiB2YWx1ZSA8PSAzMDApIHtcclxuICAgIGhlYWx0aF8xLmlubmVySFRNTCA9XHJcbiAgICAgIFwiPHN0cm9uZz5IZWFsdGggaW1wbGljYXRpb25zOjwvc3Ryb25nPjxicj48YnI+SGVhbHRoIHdhcm5pbmdzIG9mIGVtZXJnZW5jeSBjb25kaXRpb25zLiBUaGUgZW50aXJlIHBvcHVsYXRpb24gaXMgbW9yZSBsaWtlbHkgdG8gYmUgYWZmZWN0ZWQuXCI7XHJcbiAgICBoZWFsdGhfMi5pbm5lckhUTUwgPVxyXG4gICAgICBcIkFjdGl2ZSBjaGlsZHJlbiBhbmQgYWR1bHRzLCBhbmQgcGVvcGxlIHdpdGggcmVzcGlyYXRvcnkgZGlzZWFzZSwgc3VjaCBhcyBhc3RobWEsIHNob3VsZCBhdm9pZCBhbGwgb3V0ZG9vciBleGVydGlvbjsgZXZlcnlvbmUgZWxzZSwgZXNwZWNpYWxseSBjaGlsZHJlbiwgc2hvdWxkIGxpbWl0IG91dGRvb3IgZXhlcnRpb24uXCI7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhlYWx0aF8xLmlubmVySFRNTCA9XHJcbiAgICAgIFwiPHN0cm9uZz5IZWFsdGggaW1wbGljYXRpb25zOjwvc3Ryb25nPjxicj48YnI+SGVhbHRoIGFsZXJ0ISBldmVyeW9uZSBtYXkgZXhwZXJpZW5jZSBtb3JlIHNlcmlvdXMgaGVhbHRoIGVmZmVjdHMuXCI7XHJcbiAgICBoZWFsdGhfMi5pbm5lckhUTUwgPSBcIkV2ZXJ5b25lIHNob3VsZCBhdm9pZCBhbGwgb3V0ZG9vciBleGVydGlvbi5cIjtcclxuICB9XHJcblxyXG4gIGhlYWx0aF9jb250YWluZXIuY2xhc3NMaXN0LmFkZChcImhlYWx0aFwiKTtcclxuICBpZiAoaGVhbHRoXzIuaW5uZXJIVE1MID09PSBcIlwiKSB7XHJcbiAgICBoZWFsdGhfMS5zdHlsZS5ib3JkZXJCb3R0b20gPSBcIm5vbmVcIjtcclxuICAgIGhlYWx0aF8xLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBcIjBweFwiO1xyXG4gICAgaGVhbHRoXzIuc3R5bGUucGFkZGluZ1RvcCA9IFwiMHB4XCI7XHJcbiAgfSBlbHNlIHtcclxuICAgIGhlYWx0aF8xLnN0eWxlLmJvcmRlckJvdHRvbSA9IFwiMXB4IHNvbGlkICNjNGNlZDNcIjtcclxuICAgIGhlYWx0aF8xLnN0eWxlLnBhZGRpbmdCb3R0b20gPSBcIjIwcHhcIjtcclxuICAgIGhlYWx0aF8yLnN0eWxlLnBhZGRpbmdUb3AgPSBcIjIwcHhcIjtcclxuICB9XHJcbn1cclxuXHJcbi8qPGRpdiBpZD1cImRvbV81XCI+PC9kaXY+XHJcbiAgPGRpdiBpZD1cImRvbV80XCI+PC9kaXY+XHJcbiAgPGRpdiBpZD1cImRvbV8yXCI+PC9kaXY+XHJcbiAgPGRpdiBpZD1cImRvbV8xXCI+PC9kaXY+Ki9cclxuXHJcbi8qZnVuY3Rpb24gYWlyQ29tcG9zaXRpb24ob2JqLCBkb20pIHtcclxuICBsZXQgaDMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbXBvc2l0aW9uID4gaDNcIik7XHJcblxyXG4gIGNvbXBvc2l0aW9uLmNsYXNzTGlzdC5hZGQoXCJjb21wb3NpdGlvblwiKTtcclxuICBoMy5yZW1vdmVBdHRyaWJ1dGUoXCJoaWRkZW5cIik7XHJcblxyXG4gIGxldCBrZXlfYXJyID0gW107XHJcbiAgbGV0IHZhbHVlX2FyciA9IFtdO1xyXG4gIGZvciAobGV0IGtleSBpbiBvYmopIHtcclxuICAgIGtleV9hcnIucHVzaChrZXkpO1xyXG4gICAgdmFsdWVfYXJyLnB1c2gob2JqW2tleV0udik7XHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKGtleV9hcnIpO1xyXG4gIGNvbnNvbGUubG9nKHZhbHVlX2Fycik7XHJcbiAgcHJvY2Vzc0RhdGEoa2V5X2FyciwgdmFsdWVfYXJyLCA1LCBkb20pO1xyXG4gIHByb2Nlc3NEYXRhKGtleV9hcnIsIHZhbHVlX2FyciwgNCwgZG9tKTtcclxuICBwcm9jZXNzRGF0YShrZXlfYXJyLCB2YWx1ZV9hcnIsIDIsIGRvbSk7XHJcbiAgcHJvY2Vzc0RhdGEoa2V5X2FyciwgdmFsdWVfYXJyLCAxLCBkb20pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcm9jZXNzRGF0YShhcnIxLCBhcnIyLCBpbmRleCwgZG9tKSB7XHJcbiAgbGV0IGtleSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gIGxldCB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gIGxldCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZG9tXyR7aW5kZXh9YCk7XHJcblxyXG4gIGZ1bmN0aW9uIHVuaXRPZk1lYXN1cmUoeCkge1xyXG4gICAgaWYgKHggPT09IFwicG0yNVwiIHx8IHggPT09IFwicG0xMFwiKSB7XHJcbiAgICAgIHJldHVybiBcIsK1Zy9tM1wiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIFwicHBiXCI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkb21pbmFudCh4LCB0YXJnZXQpIHtcclxuICAgIGlmICh4ID09PSBhcnIxW2luZGV4XSkge1xyXG4gICAgICBsZXQgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcbiAgICAgIGRvbS5pbm5lckhUTUwgPSBcIkRvbWluYW50XCI7XHJcbiAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChkb20pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAga2V5LmlubmVySFRNTCA9IGFycjFbaW5kZXhdO1xyXG4gIHZhbHVlLmlubmVySFRNTCA9IGFycjJbaW5kZXhdICsgXCIgXCIgKyB1bml0T2ZNZWFzdXJlKGFycjFbaW5kZXhdKTtcclxuXHJcbiAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJjb21wb3NpdGlvbi1kaXZcIik7XHJcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKGtleSk7XHJcbiAgZG9taW5hbnQoZG9tLCBjb250YWluZXIpO1xyXG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh2YWx1ZSk7XHJcbn0gKi9cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9