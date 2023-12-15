import {_copyArray, _allocateAndOperate, _isTypedArray, _convertBase64ToArrayBuffer} from './utils.js';
import Module from "./csidh-wasm.js";
if(!Module && Module.postRun) throw new Error("Exported wasm JS file not found");


const CSIDH = async() => {
    const module = await Module();
    if(
        !module._free ||
        !module._malloc ||
        !module.HEAP8 ||
        !module.HEAPU64 ||
        !module._create_sk ||
        !module._create_pk ||
        !module._create_ss ||
        !module._create_pk_validated ||
        !module._create_ss_validated ||
        !module._check_pk ||
        !module.getValue
    ) {
        throw new Error("wasm initialisation error, check if the module is properly imported/exported");
    }

    const BYTE_SIZE_UNIT8 = 1;
    const BYTE_SIZE_UINT64 = 8;
    const NUM_PRIMES = 74;  // As per the 512 bits params.h file
    const LIMBS = 8; // As per 512bits params.h file

    const SK_SIZE = NUM_PRIMES * BYTE_SIZE_UNIT8;
    const PK_SIZE = LIMBS * BYTE_SIZE_UINT64;
    const secretKey = function () {
        return _allocateAndOperate(module, SK_SIZE, (skPtr) => {
            skPtr = module._create_sk();
            const sk = new Int8Array(module.HEAP8.buffer, skPtr, SK_SIZE);
            // Creates a separate copy of the array from Wasm memory to avoid potential issues with memory deallocation
            return _copyArray(sk);
        });
    }
    const publicKey = function(sk) {
        return _allocateAndOperate(module, SK_SIZE, (skPtr) => {
            module.HEAP8.set(sk, skPtr);
            const pkPtr = module._create_pk(skPtr);
            const pk = new BigUint64Array(module.HEAPU64.buffer, pkPtr, LIMBS);
            return _copyArray(pk);
        });
    }
    const sharedKey = function (pk2, sk1) {
        return _allocateAndOperate(module, PK_SIZE, (pkPtr) => {
            return _allocateAndOperate(module, SK_SIZE, (skPtr) => {
                module.HEAPU64.set(pk2, pkPtr / BYTE_SIZE_UINT64);
                module.HEAP8.set(sk1, skPtr);
                const ssPtr = module._create_ss(pkPtr, skPtr);
                const ss = new BigUint64Array(module.HEAPU64.buffer, ssPtr, LIMBS);
                return _copyArray(ss);
            });
        });
    };

    const checkPublicKey = function(pk) {
        if (!_isTypedArray(pk)) pk = decodeBase64(pk);

        return _allocateAndOperate(module, PK_SIZE, (pkPtr) => {
            module.HEAPU64.set(pk, pkPtr / BYTE_SIZE_UINT64);
            const isValid = module._check_pk(pkPtr);
            return Boolean(isValid);
        });
    }

    const encodeBase64 = function(typedArray) {
        if(!_isTypedArray(typedArray)) throw new Error("Input must be a typed array key");
        try {
            const bytes = new Uint8Array(typedArray.buffer);
            const chars = Array.from(bytes).map(byte => String.fromCharCode(byte));
            return btoa(chars.join(''));
        } catch (e) {
            throw e;
        }
    }

    const decodeBase64 = function(base64String) {
        if (typeof base64String !== 'string') throw new Error("Input must be a Base64 encoded string key");
        try {
            const arrayBuffer = _convertBase64ToArrayBuffer(base64String);
            switch (arrayBuffer.byteLength) {
                case SK_SIZE:
                    return new Int8Array(arrayBuffer);
                case PK_SIZE:
                    return new BigUint64Array(arrayBuffer);
                default:
                    throw new Error("Base64 string does not correspond to the expected byte lengths");
            }
        } catch (e) {
            throw e;
        }
    }

    //todo revisit
    const cExitCode = function() {
        try {
            const errorCodePtr = module._error_code;
            const errorCodeValue = module.getValue(errorCodePtr, 'i32');
            switch (errorCodeValue) {
                case -1:
                    console.error('invalid pk generated');
                    return 'invalid pk generated';
                case -2:
                    console.error('invalid ss generated');
                    return -2;
                case -3:
                    console.error('null pointer input');
                    return -3;
                case -4:
                    console.error('sk memory allocation error');
                    return -4;
                case -5:
                    console.error('ss memory allocation error');
                    return -5;
                case 0:
                default:
                    console.info('no errors');
            }
        } catch (e) {
            throw e;
        }
    }

    return { secretKey, publicKey, sharedKey, checkPublicKey, encodeBase64, decodeBase64, cExitCode }
}
export default CSIDH

