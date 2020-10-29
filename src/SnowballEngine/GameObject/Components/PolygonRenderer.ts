import { Frame } from '../../Camera/Frame.js';
import { Canvas } from '../../Canvas.js';
import { interval } from '../../Helpers.js';
import { Sprite } from '../../Sprite.js';
import { Vector2 } from '../../Vector2.js';
import { GameObject } from '../GameObject.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';
import { PolygonCollider } from './PolygonCollider.js';

export class PolygonRenderer extends Component {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private polygonCollider: PolygonCollider;
    private _position: Vector2;
    private size: Vector2;
    /**
     * 
     * For development.
     * 
     */
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.PolygonRenderer);

        this.polygonCollider = <PolygonCollider>this.gameObject.getComponent<PolygonCollider>(ComponentType.PolygonCollider);

        this.canvas = Canvas(this.polygonCollider.scaledSize.x * 1000, this.polygonCollider.scaledSize.y * 1000);
        this.context = this.canvas.getContext('2d')!;

        this.size = this.polygonCollider.scaledSize;
        this._position = new Vector2();

        interval(clear => {
            this.onDestroy = () => {
                clear();
                return true;
            };

            if (!this?.gameObject?.scene?.isRunning || this.gameObject.scene.ui.pauseScene) return;
            clear();

            this.polygonCollider = <PolygonCollider>this.gameObject.getComponent<PolygonCollider>(ComponentType.PolygonCollider);

            this.context.fillStyle = '#' + (~~(0xdddddd * Math.random()) + 0x111111).toString(16);
            this.context.translate(0, this.canvas.height);
            this.context.scale(1, -1);

            this.context.beginPath();

            const topLeft = new Vector2(Infinity, -Infinity);

            const vs = this.polygonCollider.vertices;

            for (const vertex of vs) {
                if (vertex.x < topLeft.x) topLeft.x = vertex.x;
                if (vertex.y > topLeft.y) topLeft.y = vertex.y;
            }

            const center = topLeft.clone.add(new Vector2(this.polygonCollider.scaledSize.x / 2, -this.polygonCollider.scaledSize.y / 2));

            for (const vertex of vs.map(v => v.sub(center))) {
                this.context.lineTo(this.canvas.width / 2 + vertex.x / this.polygonCollider.scaledSize.x * this.canvas.width, this.canvas.height / 2 + vertex.y / this.polygonCollider.scaledSize.y * this.canvas.height);
            }

            this.context.closePath();
            this.context.fill();


            this.size = this.polygonCollider.scaledSize;
            this._position = new Vector2(topLeft.x, topLeft.y - this.polygonCollider.scaledSize.y).sub(this.gameObject.transform.position).sub(this.polygonCollider.align);
        }, 100);
    }
    private get position(): Vector2 {
        return this._position.clone.add(this.polygonCollider.position).sub(this.polygonCollider.relativePosition);
    }
    public get currentFrame(): Frame | undefined {
        return new Frame(this.position, this.size, new Sprite(this.canvas), this.gameObject.transform.rotation, this.gameObject.drawPriority, 1, undefined, this.polygonCollider.position);
    }
}