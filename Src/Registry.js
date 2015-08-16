function factory (global, factoryOpts) {

    /**
     * @private
     *
     * Guess the name of an incoming function/class
     *
     * @param {} value
     * @returns {String}
     */
    function _guessNameOf (value) {
        if (Object.prototype.toString.call(value) === '[object Function]') {
            if ('name' in value && value.name) {
                return value.name;
            }

            let regexe = /^\s*function\s*([^\(]*)/im;
            let name = value.name || regexe.exec(value.toString())[1];

            if (name) {
                return name;
            }
        }

        throw new Error('@reduct/registry Error: Could not guess name of registered item. Please specify an explicit alias.');
    }

    class Registry {

        /**
         * Initializes an empty item index, as well as an empty index of derred values
         * that may be resolved by future registrations
         */
        constructor() {
            this.items = {};
            this.deferred = {};
        }

        /**
         * Returns an item from the registry
         *
         * @param {String} key
         * @returns {}
         */
        get(key) {
            if (!(key in this.items)) {
                throw new Error(`@reduct/registry Error: Could not find ${key}.`);
            }

            return this.items[key];
        }

        /**
         * Returns multiple items from the registry
         *
         * @param {String...} keys
         * @returns []
         */
        getAll(keys) {
            let result = [];

            keys.forEach((key) => result.push(this.get(key)));

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
        expect(key, timeout = 1000) {
            return new Promise((resolve, reject) => {
                if (key in this.items) {
                    resolve(this.items[key]);
                }

                this.deferred[key] = resolve;

                if (timeout > 0) {
                    setTimeout(() => reject(`@reduct/registry Error: Timeout occured while waiting for ${key}.`), timeout);
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
        expectAll(keys, timeout = 1000) {
            return Promise.all(keys.map((key) => this.expect(key, timeout)));
        }

        /**
         * Creates and returns a promise, which will resolve into the requested
         * value identified by key as soon as it is registered
         *
         * @param {String} key
         * @returns {Promise}
         */
        await(key) {
            return this.expect(key, 0);
        }

        /**
         * Creates and returns a promise, which will resolve into all of the requested
         * values identified by keys as soon as all of them are registered.
         *
         * @param {String[]} keys
         * @returns {Promise}
         */
        awaitAll(keys) {
            return Promise.all(keys.map((key) => this.await(key)));
        }

        /**
         * Registers an item
         *
         * @param {} value
         * @param {String} key
         * @returns {Registry}
         */
        register(value, key = '') {
            // Handle batch registration
            if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
                Object.keys(value).forEach((key) => this.register(key, value));
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
        registerAll(itemMap) {
            Object.keys(itemMap).forEach((name) => this.register(itemMap[name], name));

            return this;
        }
    }

    //
    // Create the `registry` factory function.
    // This factory will create a new instance of the `registry` and exposes the API
    //
    let registry = () => {
        let registry = new Registry();

        //
        // Shard the actual front-facing API (for not leaking private methods and properties).
        //
        let api = {
            register: (value, key = '') => registry.register(value, key),
            registerAll: (itemMap) => registry.registerAll(itemMap),
            get: (key) => registry.get(key),
            getAll: (keys) => registry.getAll(keys),
            expect: (key, timeout = 1000) => registry.expect(key, timeout),
            expectAll: (keys, timeout = 1000) => registry.expectAll(keys, timeout),
            await: (key) => registry.await(key),
            awaitAll: (keys) => registry.awaitAll(keys)
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
}
