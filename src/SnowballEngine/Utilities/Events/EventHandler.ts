export class EventHandler<T extends unknown[]> {
    private static _nextID: number = 0;

    public readonly id: number;
    public readonly handler: (...args: T) => void | Promise<void>;

    public constructor(handler: (...args: T) => void | Promise<void>) {
        this.id = EventHandler._nextID++;
        this.handler = handler;
    }
}