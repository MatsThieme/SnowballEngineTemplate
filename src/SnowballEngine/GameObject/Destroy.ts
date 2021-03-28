/** @category Scene */
export function Destroy(destroyable: Destroyable) {
    destroyable.destroy();
}

/** @category Scene */
export interface Destroyable {
    destroy(): void;
}