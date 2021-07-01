export function Interval(cb, milliseconds, clearOnUnload = true) {
    let _resolve;
    let _handle;
    let _counter = 0;

    const promise = new Promise((resolve, reject) => {
        _resolve = resolve;

        _handle = window.setInterval(async () => {
            await cb(promise);
            _counter++;
        }, milliseconds);
    });

    promise.clear = function (i) {
        window.clearInterval(_handle);

        i = i !== undefined ? i : Interval.intervals.findIndex(v => v.handle === this.handle);

        if (i !== -1) Interval.intervals.splice(i, 1);

        _resolve();
    };

    if (clearOnUnload) Interval.intervals.push(promise);

    return promise;
}

Interval.intervals = [];

Interval.clearAll = () => {
    for (let i = Interval.intervals.length - 1; i > 0; i--) {
        Interval.intervals[i].clear(i);
    }
};