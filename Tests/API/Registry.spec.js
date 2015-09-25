var buildTools = require('@reduct/build-tools');
var Registry = require('../../Dist/Registry.js');

var chai = buildTools.chai;
var spies = buildTools.spies;

chai.use(spies);

var expect = chai.expect;


describe('@reduct/registry: The "Registry"', function suite () {

    /**
     * A primitive value.
     */
    var justSomePrimitiveValue = 42;

    /**
     * An anonymous function. This should not be able to be registered without an explicit alias.
     */
    var anAnonymousFunction = function () {};

    /**
     * A named function. This should be able to be registered without an explicit alias.
     */
    var aNamedFunction = function funcName () {
    };

    it('should expose methods to register objects', function test (done) {
        var registry = new Registry();

        expect(registry.register).to.be.a('function');
        expect(registry.registerAll).to.be.a('function');

        done();
    });

    it('should expose methods to query the existence of objects synchronously', function test (done) {
        var registry = new Registry();

        expect(registry.get).to.be.a('function');

        done();
    });

    it('should expose methods to query the existence of multiple objects at once synchronously', function test (done) {
        var registry = new Registry();

        expect(registry.getAll).to.be.a('function');

        done();
    });

    it('should expose methods to query the existence of objects asynchronously', function test (done) {
        var registry = new Registry();

        expect(registry.expect).to.be.a('function');
        expect(registry.await).to.be.a('function');

        done();
    });

    it('should expose methods to query the existence of multiple objects at once asynchronously', function test (done) {
        var registry = new Registry();

        expect(registry.expectAll).to.be.a('function');
        expect(registry.awaitAll).to.be.a('function');

        done();
    });

    it('should expose methods for namespace usage', function test (done) {
        var registry = new Registry();

        expect(registry.namespace).to.be.a('function');
        expect(registry.use).to.be.a('function');

        done();
    });

    it('should register a function and make it available via its name', function test (done) {
        var registry = new Registry();
        registry.register(aNamedFunction);

        expect(Object.keys(registry.items).length).to.equal(1);
        expect(Object.keys(registry.items)[0]).to.equal('funcName');

        expect(registry.get('funcName')).to.equal(aNamedFunction);

        done();
    });

    it('should register a primitive and make it available via a given alias', function test (done) {
        var registry = new Registry();
        registry.register(justSomePrimitiveValue, 'someAlias');

        expect(Object.keys(registry.items).length).to.equal(1);
        expect(Object.keys(registry.items)[0]).to.equal('someAlias');

        expect(registry.get('someAlias')).to.equal(justSomePrimitiveValue);

        done();
    });

    it('should complain if an unnamed item is registered without an alias', function test (done) {
        var registry = new Registry();

        expect(function registerPrimitiveWithoutAlias () {
            registry.register(justSomePrimitiveValue);
        }).to.throw('@reduct/registry Error: Could not guess name of registered item. Please specify an explicit alias.');

        expect(function registerPrimitiveWithoutAlias () {
            registry.register(anAnonymousFunction);
        }).to.throw('@reduct/registry Error: Could not guess name of registered item. Please specify an explicit alias.');

        done();
    });

    it('should register multiple items at once', function test (done) {
        var registry = new Registry();
        registry.registerAll({
            'a': 'aaa',
            'b': 'bbb',
            'c': 'ccc'
        });

        expect(Object.keys(registry.items).length).to.equal(3);

        expect(Object.keys(registry.items)[0]).to.equal('a');
        expect(Object.keys(registry.items)[1]).to.equal('b');
        expect(Object.keys(registry.items)[2]).to.equal('c');

        expect(registry.get('a')).to.equal('aaa');
        expect(registry.get('b')).to.equal('bbb');
        expect(registry.get('c')).to.equal('ccc');

        done();
    });

    it('should complain if a requested item cannot be found', function test (done) {
        var registry = new Registry();

        expect(function callGetWithoutHavingRegisteredTheRequestedItem () {
            registry.get('someKey');
        }).to.throw('@reduct/registry Error: Could not find someKey.');

        done();
    });

    it('should retrieve multiple objects at once synchronously', function test (done) {
        var registry = new Registry();

        registry.registerAll({
            'a': 'aaa',
            'b': 'bbb',
            'c': 'ccc'
        });

        var result = registry.getAll(['a', 'b', 'c']);

        expect(result[0]).to.equal('aaa');
        expect(result[1]).to.equal('bbb');
        expect(result[2]).to.equal('ccc');

        done();
    });

    it('should inform listeners as soon as a requested item is registered', function test (done) {
        var registry = new Registry();
        var afterSomeKeyHasBeenRegistered = chai.spy();

        registry.await('someKey').then(afterSomeKeyHasBeenRegistered).then(function assert () {
            expect(afterSomeKeyHasBeenRegistered).to.have.been.called.once;
            expect(afterSomeKeyHasBeenRegistered).to.have.been.called.with('someValue');

            done();
        });

        expect(Object.keys(registry.deferred).length).to.equal(1);

        registry.register('someValue', 'someKey');
    });

    it('should inform listeners as soon as a requested item is registered within a given timeframe', function test (done) {
        var registry = new Registry();
        var afterSomeKeyHasBeenRegistered = chai.spy();
        var afterTimeoutOccurred = chai.spy();

        registry.expect('someKey', 22).then(afterSomeKeyHasBeenRegistered).then(function assert () {
            expect(afterSomeKeyHasBeenRegistered).to.have.been.called.once;
            expect(afterSomeKeyHasBeenRegistered).to.have.been.called.with('someValue');

            expect(afterTimeoutOccurred).to.have.been.called.once;
            expect(afterTimeoutOccurred).to.have.been.called.with('@reduct/registry Error: Timeout occured while waiting for someOtherKey.');

            done();
        });

        registry.expect('someOtherKey', 20).catch(afterTimeoutOccurred);

        expect(Object.keys(registry.deferred).length).to.equal(2);

        setTimeout(function registerValues () {
            registry.register('someValue', 'someKey');
            registry.register('someOtherValue', 'someOtherKey');
        }, 21);
    });

    it('should retrieve multiple objects at once asynchronously', function test (done) {
        var registry = new Registry();
        var afterAllHaveBeenRegistered = chai.spy();

        registry.awaitAll(['a', 'b', 'c']).then(afterAllHaveBeenRegistered).then(function assert () {
            expect(afterAllHaveBeenRegistered).to.have.been.called.once;
            expect(afterAllHaveBeenRegistered).to.have.been.called.with(['aaa', 'bbb', 'ccc']);

            done();
        });

        registry.registerAll({
            'a': 'aaa',
            'b': 'bbb',
            'c': 'ccc'
        });
    });

    it('should retrieve multiple objects at once asynchronously within a given timeframe', function test (done) {
        var registry = new Registry();
        var afterAllHaveBeenRegistered = chai.spy();
        var afterTimeoutOccurred = chai.spy();

        registry.expectAll(['a', 'b'], 22).then(afterAllHaveBeenRegistered).then(function assert () {
            expect(afterAllHaveBeenRegistered).to.have.been.called.once;
            expect(afterAllHaveBeenRegistered).to.have.been.called.with(['aaa', 'bbb']);

            expect(afterTimeoutOccurred).to.have.been.called.once;
            expect(afterTimeoutOccurred).to.have.been.called.with('@reduct/registry Error: Timeout occured while waiting for c.');

            done();
        });

        registry.expectAll(['c', 'd'], 20).catch(afterTimeoutOccurred);

        setTimeout(function registerValues () {
            registry.register('aaa', 'a');
            registry.register('bbb', 'b');
            registry.register('ccc', 'c');
            registry.register('ddd', 'd');
        }, 21);
    });

    it('should expose a namespaced version of its API', function test (done) {
        var registry = new Registry();
        var namespacedRegistry = registry.namespace('abc');

        expect(namespacedRegistry.register).to.be.a('function');
        expect(namespacedRegistry.registerAll).to.be.a('function');
        expect(namespacedRegistry.get).to.be.a('function');
        expect(namespacedRegistry.getAll).to.be.a('function');
        expect(namespacedRegistry.await).to.be.a('function');
        expect(namespacedRegistry.awaitAll).to.be.a('function');
        expect(namespacedRegistry.expect).to.be.a('function');
        expect(namespacedRegistry.expectAll).to.be.a('function');

        expect(namespacedRegistry.namespace).not.to.be.a('function');
        expect(namespacedRegistry.use).not.to.be.a('function');

        done();
    });

    it('should expose a namespaced version of its API in form of a callback parameter', function test (done) {
        var registry = new Registry();

        registry.use('abc', function namespacedCallback (namespacedRegistry) {
            expect(namespacedRegistry.register).to.be.a('function');
            expect(namespacedRegistry.registerAll).to.be.a('function');
            expect(namespacedRegistry.get).to.be.a('function');
            expect(namespacedRegistry.getAll).to.be.a('function');
            expect(namespacedRegistry.await).to.be.a('function');
            expect(namespacedRegistry.awaitAll).to.be.a('function');
            expect(namespacedRegistry.expect).to.be.a('function');
            expect(namespacedRegistry.expectAll).to.be.a('function');

            expect(namespacedRegistry.namespace).not.to.be.a('function');
            expect(namespacedRegistry.use).not.to.be.a('function');

            done();
        });
    });

    it('should register a namespaced version of an item', function test (done) {
        var registry = new Registry();

        registry.namespace('abc').register('aaa', 'a');
        expect(registry.get('abc/a')).to.equal('aaa');
        expect(registry.namespace('abc').get('a')).to.equal('aaa');

        registry.use('def', function namespacedCallback (namespacedRegistry) {
            namespacedRegistry.register('bbb', 'b');
            expect(namespacedRegistry.get('b')).to.equal('bbb');
        });

        expect(registry.get('def/b')).to.equal('bbb');
        expect(registry.namespace('def').get('b')).to.equal('bbb');

        done();
    });
});
