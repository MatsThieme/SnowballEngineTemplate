/** @category Utility */
export class EventHandler<
    T extends unknown[],
    U extends unknown = unknown,
    Handler extends (...args: T) => U = (...args: T) => U
> {
    private static _nextID = 0;

    public readonly id: string;
    public readonly handler: Handler;

    /**
     *
     * Stores a callback and an identifier.
     * For use on an EventTarget.
     * An instance can be used multiple times and on different EventTargets.
     *
     */
    public constructor(handler: Handler, bindScope?: ThisParameterType<Handler>) {
        this.id = String(EventHandler._nextID++);
        if (bindScope) handler = handler.bind(bindScope) as Handler;
        this.handler = handler;
    }
}
