# @reduct/registry

> Defines a set of objects and exposes methods to operate on that


## Install
With npm, use the familiar syntax e.g.:
```shell
npm install @reduct/registry --save
```

once the component package is installed, just require it in your application file.
```js
const registry = require('@reduct/registry');
```

This package also supports AMD/RequireJS. Aren't using AMD or CommonJS? Just grab a [release](https://github.com/reduct/logger/releases), include the `Dist/Logger.min.js` and access the logger via the following global:
```js
const registry = window.reduct.registry;
```


## API
#### logger.setLogLevel();
Type: `Function`
Argument `int`: `Number`

Will adjust the noise level which the logger creates. For example if you don't want to display warnings in production.
Set the logLevel to `1`.

| LogLevel    | Description                          |
| ----------- | ------------------------------------ |
| 0           | No messages are logged out.          |
| 1           | Only severe messages are logged out. |
| 2 (Default) | All messages are logged out.         |


#### logger.log();
Type: `Function`
Argument `message`: `String`
Argument `appendix`: `*`

If possible, logs out a message to the console object.
Optionally you can specify a appendix which could be a reference to a HTML Element, an object or even a function.

#### logger.info();
Type: `Function`
Argument `message`: `String`
Argument `appendix`: `*`

Basically the same as the basic log method, but tries to access the `info` method of the console API.

#### logger.warn();
Type: `Function`
Argument `message`: `String`
Argument `appendix`: `*`

Basically the same as the basic log method, but tries to access the `warn` method of the console API.

#### logger.error();
Type: `Function`
Argument `message`: `String`
Argument `appendix`: `*`

Will log an error to your console as well as throws an error afterwards since the `Error` object cant print out
objects, functions or HTML Elements.


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