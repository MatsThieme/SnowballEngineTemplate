export class AsyncWorker {
    private url: string;
    public maxWorkers: number;
    private workers: Worker[];
    private queue: { data: any, resolve: (value?: any) => void, reject: (value?: any) => void }[];
    public constructor(url: string, maxWorkers: number) {
        this.url = url;
        this.maxWorkers = maxWorkers;
        this.workers = [];
        this.queue = [];
    }
    private async work(): Promise<void> {
        const worker = await this.getWorker();
        if (!worker || worker.onmessage || worker.onerror || this.queue.length === 0) return;

        const { data, resolve, reject } = this.queue.splice(0, 1)[0];

        worker.isBusy = true;

        worker.onerror = reject;
        worker.onmessage = async e => {
            worker.onmessage = worker.onerror = null;
            resolve(e.data);
            worker.isBusy = false;

            if (this.queue.length >= this.maxWorkers && this.workers.length < this.maxWorkers) this.workers.push((await this.createWorker(1))[0]);

            for (let i = 0; i < Math.min(this.queue.length, this.workers.length); i++)
                this.work();
        };

        worker.postMessage(data);
    }

    /**
     * 
     * The resolved Promise will return the data returned by the worker.
     * 
     * @param data Data to pass to the worker.
     * 
     */
    public task<T>(data: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ data, resolve, reject });
            this.work();
        });
    }
    private async getWorker(): Promise<Worker | void> {
        const w = this.workers.filter(w => !w.isBusy);

        if (w.length > 0) return w[~~(w.length * Math.random())];

        if ((this.workers.length || 0) < this.maxWorkers) return (await this.createWorker(1))[0];

        console.error('all workers are busy!');
    }
    public removeWorker(count: number): void {
        this.workers.sort((a, b) => (<any>a.isBusy) - (<any>b.isBusy)).splice(0, Math.min(count, this.workers.length)).forEach(w => w.postMessage('close'));
    }
    public createWorker(count: number): Promise<Worker[]> {
        return new Promise((resolve, reject) => {
            const w: Worker[] = [];

            let complete = 0;
            for (let i = 0; i < count; i++) {
                w[i] = <any>new Worker(this.url);
                w[i].isBusy = false;
                this.warmup(w[i]).then(() => {
                    if (++complete === count) resolve(w);
                });
            }

            this.workers.push(...w);
        });
    }
    private warmup(worker: Worker): Promise<void> {
        return new Promise((resolve, reject) => {
            worker.postMessage(undefined);
            worker.onmessage = () => {
                worker.onmessage = null;
                resolve();
            }
        });
    }
}


/**
 *
 * @internal
 *
 */

declare interface Worker extends EventTarget, AbstractWorker {
    isBusy: boolean;
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
    postMessage(message: any, transfer: Transferable[]): void;
    postMessage(message: any, options?: PostMessageOptions): void;
    terminate(): void;
    addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}