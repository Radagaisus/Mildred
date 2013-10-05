// Generated by CoffeeScript 1.4.0
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  describe('Application', function() {
    var app, getApp;
    app = null;
    getApp = function(noInit) {
      if (noInit) {
        return (function(_super) {

          __extends(_Class, _super);

          function _Class() {
            return _Class.__super__.constructor.apply(this, arguments);
          }

          _Class.prototype.initialize = function() {};

          return _Class;

        })(Mildred.Application);
      } else {
        return Mildred.Application;
      }
    };
    beforeEach(function() {
      return app = new (getApp(true));
    });
    afterEach(function() {
      return app.dispose();
    });
    it('should be a simple object', function() {
      expect(app).to.be.an('object');
      return expect(app).to.be.a(Mildred.Application);
    });
    it('should have initialize function', function() {
      expect(app.initialize).to.be.a('function');
      return app.initialize();
    });
    it('should create a dispatcher', function() {
      expect(app.initDispatcher).to.be.a('function');
      app.initDispatcher();
      return expect(app.dispatcher).to.be.a(Mildred.Dispatcher);
    });
    it('should create a layout', function() {
      expect(app.initLayout).to.be.a('function');
      app.initLayout();
      return expect(app.layout).to.be.a(Mildred.Layout);
    });
    it('should create a composer', function() {
      expect(app.initComposer).to.be.a('function');
      app.initComposer();
      return expect(app.composer).to.be.a(Mildred.Composer);
    });
    it('should create a router', function() {
      var passedMatch, routes, routesCalled;
      passedMatch = null;
      routesCalled = false;
      routes = function(match) {
        routesCalled = true;
        return passedMatch = match;
      };
      expect(app.initRouter).to.be.a('function');
      expect(app.initRouter.length).to.be(2);
      app.initRouter(routes, {
        root: '/',
        pushState: false
      });
      expect(app.router).to.be.a(Mildred.Router);
      expect(routesCalled).to.be(true);
      return expect(passedMatch).to.be.a('function');
    });
    it('should start Backbone.history with start()', function() {
      app.initRouter((function() {}), {
        root: '/',
        pushState: false
      });
      app.start();
      expect(Backbone.History.started).to.be(true);
      return Backbone.history.stop();
    });
    it('should throw an error on double-init', function() {
      return expect(function() {
        return (new (getApp(false))).initialize();
      }).to.throwError();
    });
    it('should dispose itself correctly', function() {
      var prop, _i, _len, _ref;
      expect(app.dispose).to.be.a('function');
      app.dispose();
      _ref = ['dispatcher', 'layout', 'router', 'composer'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prop = _ref[_i];
        expect(app[prop]).to.be(void 0);
      }
      return expect(app.disposed).to.be(true);
    });
    return it('should be extendable', function() {
      var DerivedApplication, derivedApp;
      app.dispose();
      Backbone.history.stop();
      expect(Mildred.Application.extend).to.be.a('function');
      DerivedApplication = Mildred.Application.extend();
      derivedApp = new DerivedApplication();
      expect(derivedApp).to.be.a(Mildred.Application);
      return derivedApp.dispose();
    });
  });

}).call(this);
