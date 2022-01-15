/** @category Utility */
export class EventHandler<
    Args extends unknown[],
    Handler extends (...args: Args) => void = (...args: Args) => void
> {
    private static _nextID = 0;

    public readonly id: string;
    public readonly handler: Handler;

    /**
     * Stores a callback and an identifier.
     * For use on an EventTarget.
     * An instance can be used multiple times and on different EventTargets.
     */
    public constructor(handler: Handler, bindScope?: ThisParameterType<Handler>) {
        this.id = String(EventHandler._nextID++);
        if (bindScope) handler = handler.bind(bindScope) as Handler;
        this.handler = handler;
    }
}
