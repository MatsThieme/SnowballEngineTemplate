import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Bodies, Body, IChamferableBodyDefinition } from 'matter-js';
import { Vector2 } from 'Utility/Vector2';
import { Collider } from './Collider';

export class PolygonCollider extends Collider {
    private _verticies: IVector2[];

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.PolygonCollider);

        this._verticies = [];
    }

    public get verticies(): IVector2[] {
        return this._verticies;
    }
    public set verticies(val: IVector2[]) {
        this._verticies = val;

        this.rebuild();
    }

    protected buildBody(options: IChamferableBodyDefinition): Body {
        return this.setGameObjectOnBody(Bodies.fromVertices(0, 0, [this._verticies], { ...options, slop: 0.05 * this.gameObject.scene.physics.worldScale }, false, 0.001, 0.01));
    }

    public static sidesToVerticies(sides: [Vector2, Vector2][]): Vector2[] {
        return this.orderSides(sides).map(s => s[1]);
    }

    public static orderSides(sides: [Vector2, Vector2][]): [Vector2, Vector2][] {
        if (sides.length < 3) throw new Error('sides.length < 3');

        sides = sides.slice();
        const maxi = sides.length;

        const orderedSides: [Vector2, Vector2][] = [sides.splice(0, 1)[0]];

        for (let i = 1; i < maxi; i++) {
            const sideIndex = sides.findIndex(s => orderedSides[i - 1][1].equal(s[0]) || orderedSides[i - 1][1].equal(s[1]));

            if (sideIndex === -1) throw new Error('related side not found');

            const side = sides.splice(sideIndex, 1)[0];

            if (!side[0].equal(orderedSides[i - 1][1])) side.reverse();

            orderedSides.push(side);
        }

        return orderedSides;
    }
}