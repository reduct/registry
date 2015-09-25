# @reduct/registry

> Defines a set of objects and exposes methods to operate on that


## Install
With npm, use the familiar syntax e.g.:
```shell
npm install @reduct/registry --save
```

once the registry package is installed, just require it in your application file.
```js
const registry = require('@reduct/registry');
```

This package also supports AMD/RequireJS. Aren't using AMD or CommonJS? Just grab a [release](https://github.com/reduct/registry/releases), include the `Dist/Registry.min.js` and access the registry via the following global:
```js
const registry = window.reduct.registry;
```


## API
#### registry.register();
Type: `Function` <br>
Argument `item`: `*` <br>
Argument `alias`: `String` <br>
Returns: `Registry` The registry itself (for enabling method chaining)

Registers a single item in the registry. If no alias is provided, it tries to guess the name of the item, which basically means, that if you're passing a function, it'll use the function name as the alias. Since es2015 classes are just sugar for functions acting as constructors, this applies for classes too.

#### registry.registerAll();
Type: `Function` <br>
Argument `itemMap`: `Object` <br>
Returns: `Registry` The registry itself (for enabling method chaining)

Registers multiple items at once. The object keys of `itemMap` will act as aliases and the values as items.

#### registry.get();
Type: `Function` <br>
Argument `alias`: `String` <br>
Returns: `*`

Retrieves the item with the given alias from the registry. An error will be thrown, if the item doesn't exist.

#### registry.getAll();
Type: `Function` <br>
Argument `aliases`: `Array` <br>
Returns: `Array`

Retrieves multiple items with the given aliases from the registry. An error will be thrown, if any of these items doesn't exist.

#### registry.await();
Type: `Function` <br>
Argument `alias`: `String` <br>
Returns: `Promise`

Returns a Promise that will resolve as soon as an item gets registered under the given alias.

#### registry.awaitAll();
Type: `Function` <br>
Argument `aliases`: `Array` <br>
Returns: `Promise`

Returns a Promise that will resolve as soon as all items identified by an array of aliases are getting registered.

#### registry.expect();
Type: `Function` <br>
Argument `alias`: `String` <br>
Argument `timeout`: `Number` <br>
Returns: `Promise`

Returns a Promise that will resolve as soon as an item gets registered under the given alias. The Promise will be rejected after `timeout` milliseconds, if until then no item got registered.

#### registry.expectAll();
Type: `Function` <br>
Argument `aliases`: `Array` <br>
Argument `timeout`: `Number` <br>
Returns: `Promise`

Returns a Promise that will resolve as soon as all items identified by an array of aliases are getting registered. The Promise will be rejected after `timeout` milliseconds, if until then no item got registered.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.

## License
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
