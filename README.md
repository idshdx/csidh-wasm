# CSIDH-wasm.js

## A WebAssembly set of cryptographic primitives for CSIDH: post-quantum commutative group action

See https://csidh.isogeny.org/ for further information about CSIDH.


### About

WebAssembly port via Emscripten.

The c source is present in `src`, dated from 2021/06/27.

Supports 512 bits parameter set

Uses C arithmetic instead of assembly.

Experimental, use it accordingly.

Opinions are most welcomed.

### How to use

```
import CSIDH from "csidh-wasm"; // or from "./dist/node/index.js";

const csidh = await CSIDH(); // wait for the wasm runtime to initialize

const alice_sk = lib.secretKey(); 
const alice_pk = lib.publicKey(alice_sk);

const bob_sk = lib.secretKey(); 
const bob_pk = lib.publicKey(bob_sk);

const alice_ss = lib.sharedKey(bob_pk, alice_sk);
const bob_ss = lib.sharedKey(alice_pk, bob_sk);

const string_key = lib.encodeBase64(any_key);
const buffered_key = lib.decodeBase64(string_key);

const is_valid_pk = lib.checkPublicKey(string_pk) // true
const is_valid_also = lib.checkPublicKey(buffered_pk) // true

console.log(alice_sk.constructor.name); // Int8Array
console.log(alice_pk.constructor.name); // BigUint64Array
console.log(alice_ss.constructor.name); // BigUint64Array

```
Additionally, you can check [the tests file](./dist/node/test.js)  for examples

 ## License

Free as in liberty. [See file](LICENSE.md)


### Building

To build ensure you have [Emscripten](https://github.com/emscripten-core/emscripten) installed.

Run `emmake make` to build for node or `emmake make browser`

Run tests with `npm run test`  or `npm run test:browser` using webpack

### TO DO

- test and include the 1024 bits parameter set
- better browser support
- typescript support
- more tests
- benchmarks
- using assembly arithmetic code instead of C for node, browser, web workers envs
- use a script to download and build the tar.gz file from the original author`s site at https://csidh.isogeny.org/

