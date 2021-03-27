export function Timeout(milliseconds) {
    let _reject;
    let _handle;

    const promise = new Promise((resolve, reject) => {
        _reject = reject;

        _handle = setTimeout(resolve, milliseconds);
    });

    promise.cancel = function () {
        clearTimeout(_handle);
        _reject();
    }

    return promise;
}