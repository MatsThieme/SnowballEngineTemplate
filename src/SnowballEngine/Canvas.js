export function Canvas(width, height) {
    const c = document.createElement('canvas');

    c.width = width;
    c.height = height;

    return c;
}