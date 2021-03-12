
interface Window {
    /**
     *
     * SnowballEngineConfig.json values stored in window.project
     * 
     * @internal
     *
     */
    project: Project;
}

declare const project: Project;

declare interface Project {
    readonly title: string,
    readonly description: string,
    readonly version: string,
    readonly settings: {
        readonly allowContextMenu: boolean,
        readonly PIXIjsAntialiasing: boolean,
        readonly transparentBackground: boolean
    },
    readonly "cordova-settings": {
        readonly id: string,
        readonly author: {
            readonly name: string,
            readonly email: string,
            readonly href: string
        },
        readonly plugins: readonly string[]
    },
    readonly build: {
        readonly isDevelopmentBuild: boolean,
        readonly addNewAssetsToDB: boolean
    }
}


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
type Constructor<T extends Record<string, any>> = new (...args: any[]) => T;
/** @internal */
type AbstractConstructor<T> = Function & { prototype: T };

interface IVector2 {
    x: number;
    y: number;
}
