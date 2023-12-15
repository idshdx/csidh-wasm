export function _allocateAndOperate (module, memorySize, operation) {
    let memoryPtr = null;

    try {
        memoryPtr = module._malloc(memorySize);
        return operation(memoryPtr);
    } catch (e) {
        throw e;
    } finally {
        if (memoryPtr) module._free(memoryPtr);
    }
}

export function _copyArray (originalArray) {
    return originalArray.slice();
}

export function _isTypedArray (variable) {
    return variable && ArrayBuffer.isView(variable) && !(variable instanceof DataView);
}

export function _convertBase64ToArrayBuffer (base64String) {
    if (typeof base64String !== 'string') throw new Error("Input must be a Base64 encoded string");
    try {
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (e) {
        throw e
    }
}