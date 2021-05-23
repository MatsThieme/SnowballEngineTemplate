import { Destroyable } from 'GameObject/Destroy';
import { Composite, Engine, Events } from 'matter-js';
import { Client } from 'SnowballEngine/Client';
import { GameTime } from 'SnowballEngine/GameTime';
import { Scene } from 'SnowballEngine/Scene';
import { Canvas } from 'Utility/Canvas/Canvas';
import { Vector2 } from 'Utility/Vector2';

export class Physics implements Destroyable {
    public readonly engine: Engine;
    public drawDebug: boolean;
    public readonly gravity: Vector2;
    private readonly _canvas: Canvas;
    private _lastDelta: number = 1000 / 60;

    /**
     * 
     * Used to scale matterjs' size dependent options like gravity and body.slop
     * default = 0.001
     * 
     */
    public worldScale: number;

    public constructor() {
        this.drawDebug = false;
        this.worldScale = 0.001;

        this.gravity = new Vector2(0, -0.01 * this.worldScale);

        this.engine = Engine.create();
        this.engine.world.gravity.y = 0;
        this.engine.enableSleeping = false;


        Events.on(this.engine, 'collisionStart', event => {
            for (const pair of event.pairs) {
                Events.trigger(pair.bodyA, 'collisionStart', event);
                Events.trigger(pair.bodyB, 'collisionStart', event);
            }
        });
        Events.on(this.engine, 'collisionActive', event => {
            for (const pair of event.pairs) {
                Events.trigger(pair.bodyA, 'collisionActive', event);
                Events.trigger(pair.bodyB, 'collisionActive', event);
            }
        });
        Events.on(this.engine, 'collisionEnd', event => {
            for (const pair of event.pairs) {
                Events.trigger(pair.bodyA, 'collisionEnd', event);
                Events.trigger(pair.bodyB, 'collisionEnd', event);
            }
        });


        this._canvas = new Canvas(innerWidth, innerHeight);
        this._canvas.style.zIndex = '1';

        document.body.appendChild(this._canvas);
    }

    public get positionIterations(): number {
        return this.engine.positionIterations;
    }
    public set positionIterations(val: number) {
        this.engine.positionIterations = val;
    }

    public get velocityIterations(): number {
        return this.engine.velocityIterations;
    }
    public set velocityIterations(val: number) {
        this.engine.velocityIterations = val;
    }

    public get constraintIterations(): number {
        return this.engine.constraintIterations;
    }
    public set constraintIterations(val: number) {
        this.engine.constraintIterations = val;
    }

    public get timeScale(): number {
        return this.engine.timing.timeScale;
    }
    public set timeScale(val: number) {
        this.engine.timing.timeScale = val;
    }

    private debugDraw(position: IVector2, size: IVector2): void {
        if (this._canvas.width !== Client.resolution.x) this._canvas.width = Client.resolution.x;
        if (this._canvas.height !== Client.resolution.y) this._canvas.height = Client.resolution.y;

        const ctx = this._canvas.context2D();

        const bodies = Composite.allBodies(this.engine.world);
        const parts = bodies.flatMap(b => b.parts);

        const scale = { x: ctx.canvas.width / size.x, y: -ctx.canvas.height / size.y };

        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = '#3a3a3a';
        ctx.font = (this._canvas.width + this._canvas.height) / 20 + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Physics debug view', this._canvas.width / 2, this._canvas.height / 2);

        ctx.beginPath();

        for (let i = 0; i < parts.length; i++) {
            const vertices = parts[i].vertices;

            if (!vertices.length) continue;

            ctx.moveTo((vertices[0].x + position.x) * scale.x + ctx.canvas.width / 2, (vertices[0].y + position.y) * scale.y + ctx.canvas.height / 2);

            for (let j = 1; j < vertices.length; j++) {
                ctx.lineTo((vertices[j].x + position.x) * scale.x + ctx.canvas.width / 2, (vertices[j].y + position.y) * scale.y + ctx.canvas.height / 2);
            }

            ctx.lineTo((vertices[0].x + position.x) * scale.x + ctx.canvas.width / 2, (vertices[0].y + position.y) * scale.y + ctx.canvas.height / 2);
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        ctx.fillStyle = '#fff';

        for (let i = 0; i < parts.length; i++) {
            const vertices = parts[i].vertices;
            if (!vertices.length) continue;

            for (let j = 0; j < vertices.length; j++) {
                ctx.beginPath();
                ctx.arc((vertices[j].x + position.x) * scale.x + ctx.canvas.width / 2, (vertices[j].y + position.y) * scale.y + ctx.canvas.height / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }


    public update(): void {
        Engine.update(this.engine, GameTime.deltaTime, GameTime.deltaTime / this._lastDelta);
        this._lastDelta = GameTime.deltaTime;

        if (this.drawDebug) {
            const camera = Scene.currentScene.cameraManager.cameras[0];

            if (camera) this.debugDraw(camera.gameObject.transform.position, camera.size);

            if (this._canvas.style.visibility === 'hidden') this._canvas.style.visibility = 'visible';
        } else if (this._canvas.style.visibility !== 'hidden') {
            this._canvas.style.visibility = 'hidden';
        }
    }

    public destroy(): void {
        this._canvas.remove();
        Engine.clear(this.engine);
    }
}