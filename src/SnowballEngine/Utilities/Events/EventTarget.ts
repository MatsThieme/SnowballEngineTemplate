import { EventHandler } from "./EventHandler";
import { EventType } from "./EventType";

/** @category Utility */
export class EventTarget<T extends EventType> {
    private readonly _events: {
        [U in keyof T]?: { [id: string]: EventHandler<T[U]> };
    };

    public constructor() {
        this._events = {};
    }

    /**
     * @param eventName A case-sensitive string representing the event type to listen for.
     */
    public addListener<U extends keyof T>(eventName: U, handler: EventHandler<T[U]>): void {
        if (!this._events[eventName]) this._events[eventName] = {};
        (this._events[eventName] as any)[handler.id] = handler;
    }

    public removeListener<U extends keyof T>(eventName: U, handler: EventHandler<T[U]>): void {
        if (this._events[eventName]) {
            delete this._events[eventName]![handler.id];

            let counter = 0;

            for (const key in this._events) {
                counter++;
            }

            if (counter === 0) delete this._events[eventName];
        }
    }

    public dispatchEvent<U extends keyof T>(eventName: U, ...args: T[U]): void {
        if (this._events[eventName]) {
            for (const id in this._events[eventName]) {
                this._events[eventName]![id].handler(...args);
            }
        }
    }

    /**
     * Creates a promise wrapper for an eventhandler.
     * Returns a promise which will resolve when the event is dispatched.
     */
    public getEventPromise<U extends keyof T>(eventName: U): Promise<T[U]> {
        return new Promise((resolve) => {
            const handler = new EventHandler<T[U]>((...args) => {
                this.removeListener(eventName, handler);
                resolve(args);
            });

            this.addListener(eventName, handler);
        });
    }

    public async *getAsyncGenerator<U extends keyof T>(eventName: U): AsyncGenerator<T[U], void, unknown> {
        let resolve: (args: T[U]) => void;

        const handler = new EventHandler<T[U]>((...args) => {
            this.removeListener(eventName, handler);
            resolve(args);
        });

        this.addListener(eventName, handler);

        try {
            while (true) {
                yield await new Promise((r) => (resolve = r));
            }
        } finally {
            this.removeListener(eventName, handler);
        }
    }

    public getEvents(): {
        readonly [U in keyof T]?: {
            readonly [id: number]: Readonly<EventHandler<T[U]>>;
        };
    } {
        return this._events;
    }
}
