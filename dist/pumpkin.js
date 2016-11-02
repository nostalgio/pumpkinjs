var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

/* Originally the `Data View Interact` library
 * Created to simplify RESTful activity
 * Heavily modified by Josh Wedekind at Nostalg.io
 * To add Signals/Slots capabilities to Backbone.js
*/

var PumpkinEvent = function () {
    function PumpkinEvent() {
        classCallCheck(this, PumpkinEvent);

        this.callbacks = [];
    }

    createClass(PumpkinEvent, [{
        key: 'add',
        value: function add(callbackObject) {
            var index = this.callbacks.push(callbackObject) - 1;
            return index;
        }
    }, {
        key: 'squash',
        value: function squash(index) {
            delete this.callbacks[index];
        }
    }]);
    return PumpkinEvent;
}();

var Pumpkin = function () {
    function Pumpkin() {
        var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'PumpkinPatch';
        classCallCheck(this, Pumpkin);

        this.setupProperties(namespace);
    }

    createClass(Pumpkin, [{
        key: 'setupProperties',
        value: function setupProperties(namespace) {
            var globalObj = void 0;
            if (typeof window !== 'undefined') {
                globalObj = window;
            } else {
                globalObj = global;
            }
            this.patch = globalObj;
            // Set to any existing PumpkinJS instances,
            // Or start a new one.
            if (typeof this.patch[namespace] === 'undefined') {
                this.patch[namespace] = {};
            }
            this.vine = this.patch[namespace];
        }
    }, {
        key: 'getEvent',
        value: function getEvent(eventName) {
            var event = this.vine[eventName];
            if (typeof event !== 'undefined') {
                return event;
            } else {
                return null;
            }
        }
    }, {
        key: 'getOrCreateEvent',
        value: function getOrCreateEvent(eventName) {
            var event = this.getEvent(eventName);
            if (event === null) {
                event = this.vine[eventName] = new PumpkinEvent();
            }
            return event;
        }
    }, {
        key: 'signal',
        value: function signal(eventName) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var event = this.getEvent(eventName);
            if (event !== null && event.hasOwnProperty('callbacks')) {
                this.makePie(event.callbacks, data);
            }
        }
    }, {
        key: 'slot',
        value: function slot(eventName, callback) {
            var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.patch;

            var event = this.getOrCreateEvent(eventName);

            if (eventName && typeof callback === 'function') {
                var index = event.add({
                    crust: scope,
                    recipe: callback
                });
                return index;
            } else {
                return null;
            }
        }
    }, {
        key: 'makePie',
        value: function makePie(callbacks, ingredients) {
            callbacks.forEach(function (callback) {
                if (typeof callback.recipe === 'function') {
                    callback.recipe.call(callback.crust, ingredients);
                }
            });
        }
    }, {
        key: 'squash',
        value: function squash(eventName) {
            if (eventName && this.getEvent(eventName) !== null) {
                delete this.vine[eventName];
            }
        }
    }]);
    return Pumpkin;
}();

// Import statement to prevent `export` from showing in compiled code.

//# sourceMappingURL=pumpkin.js.map