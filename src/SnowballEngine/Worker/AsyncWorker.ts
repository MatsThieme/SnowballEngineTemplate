import { D } from '../Debug';
import { interval, stopwatch } from '../Helpers';

/**
 * 
 * postMessage in a webworker has to use this signature for the returned object: { status: 'failed' | 'finished' | 'progress', data: any }
 * 
 */
export class AsyncWorker {
    public maxWorkers: number;

    private nextID: number;

    private url: string;

    private readonly workers: Worker[];
    private readonly queue: { data: any, progress?: (data: any) => any, resolve: (value?: any) => void, reject: (value?: any) => void }[];

    /**
     *
     * Milliseconds a worker should be destroyed after it finished a task.
     * 
     */
    public expirationTime: number;
    public constructor(url: string, maxWorkers: number = 1, expirationTime: number = 1000) {
        this.url = url;

        this.maxWorkers = maxWorkers;

        this.workers = [];
        this.queue = [];

        this.nextID = 0;
        this.expirationTime = expirationTime;
    }

    /**
     * 
     * The resolved Promise will return the data returned by the worker.
     * 
     * @param data Data to pass to the worker.
     * @param progress progress will be called when the worker sends a progress message: { status: 'progress', data: any }
     * 
     */
    public task(data: any, progress?: (data: any) => any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push({ data, progress, resolve, reject });
            this.work();
        });
    }

    private async work(): Promise<void> {
        const worker = await this.getWorker();
        if (!worker || worker.isBusy || this.queue.length === 0) return;

        worker.isBusy = true;

        const { data, progress, resolve, reject } = this.queue.splice(0, 1)[0];

        let p = 0;

        worker.onerror = reject;
        worker.onmessage = async e => {
            if (e.data.status === 'progress') {
                if (progress) {
                    p++;
                    await progress(e.data?.data);
                    p--;
                }

                return;
            }

            if (p !== 0) {
                await new Promise<void>(resolve => {
                    interval(clear => {
                        if (p === 0) {
                            clear();
                            resolve();
                        }
                    }, 0.1);
                });
            }


            if (e.data.status === 'failed') reject(e.data?.data);

            if (e.data.status === 'finished') resolve(e.data?.data);

            this.workerFinished(worker);
        };

        worker.postMessage(data);
    }

    private async getWorker(): Promise<Worker | undefined> {
        const w = this.workers.filter(w => !w.isBusy);

        if (w.length > 0) return w[0];

        if (this.workers.length < this.maxWorkers) return await this.createWorker();

        return undefined;
    }

    private removeWorker(id: number): void {
        const i = this.workers.findIndex(v => v.id === id);
        if (i === -1) return;
        this.workers.splice(i, 1)[0].terminate();
    }

    private async createWorker(): Promise<Worker> {
        const worker = new Worker(this.url);

        worker.isBusy = true;
        worker.id = this.nextID++;

        this.workers.push(worker);

        await this.warmup(worker);

        return worker;
    }

    private workerFinished(worker: Worker, work: boolean = true): void {
        worker.onmessage = worker.onerror = null;
        worker.isBusy = false;

        const finished = worker.finished = performance.now();

        setTimeout(() => {
            if (!worker.isBusy && worker.finished === finished) {
                this.removeWorker(worker.id);
            }
        }, this.expirationTime);


        if (work) {
            for (let i = 0; i < Math.min(this.queue.length, this.maxWorkers); i++) {
                this.work();
            }
        }
    }

    private warmup(worker: Worker): Promise<void> {
        worker.isBusy = true;

        return new Promise((resolve, reject) => {
            worker.onmessage = () => {
                worker.onmessage = null;
                this.workerFinished(worker, false);
                resolve();
            };

            worker.postMessage(undefined);
        });
    }
}