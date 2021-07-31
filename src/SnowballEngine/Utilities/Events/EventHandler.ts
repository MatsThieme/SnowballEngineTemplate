/** @category Utility */
export class EventHandler<T extends unknown[]> {
    private static _nextID: number = 0;

    public readonly id: number;
    public readonly handler: (...args: T) => any | Promise<any>;

    /**
     * 
     * Stores a callback and an identifier.
     * For use on an EventTarget.
     * An instance can be used multiple times and on different EventTargets.
     * 
     */
    public constructor(handler: (...args: T) => any | Promise<any>, bindScope?: ThisParameterType<(...args: T) => any | Promise<any>>) {
        this.id = EventHandler._nextID++;
        if (bindScope) handler = handler.bind(bindScope);
        this.handler = handler;
    }
}