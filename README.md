# is-dom-detached [![NPM Version][npm-image]][npm-url] ![File Size][filesize-image] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Monitor][greenkeeper-image]][greenkeeper-url]

> Determine if a [`Node`](https://mdn.io/Node) does *not* exist within a DOM tree.


## Installation

[Node.js](http://nodejs.org) `>= 10` is required. To install, type this at the command line:
```shell
npm install is-dom-detached
```


## Importing

ES Module:
```js
import isDetachedNode from 'is-dom-detached';
```

CommonJS Module:
```js
const isDetachedNode = require('is-dom-detached');
```


## Usage

```js
const div = document.createElement('div');
isDetachedNode(div); //-> true

document.body.appendChild(div);
isDetachedNode(div); //-> false
````


[npm-image]: https://img.shields.io/npm/v/is-dom-detached.svg
[npm-url]: https://npmjs.com/package/is-dom-detached
[filesize-image]: https://img.shields.io/badge/size-490B%20gzipped-blue.svg
[travis-image]: https://img.shields.io/travis/stevenvachon/is-dom-detached.svg
[travis-url]: https://travis-ci.org/stevenvachon/is-dom-detached
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/is-dom-detached.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/is-dom-detached
[greenkeeper-image]: https://badges.greenkeeper.io/stevenvachon/is-dom-detached.svg
[greenkeeper-url]: https://greenkeeper.io/
