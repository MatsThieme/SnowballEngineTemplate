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


        if (clearOnUnload) Interval.intervals.push(this);
    });

    promise.clear = function () {
        window.clearInterval(_handle);

        Interval.intervals.splice(Interval.intervals.findIndex(v => v.handle === this.handle), 1);

        _resolve();
    };

    return promise;
}

Interval.intervals = [];

Interval.clearAll = () => {
    for (let i = Interval.intervals.length - 1; i >= 0; i--) {
        Interval.intervals[i].clear();
    }
};