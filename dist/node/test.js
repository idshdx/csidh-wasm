import CSIDH from "./index.js";
import assert from "assert";

const assertKeysEqual = (key1, key2, keyType) => {
    try {
        assert.deepStrictEqual(key1, key2);
        console.info(`The initial ${keyType} and encoded/decoded key are equal.`)
    } catch (e) {
        console.error(`The initial ${keyType} and encoded/decoded key are not equal `, e);
    }
}

const checkValidPublicKey = (lib, publicKey, publicKeyEncoded) => {
    try {
        assert.equal(lib.checkPublicKey(publicKey), 1);
        assert.equal(lib.checkPublicKey(publicKeyEncoded), 1);

        const invalidPK = lib.secretKey();
        assert.throws(() => lib.checkPublicKey(invalidPK), Error);
        console.log('Successfully checked if a PK is valid')
    } catch (e) {
        console.error('Checking if its a valid PK failed', e)
    }
}

const checkSharedKeysEqual = (lauraSS, glenSS) => {
    try {
        assert.deepStrictEqual(lauraSS, glenSS);
        console.info('The shared keys are equal.')
    } catch (e) {
        console.error('The shared keys are not equal ', e);
    }
}

(async function () {
    const csidh = await CSIDH();

    const lauraSecretKey = csidh.secretKey();
    const lauraPublicKey = csidh.publicKey(lauraSecretKey);

    const lauraSecretKeyEncoded = csidh.encodeBase64(lauraSecretKey);
    const lauraPublicKeyEncoded = csidh.encodeBase64(lauraPublicKey);

    const lauraSecretKeyDecoded = csidh.decodeBase64(lauraSecretKeyEncoded);
    const lauraPublicKeyDecoded = csidh.decodeBase64(lauraPublicKeyEncoded);

    assertKeysEqual(lauraSecretKey, lauraSecretKeyDecoded, "sk");
    assertKeysEqual(lauraPublicKey, lauraPublicKeyDecoded, "pk");
    checkValidPublicKey(csidh, lauraPublicKey, lauraPublicKeyEncoded);

    const glennSecretKey = csidh.secretKey();
    const glennPublicKey = csidh.publicKey(glennSecretKey);

    const lauraSharedKey = csidh.sharedKey(glennPublicKey, lauraSecretKey);
    const glennSharedKey = csidh.sharedKey(lauraPublicKey, glennSecretKey);

    checkSharedKeysEqual(lauraSharedKey, glennSharedKey);
})();
