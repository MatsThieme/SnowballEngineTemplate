/** @category Utility */
export class Timeout extends Promise<void> {
    public readonly handle: number;

    /**
     * Resolves after milliseconds.
     * Safe minimum = 4ms
     * @param milliseconds milliseconds to wait before resolve.
     */
    public constructor(milliseconds: number);

    /**
     * Cancel the timeout and reject the promise.
     */
    public cancel(): void;
}
