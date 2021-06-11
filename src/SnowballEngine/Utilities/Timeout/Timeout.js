export function Timeout(milliseconds) {
    let _reject;
    let _handle;

    const promise = new Promise((resolve, reject) => {
        _reject = reject;

        _handle = window.setTimeout(resolve, milliseconds);
    });

    promise.cancel = function () {
        window.clearTimeout(_handle);
        _reject();
    };

    return promise;
}