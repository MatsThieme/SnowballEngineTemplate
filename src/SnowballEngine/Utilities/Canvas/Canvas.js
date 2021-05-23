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

    function findId() {
        let id = '' + Math.random + performance.now();

        while (document.getElementById(id)) {
            id = '' + Math.random + performance.now();
        }

        return id;
    }

    return c;
}