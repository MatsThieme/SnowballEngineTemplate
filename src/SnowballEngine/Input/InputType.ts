const props = new Map<string, number>();
const nums = new Map<number, string>();

let counter = 0;

const handler = {
    get: function (target: any, property: string) {
        if (props.has(property)) return props.get(property);
        if (!isNaN(<any>property)) return nums.get(parseInt(property));

        props.set(property, counter);
        nums.set(counter, property);

        return counter++;
    }
};

(<any>window).InputType = new Proxy({}, handler);

export default {};