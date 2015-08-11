var buildTools = require('@reduct/build-tools');
var Registry = require('../../Dist/Registry.js');

var chai = buildTools.chai;
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

    it('should expose methods to query the existence of objects asynchronously', function test (done) {
        var registry = new Registry();

        expect(registry.expect).to.be.a('function');
        expect(registry.await).to.be.a('function');

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

});