export function Canvas(width, height) {
    const c = document.createElement('canvas');

    c.width = width;
    c.height = height;

    let ctx;

    c.context2D = () => {
        if (!ctx) ctx = c.getContext('2d');

        if (!ctx) throw new Error('HTMLCanvasElement.getContext(\'2d\') === null');

        return ctx;
    };

    return c;
}