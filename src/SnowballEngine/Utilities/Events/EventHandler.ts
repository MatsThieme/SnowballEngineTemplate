/** @category Utility */
export class EventHandler<T extends unknown[]> {
    private static _nextID: number = 0;

    public readonly id: number;
    public readonly handler: (...args: T) => any | Promise<any>;

    public constructor(handler: (...args: T) => any | Promise<any>, bindScope?: ThisParameterType<(...args: T) => any | Promise<any>>) {
        this.id = EventHandler._nextID++;
        if (bindScope) handler = handler.bind(bindScope);
        this.handler = handler;
    }
}