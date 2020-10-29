import { Face } from '../../Physics/Face.js';
import { GameTime } from '../../GameTime.js';
import { AABB } from '../../Physics/AABB.js';
import { PhysicsMaterial } from '../../Physics/PhysicsMaterial.js';
import { Projection } from '../../Physics/Projection.js';
import { Vector2 } from '../../Vector2.js';
import { AlignH, AlignV } from '../Align.js';
import { GameObject } from '../GameObject.js';
import { Collider } from './Collider.js';
import { ComponentType } from './ComponentType.js';

export class PolygonCollider extends Collider {
    protected _aabb: AABB;
    protected _area: number;
    public scaledSize: Vector2;
    private _vertices: Vector2[];
    private _computedVertices: Vector2[];
    public faces: Face[];
    public constructor(gameObject: GameObject, relativePosition: Vector2 = new Vector2(), material: PhysicsMaterial = new PhysicsMaterial(), density: number = 1, vertices: Vector2[] = [new Vector2(0, 0), new Vector2(1, 1), new Vector2(0, 1), new Vector2(1, 0)], alignH: AlignH = AlignH.Center, alignV: AlignV = AlignV.Center, isTrigger: boolean = false) {
        super(gameObject, ComponentType.PolygonCollider, relativePosition, material, density, alignH, alignV, isTrigger);

        this.scaledSize = this.calculateSize(vertices);
        this._vertices = this.orderVertices(vertices);
        this.faces = this.calculateFaces(this._vertices);
        this._computedVertices = this._vertices;
        this._area = this.calculateArea();
        this._aabb = this.calculateAABB();
        this.gameObject.rigidbody.updateInertia();
        this._computedVertices = this._vertices.map(v => v.clone.scale(this.gameObject.transform.relativeScale).rotateAroundTo(new Vector2(), this.gameObject.transform.relativeRotation).add(this.position));
    }
    /**
     * 
     * Set the points describing the polygon, order is irrelevant.
     * 
     */
    public set vertices(vertices: Vector2[]) {
        this.scaledSize = this.calculateSize(vertices);
        this._vertices = this.orderVertices(vertices);
        this.faces = this.calculateFaces(this._vertices);
        this._area = this.calculateArea();
        this._aabb = this.calculateAABB();
        this.gameObject.rigidbody.updateInertia();
        this._computedVertices = this._vertices.map(v => v.clone.scale(this.gameObject.transform.relativeScale).rotateAroundTo(new Vector2(), this.gameObject.transform.relativeRotation).add(this.position));
    }
    /**
     * 
     * Get absolute positioned, scaled and rotated vertices.
     * 
     */
    public get vertices(): Vector2[] {
        return this._computedVertices;
    }

    /**
     * 
     * Center vertices around a point.
     * 
     */
    public centerPointsAt(vertices: Vector2[], point: Vector2 = new Vector2()): Vector2[] {
        const difference = Vector2.average(...vertices);

        for (const vertex of vertices) {
            vertex.sub(difference).add(point);
        }

        return vertices;
    }

    /**
     * 
     * Calculates the AABB size of vertices.
     * 
     */
    private calculateSize(vertices: Vector2[]): Vector2 {
        let maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity;

        for (const vertex of vertices) {
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.y > maxY) maxY = vertex.y;
        }

        return new Vector2(maxX - minX, maxY - minY);
    }

    /**
     * 
     * Order vertices clockwise.
     * 
     */
    private orderVertices(vertices: Vector2[]): Vector2[] {
        return this.centerPointsAt(vertices).sort((a, b) => Vector2.up.angleTo(new Vector2(), a).degree - Vector2.up.angleTo(new Vector2(), b).degree);
    }

    /**
     * 
     * Calculates the faces of a clockwise ordered vertices array.
     * 
     */
    private calculateFaces(vertices: Vector2[]): Face[] {
        const faces = [];

        for (let i = 0; i < vertices.length; i++) {
            faces.push(new Face(vertices[i], vertices[(i + 1) % vertices.length]));
        }

        return faces;
    }

    /**
     * 
     * Project this.vertices onto an axis, used in polygon intersection tests(Seperating Axis Theorem).
     * 
     */
    public project(axis: Vector2): Projection { // x=min, y=max
        let min = Infinity;
        let max = -Infinity;
        let minVertex!: Vector2;
        let maxVertex!: Vector2;


        for (const vertex of this.vertices) {
            const product = Vector2.dot(axis, vertex);
            if (product < min) {
                min = product;
                minVertex = vertex;
            }
            if (product > max) {
                max = product;
                maxVertex = vertex;
            }
        }

        return new Projection(min, max, minVertex, maxVertex);
    }

    /**
     * 
     * Calculates the area of the polygon described by this.vertices.
     * 
     */
    private calculateArea(): number {
        const vertices = this.vertices;
        let area = 0;

        for (let i = 1; i < vertices.length; i++) {
            area += (vertices[i - 1].x + vertices[i].x) * (vertices[i - 1].y - vertices[i].y);
        }

        return area / 2;
    }
    private calculateAABB(): AABB {
        const topLeft = new Vector2(Infinity, -Infinity);

        const vs = this.vertices;

        for (const vertex of vs) {
            if (vertex.x < topLeft.x) topLeft.x = vertex.x;
            if (vertex.y > topLeft.y) topLeft.y = vertex.y;
        }

        return new AABB(this.scaledSize, topLeft);
    }

    /**
     * 
     * Calculates vertices, faces, aabb.
     * 
     */
    public async update(gameTime: GameTime): Promise<void> {
        this._computedVertices = this._vertices.map(v => v.clone.scale(this.gameObject.transform.relativeScale).rotateAroundTo(new Vector2(), this.gameObject.transform.relativeRotation).add(this.position));
        this.faces = this.calculateFaces(this.vertices);
        this.scaledSize = this.calculateSize(this.vertices);
        this._aabb = this.calculateAABB();
    }
}