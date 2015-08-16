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

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (factory) {
    var opts = {
        isTestingEnv: process && process.title && !! ~process.title.indexOf('reduct'),
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

    // Initiate the global reduct object if necessary.
    if (!world.reduct) {
        world.reduct = {};
    }

    // Export the factory with the global and options to all module formats.
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(world, opts);
    } else if (typeof define === "function" && define.amd) {
        define([], function () {
            return factory(world, opts);
        });
    } else {
        world.reduct.registry = factory(world, opts);
    }
})(function factory(global, factoryOpts) {

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

        throw new Error('@reduct/registry Error: Could not guess name of registered item. Please specify an explicit alias.');
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
            key: "get",
            value: function get(key) {
                if (!(key in this.items)) {
                    throw new Error("@reduct/registry Error: Could not find " + key + ".");
                }

                return this.items[key];
            }

            /**
             * Returns multiple items from the registry
             *
             * @param {String...} keys
             * @returns []
             */
        }, {
            key: "getAll",
            value: function getAll(keys) {
                var _this = this;

                var result = [];

                keys.forEach(function (key) {
                    return result.push(_this.get(key));
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
            key: "expect",
            value: function expect(key) {
                var _this2 = this;

                var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];

                return new Promise(function (resolve, reject) {
                    if (key in _this2.items) {
                        resolve(_this2.items[key]);
                    }

                    _this2.deferred[key] = resolve;

                    if (timeout > 0) {
                        setTimeout(function () {
                            return reject("@reduct/registry Error: Timeout occured while waiting for " + key + ".");
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
            key: "expectAll",
            value: function expectAll(keys) {
                var _this3 = this;

                var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];

                return Promise.all(keys.map(function (key) {
                    return _this3.expect(key, timeout);
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
            key: "await",
            value: function await(key) {
                return this.expect(key, 0);
            }

            /**
             * Creates and returns a promise, which will resolve into all of the requested
             * values identified by keys as soon as all of them are registered.
             *
             * @param {String[]} keys
             * @returns {Promise}
             */
        }, {
            key: "awaitAll",
            value: function awaitAll(keys) {
                var _this4 = this;

                return Promise.all(keys.map(function (key) {
                    return _this4.await(key);
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
            key: "register",
            value: function register(value) {
                var _this5 = this;

                var key = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

                // Handle batch registration
                if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
                    Object.keys(value).forEach(function (key) {
                        return _this5.register(key, value);
                    });
                    return;
                }

                key = key || _guessNameOf(value);

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
            key: "registerAll",
            value: function registerAll(itemMap) {
                var _this6 = this;

                Object.keys(itemMap).forEach(function (name) {
                    return _this6.register(itemMap[name], name);
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
        var api = {
            register: function register(value) {
                var key = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
                return registry.register(value, key);
            },
            registerAll: function registerAll(itemMap) {
                return registry.registerAll(itemMap);
            },
            get: function get(key) {
                return registry.get(key);
            },
            getAll: function getAll(keys) {
                return registry.getAll(keys);
            },
            expect: function expect(key) {
                var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
                return registry.expect(key, timeout);
            },
            expectAll: function expectAll(keys) {
                var timeout = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];
                return registry.expectAll(keys, timeout);
            },
            await: function await(key) {
                return registry.await(key);
            },
            awaitAll: function awaitAll(keys) {
                return registry.awaitAll(keys);
            }
        };

        //
        // Expose additional attributes for the tests.
        //
        if (factoryOpts.isTestingEnv) {
            api.items = registry.items;
            api.deferred = registry.deferred;
        }

        return api;
    };

    //
    // Add the version information to the factory function.
    //
    registry.version = factoryOpts.packageVersion;

    return registry;
});