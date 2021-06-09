import { EventHandler } from './EventHandler';
import { EventType } from './EventType';

/** @category Utility */
export class EventTarget<T extends EventType> {
    private readonly _events: { [U in keyof T]?: { [id: number]: EventHandler<T[U]> } };

    public constructor() {
        this._events = {};
    }

    public addListener<U extends keyof T>(eventName: U, handler: EventHandler<T[U]>): void {
        if (!this._events[eventName]) this._events[eventName] = {};
        this._events[eventName]![handler.id] = handler;
    }

    public removeListener<U extends keyof T>(eventName: U, handler: EventHandler<T[U]>): void {
        if (this._events[eventName]) {
            delete this._events[eventName]![handler.id];
            if (Object.keys(this._events[eventName]!).length === 0) delete this._events[eventName];
        }
    }

    public dispatchEvent<U extends keyof T>(eventName: U, ...args: T[U]): void | Promise<void[]> {
        if (this._events[eventName]) return Promise.all(Object.keys(this._events[eventName]!).map(id => this._events[eventName]![<any>id].handler(...args)));
    }

    /**
     * 
     * Creates a promise wrapper for an eventhandler.
     * Returns a promise which will resolve when the event is dispatched.
     *  
     */
    public getEventPromise<U extends keyof T>(eventName: U): Promise<void> {
        return new Promise(resolve => {
            const handler = new EventHandler(() => {
                this.removeListener(eventName, handler);
                resolve();
            });

            this.addListener(eventName, handler);
        });
    }

    public getEvents(): { readonly [U in keyof T]?: { readonly [id: number]: Readonly<EventHandler<T[U]>> } } {
        return this._events;
    }
}