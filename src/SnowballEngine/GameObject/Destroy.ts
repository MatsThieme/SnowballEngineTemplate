export function Destroy(destroyable: Destroyable) {
    destroyable.destroy();
}

export interface Destroyable {
    destroy(): void;
}