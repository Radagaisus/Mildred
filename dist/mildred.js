/*!
 * Mildred 0.0.1
 *
 * Mildred may be freely distributed under the MIT license.
 * For all details and documentation:
 * https://github.com/snird/Mildred
 */var support;

window.Mildred = {};

support = {
  propertyDescriptors: (function() {
    var o;
    if (!(typeof Object.defineProperty === 'function' && typeof Object.defineProperties === 'function')) {
      return false;
    }
    try {
      o = {};
      Object.defineProperty(o, 'foo', {
        value: 'bar'
      });
      return o.foo === 'bar';
    } catch (error) {
      return false;
    }
  })()
};
;var utils,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __hasProp = {}.hasOwnProperty;

utils = {
  beget: (function() {
    var ctor;
    if (typeof Object.create === 'function') {
      return Object.create;
    } else {
      ctor = function() {};
      return function(obj) {
        ctor.prototype = obj;
        return new ctor;
      };
    }
  })(),
  serialize: function(data) {
    if (typeof data.serialize === 'function') {
      return data.serialize();
    } else if (typeof data.toJSON === 'function') {
      return data.toJSON();
    } else {
      throw new TypeError('utils.serialize: Unknown data was passed');
    }
  },
  readonly: (function() {
    var readonlyDescriptor;
    if (support.propertyDescriptors) {
      readonlyDescriptor = {
        writable: false,
        enumerable: true,
        configurable: false
      };
      return function() {
        var obj, prop, properties, _i, _len;
        obj = arguments[0], properties = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          readonlyDescriptor.value = obj[prop];
          Object.defineProperty(obj, prop, readonlyDescriptor);
        }
        return true;
      };
    } else {
      return function() {
        return false;
      };
    }
  })(),
  getPrototypeChain: function(object) {
    var chain, _ref, _ref1, _ref2;
    chain = [object.constructor.prototype];
    while (object = (_ref = (_ref1 = object.constructor) != null ? _ref1.__super__ : void 0) != null ? _ref : (_ref2 = object.constructor) != null ? _ref2.superclass : void 0) {
      chain.push(object);
    }
    return chain.reverse();
  },
  getAllPropertyVersions: function(object, property) {
    var proto, result, value, _i, _len, _ref;
    result = [];
    _ref = utils.getPrototypeChain(object);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      proto = _ref[_i];
      value = proto[property];
      if (value && __indexOf.call(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  },
  upcase: function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  },
  escapeRegExp: function(str) {
    return String(str || '').replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  },
  modifierKeyPressed: function(event) {
    return event.shiftKey || event.altKey || event.ctrlKey || event.metaKey;
  },
  queryParams: {
    stringify: function(queryParams) {
      var arrParam, encodedKey, key, query, value, _i, _len;
      query = '';
      for (key in queryParams) {
        if (!__hasProp.call(queryParams, key)) continue;
        value = queryParams[key];
        encodedKey = encodeURIComponent(key);
        if (_.isArray(value)) {
          for (_i = 0, _len = value.length; _i < _len; _i++) {
            arrParam = value[_i];
            query += '&' + encodedKey + '=' + encodeURIComponent(arrParam);
          }
        } else {
          query += '&' + encodedKey + '=' + encodeURIComponent(value);
        }
      }
      return query && query.substring(1);
    },
    parse: function(queryString) {
      var current, field, pair, pairs, params, value, _i, _len, _ref;
      params = {};
      if (!queryString) {
        return params;
      }
      pairs = queryString.split('&');
      for (_i = 0, _len = pairs.length; _i < _len; _i++) {
        pair = pairs[_i];
        if (!pair.length) {
          continue;
        }
        _ref = pair.split('='), field = _ref[0], value = _ref[1];
        if (!field.length) {
          continue;
        }
        field = decodeURIComponent(field);
        value = decodeURIComponent(value);
        current = params[field];
        if (current) {
          if (current.push) {
            current.push(value);
          } else {
            params[field] = [current, value];
          }
        } else {
          params[field] = value;
        }
      }
      return params;
    }
  },
  serializeAttributes: function(model, attributes, modelStack) {
    var delegator, key, otherModel, serializedModels, value, _i, _len, _ref;
    delegator = this.beget(attributes);
    if (modelStack == null) {
      modelStack = {};
    }
    modelStack[model.cid] = true;
    for (key in attributes) {
      value = attributes[key];
      if (value instanceof Backbone.Model) {
        delegator[key] = utils.serializeModelAttributes(value, model, modelStack);
      } else if (value instanceof Backbone.Collection) {
        serializedModels = [];
        _ref = value.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          otherModel = _ref[_i];
          serializedModels.push(utils.serializeModelAttributes(otherModel, model, modelStack));
        }
        delegator[key] = serializedModels;
      }
    }
    delete modelStack[model.cid];
    return delegator;
  },
  serializeModelAttributes: function(model, currentModel, modelStack) {
    var attributes;
    if (model === currentModel || _.has(modelStack, model.cid)) {
      return null;
    }
    attributes = typeof model.getAttributes === 'function' ? model.getAttributes() : model.attributes;
    return this.serializeAttributes(model, attributes, modelStack);
  }
};

if (typeof Object.seal === "function") {
  Object.seal(utils);
}
;var __hasProp = {}.hasOwnProperty;

Mildred.Composition = (function() {

  Composition.extend = Backbone.Model.extend;

  _.extend(Composition.prototype, Backbone.Events);

  Composition.prototype.item = null;

  Composition.prototype.options = null;

  Composition.prototype._stale = false;

  function Composition(options) {
    if (options != null) {
      this.options = _.clone(options);
    }
    this.item = this;
    this.initialize(this.options);
  }

  Composition.prototype.initialize = function() {};

  Composition.prototype.compose = function() {};

  Composition.prototype.check = function(options) {
    return _.isEqual(this.options, options);
  };

  Composition.prototype.stale = function(value) {
    var item, name;
    if (value == null) {
      return this._stale;
    }
    this._stale = value;
    for (name in this) {
      item = this[name];
      if (item && item !== this && _.has(item, 'stale')) {
        item.stale = value;
      }
    }
  };

  Composition.prototype.disposed = false;

  Composition.prototype.dispose = function() {
    var obj, prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    for (prop in this) {
      if (!__hasProp.call(this, prop)) continue;
      obj = this[prop];
      if (obj && typeof obj.dispose === 'function') {
        if (obj !== this) {
          obj.dispose();
          delete this[prop];
        }
      }
    }
    this.stopListening();
    this.off;
    properties = ['redirected'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      delete this[prop];
    }
    return this.disposed = true;
  };

  return Composition;

})();
;
Mildred.Composer = (function() {

  Composer.extend = Backbone.Model.extend;

  Composer.prototype.compositions = null;

  function Composer() {
    this.initialize.apply(this, arguments);
  }

  Composer.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    this.compositions = {};
    Backbone.on('composer:compose', this.compose, this);
    Backbone.on('composer:retrieve', this.retrieve, this);
    return Backbone.on('dispatcher:dispatch', this.cleanup);
  };

  Composer.prototype.compose = function(name, second, third) {
    if (typeof second === 'function') {
      if (third || second.prototype.dispose) {
        if (second.prototype instanceof Mildred.Composition) {
          return this._compose(name, {
            composition: second,
            options: third
          });
        } else {
          return this._compose(name, {
            options: third,
            compose: function() {
              var autoRender, disabledAutoRender;
              this.item = new second(this.options);
              autoRender = this.item.autoRender;
              disabledAutoRender = autoRender === void 0 || !autoRender;
              if (disabledAutoRender && typeof this.item.render === 'function') {
                return this.item.render();
              }
            }
          });
        }
      }
      return this._compose(name, {
        compose: second
      });
    }
    if (typeof third === 'function') {
      return this._compose(name, {
        compose: third,
        options: second
      });
    }
    return this._compose(name, second);
  };

  Composer.prototype._compose = function(name, options) {
    var composition, current, isPromise, returned;
    if (typeof options.compose !== 'function' && !(options.composition != null)) {
      throw new Error('Composer#compose was used incorrectly');
    }
    if (options.composition != null) {
      composition = new options.composition(options.options);
    } else {
      composition = new Mildred.Composition(options.options);
      composition.compose = options.compose;
      if (options.check) {
        composition.check = options.check;
      }
    }
    current = this.compositions[name];
    isPromise = false;
    if (current && current.check(composition.options)) {
      current.stale(false);
    } else {
      if (current) {
        current.dispose();
      }
      returned = composition.compose(composition.options);
      isPromise = typeof (returned != null ? returned.then : void 0) === 'function';
      composition.stale(false);
      this.compositions[name] = composition;
    }
    if (isPromise) {
      return returned;
    } else {
      return this.compositions[name].item;
    }
  };

  Composer.prototype.retrieve = function(name) {
    var active;
    active = this.compositions[name];
    if (active && !active.stale()) {
      return active.item;
    } else {
      return void 0;
    }
  };

  Composer.prototype.cleanup = function() {
    var composition, name, _ref;
    _ref = this.compositions;
    for (name in _ref) {
      composition = _ref[name];
      if (composition.stale()) {
        composition.dispose();
        delete this.compositions[name];
      } else {
        composition.stale(true);
      }
    }
  };

  Composer.prototype.dispose = function() {
    var composition, name, _ref;
    if (this.disposed) {
      return;
    }
    this.off;
    _ref = this.compositions;
    for (name in _ref) {
      composition = _ref[name];
      composition.dispose();
    }
    delete this.compositions;
    return this.disposed = true;
  };

  return Composer;

})();
;
Mildred.Dispatcher = (function() {

  Dispatcher.extend = Backbone.Model.extend;

  Dispatcher.prototype.previousRoute = null;

  Dispatcher.prototype.currentController = null;

  Dispatcher.prototype.currentRoute = null;

  Dispatcher.prototype.currentParams = null;

  function Dispatcher() {
    this.initialize.apply(this, arguments);
  }

  Dispatcher.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    this.controllers = options.controllers;
    return Backbone.on('router:match', this.dispatch, this);
  };

  Dispatcher.prototype.dispatch = function(route, params, options) {
    var controller, _ref, _ref1;
    params = params ? _.clone(params) : {};
    options = options ? _.clone(options) : {};
    if (options.changeURL !== false) {
      options.changeURL = true;
    }
    if (options.forceStartup !== true) {
      options.forceStartup = false;
    }
    if (!options.forceStartup && ((_ref = this.currentRoute) != null ? _ref.controller : void 0) === route.controller && ((_ref1 = this.currentRoute) != null ? _ref1.action : void 0) === route.action && _.isEqual(this.currentParams, params)) {
      return;
    }
    controller = this.getControllerByName(route.controller);
    return this.runController(controller, route, params, options);
  };

  Dispatcher.prototype.getControllerByName = function(name) {
    var controller;
    controller = '';
    this.controllers.forEach(function(el) {
      if (el.name.toUpperCase() === name.toUpperCase()) {
        return controller = el;
      }
    });
    return controller;
  };

  Dispatcher.prototype.runController = function(controller, route, params, options) {
    this.previousRoute = this.currentRoute;
    this.currentRoute = _.extend({}, route, {
      previous: utils.beget(this.previousRoute)
    });
    controller = new controller(params, this.currentRoute, options);
    return this.executeBeforeAction(controller, this.currentRoute, params, options);
  };

  Dispatcher.prototype.executeAction = function(controller, route, params, options) {
    if (this.currentController) {
      Backbone.trigger('beforeControllerDispose', this.currentController);
      this.currentController.dispose(params, route, options);
    }
    this.currentController = controller;
    this.currentParams = params;
    controller[route.action](params, route, options);
    if (controller.redirected) {
      return;
    }
    this.adjustURL(route, params, options);
    return Backbone.trigger('dispatcher:dispatch', this.currentController, params, route, options);
  };

  Dispatcher.prototype.executeBeforeAction = function(controller, route, params, options) {
    var before, executeAction, promise,
      _this = this;
    before = controller.beforeAction;
    executeAction = function() {
      if (controller.redirected || _this.currentRoute && route !== _this.currentRoute) {
        controller.dispose();
        return;
      }
      return _this.executeAction(controller, route, params, options);
    };
    if (!before) {
      executeAction();
      return;
    }
    if (typeof before !== 'function') {
      throw new TypeError('Controller#beforeAction: function expected. ' + 'Old object-like form is not supported.');
    }
    promise = controller.beforeAction(params, route, options);
    if (promise && promise.then) {
      return promise.then(executeAction);
    } else {
      return executeAction();
    }
  };

  Dispatcher.prototype.adjustURL = function(route, params, options) {
    var url;
    if (route.path == null) {
      return;
    }
    url = route.path + (route.query ? "?" + route.query : "");
    if (options.changeURL) {
      return Backbone.trigger('router:changeURL', url, options);
    }
  };

  Dispatcher.prototype.disposed = false;

  Dispatcher.prototype.dispose = function() {
    if (this.disposed) {
      return;
    }
    this.off;
    return this.disposed = true;
  };

  return Dispatcher;

})();
;var STATE_CHANGE, SYNCED, SYNCING, UNSYNCED, event, _fn, _i, _len, _ref;

UNSYNCED = 'unsynced';

SYNCING = 'syncing';

SYNCED = 'synced';

STATE_CHANGE = 'syncStateChange';

Mildred.SyncMachine = {
  _syncState: UNSYNCED,
  _previousSyncState: null,
  syncState: function() {
    return this._syncState;
  },
  isUnsynced: function() {
    return this._syncState === UNSYNCED;
  },
  isSynced: function() {
    return this._syncState === SYNCED;
  },
  isSyncing: function() {
    return this._syncState === SYNCING;
  },
  unsync: function() {
    var _ref;
    if ((_ref = this._syncState) === SYNCING || _ref === SYNCED) {
      this._previousSync = this._syncState;
      this._syncState = UNSYNCED;
      this.trigger(this._syncState, this, this._syncState);
      this.trigger(STATE_CHANGE, this, this._syncState);
    }
  },
  beginSync: function() {
    var _ref;
    if ((_ref = this._syncState) === UNSYNCED || _ref === SYNCED) {
      this._previousSync = this._syncState;
      this._syncState = SYNCING;
      this.trigger(this._syncState, this, this._syncState);
      this.trigger(STATE_CHANGE, this, this._syncState);
    }
  },
  finishSync: function() {
    if (this._syncState === SYNCING) {
      this._previousSync = this._syncState;
      this._syncState = SYNCED;
      this.trigger(this._syncState, this, this._syncState);
      this.trigger(STATE_CHANGE, this, this._syncState);
    }
  },
  abortSync: function() {
    if (this._syncState === SYNCING) {
      this._syncState = this._previousSync;
      this._previousSync = this._syncState;
      this.trigger(this._syncState, this, this._syncState);
      this.trigger(STATE_CHANGE, this, this._syncState);
    }
  }
};

_ref = [UNSYNCED, SYNCING, SYNCED, STATE_CHANGE];
_fn = function(event) {
  return Mildred.SyncMachine[event] = function(callback, context) {
    if (context == null) {
      context = this;
    }
    this.on(event, callback, context);
    if (this._syncState === event) {
      return callback.call(context);
    }
  };
};
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  event = _ref[_i];
  _fn(event);
}
;var helpers;

helpers = {
  reverse: function(criteria, params, query) {
    return Backbone.trigger('router:reverse', criteria, params, query);
  },
  redirectTo: function(pathDesc, params, options) {
    return Backbone.trigger('router:route', pathDesc, params, options);
  }
};
;var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Mildred.History = (function(_super) {

  __extends(History, _super);

  function History() {
    return History.__super__.constructor.apply(this, arguments);
  }

  History.prototype.routeStripper = /^[#\/]|\s+$/g;

  History.prototype.rootStripper = /^\/+|\/+$/g;

  History.prototype.isExplorer = /msie [\w.]+/;

  History.prototype.trailingSlash = /\/$/;

  History.prototype.getFragment = function(fragment, forcePushState) {
    var root;
    if (!(fragment != null)) {
      if (this._hasPushState || !this._wantsHashChange || forcePushState) {
        fragment = this.location.pathname + this.location.search;
        root = this.root.replace(this.trailingSlash, '');
        if (!fragment.indexOf(root)) {
          fragment = fragment.substr(root.length);
        }
      } else {
        fragment = this.getHash();
      }
    }
    return fragment.replace(this.routeStripper, '');
  };

  History.prototype.start = function(options) {
    var atRoot, docMode, fragment, loc, oldIE;
    if (Backbone.History.started) {
      throw new Error('Backbone.history has already been started');
    }
    Backbone.History.started = true;
    this.options = _.extend({}, {
      root: '/'
    }, this.options, options);
    this.root = this.options.root;
    this._wantsHashChange = this.options.hashChange !== false;
    this._wantsPushState = !!this.options.pushState;
    this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
    fragment = this.getFragment();
    docMode = document.documentMode;
    oldIE = this.isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7);
    this.root = ('/' + this.root + '/').replace(this.rootStripper, '/');
    if (oldIE && this._wantsHashChange) {
      this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
      this.navigate(fragment);
    }
    if (this._hasPushState) {
      Backbone.$(window).on('popstate', this.checkUrl);
    } else if (this._wantsHashChange && __indexOf.call(window, 'onhashchange') >= 0 && !oldIE) {
      Backbone.$(window).on('hashchange', this.checkUrl);
    } else if (this._wantsHashChange) {
      this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
    }
    this.fragment = fragment;
    loc = this.location;
    atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;
    if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
      this.fragment = this.getFragment(null, true);
      this.location.replace(this.root + '#' + this.fragment);
      return true;
    } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
      this.fragment = this.getHash().replace(this.routeStripper, '');
      this.history.replaceState({}, document.title, this.root + this.fragment);
    }
    if (!this.options.silent) {
      return this.loadUrl();
    }
  };

  return History;

})(Backbone.History);
;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty;

Mildred.Route = (function() {
  var escapeRegExp;

  Route.extend = Backbone.Model.extend;

  escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

  function Route(pattern, controller, action, options) {
    var _ref;
    this.pattern = pattern;
    this.controller = controller;
    this.action = action;
    this.handler = __bind(this.handler, this);

    this.addParamName = __bind(this.addParamName, this);

    if (_.isRegExp(this.pattern)) {
      throw new Error('Route: RegExps are not supported.\
      Use strings with :names and `constraints` option of route');
    }
    this.options = options ? _.clone(options) : {};
    if (this.options.name != null) {
      this.name = this.options.name;
    }
    if (this.name && this.name.indexOf('#') !== -1) {
      throw new Error('Route: "#" cannot be used in name');
    }
    if ((_ref = this.name) == null) {
      this.name = this.controller + '#' + this.action;
    }
    this.paramNames = [];
    if (_.has(Mildred.Controller.prototype, this.action)) {
      throw new Error('Route: You should not use existing controller ' + 'properties as action names');
    }
    this.createRegExp();
    if (typeof Object.freeze === "function") {
      Object.freeze(this);
    }
  }

  Route.prototype.matches = function(criteria) {
    var invalidParamsCount, name, propertiesCount, property, _i, _len, _ref;
    if (typeof criteria === 'string') {
      return criteria === this.name;
    } else {
      propertiesCount = 0;
      _ref = ['name', 'action', 'controller'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        propertiesCount++;
        property = criteria[name];
        if (property && property !== this[name]) {
          return false;
        }
      }
      invalidParamsCount = propertiesCount === 1 && (name === 'action' || name === 'controller');
      return !invalidParamsCount;
    }
  };

  Route.prototype.reverse = function(params, query) {
    var name, url, value, _i, _len, _ref;
    params = this.normalizeParams(params);
    if (params === false) {
      return false;
    }
    url = this.pattern;
    _ref = this.paramNames;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      value = params[name];
      url = url.replace(RegExp("[:*]" + name, "g"), value);
    }
    if (!query) {
      return url;
    }
    if (typeof query === 'object') {
      return url += '?' + utils.queryParams.stringify(query);
    } else {
      return url += (query[0] === '?' ? '' : '?') + query;
    }
  };

  Route.prototype.normalizeParams = function(params) {
    var paramIndex, paramName, paramsHash, _i, _len, _ref;
    if (_.isArray(params)) {
      if (params.length < this.paramNames.length) {
        return false;
      }
      paramsHash = {};
      _ref = this.paramNames;
      for (paramIndex = _i = 0, _len = _ref.length; _i < _len; paramIndex = ++_i) {
        paramName = _ref[paramIndex];
        paramsHash[paramName] = params[paramIndex];
      }
      if (!this.testConstraints(paramsHash)) {
        return false;
      }
      params = paramsHash;
    } else {
      if (params == null) {
        params = {};
      }
      if (!this.testParams(params)) {
        return false;
      }
    }
    return params;
  };

  Route.prototype.testConstraints = function(params) {
    var constraint, constraints, name;
    constraints = this.options.constraints;
    if (constraints) {
      for (name in constraints) {
        if (!__hasProp.call(constraints, name)) continue;
        constraint = constraints[name];
        if (!constraint.test(params[name])) {
          return false;
        }
      }
    }
    return true;
  };

  Route.prototype.testParams = function(params) {
    var paramName, _i, _len, _ref;
    _ref = this.paramNames;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      paramName = _ref[_i];
      if (params[paramName] === void 0) {
        return false;
      }
    }
    return this.testConstraints(params);
  };

  Route.prototype.createRegExp = function() {
    var pattern;
    pattern = this.pattern.replace(escapeRegExp, '\\$&').replace(/(?::|\*)(\w+)/g, this.addParamName);
    return this.regExp = RegExp("^" + pattern + "(?=\\?|$)");
  };

  Route.prototype.addParamName = function(match, paramName) {
    this.paramNames.push(paramName);
    if (match.charAt(0) === ':') {
      return '([^\/\?]+)';
    } else {
      return '(.*?)';
    }
  };

  Route.prototype.test = function(path) {
    var constraints, matched;
    matched = this.regExp.test(path);
    if (!matched) {
      return false;
    }
    constraints = this.options.constraints;
    if (constraints) {
      return this.testConstraints(this.extractParams(path));
    }
    return true;
  };

  Route.prototype.handler = function(pathParams, options) {
    var actionParams, params, path, query, route, _ref;
    options = options ? _.clone(options) : {};
    if (typeof pathParams === 'object') {
      query = utils.queryParams.stringify(options.query);
      params = pathParams;
      path = this.reverse(params);
    } else {
      _ref = pathParams.split('?'), path = _ref[0], query = _ref[1];
      if (!(query != null)) {
        query = '';
      } else {
        options.query = utils.queryParams.parse(query);
      }
      params = this.extractParams(path);
    }
    actionParams = _.extend({}, params, this.options.params);
    route = {
      path: path,
      action: this.action,
      controller: this.controller,
      name: this.name,
      query: query
    };
    return Backbone.Events.trigger('router:match', route, actionParams, options);
  };

  Route.prototype.extractParams = function(path) {
    var index, match, matches, paramName, params, _i, _len, _ref;
    params = {};
    matches = this.regExp.exec(path);
    _ref = matches.slice(1);
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      match = _ref[index];
      paramName = this.paramNames.length ? this.paramNames[index] : index;
      params[paramName] = match;
    }
    return params;
  };

  return Route;

})();
;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Mildred.Router = (function() {

  Router.extend = Backbone.Model.extend;

  function Router(options) {
    var isWebFile;
    this.options = options != null ? options : {};
    this.match = __bind(this.match, this);

    isWebFile = window.location.protocol !== 'file:';
    _.defaults(this.options, {
      pushState: isWebFile,
      root: '/'
    });
    this.removeRoot = new RegExp('^' + utils.escapeRegExp(this.options.root) + '(#)?');
    Backbone.on('router:route', this.route, this);
    Backbone.on('router:reverse', this.reverse, this);
    Backbone.on('router:changeURL', this.changeURL, this);
    this.createHistory();
  }

  Router.prototype.createHistory = function() {
    return Backbone.history = new Mildred.History();
  };

  Router.prototype.startHistory = function() {
    return Backbone.history.start(this.options);
  };

  Router.prototype.match = function(pattern, target, options) {
    var action, controller, route, _ref;
    if (options == null) {
      options = {};
    }
    if (arguments.length === 2 && typeof target === 'object') {
      options = target;
      controller = options.controller, action = options.action;
      if (!(controller && action)) {
        throw new Error('Router#match must receive either target or ' + 'options.controller & options.action');
      }
    } else {
      controller = options.controller, action = options.action;
      if (controller || action) {
        throw new Error('Router#match cannot use both target and ' + 'options.controller / options.action');
      }
      _ref = target.split('#'), controller = _ref[0], action = _ref[1];
    }
    route = new Mildred.Route(pattern, controller, action, options);
    Backbone.history.handlers.push({
      route: route,
      callback: route.handler
    });
    return route;
  };

  Router.prototype.route = function(pathDesc, params, options) {
    var handler, path;
    params = params ? _.clone(params) : {};
    if (typeof pathDesc === 'object') {
      path = pathDesc.url;
    }
    if (path != null) {
      path = path.replace(this.removeRoot, '');
      handler = _.find(Backbone.history.handlers, function(handler) {
        return handler.route.test(path);
      });
      options = params;
      params = null;
    } else {
      options = options ? _.clone(options) : {};
      handler = _.find(Backbone.history.handlers, function(handler) {
        if (handler.route.matches(pathDesc)) {
          params = handler.route.normalizeParams(params);
          if (params) {
            return true;
          }
        }
        return false;
      });
    }
    if (handler) {
      _.defaults(options, {
        changeURL: true
      });
      handler.callback(path || params, options);
      return true;
    } else {
      throw new Error('Router#route: request was not routed');
    }
  };

  Router.prototype.reverse = function(criteria, params, query) {
    var handler, handlers, reversed, root, url, _i, _len;
    root = this.options.root;
    if ((params != null) && typeof params !== 'object') {
      throw new TypeError('Router#reverse: params must be an array or an ' + 'object');
    }
    handlers = Backbone.history.handlers;
    for (_i = 0, _len = handlers.length; _i < _len; _i++) {
      handler = handlers[_i];
      if (!(handler.route.matches(criteria))) {
        continue;
      }
      reversed = handler.route.reverse(params, query);
      if (reversed !== false) {
        url = root ? root + reversed : reversed;
        return url;
      }
    }
    throw new Error('Router#reverse: invalid route specified');
  };

  Router.prototype.changeURL = function(url, options) {
    var navigateOptions;
    if (options == null) {
      options = {};
    }
    navigateOptions = {
      trigger: options.trigger === true,
      replace: options.replace === true
    };
    return Backbone.history.navigate(url, navigateOptions);
  };

  Router.prototype.disposed = false;

  Router.prototype.dispose = function() {
    if (this.disposed) {
      return;
    }
    Backbone.history.stop();
    delete Backbone.history;
    Backbone.off('router:route');
    Backbone.off('router:reverse');
    Backbone.off('router:changeURL');
    return this.disposed = true;
  };

  return Router;

})();
;var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mildred.Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.getAttributes = function() {
    return this.attributes;
  };

  Model.prototype.serialize = function() {
    return utils.serializeAttributes(this, this.getAttributes());
  };

  Model.prototype.disposed = false;

  Model.prototype.dispose = function() {
    var prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    this.trigger('dispose', this);
    this.stopListening();
    this.off();
    properties = ['collection', 'attributes', 'changed', '_escapedAttributes', '_previousAttributes', '_silent', '_pending', '_callbacks'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      delete this[prop];
    }
    return this.disposed = true;
  };

  return Model;

})(Backbone.Model);
;var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mildred.Collection = (function(_super) {

  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  Collection.prototype.model = Mildred.Model;

  Collection.prototype.serialize = function() {
    return this.map(utils.serialize);
  };

  Collection.prototype.disposed = false;

  Collection.prototype.dispose = function() {
    var prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    this.trigger('dispose', this);
    this.reset([], {
      silent: true
    });
    this.stopListening();
    this.off();
    properties = ['model', 'models', '_byId', '_byCid', '_callbacks'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      delete this[prop];
    }
    return this.disposed = true;
  };

  return Collection;

})(Backbone.Collection);
;var __slice = [].slice,
  __hasProp = {}.hasOwnProperty;

Mildred.Controller = (function() {

  Controller.extend = Backbone.Model.extend;

  _.extend(Controller.prototype, Backbone.Events);

  Controller.prototype.view = null;

  Controller.prototype.redirected = false;

  function Controller() {
    this.initialize.apply(this, arguments);
  }

  Controller.prototype.initialize = function() {};

  Controller.prototype.beforeAction = function() {};

  Controller.prototype.adjustTitle = function(subtitle) {
    return Backbone.trigger('adjustTitle', subtitle);
  };

  Controller.prototype.compose = function(name) {
    var method;
    method = arguments.length === 1 ? 'retrieve' : 'compose';
    return Backbone.trigger.apply(Backbone, ["composer:" + method].concat(__slice.call(arguments)));
  };

  Controller.prototype.redirectTo = function(pathDesc, params, options) {
    this.redirected = true;
    return helpers.redirectTo(pathDesc, params, options);
  };

  Controller.prototype.disposed = false;

  Controller.prototype.dispose = function() {
    var obj, prop;
    if (this.disposed) {
      return;
    }
    for (prop in this) {
      if (!__hasProp.call(this, prop)) continue;
      obj = this[prop];
      if (!(obj && typeof obj.dispose === 'function')) {
        continue;
      }
      obj.dispose();
      delete this[prop];
    }
    this.off();
    this.stopListening();
    return this.disposed = true;
  };

  return Controller;

})();
;var $,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = Backbone.$;

Mildred.View = (function(_super) {

  __extends(View, _super);

  View.prototype.autoRender = false;

  View.prototype.autoAttach = true;

  View.prototype.container = null;

  View.prototype.containerMethod = 'append';

  View.prototype.stale = false;

  View.prototype.keepElement = false;

  View.prototype.subviews = null;

  View.prototype.subviewsByName = null;

  View.prototype.optionNames = ['autoAttach', 'autoRender', 'container', 'containerMethod'];

  function View(options) {
    var render,
      _this = this;
    if (options) {
      _.extend(this, _.pick(options, this.optionNames));
    }
    render = this.render;
    this.render = function() {
      if (_this.disposed) {
        return false;
      }
      render.apply(_this, arguments);
      if (_this.autoAttach) {
        _this.attach.apply(_this, arguments);
      }
      return _this;
    };
    this.subviews = [];
    this.subviewsByName = {};
    View.__super__.constructor.apply(this, arguments);
    this.delegateListeners();
    if (this.model) {
      this.listenTo(this.model, 'dispose', this.dispose);
    }
    if (this.collection) {
      this.listenTo(this.collection, 'dispose', function(subject) {
        if (!subject || subject === _this.collection) {
          return _this.dispose();
        }
      });
    }
    if (this.autoRender) {
      this.render();
    }
  }

  View.prototype.delegate = function(eventName, second, third) {
    var bound, events, handler, list, selector,
      _this = this;
    if (typeof eventName !== 'string') {
      throw new TypeError('View#delegate: first argument must be a string');
    }
    if (arguments.length === 2) {
      handler = second;
    } else if (arguments.length === 3) {
      selector = second;
      if (typeof selector !== 'string') {
        throw new TypeError('View#delegate: ' + 'second argument must be a string');
      }
      handler = third;
    } else {
      throw new TypeError('View#delegate: ' + 'only two or three arguments are allowed');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('View#delegate: ' + 'handler argument must be function');
    }
    list = _.map(eventName.split(' '), function(event) {
      return "" + event + ".delegate" + _this.cid;
    });
    events = list.join(' ');
    bound = _.bind(handler, this);
    this.$el.on(events, selector || null, bound);
    return bound;
  };

  View.prototype._delegateEvents = function(events) {
    var bound, eventName, handler, key, match, selector, value;
    for (key in events) {
      value = events[key];
      handler = typeof value === 'function' ? value : this[value];
      if (!handler) {
        throw new Error("Method '" + handler + "' does not exist");
      }
      match = key.match(/^(\S+)\s*(.*)$/);
      eventName = "" + match[1] + ".delegateEvents" + this.cid;
      selector = match[2];
      bound = _.bind(handler, this);
      this.$el.on(eventName, selector || null, bound);
    }
  };

  View.prototype.delegateEvents = function(events) {
    var classEvents, _i, _len, _ref;
    this.undelegateEvents();
    if (events) {
      this._delegateEvents(events);
      return;
    }
    if (!this.events) {
      return;
    }
    _ref = utils.getAllPropertyVersions(this, 'events');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      classEvents = _ref[_i];
      if (typeof classEvents === 'function') {
        throw new TypeError('View#delegateEvents: functions are not supported');
      }
      this._delegateEvents(classEvents);
    }
  };

  View.prototype.undelegate = function(eventName, second, third) {
    var events, handler, list, selector,
      _this = this;
    if (eventName) {
      if (typeof eventName !== 'string') {
        throw new TypeError('View#undelegate: first argument must be a string');
      }
      if (arguments.length === 2) {
        if (typeof second === 'string') {
          selector = second;
        } else {
          handler = second;
        }
      } else if (arguments.length === 3) {
        selector = second;
        if (typeof selector !== 'string') {
          throw new TypeError('View#undelegate: ' + 'second argument must be a string');
        }
        handler = third;
      }
      list = _.map(eventName.split(' '), function(event) {
        return "" + event + ".delegate" + _this.cid;
      });
      events = list.join(' ');
      return this.$el.off(events, selector || null);
    } else {
      return this.$el.off(".delegate" + this.cid);
    }
  };

  View.prototype.delegateListeners = function() {
    var eventName, key, method, target, version, _i, _len, _ref, _ref1;
    if (!this.listen) {
      return;
    }
    _ref = utils.getAllPropertyVersions(this, 'listen');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      version = _ref[_i];
      for (key in version) {
        method = version[key];
        if (typeof method !== 'function') {
          method = this[method];
        }
        if (typeof method !== 'function') {
          throw new Error('View#delegateListeners: ' + ("" + method + " must be function"));
        }
        _ref1 = key.split(' '), eventName = _ref1[0], target = _ref1[1];
        this.delegateListener(eventName, target, method);
      }
    }
  };

  View.prototype.delegateListener = function(eventName, target, callback) {
    var prop;
    if (target === 'model' || target === 'collection') {
      prop = this[target];
      if (prop) {
        this.listenTo(prop, eventName, callback);
      }
    } else if (!target) {
      this.on(eventName, callback, this);
    }
  };

  View.prototype.subview = function(name, view) {
    var byName, subviews;
    subviews = this.subviews;
    byName = this.subviewsByName;
    if (name && view) {
      this.removeSubview(name);
      subviews.push(view);
      byName[name] = view;
      return view;
    } else if (name) {
      return byName[name];
    }
  };

  View.prototype.removeSubview = function(nameOrView) {
    var byName, index, name, otherName, otherView, subviews, view;
    if (!nameOrView) {
      return;
    }
    subviews = this.subviews;
    byName = this.subviewsByName;
    if (typeof nameOrView === 'string') {
      name = nameOrView;
      view = byName[name];
    } else {
      view = nameOrView;
      for (otherName in byName) {
        otherView = byName[otherName];
        if (view === otherView) {
          name = otherName;
          break;
        }
      }
    }
    if (!(name && view && view.dispose)) {
      return;
    }
    view.dispose();
    index = _.indexOf(subviews, view);
    if (index !== -1) {
      subviews.splice(index, 1);
    }
    return delete byName[name];
  };

  View.prototype.getTemplateData = function() {
    var data, source;
    data = this.model ? utils.serialize(this.model) : this.collection ? {
      items: utils.serialize(this.collection),
      length: this.collection.length
    } : {};
    source = this.model || this.collection;
    if (source) {
      if (typeof source.isSynced === 'function' && !('synced' in data)) {
        data.synced = source.isSynced();
      }
    }
    return data;
  };

  View.prototype.getTemplateFunction = function() {
    if (typeof Mildred.templateFunction === 'function') {
      return Mildred.templateFunction;
    }
    return _.template;
  };

  View.prototype.render = function() {
    var html, templateFunc;
    if (this.disposed) {
      return false;
    }
    templateFunc = this.getTemplateFunction(this.template);
    if (typeof templateFunc === 'function') {
      html = templateFunc(this.getTemplateData());
      this.$el.html(html);
    }
    return this;
  };

  View.prototype.attach = function() {
    if (this.container && !document.body.contains(this.el)) {
      $(this.container)[this.containerMethod](this.el);
      return this.trigger('addedToDOM');
    }
  };

  View.prototype.disposed = false;

  View.prototype.dispose = function() {
    var prop, properties, subview, _i, _j, _len, _len1, _ref;
    if (this.disposed) {
      return;
    }
    _ref = this.subviews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      subview = _ref[_i];
      subview.dispose();
    }
    this.off();
    if (this.keepElement) {
      this.undelegateEvents();
      this.undelegate();
      this.stopListening();
    } else {
      this.remove();
    }
    properties = ['el', '$el', 'options', 'model', 'collection', 'subviews', 'subviewsByName', '_callbacks'];
    for (_j = 0, _len1 = properties.length; _j < _len1; _j++) {
      prop = properties[_j];
      delete this[prop];
    }
    return this.disposed = true;
  };

  return View;

})(Backbone.View);
;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mildred.Layout = (function(_super) {

  __extends(Layout, _super);

  Layout.prototype.el = 'body';

  Layout.prototype.keepElement = true;

  Layout.prototype.title = '';

  Layout.prototype.listen = {
    'beforeControllerDispose mediator': 'scroll'
  };

  function Layout(options) {
    if (options == null) {
      options = {};
    }
    this.openLink = __bind(this.openLink, this);

    this.title = options.title;
    this.settings = _.defaults(options, {
      titleTemplate: _.template("<% if (subtitle) { %><%= subtitle %> \u2013 <% } %><%= title %>"),
      openExternalToBlank: false,
      routeLinks: 'a, .go-to',
      skipRouting: '.noscript',
      scrollTo: [0, 0]
    });
    Backbone.on('adjustTitle', this.adjustTitle, this);
    Layout.__super__.constructor.apply(this, arguments);
    if (this.settings.routeLinks) {
      this.startLinkRouting();
    }
  }

  Layout.prototype.scroll = function(controller) {
    var position;
    position = this.settings.scrollTo;
    if (position) {
      return window.scrollTo(position[0], position[1]);
    }
  };

  Layout.prototype.adjustTitle = function(subtitle) {
    var title;
    if (subtitle == null) {
      subtitle = '';
    }
    title = this.settings.titleTemplate({
      title: this.title,
      subtitle: subtitle
    });
    document.title = title;
    return title;
  };

  Layout.prototype.startLinkRouting = function() {
    var route;
    route = this.settings.routeLinks;
    if (route) {
      return this.$el.on('click', route, this.openLink);
    }
  };

  Layout.prototype.stopLinkRouting = function() {
    var route;
    route = this.settings.routeLinks;
    if (route) {
      return this.$el.off('click', route);
    }
  };

  Layout.prototype.isExternalLink = function(link) {
    var _ref, _ref1;
    return link.target === '_blank' || link.rel === 'external' || ((_ref = link.protocol) !== 'http:' && _ref !== 'https:' && _ref !== 'file:') || ((_ref1 = link.hostname) !== location.hostname && _ref1 !== '');
  };

  Layout.prototype.openLink = function(event) {
    var $el, el, external, href, isAnchor, skipRouting, type;
    if (utils.modifierKeyPressed(event)) {
      return;
    }
    el = event.currentTarget;
    $el = $(el);
    isAnchor = el.nodeName === 'A';
    href = $el.attr('href') || $el.data('href') || null;
    if (!(href != null) || href === '' || href.charAt(0) === '#') {
      return;
    }
    skipRouting = this.settings.skipRouting;
    type = typeof skipRouting;
    if (type === 'function' && !skipRouting(href, el) || type === 'string' && $el.is(skipRouting)) {
      return;
    }
    external = isAnchor && this.isExternalLink(el);
    if (external) {
      if (this.settings.openExternalToBlank) {
        event.preventDefault();
        window.open(href);
      }
      return;
    }
    helpers.redirectTo({
      url: href
    });
    event.preventDefault();
  };

  Layout.prototype.dispose = function() {
    var prop, _i, _len, _ref;
    if (this.disposed) {
      return;
    }
    this.stopLinkRouting();
    _ref = ['title', 'route'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      prop = _ref[_i];
      delete this[prop];
    }
    this.off;
    return Layout.__super__.dispose.apply(this, arguments);
  };

  return Layout;

})(Mildred.View);
;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Mildred.CollectionView = (function(_super) {

  __extends(CollectionView, _super);

  CollectionView.prototype.itemView = null;

  CollectionView.prototype.autoRender = true;

  CollectionView.prototype.renderItems = true;

  CollectionView.prototype.animationDuration = 500;

  CollectionView.prototype.useCssAnimation = false;

  CollectionView.prototype.animationStartClass = 'animated-item-view';

  CollectionView.prototype.animationEndClass = 'animated-item-view-end';

  CollectionView.prototype.listSelector = null;

  CollectionView.prototype.$list = null;

  CollectionView.prototype.fallbackSelector = null;

  CollectionView.prototype.$fallback = null;

  CollectionView.prototype.loadingSelector = null;

  CollectionView.prototype.$loading = null;

  CollectionView.prototype.itemSelector = void 0;

  CollectionView.prototype.filterer = null;

  CollectionView.prototype.filterCallback = function(view, included) {
    return view.$el.stop(true, true).toggle(included);
  };

  CollectionView.prototype.visibleItems = null;

  CollectionView.prototype.optionNames = Mildred.View.prototype.optionNames.concat(['renderItems', 'itemView']);

  function CollectionView(options) {
    this.renderAllItems = __bind(this.renderAllItems, this);

    this.toggleFallback = __bind(this.toggleFallback, this);

    this.itemsReset = __bind(this.itemsReset, this);

    this.itemRemoved = __bind(this.itemRemoved, this);

    this.itemAdded = __bind(this.itemAdded, this);
    this.visibleItems = [];
    CollectionView.__super__.constructor.apply(this, arguments);
  }

  CollectionView.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    this.addCollectionListeners();
    if (options.filterer != null) {
      return this.filter(options.filterer);
    }
  };

  CollectionView.prototype.addCollectionListeners = function() {
    this.listenTo(this.collection, 'add', this.itemAdded);
    this.listenTo(this.collection, 'remove', this.itemRemoved);
    return this.listenTo(this.collection, 'reset sort', this.itemsReset);
  };

  CollectionView.prototype.getTemplateData = function() {
    var templateData;
    templateData = {
      length: this.collection.length
    };
    if (typeof this.collection.isSynced === 'function') {
      templateData.synced = this.collection.isSynced();
    }
    return templateData;
  };

  CollectionView.prototype.getTemplateFunction = function() {};

  CollectionView.prototype.render = function() {
    CollectionView.__super__.render.apply(this, arguments);
    this.$list = this.listSelector ? this.$(this.listSelector) : this.$el;
    this.initFallback();
    this.initLoadingIndicator();
    if (this.renderItems) {
      return this.renderAllItems();
    }
  };

  CollectionView.prototype.itemAdded = function(item, collection, options) {
    return this.insertView(item, this.renderItem(item), options.at);
  };

  CollectionView.prototype.itemRemoved = function(item) {
    return this.removeViewForItem(item);
  };

  CollectionView.prototype.itemsReset = function() {
    return this.renderAllItems();
  };

  CollectionView.prototype.initFallback = function() {
    if (!this.fallbackSelector) {
      return;
    }
    this.$fallback = this.$(this.fallbackSelector);
    this.on('visibilityChange', this.toggleFallback);
    this.listenTo(this.collection, 'syncStateChange', this.toggleFallback);
    return this.toggleFallback();
  };

  CollectionView.prototype.toggleFallback = function() {
    var visible;
    visible = this.visibleItems.length === 0 && (typeof this.collection.isSynced === 'function' ? this.collection.isSynced() : true);
    return this.$fallback.toggle(visible);
  };

  CollectionView.prototype.initLoadingIndicator = function() {
    if (!(this.loadingSelector && typeof this.collection.isSyncing === 'function')) {
      return;
    }
    this.$loading = this.$(this.loadingSelector);
    this.listenTo(this.collection, 'syncStateChange', this.toggleLoadingIndicator);
    return this.toggleLoadingIndicator();
  };

  CollectionView.prototype.toggleLoadingIndicator = function() {
    var visible;
    visible = this.collection.length === 0 && this.collection.isSyncing();
    return this.$loading.toggle(visible);
  };

  CollectionView.prototype.getItemViews = function() {
    var itemViews, name, view, _ref;
    itemViews = {};
    if (this.subviews.length > 0) {
      _ref = this.subviewsByName;
      for (name in _ref) {
        view = _ref[name];
        if (name.slice(0, 9) === 'itemView:') {
          itemViews[name.slice(9)] = view;
        }
      }
    }
    return itemViews;
  };

  CollectionView.prototype.filter = function(filterer, filterCallback) {
    var included, index, item, view, _i, _len, _ref;
    this.filterer = filterer;
    if (filterCallback) {
      this.filterCallback = filterCallback;
    }
    if (filterCallback == null) {
      filterCallback = this.filterCallback;
    }
    if (!_.isEmpty(this.getItemViews())) {
      _ref = this.collection.models;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        item = _ref[index];
        included = typeof filterer === 'function' ? filterer(item, index) : true;
        view = this.subview("itemView:" + item.cid);
        if (!view) {
          throw new Error('CollectionView#filter: ' + ("no view found for " + item.cid));
        }
        this.filterCallback(view, included);
        this.updateVisibleItems(view.model, included, false);
      }
    }
    return this.trigger('visibilityChange', this.visibleItems);
  };

  CollectionView.prototype.renderAllItems = function() {
    var cid, index, item, items, remainingViewsByCid, view, _i, _j, _len, _len1, _ref;
    items = this.collection.models;
    this.visibleItems = [];
    remainingViewsByCid = {};
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      view = this.subview("itemView:" + item.cid);
      if (view) {
        remainingViewsByCid[item.cid] = view;
      }
    }
    _ref = this.getItemViews();
    for (cid in _ref) {
      if (!__hasProp.call(_ref, cid)) continue;
      view = _ref[cid];
      if (!(cid in remainingViewsByCid)) {
        this.removeSubview("itemView:" + cid);
      }
    }
    for (index = _j = 0, _len1 = items.length; _j < _len1; index = ++_j) {
      item = items[index];
      view = this.subview("itemView:" + item.cid);
      if (view) {
        this.insertView(item, view, index, false);
      } else {
        this.insertView(item, this.renderItem(item), index);
      }
    }
    if (items.length === 0) {
      return this.trigger('visibilityChange', this.visibleItems);
    }
  };

  CollectionView.prototype.renderItem = function(item) {
    var view;
    view = this.subview("itemView:" + item.cid);
    if (!view) {
      view = this.initItemView(item);
      this.subview("itemView:" + item.cid, view);
    }
    view.render();
    return view;
  };

  CollectionView.prototype.initItemView = function(model) {
    if (this.itemView) {
      return new this.itemView({
        model: model,
        autoRender: false
      });
    } else {
      throw new Error('The CollectionView#itemView property ' + 'must be defined or the initItemView() must be overridden.');
    }
  };

  CollectionView.prototype.insertView = function(item, view, position, enableAnimation) {
    var $list, $next, $previous, $viewEl, children, childrenLength, included, insertInMiddle, isEnd, length, method, viewEl,
      _this = this;
    if (enableAnimation == null) {
      enableAnimation = true;
    }
    if (this.animationDuration === 0) {
      enableAnimation = false;
    }
    if (typeof position !== 'number') {
      position = this.collection.indexOf(item);
    }
    included = typeof this.filterer === 'function' ? this.filterer(item, position) : true;
    viewEl = view.el;
    $viewEl = view.$el;
    if (included && enableAnimation) {
      if (this.useCssAnimation) {
        $viewEl.addClass(this.animationStartClass);
      } else {
        $viewEl.css('opacity', 0);
      }
    }
    if (this.filterer) {
      this.filterCallback(view, included);
    }
    length = this.collection.length;
    insertInMiddle = (0 < position && position < length);
    isEnd = function(length) {
      return length === 0 || position === length;
    };
    $list = this.$list;
    if (insertInMiddle || this.itemSelector) {
      children = $list.children(this.itemSelector);
      childrenLength = children.length;
      if (children.get(position) !== viewEl) {
        if (isEnd(childrenLength)) {
          $list.append(viewEl);
        } else {
          if (position === 0) {
            $next = children.eq(position);
            $next.before(viewEl);
          } else {
            $previous = children.eq(position - 1);
            $previous.after(viewEl);
          }
        }
      }
    } else {
      method = isEnd(length) ? 'append' : 'prepend';
      $list[method](viewEl);
    }
    view.trigger('addedToParent');
    this.updateVisibleItems(item, included);
    if (included && enableAnimation) {
      if (this.useCssAnimation) {
        setTimeout(function() {
          return $viewEl.addClass(_this.animationEndClass);
        }, 0);
      } else {
        $viewEl.animate({
          opacity: 1
        }, this.animationDuration);
      }
    }
    return view;
  };

  CollectionView.prototype.removeViewForItem = function(item) {
    this.updateVisibleItems(item, false);
    return this.removeSubview("itemView:" + item.cid);
  };

  CollectionView.prototype.updateVisibleItems = function(item, includedInFilter, triggerEvent) {
    var includedInVisibleItems, visibilityChanged, visibleItemsIndex;
    if (triggerEvent == null) {
      triggerEvent = true;
    }
    visibilityChanged = false;
    visibleItemsIndex = _.indexOf(this.visibleItems, item);
    includedInVisibleItems = visibleItemsIndex !== -1;
    if (includedInFilter && !includedInVisibleItems) {
      this.visibleItems.push(item);
      visibilityChanged = true;
    } else if (!includedInFilter && includedInVisibleItems) {
      this.visibleItems.splice(visibleItemsIndex, 1);
      visibilityChanged = true;
    }
    if (visibilityChanged && triggerEvent) {
      this.trigger('visibilityChange', this.visibleItems);
    }
    return visibilityChanged;
  };

  CollectionView.prototype.dispose = function() {
    var prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    properties = ['$list', '$fallback', '$loading', 'visibleItems'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      delete this[prop];
    }
    return CollectionView.__super__.dispose.apply(this, arguments);
  };

  return CollectionView;

})(Mildred.View);
;
Mildred.Application = (function() {

  Application.extend = Backbone.Model.extend;

  Application.prototype.title = '';

  Application.prototype.layout = void 0;

  Application.prototype.router = void 0;

  Application.prototype.composer = void 0;

  Application.prototype.started = false;

  function Application(options) {
    if (options == null) {
      options = {};
    }
    this.initialize(options);
  }

  Application.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    if (this.started) {
      throw new Error('Application#initialize: App was already started');
    }
    if (typeof options.templateFunction === 'function') {
      Mildred.templateFunction = options.templateFunction;
    }
    this.initRouter(options.routes, options);
    this.initDispatcher(options);
    this.initLayout(options);
    this.initComposer(options);
    return this.start();
  };

  Application.prototype.initDispatcher = function(options) {
    return this.dispatcher = new Mildred.Dispatcher(options);
  };

  Application.prototype.initLayout = function(options) {
    var _ref;
    if (options == null) {
      options = {};
    }
    if ((_ref = options.title) == null) {
      options.title = this.title;
    }
    return this.layout = new Mildred.Layout(options);
  };

  Application.prototype.initComposer = function(options) {
    if (options == null) {
      options = {};
    }
    return this.composer = new Mildred.Composer(options);
  };

  Application.prototype.initRouter = function(routes, options) {
    this.router = new Mildred.Router(options);
    return typeof routes === "function" ? routes(this.router.match) : void 0;
  };

  Application.prototype.start = function() {
    this.router.startHistory();
    this.started = true;
    return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
  };

  Application.prototype.disposed = false;

  Application.prototype.dispose = function() {
    var prop, properties, _i, _len;
    if (this.disposed) {
      return;
    }
    properties = ['dispatcher', 'layout', 'router', 'composer'];
    for (_i = 0, _len = properties.length; _i < _len; _i++) {
      prop = properties[_i];
      if (!(this[prop] != null)) {
        continue;
      }
      this[prop].dispose();
      delete this[prop];
    }
    return this.disposed = true;
  };

  return Application;

})();
