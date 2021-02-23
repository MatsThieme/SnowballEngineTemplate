import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';

export class CircleRenderer extends Component {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.CircleRenderer);

        throw new Error('not implemented.');
    }

    public get active(): boolean {
        throw new Error('Method not implemented.');
    }
    public set active(val: boolean) {
        throw new Error('Method not implemented.');
    }
}


//export class CircleRenderer extends Component {
//    private canvas: HTMLCanvasElement;
//    private context: CanvasRenderingContext2D;
//    private circleCollider: CircleCollider;
//    private _position: Vector2;
//    private size: Vector2;
//    /**
//    *
//    * For development.
//    *
//    */
//    public constructor(gameObject: GameObject) {
//        super(gameObject, ComponentType.CircleRenderer);

//        this.circleCollider = <CircleCollider>this.gameObject.getComponent<CircleCollider>(ComponentType.CircleCollider);

//        this.canvas = Canvas(this.circleCollider.radius * 2 * 100, this.circleCollider.radius * 2 * 100);
//        this.context = this.canvas.getContext('2d')!;

//        this.size = new Vector2(this.circleCollider.radius * 2, this.circleCollider.radius * 2);
//        this._position = new Vector2();

//        setTimeout(() => {
//            this.context.fillStyle = '#' + (~~(0xdddddd * Math.random()) + 0x111111).toString(16);
//            this.context.translate(0, this.canvas.height);
//            this.context.scale(1, -1);

//            this.context.beginPath();

//            const topLeft = new Vector2(this.circleCollider.position.x - this.circleCollider.radius, this.circleCollider.position.y + this.circleCollider.radius);

//            this.size = new Vector2(this.circleCollider.radius * 2, this.circleCollider.radius * 2);
//            this._position = new Vector2(topLeft.x, topLeft.y - this.circleCollider.radius * 2).sub(this.gameObject.transform.toGlobal().position).sub(this.circleCollider.align);


//            this.context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.height / 2, 0, Math.PI * 2);

//            this.context.closePath();
//            this.context.fill();
//        }, 100);
//    }
//    private get position(): Vector2 {
//        return this._position.clone.add(this.circleCollider.position).sub(this.circleCollider.relativePosition);
//    }
//    //public get currentFrame(): Frame | undefined {
//    //    return new Frame(this.position, this.size, new Sprite(this.canvas), this.gameObject.transform.rotation, this.gameObject.drawPriority, 1, undefined, this.circleCollider.position);
//    //}
//}