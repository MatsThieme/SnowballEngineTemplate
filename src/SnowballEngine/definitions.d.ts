/**
 *
 * SnowballEngineConfig.json values stored in window.project
 * 
 * @internal
 *
 */
declare const project: {
    readonly title: string,
    readonly description: string,
    readonly version: string,
    readonly settings: {
        readonly allowContextMenu: boolean,
        readonly isDevelopmentBuild: boolean
    },
    readonly "cordova-settings": {
        readonly id: string,
        readonly author: {
            readonly name: string,
            readonly email: string,
            readonly href: string
        },
        readonly Fullscreen: boolean,
        readonly Orientation: 'default' | 'landscape' | 'portrait',
        readonly KeepRunning: boolean,
        readonly plugins: ReadonlyArray<string>
    }
};

/** @internal */
declare interface Worker extends EventTarget, AbstractWorker {
    isBusy: boolean;
    id: number;
    finished: number;
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
    postMessage(message: any, transfer: Transferable[]): void;
    postMessage(message: any, options?: PostMessageOptions): void;
    terminate(): void;
    addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

/** @internal */
type Constructor<T> = Function & { prototype: T, new(...args: any[]): T };
/** @internal */
type AbstractConstructor<T> = Function & { prototype: T };

declare enum InputType {
    Trigger = Infinity,
    PointerPosition,
}