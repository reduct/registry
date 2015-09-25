/**
 *
 * @name @reduct/registry
 * @version 1.0.0
 * @license undefined
 *
 * @author Tyll Weiß <inkdpixels@gmail.com>
 * @author André König <andre.koenig@posteo.de>
 * @author Wilhelm Behncke
 *
 */


(function () {
    var reductOpts = {
        isTestingEnv: false,
        packageVersion: {
            major: 1,
            minor: 0,
            patch: 0
        }
    };
    var world = this;

    // Check for globals.
    if (typeof window !== "undefined") {
        world = window;
    } else if (typeof global !== "undefined") {
        world = global;
    } else if (typeof self !== "undefined") {
        world = self;
    }

    // Execute the isTestingEnv check.
    reductOpts.isTestingEnv = world.process && world.process.title && !!~world.process.title.indexOf('reduct');

    return (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.reduct || (g.reduct = {})).registry = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_redReq,module,exports){
/*global reductOpts*/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reductLogger = _redReq('@reduct/logger');

var registryLogger = _reductLogger.logger.getLogger('@reduct/registry');

/**
 * @private
 *
 * Guess the name of an incoming function/class
 *
 * @param {} value
 * @returns {String}
 */
function _guessNameOf(value) {
    if (Object.prototype.toString.call(value) === '[object Function]') {
        if ('name' in value && value.name) {
            return value.name;
        }

        var regexe = /^\s*function\s*([^\(]*)/im;
        var _name = value.name || regexe.exec(value.toString())[1];

        if (_name) {
            return _name;
        }
    }

    registryLogger.error('Could not guess name of registered item. Please specify an explicit alias.');
}

var Registry = (function () {

    /**
     * Initializes an empty item index, as well as an empty index of derred values
     * that may be resolved by future registrations
     */

    function Registry() {
        _classCallCheck(this, Registry);

        this.items = {};
        this.deferred = {};
    }

    //
    // Create the `registry` factory function.
    // This factory will create a new instance of the `registry` and exposes the API
    //

    /**
     * Returns an item from the registry
     *
     * @param {String} key
     * @returns {}
     */

    _createClass(Registry, [{
        key: 'get',
        value: function get(key) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            if (!(namespace + key in this.items)) {
                registryLogger.error('Could not find ' + key + '.');
            }

            return this.items[namespace + key];
        }

        /**
         * Returns multiple items from the registry
         *
         * @param {String...} keys
         * @returns []
         */
    }, {
        key: 'getAll',
        value: function getAll(keys) {
            var _this = this;

            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            var result = [];

            keys.forEach(function (key) {
                return result.push(_this.get(key, namespace));
            });

            return result;
        }

        /**
         * Creates and returns a promise, which will resolve into the requested
         * value identified by key as soon as it is registered or will reject, if no
         * value is registered after a given timeout
         *
         * @param {String} key
         * @param {Number} timeout
         * @returns {Promise}
         */
    }, {
        key: 'expect',
        value: function expect(key) {
            var _this2 = this;

            var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
            var namespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            return new Promise(function (resolve, reject) {
                if (namespace + key in _this2.items) {
                    resolve(_this2.items[namespace + key]);
                }

                _this2.deferred[namespace + key] = resolve;

                if (timeout > 0) {
                    setTimeout(function () {
                        return reject('@reduct/registry Error: Timeout occured while waiting for ' + key + '.');
                    }, timeout);
                }
            });
        }

        /**
         * Creates and returns a promise, which will resolve into all of the requested
         * values identified by keys as soon as all of them are registered or will reject, if any of
         * the values is not registered after a given timeout
         *
         * @param {String[]} keys
         * @param {Number} timeout
         * @returns {Promise}
         */
    }, {
        key: 'expectAll',
        value: function expectAll(keys) {
            var _this3 = this;

            var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
            var namespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            return Promise.all(keys.map(function (key) {
                return _this3.expect(key, timeout, namespace);
            }));
        }

        /**
         * Creates and returns a promise, which will resolve into the requested
         * value identified by key as soon as it is registered
         *
         * @param {String} key
         * @returns {Promise}
         */
    }, {
        key: 'await',
        value: function await(key) {
            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            return this.expect(key, 0, namespace);
        }

        /**
         * Creates and returns a promise, which will resolve into all of the requested
         * values identified by keys as soon as all of them are registered.
         *
         * @param {String[]} keys
         * @returns {Promise}
         */
    }, {
        key: 'awaitAll',
        value: function awaitAll(keys, namespace) {
            var _this4 = this;

            return Promise.all(keys.map(function (key) {
                return _this4.await(key, namespace);
            }));
        }

        /**
         * Registers an item
         *
         * @param {} value
         * @param {String} key
         * @returns {Registry}
         */
    }, {
        key: 'register',
        value: function register(value) {
            var _this5 = this;

            var key = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            var namespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            // Handle batch registration
            if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
                Object.keys(value).forEach(function (key) {
                    return _this5.register(key, value, namespace);
                });
                return;
            }

            key = namespace + (key || _guessNameOf(value));

            this.items[key] = value;

            if (key in this.deferred) {
                this.deferred[key](value);
                delete this.deferred[key];
            }

            return this;
        }

        /**
         * Takes a hashmap with multiple items
         * and registers them at once.
         *
         * @param {Object} itemMap
         */
    }, {
        key: 'registerAll',
        value: function registerAll(itemMap) {
            var _this6 = this;

            var namespace = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            Object.keys(itemMap).forEach(function (name) {
                return _this6.register(itemMap[name], name, namespace);
            });

            return this;
        }
    }]);

    return Registry;
})();

var registry = function registry() {
    var registry = new Registry();

    //
    // Shard the actual front-facing API (for not leaking private methods and properties).
    //
    var apiFactory = function apiFactory() {
        var namespace = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        if (namespace && !namespace.endsWith('/')) {
            namespace = namespace + '/';
        }

        var namespacedApi = {
            register: function register(value) {
                var key = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
                return registry.register(value, key, namespace);
            },
            registerAll: function registerAll(itemMap) {
                return registry.registerAll(itemMap, namespace);
            },
            get: function get(key) {
                return registry.get(key, namespace);
            },
            getAll: function getAll(keys) {
                return registry.getAll(keys, namespace);
            },
            expect: function expect(key) {
                var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
                return registry.expect(key, timeout, namespace);
            },
            expectAll: function expectAll(keys) {
                var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
                return registry.expectAll(keys, timeout, namespace);
            },
            await: function await(key) {
                return registry.await(key, namespace);
            },
            awaitAll: function awaitAll(keys) {
                return registry.awaitAll(keys, namespace);
            }
        };

        if (!namespace) {
            namespacedApi.namespace = function (namespace) {
                return apiFactory(namespace);
            };
            namespacedApi.use = function (namespace, callback) {
                return callback(apiFactory(namespace));
            };
        }

        return namespacedApi;
    };

    var api = apiFactory();

    //
    // Expose additional attributes for the tests.
    //
    if (reductOpts.isTestingEnv) {
        api.items = registry.items;
        api.deferred = registry.deferred;

        // Reset the logLevel to all since we want to test throws of errors.
        _reductLogger.logger.setLogLevel(_reductLogger.logLevels.ALL);
    }

    return api;
};

//
// Add the version information to the factory function.
//
registry.version = reductOpts.packageVersion;

exports['default'] = registry;
module.exports = exports['default'];

},{"@reduct/logger":2}],2:[function(_redReq,module,exports){
(function (global){
/**
 *
 * @name @reduct/logger
 * @version 1.1.0
 * @license MIT
 *
 * @author Tyll Weiß <inkdpixels@gmail.com>
 * @author André König <andre.koenig@posteo.de>
 * @author Wilhelm Behncke
 *
 */


(function () {
    var reductOpts = {
        isTestingEnv: false,
        packageVersion: {
            major: 1,
            minor: 1,
            patch: 0
        }
    };
    var world = this;

    // Check for globals.
    if (typeof window !== "undefined") {
        world = window;
    } else if (typeof global !== "undefined") {
        world = global;
    } else if (typeof self !== "undefined") {
        world = self;
    }

    // Execute the isTestingEnv check.
    reductOpts.isTestingEnv = world.process && world.process.title && !!~world.process.title.indexOf('reduct');

    return (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.logger = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _redReq=="function"&&_redReq;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _redReq=="function"&&_redReq;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_redReq,module,exports){
(function (global){
/*global reductOpts*/

/**
 * @private
 *
 * Checks if the given argument is a Number.
 *
 * @param num {*} The argument which will be validated.
 * @returns {boolean}
 *
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _isNumeric(num) {
    return !isNaN(num);
}

var logLevels = {
    ALL: 2,
    WARNINGS: 1,
    SILENT: 0
};

var Logger = (function () {
    /**
     * Sets up internal properties for the logger.
     *
     * @param namespace {String} The optional namespace for the logger.
     * @param logLevel {Number} The optional initial logLevel for the logger.
     */

    function Logger() {
        var namespace = arguments.length <= 0 || arguments[0] === undefined ? '@reduct/logger' : arguments[0];
        var logLevel = arguments.length <= 1 || arguments[1] === undefined ? logLevels.ALL : arguments[1];

        _classCallCheck(this, Logger);

        this.version = reductOpts.packageVersion;
        this.logLevel = logLevel;
        this.namespace = namespace;

        this.instances = [];
    }

    //
    // Check for the existence of an logger instance in the global namespace,
    // and if none was found create a singleton.
    //

    /**
     * Returns customized version of the logger API.
     *
     * @param namespace {String} The namespace of the new logger instance.
     */

    _createClass(Logger, [{
        key: 'getLogger',
        value: function getLogger() {
            var namespace = arguments.length <= 0 || arguments[0] === undefined ? this.namespace : arguments[0];

            var logger = new Logger(namespace, this.logLevel);

            this.instances.push(logger);

            return {
                log: function log(message, appendix) {
                    logger.log(message, appendix);
                },

                info: function info(message, appendix) {
                    logger.info(message, appendix);
                },

                warn: function warn(message, appendix) {
                    logger.warn(message, appendix);
                },

                error: function error(message, appendix) {
                    logger.error(message, appendix);
                }
            };
        }

        /**
         * Adjusts the noise of the centralized instance of the logger.
         * 0 => No messages are displayed
         * 1 => Only severe messages are displayed
         * 2 => Every message is displayed
         *
         * @param int {Number} The new log level.
         * @returns {Logger}
         *
         */
    }, {
        key: 'setLogLevel',
        value: function setLogLevel(int) {
            var logLevel = _isNumeric(int) ? int : 2;

            this.logLevel = logLevel;

            this.instances.forEach(function (logger) {
                logger.logLevel = logLevel;
            });

            return this;
        }

        /**
         * Logs a message to the console API if possible.
         *
         * @param message {String} The message to log.
         * @param appendix {*} An optional appendix for the log.
         * @returns {Logger}
         *
         */
    }, {
        key: 'log',
        value: function log(message) {
            var appendix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            if (this.logLevel < logLevels.ALL) {
                return this;
            }

            try {
                console.log(this.namespace + ': ' + message, appendix);
            } catch (e) {}

            return this;
        }

        /**
         * Logs a info to the console API if possible.
         *
         * @param message {String} The message to log.
         * @param appendix {*} An optional appendix for the info log.
         * @returns {Logger}
         *
         */
    }, {
        key: 'info',
        value: function info(message) {
            var appendix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            if (this.logLevel < logLevels.ALL) {
                return this;
            }

            try {
                console.info(this.namespace + ' Info: ' + message, appendix);
            } catch (e) {}

            return this;
        }

        /**
         * Logs a warning to the console API if possible.
         *
         * @param message {String} The message to log.
         * @param appendix {*} An optional appendix for the warning.
         * @returns {Logger}
         *
         */
    }, {
        key: 'warn',
        value: function warn(message) {
            var appendix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            if (this.logLevel < logLevels.WARNINGS) {
                return this;
            }

            try {
                console.warn(this.namespace + ' Warning: ' + message, appendix);
            } catch (e) {}
        }

        /**
         * Logs a error to the console API if possible.
         *
         * @param message {String} The message to log.
         * @param appendix {*} An optional appendix for the error log.
         * @returns {Logger}
         *
         */
    }, {
        key: 'error',
        value: function error(message) {
            var appendix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            if (this.logLevel < logLevels.SILENT) {
                return this;
            }

            if (appendix !== '') {
                try {
                    // We still need the console.error call since the Error object can't print out references to HTML Elements/Objects etc.
                    console.error(message, appendix);
                } catch (e) {}

                throw new Error(this.namespace + ' Error: Details are posted above.');
            } else {
                throw new Error(this.namespace + ' Error: ' + message);
            }
        }
    }]);

    return Logger;
})();

if (!(global.reductLogger instanceof Logger)) {
    var logger = new Logger();

    //
    // Reduce the logging noise for the unit tests.
    //
    if (reductOpts.isTestingEnv) {
        logger.setLogLevel(0);
    }

    global.reductLogger = logger;
}

exports['default'] = {
    logger: global.reductLogger,
    logLevels: logLevels
};
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}());
                
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
}());
                