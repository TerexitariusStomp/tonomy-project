import { APIClient, FetchProvider, SignedTransaction, Transaction as Transaction$1, Action, PublicKey, Checksum256, Bytes, PrivateKey, KeyType, Name, ABI, Serializer } from '@greymass/eosio';
import fetch from 'cross-fetch';
import rb from '@consento/sync-randombytes';
import elliptic from 'elliptic';
import { createJWT, ES256KSigner, verifyJWT } from 'did-jwt';
import { io } from 'socket.io-client';

function _regeneratorRuntime() {
  _regeneratorRuntime = function () {
    return exports;
  };
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == typeof value && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function (method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var methodName = context.method,
      method = delegate.iterator[methodName];
    if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator.return && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel;
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) keys.push(key);
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
    },
    stop: function () {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function (record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    catch: function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}
function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct.bind();
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }
  return _construct.apply(null, arguments);
}
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;
  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;
    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);
      _cache.set(Class, Wrapper);
    }
    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };
  return _wrapNativeSuper(Class);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

var HttpError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(HttpError, _Error);
  function HttpError(httpError) {
    var _this;
    _this = _Error.call(this, 'HTTP Error') || this;
    // Ensure the name of this error is the same as the class name
    _this.name = _this.constructor.name;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
    }
    _this.stack = new Error().stack;
    _this.path = httpError.path;
    _this.response = httpError.response;
    if (httpError.line) _this.line = httpError.line;
    if (httpError.column) _this.line = httpError.column;
    if (httpError.sourceURL) _this.sourceURL = httpError.sourceURL;
    return _this;
  }
  return HttpError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
var SdkError = /*#__PURE__*/function (_Error2) {
  _inheritsLoose(SdkError, _Error2);
  function SdkError(message) {
    var _this2;
    _this2 = _Error2.call(this, message) || this;
    // Ensure the name of this error is the same as the class name
    _this2.name = _this2.constructor.name;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_assertThisInitialized(_this2), _this2.constructor);
    }
    _this2.stack = new Error().stack;
    return _this2;
  }
  return SdkError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
// using never to suppress error https://bobbyhadz.com/blog/typescript-function-that-throws-error#:~:text=To%20declare%20a%20function%20that,terminate%20execution%20of%20the%20program.
function throwError(message, code) {
  var error = new SdkError(message);
  if (code) {
    error = new SdkError(code + ': ' + message);
    error.code = code;
  }
  throw error;
}
var SdkErrors;
(function (SdkErrors) {
  SdkErrors["UsernameTaken"] = "UsernameTaken";
  SdkErrors["AccountDoesntExist"] = "AccountDoesntExist";
  SdkErrors["UsernameNotFound"] = "UsernameNotFound";
  SdkErrors["DataQueryNoRowDataFound"] = "DataQueryNoRowDataFound";
  SdkErrors["UpdateKeysTransactionNoKeys"] = "UpdateKeysTransactionNoKeys";
  SdkErrors["CouldntCreateApi"] = "CouldntCreateApi";
  SdkErrors["PasswordFormatInvalid"] = "PasswordFormatInvalid";
  SdkErrors["PasswordTooCommon"] = "PasswordTooCommon";
  SdkErrors["PasswordInValid"] = "PasswordInValid";
  SdkErrors["KeyNotFound"] = "KeyNotFound";
  SdkErrors["OriginNotFound"] = "OriginNotFound";
  SdkErrors["JwtNotValid"] = "JwtNotValid";
  SdkErrors["WrongOrigin"] = "WrongOrigin";
  SdkErrors["SettingsNotInitialized"] = "SettingsNotInitialized";
  SdkErrors["MissingParams"] = "MissingParams";
  SdkErrors["InvalidKey"] = "InvalidKey";
})(SdkErrors || (SdkErrors = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (SdkErrors) {
  /*
   * Returns the index of the enum value
   *
   * @param value The value to get the index of
   */
  function indexFor(value) {
    return Object.keys(SdkErrors).indexOf(value);
  }
  SdkErrors.indexFor = indexFor;
  /*
   * Creates an SdkErrors from a string or index of the level
   *
   * @param value The string or index
   */
  function from(value) {
    var index;
    if (typeof value !== 'number') {
      index = SdkErrors.indexFor(value);
    } else {
      index = value;
    }
    return Object.values(SdkErrors)[index];
  }
  SdkErrors.from = from;
})(SdkErrors || (SdkErrors = {}));

var settings;
var initialized = false;
function setSettings(newSettings) {
  settings = newSettings;
  initialized = true;
}
function getSettings() {
  if (!initialized) {
    throwError('Settings not yet initialized', SdkErrors.SettingsNotInitialized);
  }
  return settings;
}

var api;
function getApi() {
  return _getApi.apply(this, arguments);
}
function _getApi() {
  _getApi = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
    var settings;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!api) {
            _context.next = 2;
            break;
          }
          return _context.abrupt("return", api);
        case 2:
          settings = getSettings();
          api = new APIClient({
            url: settings.blockchainUrl,
            provider: new FetchProvider(settings.blockchainUrl, {
              fetch: fetch
            })
          });
          if (!api) throwError('Could not create API client', SdkErrors.CouldntCreateApi);
          return _context.abrupt("return", api);
        case 6:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _getApi.apply(this, arguments);
}

var Eosio = {
  __proto__: null,
  getApi: getApi
};

function createSigner(privateKey) {
  return {
    sign: function sign(digest) {
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", privateKey.signDigest(digest));
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))();
    }
  };
}
function createKeyManagerSigner(keyManager, level, challenge) {
  return {
    sign: function sign(digest) {
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return keyManager.signData({
                level: level,
                data: digest,
                challenge: challenge
              });
            case 2:
              return _context2.abrupt("return", _context2.sent);
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))();
    }
  };
}
var AntelopePushTransactionError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(AntelopePushTransactionError, _Error);
  function AntelopePushTransactionError(err) {
    var _this;
    _this = _Error.call(this, 'AntelopePushTransactionError') || this;
    _this.code = err.code;
    _this.message = err.message;
    _this.error = err.error;
    _this.stack = new Error().stack;
    // Ensure the name of this error is the same as the class name
    _this.name = _this.constructor.name;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
    }
    return _this;
  }
  var _proto = AntelopePushTransactionError.prototype;
  _proto.hasErrorCode = function hasErrorCode(code) {
    return this.error.code === code;
  };
  _proto.hasTonomyErrorCode = function hasTonomyErrorCode(code) {
    // TODO iterate over deatils array instead of only looking at first element
    return this.error.details[0].message.search(code) > 0;
  };
  return AntelopePushTransactionError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
function transact(_x, _x2, _x3) {
  return _transact.apply(this, arguments);
}
function _transact() {
  _transact = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(contract, actions, signer) {
    var api, abi, actionData, info, header, transaction, signDigest, signature, signedTransaction, res;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return getApi();
        case 2:
          api = _context3.sent;
          _context3.next = 5;
          return api.v1.chain.get_abi(contract);
        case 5:
          abi = _context3.sent;
          // Create the action data
          actionData = [];
          actions.forEach(function (data) {
            actionData.push(Action.from(_extends({}, data, {
              account: contract
            }), abi.abi));
          });
          // Construct the transaction
          _context3.next = 10;
          return api.v1.chain.get_info();
        case 10:
          info = _context3.sent;
          header = info.getTransactionHeader();
          transaction = Transaction$1.from(_extends({}, header, {
            actions: actionData
          })); // Create signature
          signDigest = transaction.signingDigest(info.chain_id);
          _context3.next = 16;
          return signer.sign(signDigest);
        case 16:
          signature = _context3.sent;
          signedTransaction = SignedTransaction.from(_extends({}, transaction, {
            signatures: [signature]
          })); // Send to the node
          _context3.prev = 18;
          _context3.next = 21;
          return api.v1.chain.push_transaction(signedTransaction);
        case 21:
          res = _context3.sent;
          _context3.next = 31;
          break;
        case 24:
          _context3.prev = 24;
          _context3.t0 = _context3["catch"](18);
          if (!(_context3.t0.response && _context3.t0.response.headers)) {
            _context3.next = 30;
            break;
          }
          if (!_context3.t0.response.json) {
            _context3.next = 29;
            break;
          }
          throw new AntelopePushTransactionError(_context3.t0.response.json);
        case 29:
          throw new HttpError(_context3.t0);
        case 30:
          throw _context3.t0;
        case 31:
          return _context3.abrupt("return", res);
        case 32:
        case "end":
          return _context3.stop();
      }
    }, _callee3, null, [[18, 24]]);
  }));
  return _transact.apply(this, arguments);
}

var Transaction = {
  __proto__: null,
  AntelopePushTransactionError: AntelopePushTransactionError,
  transact: transact,
  createSigner: createSigner,
  createKeyManagerSigner: createKeyManagerSigner
};

var KeyManagerLevel;
(function (KeyManagerLevel) {
  KeyManagerLevel["PASSWORD"] = "PASSWORD";
  KeyManagerLevel["PIN"] = "PIN";
  KeyManagerLevel["FINGERPRINT"] = "FINGERPRINT";
  KeyManagerLevel["LOCAL"] = "LOCAL";
  KeyManagerLevel["BROWSERLOCALSTORAGE"] = "BROWSERLOCALSTORAGE";
  KeyManagerLevel["BROWSERSESSIONSTORAGE"] = "BROWSERSESSIONSTORAGE";
})(KeyManagerLevel || (KeyManagerLevel = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (KeyManagerLevel) {
  /*
   * Returns the index of the enum value
   *
   * @param value The level to get the index of
   */
  function indexFor(value) {
    return Object.keys(KeyManagerLevel).indexOf(value);
  }
  KeyManagerLevel.indexFor = indexFor;
  /*
   * Creates an AuthenticatorLevel from a string or index of the level
   *
   * @param value The string or index
   */
  function from(value) {
    var index;
    if (typeof value !== 'number') {
      index = KeyManagerLevel.indexFor(value);
    } else {
      index = value;
    }
    return Object.values(KeyManagerLevel)[index];
  }
  KeyManagerLevel.from = from;
})(KeyManagerLevel || (KeyManagerLevel = {}));

/**
 * A proxy handler that will create magic getters and setters for the storage
 */
var storageProxyHandler = {
  /**
   * return the called property from the storage if it exists
   * @param target - The target object
   * @param key - The property key
   * @returns The value of the property from the storage or cached value
   * @throws {Error} If the data could not be retrieved
   */
  get: function get(target, key) {
    if (key === 'scope') throwError('Scope is a reserved key');
    if (key === 'cache') throwError('Cache is a reserved key');
    var scopedKey = target.scope + key;
    if (key in target) {
      if (key === 'clear') {
        target.cache = {};
      }
      return function () {
        target[key]();
      };
    }
    if (target.cache[scopedKey]) return target.cache[scopedKey];
    return target.retrieve(scopedKey).then(function (data) {
      target.cache[scopedKey] = data; // cache the data
      return data;
    })["catch"](function (e) {
      throwError("Could not get " + scopedKey + " from storage - " + e);
    });
  },
  /**
   * store the value in the storage
   * @param target - The target object
   * @param key - The property key
   * @param value - The value to store
   * @returns true if the value was stored
   * @throws {Error} If the data could not be stored
   */
  set: /*#__PURE__*/function () {
    var _set = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(target, key, value) {
      var scopedKey;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            scopedKey = target.scope + key;
            return _context.abrupt("return", target.store(scopedKey, value).then(function () {
              target.cache[scopedKey] = value;
              return true;
            })["catch"](function () {
              return false;
              // throw new Error(`Could not store data - ${e}`);
            }));
          case 2:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    function set(_x, _x2, _x3) {
      return _set.apply(this, arguments);
    }
    return set;
  }()
};
function createStorage(scope, storageFactory) {
  var storage = storageFactory(scope);
  storage.cache = {};
  var proxy = new Proxy(storage, storageProxyHandler);
  return proxy;
}

var secp256k1 = /*#__PURE__*/new elliptic.ec('secp256k1');
function randomBytes(bytes) {
  return rb(new Uint8Array(bytes));
}
function validateKey(keyPair) {
  var result = keyPair.validate();
  if (!result.result) {
    throwError("Key not valid with reason " + result.reason, SdkErrors.InvalidKey);
  }
}
function toElliptic(key) {
  var ecKeyPair;
  if (key instanceof PublicKey) {
    ecKeyPair = secp256k1.keyFromPublic(key.data.array);
  } else {
    ecKeyPair = secp256k1.keyFromPrivate(key.data.array);
  }
  validateKey(ecKeyPair);
  return ecKeyPair;
}
function randomString(bytes) {
  var random = rb(new Uint8Array(bytes));
  return Array.from(random).map(int2hex).join('');
}
function sha256(digest) {
  return Checksum256.hash(Bytes.from(encodeHex(digest), 'hex')).toString();
}
function int2hex(i) {
  return ('0' + i.toString(16)).slice(-2);
}
function encodeHex(str) {
  return str.split('').map(function (c) {
    return c.charCodeAt(0).toString(16).padStart(2, '0');
  }).join('');
}
function decodeHex(hex) {
  return hex.split(/(\w\w)/g).filter(function (p) {
    return !!p;
  }).map(function (c) {
    return String.fromCharCode(parseInt(c, 16));
  }).join('');
}
function generateRandomKeyPair() {
  var bytes = randomBytes(32);
  var privateKey = new PrivateKey(KeyType.K1, new Bytes(bytes));
  var publicKey = privateKey.toPublic();
  return {
    privateKey: privateKey,
    publicKey: publicKey
  };
}

var AccountType;
(function (AccountType) {
  AccountType["PERSON"] = "PERSON";
  AccountType["ORG"] = "ORG";
  AccountType["APP"] = "APP";
  AccountType["GOV"] = "GOV";
})(AccountType || (AccountType = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (AccountType) {
  /*
   * Returns the index of the enum value
   *
   * @param value The level to get the index of
   */
  function indexFor(value) {
    return Object.keys(AccountType).indexOf(value);
  }
  AccountType.indexFor = indexFor;
  /*
   * Creates an AccountType from a string or index of the level
   *
   * @param value The string or index
   */
  function from(value) {
    var index;
    if (typeof value !== 'number') {
      index = AccountType.indexFor(value);
    } else {
      index = value;
    }
    return Object.values(AccountType)[index];
  }
  AccountType.from = from;
  function getPreSuffix(value) {
    return value.toLowerCase();
  }
  AccountType.getPreSuffix = getPreSuffix;
})(AccountType || (AccountType = {}));
var TonomyUsername = /*#__PURE__*/function () {
  function TonomyUsername(username, hashed) {
    if (hashed === void 0) {
      hashed = false;
    }
    if (hashed) {
      this.usernameHash = username;
    } else {
      this.username = username;
      this.usernameHash = sha256(this.username);
    }
  }
  TonomyUsername.fromHash = function fromHash(usernameHash) {
    return new TonomyUsername(usernameHash, true);
  };
  TonomyUsername.fromUsername = function fromUsername(username, type, suffix) {
    var fullUsername = username + '.' + AccountType.getPreSuffix(type) + suffix;
    return new TonomyUsername(fullUsername);
  };
  TonomyUsername.fromFullUsername = function fromFullUsername(username) {
    return new TonomyUsername(username);
  };
  return TonomyUsername;
}();

var PermissionLevel;
(function (PermissionLevel) {
  PermissionLevel["OWNER"] = "OWNER";
  PermissionLevel["ACTIVE"] = "ACTIVE";
  PermissionLevel["PASSWORD"] = "PASSWORD";
  PermissionLevel["PIN"] = "PIN";
  PermissionLevel["FINGERPRINT"] = "FINGERPRINT";
  PermissionLevel["LOCAL"] = "LOCAL";
})(PermissionLevel || (PermissionLevel = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (PermissionLevel) {
  /*
   * Returns the index of the enum value
   *
   * @param value The value to get the index of
   */
  function indexFor(value) {
    return Object.keys(PermissionLevel).indexOf(value);
  }
  PermissionLevel.indexFor = indexFor;
  /*
   * Creates an PermissionLevel from a string or index of the level
   *
   * @param value The string or index
   */
  function from(value) {
    var index;
    if (typeof value !== 'number') {
      index = PermissionLevel.indexFor(value);
    } else {
      index = value;
    }
    return Object.values(PermissionLevel)[index];
  }
  PermissionLevel.from = from;
})(PermissionLevel || (PermissionLevel = {}));
var IDContract = /*#__PURE__*/function () {
  function IDContract() {}
  var _proto = IDContract.prototype;
  _proto.newperson = /*#__PURE__*/function () {
    var _newperson = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(username_hash, password_key, password_salt, signer) {
      var action;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            action = {
              authorization: [{
                actor: 'id.tonomy',
                permission: 'active'
              }],
              account: 'id.tonomy',
              name: 'newperson',
              data: {
                username_hash: username_hash,
                password_key: password_key,
                password_salt: password_salt
              }
            };
            _context.next = 3;
            return transact(Name.from('id.tonomy'), [action], signer);
          case 3:
            return _context.abrupt("return", _context.sent);
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    function newperson(_x, _x2, _x3, _x4) {
      return _newperson.apply(this, arguments);
    }
    return newperson;
  }();
  _proto.updatekeysper = /*#__PURE__*/function () {
    var _updatekeysper = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(account, keys, signer) {
      var actions, key, permission, publicKey;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            actions = [];
            if (Object.keys(keys).length === 0) throwError('At least one key must be provided', SdkErrors.UpdateKeysTransactionNoKeys);
            for (key in keys) {
              permission = PermissionLevel.from(key); // "keys as any" fixes typescript issue see https://stackoverflow.com/a/57192972
              publicKey = keys[key];
              actions.push({
                authorization: [{
                  actor: account,
                  permission: 'active'
                }],
                account: 'id.tonomy',
                name: 'updatekeyper',
                data: {
                  account: account,
                  permission: PermissionLevel.indexFor(permission),
                  key: publicKey
                }
              });
            }
            _context2.next = 5;
            return transact(Name.from('id.tonomy'), actions, signer);
          case 5:
            return _context2.abrupt("return", _context2.sent);
          case 6:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    function updatekeysper(_x5, _x6, _x7) {
      return _updatekeysper.apply(this, arguments);
    }
    return updatekeysper;
  }();
  _proto.newapp = /*#__PURE__*/function () {
    var _newapp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(app_name, description, username_hash, logo_url, origin, key, signer) {
      var action;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            /^(((http:\/\/)|(https:\/\/))?)(([a-zA-Z0-9.])+)((:{1}[0-9]+)?)$/g.test(origin);
            /^(((http:\/\/)|(https:\/\/))?)(([a-zA-Z0-9.])+)((:{1}[0-9]+)?)([?#/a-zA-Z0-9.]*)$/g.test(logo_url);
            action = {
              authorization: [{
                actor: 'id.tonomy',
                permission: 'active'
              }],
              account: 'id.tonomy',
              name: 'newapp',
              data: {
                app_name: app_name,
                description: description,
                logo_url: logo_url,
                origin: origin,
                username_hash: username_hash,
                key: key
              }
            };
            _context3.next = 5;
            return transact(Name.from('id.tonomy'), [action], signer);
          case 5:
            return _context3.abrupt("return", _context3.sent);
          case 6:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    function newapp(_x8, _x9, _x10, _x11, _x12, _x13, _x14) {
      return _newapp.apply(this, arguments);
    }
    return newapp;
  }();
  _proto.loginwithapp = /*#__PURE__*/function () {
    var _loginwithapp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(account, app, parent, key, signer) {
      var action;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            action = {
              authorization: [{
                actor: account,
                permission: parent
              }],
              account: 'id.tonomy',
              name: 'loginwithapp',
              data: {
                account: account,
                app: app,
                parent: parent,
                key: key
              }
            };
            _context4.next = 3;
            return transact(Name.from('id.tonomy'), [action], signer);
          case 3:
            return _context4.abrupt("return", _context4.sent);
          case 4:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    function loginwithapp(_x15, _x16, _x17, _x18, _x19) {
      return _loginwithapp.apply(this, arguments);
    }
    return loginwithapp;
  }();
  _proto.getPerson = /*#__PURE__*/function () {
    var _getPerson = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(account) {
      var data, api, usernameHash, idData;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return getApi();
          case 2:
            api = _context5.sent;
            if (!(account instanceof TonomyUsername)) {
              _context5.next = 12;
              break;
            }
            // this is a username
            usernameHash = account.usernameHash;
            _context5.next = 7;
            return api.v1.chain.get_table_rows({
              code: 'id.tonomy',
              scope: 'id.tonomy',
              table: 'people',
              // eslint-disable-next-line camelcase
              lower_bound: Checksum256.from(usernameHash),
              limit: 1,
              // eslint-disable-next-line camelcase
              index_position: 'secondary'
            });
          case 7:
            data = _context5.sent;
            if (!data || !data.rows) throwError('No data found', SdkErrors.DataQueryNoRowDataFound);
            if (data.rows.length === 0 || data.rows[0].username_hash.toString() !== usernameHash) {
              throwError('Person with username "' + account.username + '" not found', SdkErrors.UsernameNotFound);
            }
            _context5.next = 17;
            break;
          case 12:
            _context5.next = 14;
            return api.v1.chain.get_table_rows({
              code: 'id.tonomy',
              scope: 'id.tonomy',
              table: 'people',
              // eslint-disable-next-line camelcase
              lower_bound: account,
              limit: 1
            });
          case 14:
            data = _context5.sent;
            if (!data || !data.rows) throwError('No data found', SdkErrors.DataQueryNoRowDataFound);
            if (data.rows.length === 0 || data.rows[0].account_name !== account.toString()) {
              throwError('Person with account name "' + account.toString() + '" not found', SdkErrors.AccountDoesntExist);
            }
          case 17:
            idData = data.rows[0];
            return _context5.abrupt("return", {
              // eslint-disable-next-line camelcase
              account_name: Name.from(idData.account_name),
              status: idData.status,
              // eslint-disable-next-line camelcase
              username_hash: Checksum256.from(idData.username_hash),
              // eslint-disable-next-line camelcase
              password_salt: Checksum256.from(idData.password_salt),
              version: idData.version
            });
          case 19:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    function getPerson(_x20) {
      return _getPerson.apply(this, arguments);
    }
    return getPerson;
  }();
  _proto.getApp = /*#__PURE__*/function () {
    var _getApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(account) {
      var data, api, usernameHash, origin, originHash, idData;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return getApi();
          case 2:
            api = _context6.sent;
            if (!(account instanceof TonomyUsername)) {
              _context6.next = 12;
              break;
            }
            // this is a username
            usernameHash = account.usernameHash;
            _context6.next = 7;
            return api.v1.chain.get_table_rows({
              code: 'id.tonomy',
              scope: 'id.tonomy',
              table: 'apps',
              // eslint-disable-next-line camelcase
              lower_bound: Checksum256.from(usernameHash),
              limit: 1,
              // eslint-disable-next-line camelcase
              index_position: 'secondary'
            });
          case 7:
            data = _context6.sent;
            if (!data || !data.rows) throwError('No data found', SdkErrors.DataQueryNoRowDataFound);
            if (data.rows.length === 0 || data.rows[0].username_hash.toString() !== usernameHash) {
              throwError('Account with username "' + account.username + '" not found', SdkErrors.UsernameNotFound);
            }
            _context6.next = 27;
            break;
          case 12:
            if (!(account instanceof Name)) {
              _context6.next = 20;
              break;
            }
            _context6.next = 15;
            return api.v1.chain.get_table_rows({
              code: 'id.tonomy',
              scope: 'id.tonomy',
              table: 'apps',
              // eslint-disable-next-line camelcase
              lower_bound: account,
              limit: 1
            });
          case 15:
            data = _context6.sent;
            if (!data || !data.rows) throwError('No data found', SdkErrors.DataQueryNoRowDataFound);
            if (data.rows.length === 0 || data.rows[0].account_name !== account.toString()) {
              throwError('Account "' + account.toString() + '" not found', SdkErrors.AccountDoesntExist);
            }
            _context6.next = 27;
            break;
          case 20:
            // account is the origin
            origin = account;
            originHash = sha256(origin);
            _context6.next = 24;
            return api.v1.chain.get_table_rows({
              code: 'id.tonomy',
              scope: 'id.tonomy',
              table: 'apps',
              // eslint-disable-next-line camelcase
              lower_bound: Checksum256.from(originHash),
              limit: 1,
              // eslint-disable-next-line camelcase
              index_position: 'tertiary'
            });
          case 24:
            data = _context6.sent;
            if (!data || !data.rows) throwError('No data found', SdkErrors.DataQueryNoRowDataFound);
            if (data.rows.length === 0 || data.rows[0].origin !== origin) {
              throwError('Account with origin "' + origin + '" not found', SdkErrors.OriginNotFound);
            }
          case 27:
            idData = data.rows[0];
            return _context6.abrupt("return", {
              // eslint-disable-next-line camelcase
              app_name: idData.app_name,
              description: idData.description,
              // eslint-disable-next-line camelcase
              logo_url: idData.logo_url,
              origin: idData.origin,
              // eslint-disable-next-line camelcase
              account_name: Name.from(idData.account_name),
              // eslint-disable-next-line camelcase
              username_hash: Checksum256.from(idData.username_hash),
              version: idData.version
            });
          case 29:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }));
    function getApp(_x21) {
      return _getApp.apply(this, arguments);
    }
    return getApp;
  }();
  _createClass(IDContract, null, [{
    key: "Instance",
    get: function get() {
      return this.singletonInstance || (this.singletonInstance = new this());
    }
  }]);
  return IDContract;
}();

// https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10-million-password-list-top-100.txt
var top100Passwords = ['123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111', '1234567', 'dragon', '123123', 'baseball', 'abc123', 'football', 'monkey', 'letmein', '696969', 'shadow', 'master', '666666', 'qwertyuiop', '123321', 'mustang', '1234567890', 'michael', '654321', 'pussy', 'superman', '1qaz2wsx', '7777777', 'fuckyou', '121212',
//    '0',
'qazwsx', '123qwe', 'killer', 'trustno1', 'jordan', 'jennifer', 'zxcvbnm', 'asdfgh', 'hunter', 'buster', 'soccer', 'harley', 'batman', 'andrew', 'tigger', 'sunshine', 'iloveyou', 'fuckme', '2000', 'charlie', 'robert', 'thomas', 'hockey', 'ranger', 'daniel', 'starwars', 'klaster', '112233', 'george', 'asshole', 'computer', 'michelle', 'jessica', 'pepper', '1111', 'zxcvbn', '555555', '11111111', '131313', 'freedom', '777777', 'pass', 'fuck', 'maggie', '159753', 'aaaaaa', 'ginger', 'princess', 'joshua', 'cheese', 'amanda', 'summer', 'love', 'ashley', '6969', 'nicole', 'chelsea', 'biteme', 'matthew', 'access', 'yankees', '987654321', 'dallas', 'austin', 'thunder', 'taylor', 'matrix', 'minecraft'];

function validatePassword(masterPassword) {
  var normalizedPassword = masterPassword.normalize('NFKC');
  // minimum 12 characters
  // at least 1 lowercase, 1 uppercase, 1 number
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/.test(normalizedPassword)) {
    throwError('Password is invalid', SdkErrors.PasswordFormatInvalid);
  }
  for (var _iterator = _createForOfIteratorHelperLoose(top100Passwords), _step; !(_step = _iterator()).done;) {
    var password = _step.value;
    if (normalizedPassword.toLowerCase().includes(password)) throwError('Password contains words or phrases that are too common', SdkErrors.PasswordTooCommon);
  }
  return normalizedPassword;
}

// Inspired by https://github.com/davidchambers/Base64.js/blob/master/base64.js
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
var Base64 = {
  btoa: function btoa(input) {
    if (input === void 0) {
      input = '';
    }
    var str = input;
    var output = '';
    for (var block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
      charCode = str.charCodeAt(i += 3 / 4);
      if (charCode > 0xff) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  },
  atob: function atob(input) {
    if (input === void 0) {
      input = '';
    }
    var str = input.replace(/=+$/, '');
    var output = '';
    if (str.length % 4 === 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (var bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  }
};
// Polyfill for React Native which does not have Buffer, or atob/btoa
// TODO maybe do this at global level?
if (typeof Buffer === 'undefined') {
  if (typeof window === 'undefined' || typeof window.atob === 'undefined') {
    window.atob = Base64.atob;
    window.btoa = Base64.btoa;
  }
}
function bnToBase64Url(bn) {
  if (typeof Buffer !== 'undefined') {
    // nodejs
    var buffer = bn.toArrayLike(Buffer, 'be');
    return Buffer.from(buffer).toString('base64');
  } else {
    // browser
    return hexToBase64(bn.toString('hex'));
  }
}
function hexToBase64(hexstring) {
  return window.btoa(hexstring.match(/\w{2}/g).map(function (a) {
    return String.fromCharCode(parseInt(a, 16));
  }).join(''));
}
function utf8ToB64(str) {
  if (typeof Buffer !== 'undefined') {
    // nodejs
    return Buffer.from(str).toString('base64');
  } else {
    // browser
    return window.btoa(unescape(encodeURIComponent(str)));
  }
}
function b64ToUtf8(str) {
  console.log('b64ToUtf8', str);
  if (typeof Buffer !== 'undefined') {
    // nodejs
    console.log('nodejs');
    return Buffer.from(str, 'base64').toString('utf8');
  } else {
    // browser
    console.log('browser');
    return decodeURIComponent(escape(window.atob(str)));
  }
}

var _excluded = ["d", "p", "q", "dp", "dq", "qi"],
  _excluded2 = ["d", "p", "q", "dp", "dq", "qi", "key_ops"];
function createJWK(publicKey) {
  var ecPubKey = toElliptic(publicKey);
  var publicKeyJwk = {
    crv: 'secp256k1',
    kty: 'EC',
    x: bnToBase64Url(ecPubKey.getPublic().getX()),
    y: bnToBase64Url(ecPubKey.getPublic().getY()),
    kid: publicKey.toString()
  };
  return publicKeyJwk;
}
// reference https://github.com/OR13/did-jwk/blob/main/src/index.js#L120
function toDid(jwk) {
  // eslint-disable-next-line no-unused-vars
  var publicKeyJwk = _objectWithoutPropertiesLoose(jwk, _excluded);
  // TODO replace with base64url encoder for web
  var id = utf8ToB64(JSON.stringify(publicKeyJwk));
  var did = "did:jwk:" + id;
  return did;
}
// reference https://github.com/OR13/did-jwk/blob/main/src/index.js#L128
function toDidDocument(jwk) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var getPublicOperationsFromPrivate = function getPublicOperationsFromPrivate(keyOps) {
    if (keyOps.includes('sign')) {
      return ['verify'];
    }
    if (keyOps.includes('verify')) {
      return ['encrypt'];
    }
    return keyOps;
  };
  var d = jwk.d,
    key_ops = jwk.key_ops,
    publicKeyJwk = _objectWithoutPropertiesLoose(jwk, _excluded2);
  // eslint-disable-next-line camelcase
  if (d && key_ops) {
    // eslint-disable-next-line camelcase
    publicKeyJwk.key_ops = getPublicOperationsFromPrivate(key_ops);
  }
  var did = toDid(publicKeyJwk);
  var vm = {
    id: '#0',
    type: 'JsonWebKey2020',
    controller: did,
    publicKeyJwk: publicKeyJwk
  };
  var didDocument = {
    '@context': ['https://www.w3.org/ns/did/v1', {
      '@vocab': 'https://www.iana.org/assignments/jose#'
    }],
    id: did,
    verificationMethod: [vm]
  };
  return didDocument;
}
// reference https://github.com/OR13/did-jwk/blob/main/src/index.js#L177
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolve(did, options) {
  var decoded = b64ToUtf8(did.split(':').pop().split('#')[0]);
  var jwk = JSON.parse(decoded.toString());
  return toDidDocument(jwk);
}

var idContract = IDContract.Instance;
var AppStatus;
(function (AppStatus) {
  AppStatus["PENDING"] = "PENDING";
  AppStatus["CREATING"] = "CREATING";
  AppStatus["READY"] = "READY";
  AppStatus["DEACTIVATED"] = "DEACTIVATED";
})(AppStatus || (AppStatus = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (AppStatus) {
  /*
   * Returns the index of the enum value
   *
   * @param value The level to get the index of
   */
  function indexFor(value) {
    return Object.keys(AppStatus).indexOf(value);
  }
  AppStatus.indexFor = indexFor;
  /*
   * Creates an AppStatus from a string or index of the level
   *
   * @param value The string or index
   */
  function from(value) {
    var index;
    if (typeof value !== 'number') {
      index = AppStatus.indexFor(value);
    } else {
      index = value;
    }
    return Object.values(AppStatus)[index];
  }
  AppStatus.from = from;
})(AppStatus || (AppStatus = {}));
var App = /*#__PURE__*/function () {
  function App(options) {
    this.accountName = options.accountName;
    this.appName = options.appName;
    this.username = options.username;
    this.description = options.description;
    this.logoUrl = options.logoUrl;
    this.origin = options.origin;
    this.version = options.version;
    this.status = options.status;
  }
  App.create = /*#__PURE__*/function () {
    var _create = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(options) {
      var username, privateKey, res, newAccountAction;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            username = TonomyUsername.fromUsername(options.usernamePrefix, AccountType.APP, getSettings().accountSuffix); // TODO remove this
            privateKey = PrivateKey.from('PVT_K1_2bfGi9rYsXQSXXTvJbDAPhHLQUojjaNLomdm3cEJ1XTzMqUt3V');
            _context.next = 4;
            return idContract.newapp(options.appName, options.description, username.usernameHash, options.logoUrl, options.origin, options.publicKey, createSigner(privateKey));
          case 4:
            res = _context.sent;
            newAccountAction = res.processed.action_traces[0].inline_traces[0].act;
            return _context.abrupt("return", new App(_extends({}, options, {
              accountName: Name.from(newAccountAction.data.name),
              username: username,
              version: newAccountAction.data.version,
              status: AppStatus.READY
            })));
          case 7:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    function create(_x) {
      return _create.apply(this, arguments);
    }
    return create;
  }();
  App.getApp = /*#__PURE__*/function () {
    var _getApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(origin) {
      var contractAppData;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return idContract.getApp(origin);
          case 2:
            contractAppData = _context2.sent;
            return _context2.abrupt("return", new App({
              accountName: contractAppData.account_name,
              appName: contractAppData.app_name,
              username: TonomyUsername.fromHash(contractAppData.username_hash.toString()),
              description: contractAppData.description,
              logoUrl: contractAppData.logo_url,
              origin: contractAppData.origin,
              version: contractAppData.version,
              status: AppStatus.READY
            }));
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    function getApp(_x2) {
      return _getApp.apply(this, arguments);
    }
    return getApp;
  }();
  return App;
}();

var idContract$1 = IDContract.Instance;
var UserApps = /*#__PURE__*/function () {
  function UserApps(_user, _keyManager, storageFactory) {
    this.user = _user;
    this.keyManager = _keyManager;
    this.storage = createStorage('tonomy.user.apps.', storageFactory);
  }
  var _proto = UserApps.prototype;
  _proto.loginWithApp = /*#__PURE__*/function () {
    var _loginWithApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(app, key) {
      var myAccount, appRecord, apps, signer;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return this.user.storage.accountName;
          case 2:
            myAccount = _context.sent;
            appRecord = {
              app: app,
              added: new Date(),
              status: AppStatus.PENDING
            };
            _context.next = 6;
            return this.storage.appRecords;
          case 6:
            apps = _context.sent;
            if (!apps) {
              apps = [];
            }
            apps.push(appRecord);
            this.storage.appRecords = apps;
            _context.next = 12;
            return this.storage.appRecords;
          case 12:
            signer = createKeyManagerSigner(this.keyManager, KeyManagerLevel.LOCAL);
            _context.next = 15;
            return idContract$1.loginwithapp(myAccount.toString(), app.accountName.toString(), 'local', key, signer);
          case 15:
            appRecord.status = AppStatus.READY;
            this.storage.appRecords = apps;
            _context.next = 19;
            return this.storage.appRecords;
          case 19:
          case "end":
            return _context.stop();
        }
      }, _callee, this);
    }));
    function loginWithApp(_x, _x2) {
      return _loginWithApp.apply(this, arguments);
    }
    return loginWithApp;
  }();
  UserApps.onPressLogin = /*#__PURE__*/function () {
    var _onPressLogin = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(_ref, keyManager, keyManagerLevel) {
      var _ref$redirect, redirect, callbackPath, _generateRandomKeyPai, privateKey, publicKey, payload, signer, jwk, issuer, token, requests, requestsString;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _ref$redirect = _ref.redirect, redirect = _ref$redirect === void 0 ? true : _ref$redirect, callbackPath = _ref.callbackPath;
            if (keyManagerLevel === void 0) {
              keyManagerLevel = KeyManagerLevel.BROWSERLOCALSTORAGE;
            }
            //TODO: dont create new key if it exist
            _generateRandomKeyPai = generateRandomKeyPair(), privateKey = _generateRandomKeyPai.privateKey, publicKey = _generateRandomKeyPai.publicKey;
            if (!keyManager) {
              _context2.next = 6;
              break;
            }
            _context2.next = 6;
            return keyManager.storeKey({
              level: keyManagerLevel,
              privateKey: privateKey
            });
          case 6:
            payload = {
              randomString: randomString(32),
              origin: window.location.origin,
              publicKey: publicKey.toString(),
              callbackPath: callbackPath
            }; // TODO store the signer key in localStorage
            signer = ES256KSigner(privateKey.data.array, true);
            _context2.next = 10;
            return createJWK(publicKey);
          case 10:
            jwk = _context2.sent;
            issuer = toDid(jwk); // TODO use expiresIn to make JWT expire after 5 minutes
            _context2.next = 14;
            return createJWT(payload, {
              issuer: issuer,
              signer: signer,
              alg: 'ES256K-R'
            });
          case 14:
            token = _context2.sent;
            requests = [token];
            requestsString = JSON.stringify(requests);
            if (!redirect) {
              _context2.next = 20;
              break;
            }
            window.location.href = getSettings().ssoWebsiteOrigin + "/login?requests=" + requestsString;
            return _context2.abrupt("return");
          case 20:
            return _context2.abrupt("return", token);
          case 21:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    function onPressLogin(_x3, _x4, _x5) {
      return _onPressLogin.apply(this, arguments);
    }
    return onPressLogin;
  }()
  /**
   * gets parameteres from URL and verify the requests coming from the app
   * @returns the verified results, accountName and username
   */
  ;
  UserApps.onAppRedirectVerifyRequests =
  /*#__PURE__*/
  function () {
    var _onAppRedirectVerifyRequests = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var params, requests, username, accountName, result;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            params = new URLSearchParams(window.location.search);
            requests = params.get('requests');
            if (!requests) throwError("requests parameter doesn't exists", SdkErrors.MissingParams);
            username = params.get('username');
            if (!username) throwError("username parameter doesn't exists", SdkErrors.MissingParams);
            accountName = params.get('accountName');
            if (!accountName) throwError("accountName parameter doesn't exists", SdkErrors.MissingParams);
            _context3.next = 9;
            return UserApps.verifyRequests(requests);
          case 9:
            result = _context3.sent;
            return _context3.abrupt("return", {
              result: result,
              username: username,
              accountName: accountName
            });
          case 11:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    function onAppRedirectVerifyRequests() {
      return _onAppRedirectVerifyRequests.apply(this, arguments);
    }
    return onAppRedirectVerifyRequests;
  }();
  UserApps.verifyRequests = /*#__PURE__*/function () {
    var _verifyRequests = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(requests) {
      var jwtRequests, verified, _iterator, _step, jwt;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            if (!requests) throwError('No requests found in URL', SdkErrors.MissingParams);
            jwtRequests = JSON.parse(requests);
            if (!jwtRequests || !Array.isArray(jwtRequests) || jwtRequests.length === 0) {
              throwError('No JWTs found in URL', SdkErrors.MissingParams);
            }
            verified = [];
            _iterator = _createForOfIteratorHelperLoose(jwtRequests);
          case 5:
            if ((_step = _iterator()).done) {
              _context4.next = 15;
              break;
            }
            jwt = _step.value;
            console.log('verifying jwt', jwt);
            _context4.t0 = verified;
            _context4.next = 11;
            return this.verifyLoginJWT(jwt);
          case 11:
            _context4.t1 = _context4.sent;
            _context4.t0.push.call(_context4.t0, _context4.t1);
          case 13:
            _context4.next = 5;
            break;
          case 15:
            return _context4.abrupt("return", verified);
          case 16:
          case "end":
            return _context4.stop();
        }
      }, _callee4, this);
    }));
    function verifyRequests(_x6) {
      return _verifyRequests.apply(this, arguments);
    }
    return verifyRequests;
  }();
  UserApps.onRedirectLogin = /*#__PURE__*/function () {
    var _onRedirectLogin = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var urlParams, requests, verifiedRequests, referrer, _iterator2, _step2, request;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            urlParams = new URLSearchParams(window.location.search);
            requests = urlParams.get('requests');
            _context5.next = 4;
            return this.verifyRequests(requests);
          case 4:
            verifiedRequests = _context5.sent;
            referrer = new URL(document.referrer);
            _iterator2 = _createForOfIteratorHelperLoose(verifiedRequests);
          case 7:
            if ((_step2 = _iterator2()).done) {
              _context5.next = 13;
              break;
            }
            request = _step2.value;
            if (!(request.payload.origin === referrer.origin)) {
              _context5.next = 11;
              break;
            }
            return _context5.abrupt("return", request);
          case 11:
            _context5.next = 7;
            break;
          case 13:
            throwError("No origins from: " + verifiedRequests.map(function (r) {
              return r.payload.origin;
            }) + " match referrer: " + referrer.origin, SdkErrors.WrongOrigin);
          case 14:
          case "end":
            return _context5.stop();
        }
      }, _callee5, this);
    }));
    function onRedirectLogin() {
      return _onRedirectLogin.apply(this, arguments);
    }
    return onRedirectLogin;
  }();
  UserApps.verifyLoginJWT = /*#__PURE__*/function () {
    var _verifyLoginJWT = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(jwt) {
      var resolver, res;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            resolver = {
              resolve: resolve
            };
            _context6.next = 3;
            return verifyJWT(jwt, {
              resolver: resolver
            });
          case 3:
            res = _context6.sent;
            if (!res.verified) throwError('JWT failed verification', SdkErrors.JwtNotValid);
            return _context6.abrupt("return", res);
          case 6:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }));
    function verifyLoginJWT(_x7) {
      return _verifyLoginJWT.apply(this, arguments);
    }
    return verifyLoginJWT;
  }();
  UserApps.verifyKeyExistsForApp = /*#__PURE__*/function () {
    var _verifyKeyExistsForApp = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(accountName, keyManager, keyManagerLevel) {
      var pubKey, user, app, publickey;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            if (keyManagerLevel === void 0) {
              keyManagerLevel = KeyManagerLevel.BROWSERLOCALSTORAGE;
            }
            _context7.next = 3;
            return keyManager.getKey({
              level: keyManagerLevel
            });
          case 3:
            pubKey = _context7.sent;
            _context7.next = 6;
            return User.getAccountInfo(Name.from(accountName));
          case 6:
            user = _context7.sent;
            _context7.next = 9;
            return App.getApp(window.location.origin);
          case 9:
            app = _context7.sent;
            publickey = user.getPermission(app.accountName).required_auth.keys[0].key;
            if (!pubKey) throwError("Couldn't fetch Key", SdkErrors.KeyNotFound);
            return _context7.abrupt("return", pubKey.toString() === publickey.toString());
          case 13:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    }));
    function verifyKeyExistsForApp(_x8, _x9, _x10) {
      return _verifyKeyExistsForApp.apply(this, arguments);
    }
    return verifyKeyExistsForApp;
  }();
  return UserApps;
}();

var Communication = /*#__PURE__*/function () {
  function Communication() {
    var url = getSettings().communicationUrl;
    this.socketServer = io(url, {
      transports: ['websocket']
    });
  }
  /**
   * connect unregistered user to the website
   * @param randomSeed the random seed the user need to connect on typically recieved in jwt
   */
  var _proto = Communication.prototype;
  _proto.connectTonomy = function connectTonomy(randomSeed) {
    this.socketServer.emit('connectTonomy', {
      randomSeed: randomSeed
    });
  };
  _proto.onClientConnected = function onClientConnected(func) {
    this.socketServer.on('connectTonomy', function (param) {
      func(param);
    });
  }
  /**
   * makes user login to websites
   */;
  _proto.login = function login(userName, client) {
    this.socketServer.emit('loginTonomy', {
      client: client,
      userName: userName
    });
  }
  /**
   * unregistered website can send jwts to mobile
   * awaits until the mobile user is connected then sends it the jwt
   */;
  _proto.sendJwtToMobile = function sendJwtToMobile(requests) {
    var _this = this;
    this.onClientConnected(function () {
      _this.sendJwtToClient(requests);
      _this.socketServer.off('connectTonomy');
    });
  };
  _proto.sendJwtToBrowser = function sendJwtToBrowser(requests, accountName) {
    this.sendJwtToClient(requests, accountName);
  };
  _proto.sendJwtToClient = function sendJwtToClient(requests, accountName) {
    this.socketServer.emit('sendLoginJwt', {
      requests: requests,
      accountName: accountName
    });
  };
  _proto.onJwtToClient = function onJwtToClient(func) {
    this.socketServer.on('sendLoginJwt', function (param) {
      func(param);
    });
  };
  _proto.SSOWebsiteSendToMobile = function SSOWebsiteSendToMobile(randomSeed, requests) {
    this.connectTonomy(randomSeed);
    this.sendJwtToMobile(requests);
  };
  return Communication;
}();

var UserStatus;
(function (UserStatus) {
  UserStatus["CREATING"] = "CREATING";
  UserStatus["READY"] = "READY";
  UserStatus["DEACTIVATED"] = "DEACTIVATED";
})(UserStatus || (UserStatus = {}));
// eslint-disable-next-line @typescript-eslint/no-namespace
(function (UserStatus) {
  /*
   * Returns the index of the enum value
   *
   * @param value The level to get the index of
   */
  function indexFor(value) {
    return Object.keys(UserStatus).indexOf(value);
  }
  UserStatus.indexFor = indexFor;
  /*
   * Creates an AuthenticatorLevel from a string or index of the level
   *
   * @param value The string or index
   */
  function from(value) {
    var index;
    if (typeof value !== 'number') {
      index = UserStatus.indexFor(value);
    } else {
      index = value;
    }
    return Object.values(UserStatus)[index];
  }
  UserStatus.from = from;
})(UserStatus || (UserStatus = {}));
var idContract$2 = IDContract.Instance;
var User = /*#__PURE__*/function () {
  function User(_keyManager, storageFactory) {
    this.keyManager = _keyManager;
    this.storage = createStorage('tonomy.user.', storageFactory);
    this.apps = new UserApps(this, _keyManager, storageFactory);
    //TODO implement dependency inversion
    this.communication = new Communication();
  }
  var _proto = User.prototype;
  _proto.saveUsername = /*#__PURE__*/function () {
    var _saveUsername = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(username) {
      var normalizedUsername, user, fullUsername;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            normalizedUsername = username.normalize('NFKC');
            fullUsername = TonomyUsername.fromUsername(normalizedUsername, AccountType.PERSON, getSettings().accountSuffix);
            _context.prev = 2;
            _context.next = 5;
            return User.getAccountInfo(fullUsername);
          case 5:
            user = _context.sent;
            // Throws error if username is taken
            if (user) throwError('Username is taken', SdkErrors.UsernameTaken);
            _context.next = 13;
            break;
          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](2);
            if (_context.t0 instanceof SdkError && _context.t0.code === SdkErrors.UsernameNotFound) {
              _context.next = 13;
              break;
            }
            throw _context.t0;
          case 13:
            this.storage.username = fullUsername;
            _context.next = 16;
            return this.storage.username;
          case 16:
          case "end":
            return _context.stop();
        }
      }, _callee, this, [[2, 9]]);
    }));
    function saveUsername(_x) {
      return _saveUsername.apply(this, arguments);
    }
    return saveUsername;
  }();
  _proto.savePassword = /*#__PURE__*/function () {
    var _savePassword = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(masterPassword, options) {
      var password, privateKey, salt, res, _res;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            password = validatePassword(masterPassword);
            if (!(options && options.salt)) {
              _context2.next = 9;
              break;
            }
            salt = options.salt;
            _context2.next = 5;
            return this.keyManager.generatePrivateKeyFromPassword(password, salt);
          case 5:
            res = _context2.sent;
            privateKey = res.privateKey;
            _context2.next = 14;
            break;
          case 9:
            _context2.next = 11;
            return this.keyManager.generatePrivateKeyFromPassword(password);
          case 11:
            _res = _context2.sent;
            privateKey = _res.privateKey;
            salt = _res.salt;
          case 14:
            this.storage.salt = salt;
            _context2.next = 17;
            return this.storage.salt;
          case 17:
            _context2.next = 19;
            return this.keyManager.storeKey({
              level: KeyManagerLevel.PASSWORD,
              privateKey: privateKey,
              challenge: password
            });
          case 19:
          case "end":
            return _context2.stop();
        }
      }, _callee2, this);
    }));
    function savePassword(_x2, _x3) {
      return _savePassword.apply(this, arguments);
    }
    return savePassword;
  }();
  _proto.savePIN = /*#__PURE__*/function () {
    var _savePIN = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(pin) {
      var privateKey;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            privateKey = this.keyManager.generateRandomPrivateKey();
            _context3.next = 3;
            return this.keyManager.storeKey({
              level: KeyManagerLevel.PIN,
              privateKey: privateKey,
              challenge: pin
            });
          case 3:
          case "end":
            return _context3.stop();
        }
      }, _callee3, this);
    }));
    function savePIN(_x4) {
      return _savePIN.apply(this, arguments);
    }
    return savePIN;
  }();
  _proto.saveFingerprint = /*#__PURE__*/function () {
    var _saveFingerprint = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
      var privateKey;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            privateKey = this.keyManager.generateRandomPrivateKey();
            _context4.next = 3;
            return this.keyManager.storeKey({
              level: KeyManagerLevel.FINGERPRINT,
              privateKey: privateKey
            });
          case 3:
          case "end":
            return _context4.stop();
        }
      }, _callee4, this);
    }));
    function saveFingerprint() {
      return _saveFingerprint.apply(this, arguments);
    }
    return saveFingerprint;
  }();
  _proto.saveLocal = /*#__PURE__*/function () {
    var _saveLocal = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var privateKey;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            privateKey = this.keyManager.generateRandomPrivateKey();
            _context5.next = 3;
            return this.keyManager.storeKey({
              level: KeyManagerLevel.LOCAL,
              privateKey: privateKey
            });
          case 3:
          case "end":
            return _context5.stop();
        }
      }, _callee5, this);
    }));
    function saveLocal() {
      return _saveLocal.apply(this, arguments);
    }
    return saveLocal;
  }();
  _proto.createPerson = /*#__PURE__*/function () {
    var _createPerson = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
      var keyManager, username, usernameHash, passwordKey, idTonomyActiveKey, salt, res, newAccountAction;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            keyManager = this.keyManager;
            _context6.next = 3;
            return this.storage.username;
          case 3:
            username = _context6.sent;
            usernameHash = username.usernameHash;
            _context6.next = 7;
            return keyManager.getKey({
              level: KeyManagerLevel.PASSWORD
            });
          case 7:
            passwordKey = _context6.sent;
            if (!passwordKey) throwError('Password key not found', SdkErrors.KeyNotFound);
            // TODO this needs to change to the actual key used, from settings
            idTonomyActiveKey = PrivateKey.from('PVT_K1_2bfGi9rYsXQSXXTvJbDAPhHLQUojjaNLomdm3cEJ1XTzMqUt3V');
            _context6.next = 12;
            return this.storage.salt;
          case 12:
            salt = _context6.sent;
            _context6.prev = 13;
            _context6.next = 16;
            return idContract$2.newperson(usernameHash.toString(), passwordKey.toString(), salt.toString(), createSigner(idTonomyActiveKey));
          case 16:
            res = _context6.sent;
            _context6.next = 25;
            break;
          case 19:
            _context6.prev = 19;
            _context6.t0 = _context6["catch"](13);
            if (!(_context6.t0 instanceof AntelopePushTransactionError)) {
              _context6.next = 24;
              break;
            }
            if (!(_context6.t0.hasErrorCode(3050003) && _context6.t0.hasTonomyErrorCode('TCON1000'))) {
              _context6.next = 24;
              break;
            }
            throw throwError('Username is taken', SdkErrors.UsernameTaken);
          case 24:
            throw _context6.t0;
          case 25:
            newAccountAction = res.processed.action_traces[0].inline_traces[0].act;
            this.storage.accountName = Name.from(newAccountAction.data.name);
            _context6.next = 29;
            return this.storage.accountName;
          case 29:
            this.storage.status = UserStatus.CREATING;
            _context6.next = 32;
            return this.storage.status;
          case 32:
            return _context6.abrupt("return", res);
          case 33:
          case "end":
            return _context6.stop();
        }
      }, _callee6, this, [[13, 19]]);
    }));
    function createPerson() {
      return _createPerson.apply(this, arguments);
    }
    return createPerson;
  }();
  _proto.updateKeys = /*#__PURE__*/function () {
    var _updateKeys = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(password) {
      var status, keyManager, pinKey, fingerprintKey, localKey, keys, signer, accountName;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return this.storage.status;
          case 2:
            status = _context7.sent;
            if (!(status !== UserStatus.CREATING && status !== UserStatus.READY)) {
              _context7.next = 5;
              break;
            }
            throw new Error("Can't update keys ");
          case 5:
            keyManager = this.keyManager;
            _context7.next = 8;
            return keyManager.getKey({
              level: KeyManagerLevel.PIN
            });
          case 8:
            pinKey = _context7.sent;
            _context7.next = 11;
            return keyManager.getKey({
              level: KeyManagerLevel.FINGERPRINT
            });
          case 11:
            fingerprintKey = _context7.sent;
            _context7.next = 14;
            return keyManager.getKey({
              level: KeyManagerLevel.LOCAL
            });
          case 14:
            localKey = _context7.sent;
            keys = {};
            if (pinKey) keys.PIN = pinKey.toString();
            if (fingerprintKey) keys.FINGERPRINT = fingerprintKey.toString();
            if (localKey) keys.LOCAL = localKey.toString();
            signer = createKeyManagerSigner(keyManager, KeyManagerLevel.PASSWORD, password);
            _context7.next = 22;
            return this.storage.accountName;
          case 22:
            accountName = _context7.sent;
            _context7.next = 25;
            return idContract$2.updatekeysper(accountName.toString(), keys, signer);
          case 25:
            this.storage.status = UserStatus.READY;
            _context7.next = 28;
            return this.storage.status;
          case 28:
          case "end":
            return _context7.stop();
        }
      }, _callee7, this);
    }));
    function updateKeys(_x5) {
      return _updateKeys.apply(this, arguments);
    }
    return updateKeys;
  }();
  _proto.login = /*#__PURE__*/function () {
    var _login = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(username, password) {
      var keyManager, idData, salt, passwordKey, accountData, onchainKey;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            keyManager = this.keyManager;
            _context8.next = 3;
            return idContract$2.getPerson(username);
          case 3:
            idData = _context8.sent;
            salt = idData.password_salt;
            _context8.next = 7;
            return this.savePassword(password, {
              salt: salt
            });
          case 7:
            _context8.next = 9;
            return keyManager.getKey({
              level: KeyManagerLevel.PASSWORD
            });
          case 9:
            passwordKey = _context8.sent;
            if (!passwordKey) throwError('Password key not found', SdkErrors.KeyNotFound);
            _context8.next = 13;
            return User.getAccountInfo(idData.account_name);
          case 13:
            accountData = _context8.sent;
            onchainKey = accountData.getPermission('owner').required_auth.keys[0].key; // TODO change to active/other permissions when we make the change
            if (passwordKey.toString() !== onchainKey.toString()) throwError('Password is incorrect', SdkErrors.PasswordInValid);
            this.storage.accountName = Name.from(idData.account_name);
            this.storage.username = username;
            this.storage.status = UserStatus.READY;
            return _context8.abrupt("return", idData);
          case 20:
          case "end":
            return _context8.stop();
        }
      }, _callee8, this);
    }));
    function login(_x6, _x7) {
      return _login.apply(this, arguments);
    }
    return login;
  }();
  _proto.logout = /*#__PURE__*/function () {
    var _logout = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return this.keyManager.removeKey({
              level: KeyManagerLevel.PASSWORD
            });
          case 2:
            _context9.next = 4;
            return this.keyManager.removeKey({
              level: KeyManagerLevel.PIN
            });
          case 4:
            _context9.next = 6;
            return this.keyManager.removeKey({
              level: KeyManagerLevel.FINGERPRINT
            });
          case 6:
            _context9.next = 8;
            return this.keyManager.removeKey({
              level: KeyManagerLevel.LOCAL
            });
          case 8:
            // clear storage data
            this.storage.clear();
          case 9:
          case "end":
            return _context9.stop();
        }
      }, _callee9, this);
    }));
    function logout() {
      return _logout.apply(this, arguments);
    }
    return logout;
  }();
  _proto.isLoggedIn = /*#__PURE__*/function () {
    var _isLoggedIn = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return this.storage.status;
          case 2:
            return _context10.abrupt("return", !!_context10.sent);
          case 3:
          case "end":
            return _context10.stop();
        }
      }, _callee10, this);
    }));
    function isLoggedIn() {
      return _isLoggedIn.apply(this, arguments);
    }
    return isLoggedIn;
  }();
  User.getAccountInfo = /*#__PURE__*/function () {
    var _getAccountInfo = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(account) {
      var accountName, api, idData, error;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            _context11.next = 3;
            return getApi();
          case 3:
            api = _context11.sent;
            if (!(account instanceof TonomyUsername)) {
              _context11.next = 11;
              break;
            }
            _context11.next = 7;
            return idContract$2.getPerson(account);
          case 7:
            idData = _context11.sent;
            accountName = idData.account_name;
            _context11.next = 12;
            break;
          case 11:
            accountName = account;
          case 12:
            _context11.next = 14;
            return api.v1.chain.get_account(accountName);
          case 14:
            return _context11.abrupt("return", _context11.sent);
          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](0);
            error = _context11.t0;
            if (!(error.message === 'Account not found at /v1/chain/get_account')) {
              _context11.next = 24;
              break;
            }
            throwError('Account "' + account.toString() + '" not found', SdkErrors.AccountDoesntExist);
            _context11.next = 25;
            break;
          case 24:
            throw _context11.t0;
          case 25:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[0, 17]]);
    }));
    function getAccountInfo(_x8) {
      return _getAccountInfo.apply(this, arguments);
    }
    return getAccountInfo;
  }();
  return User;
}();
/**
 * Initialize and return the user object
 * @param keyManager  the key manager
 * @param storage  the storage
 * @returns the user object
 */
function createUserObject(keyManager, storageFactory) {
  return new User(keyManager, storageFactory);
}

var Authority = /*#__PURE__*/function () {
  function Authority(threshold, keys, accounts, waits) {
    this.threshold = threshold;
    this.keys = keys;
    this.accounts = accounts;
    this.waits = waits;
  }
  Authority.fromKey = function fromKey(key) {
    var keys = [{
      key: key,
      weight: 1
    }];
    return new this(1, keys, [], []);
  };
  Authority.fromAccount = function fromAccount(permission) {
    var accounts = [{
      permission: permission,
      weight: 1
    }];
    return new this(1, [], accounts, []);
  }
  // to add the eosio.code authority for smart contracts
  // https://developers.eos.io/welcome/v2.1/smart-contract-guides/adding-inline-actions#step-1-adding-eosiocode-to-permissions
  ;
  var _proto = Authority.prototype;
  _proto.addCodePermission = function addCodePermission(account) {
    this.accounts.push({
      permission: {
        actor: account,
        permission: 'eosio.code'
      },
      weight: 1
    });
  };
  return Authority;
}();

var EosioContract = /*#__PURE__*/function () {
  function EosioContract() {}
  var _proto = EosioContract.prototype;
  /**
   * Deploys a contract at the specified address
   *
   * @param account - Account where the contract will be deployed
   * @param wasmFileContents - wasmFile after reading with fs.readFileSync(path) or equivalent
   * @param abiFileContents - abiFile after reading with fs.readFileSync(path, `utf8`) or equivalent
   */
  _proto.deployContract =
  /*#__PURE__*/
  function () {
    var _deployContract = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(account, wasmFileContent, abiFileContent, signer) {
      var wasm, abi, abiDef, abiSerializedHex, setcodeAction, setabiAction, actions;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            // 1. Prepare SETCODE
            // read the file and make a hex string out of it
            wasm = wasmFileContent.toString("hex"); // 2. Prepare SETABI
            abi = JSON.parse(abiFileContent);
            abiDef = ABI.from(abi);
            abiSerializedHex = Serializer.encode({
              object: abiDef
            }).hexString; // 3. Send transaction with both setcode and setabi actions
            setcodeAction = {
              account: 'eosio',
              name: 'setcode',
              authorization: [{
                actor: account.toString(),
                permission: 'active'
              }],
              data: {
                account: account.toString(),
                vmtype: 0,
                vmversion: 0,
                code: wasm
              }
            };
            setabiAction = {
              account: 'eosio',
              name: 'setabi',
              authorization: [{
                actor: account.toString(),
                permission: 'active'
              }],
              data: {
                account: account,
                abi: abiSerializedHex
              }
            };
            actions = [setcodeAction, setabiAction];
            _context.next = 9;
            return transact(Name.from('eosio'), actions, signer);
          case 9:
            return _context.abrupt("return", _context.sent);
          case 10:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    function deployContract(_x, _x2, _x3, _x4) {
      return _deployContract.apply(this, arguments);
    }
    return deployContract;
  }();
  _proto.newaccount = /*#__PURE__*/function () {
    var _newaccount = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(creator, account, owner, active, signer) {
      var action;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            action = {
              authorization: [{
                actor: creator,
                permission: 'active'
              }],
              account: 'eosio',
              name: 'newaccount',
              data: {
                creator: creator,
                name: account,
                owner: owner,
                active: active
              }
            };
            _context2.next = 3;
            return transact(Name.from('eosio'), [action], signer);
          case 3:
            return _context2.abrupt("return", _context2.sent);
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    function newaccount(_x5, _x6, _x7, _x8, _x9) {
      return _newaccount.apply(this, arguments);
    }
    return newaccount;
  }();
  _proto.updateauth = /*#__PURE__*/function () {
    var _updateauth = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(account, permission, parent, auth, signer) {
      var action;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            action = {
              authorization: [{
                actor: account,
                permission: parent
              }],
              account: 'eosio',
              name: 'updateauth',
              data: {
                account: account,
                permission: permission,
                parent: parent,
                auth: auth
              }
            };
            _context3.next = 3;
            return transact(Name.from('eosio'), [action], signer);
          case 3:
            return _context3.abrupt("return", _context3.sent);
          case 4:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    function updateauth(_x10, _x11, _x12, _x13, _x14) {
      return _updateauth.apply(this, arguments);
    }
    return updateauth;
  }();
  _createClass(EosioContract, null, [{
    key: "Instance",
    get: function get() {
      return this.singletonInstance || (this.singletonInstance = new this());
    }
  }]);
  return EosioContract;
}();

var EosioTokenContract = /*#__PURE__*/function () {
  function EosioTokenContract() {}
  var _proto = EosioTokenContract.prototype;
  _proto.create = /*#__PURE__*/function () {
    var _create = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(supply, signer) {
      var actions;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            actions = [{
              account: 'eosio.token',
              name: 'create',
              authorization: [{
                actor: 'eosio.token',
                permission: 'active'
              }],
              data: {
                issuer: 'eosio.token',
                maximum_supply: supply
              }
            }];
            _context.next = 3;
            return transact(Name.from('eosio.token'), actions, signer);
          case 3:
            return _context.abrupt("return", _context.sent);
          case 4:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    function create(_x, _x2) {
      return _create.apply(this, arguments);
    }
    return create;
  }();
  _proto.issue = /*#__PURE__*/function () {
    var _issue = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(quantity, signer) {
      var actions;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            actions = [{
              account: 'eosio.token',
              name: 'issue',
              authorization: [{
                actor: 'eosio.token',
                permission: 'active'
              }],
              data: {
                to: 'eosio.token',
                quantity: quantity,
                memo: ''
              }
            }];
            _context2.next = 3;
            return transact(Name.from('eosio.token'), actions, signer);
          case 3:
            return _context2.abrupt("return", _context2.sent);
          case 4:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    function issue(_x3, _x4) {
      return _issue.apply(this, arguments);
    }
    return issue;
  }();
  _createClass(EosioTokenContract, null, [{
    key: "Instance",
    get: function get() {
      return this.singletonInstande || (this.singletonInstande = new this());
    }
  }]);
  return EosioTokenContract;
}();

var EosioUtil = /*#__PURE__*/_extends({}, Eosio, Transaction);

export { AccountType, App, AppStatus, Authority, Communication, EosioContract, EosioTokenContract, EosioUtil, HttpError, IDContract, KeyManagerLevel, SdkError, SdkErrors, TonomyUsername, User, UserApps, UserStatus, createStorage, createUserObject, decodeHex, encodeHex, generateRandomKeyPair, getSettings, int2hex, randomBytes, randomString, setSettings, sha256, storageProxyHandler, throwError, toElliptic };
//# sourceMappingURL=tonomy-id-sdk.esm.js.map
