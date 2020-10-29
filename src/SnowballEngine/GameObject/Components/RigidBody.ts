import { GameTime } from '../../GameTime.js';
import { Collision } from '../../Physics/Collision.js';
import { Physics } from '../../Physics/Physics.js';
import { Vector2 } from '../../Vector2.js';
import { GameObject } from '../GameObject.js';
import { CircleCollider } from './CircleCollider.js';
import { Collider } from './Collider.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';
import { PolygonCollider } from './PolygonCollider.js';

export class RigidBody extends Component {
    private static nextID: number = 0;
    private id: number;
    private _mass: number;
    private _inertia: number;
    /**
     * 
     * Velocity should not be modified directly, consider applying an impulse or change force.
     * 
     */
    public velocity: Vector2;
    /**
    *
    * AngularVelocity should not be modified directly, consider applying an impulse or change torque.
    *
    */
    public angularVelocity: number;
    public force: Vector2;
    public torque: number;
    /**
     * 
     * Specifies whether this rigidbody should compute its mass or use the mass property.
     * 
     */
    public useAutoMass: boolean;
    public freezePosition: boolean;
    public freezeRotation: boolean;
    public constructor(gameObject: GameObject, mass: number = 0, useAutoMass: boolean = false) {
        super(gameObject, ComponentType.RigidBody);
        this._mass = mass;
        this.useAutoMass = useAutoMass;
        this.velocity = new Vector2();
        this.angularVelocity = 0;
        this.torque = 0;
        this.force = new Vector2();
        this._inertia = this.computeInertia();
        this.freezePosition = false;
        this.freezeRotation = false;

        this.id = RigidBody.nextID++;
    }
    public get mass(): number {
        return this.useAutoMass ? this.autoMass : this._mass;
    }
    public get invMass(): number {
        return this.mass === 0 ? 0 : 1 / this.mass;
    }
    public get invInertia(): number {
        return this.inertia === 0 ? 0 : 1 / this.inertia;
    }
    public set mass(val: number) {
        this._mass = val;
        this.velocity = new Vector2();
    }
    public get centerOfMass(): Vector2 {
        return Vector2.average(...this.gameObject.getComponents<Collider>(ComponentType.Collider).map(c => c.position));
    }
    public get autoMass(): number {
        return this.gameObject.getComponents<Collider>(ComponentType.Collider).reduce((t, c) => t += c.autoMass, 0);
    }
    public get inertia(): number {
        return this._inertia;
    }
    private computeInertia(): number {
        const collider = <(CircleCollider | PolygonCollider)[]>this.gameObject.collider;
        if (collider.length === 0) return 0;

        let inertia = 0;
        for (const c of collider) {
            if (c.type === ComponentType.CircleCollider) {
                inertia += 0.5 * this.mass * (<CircleCollider>c).radius ** 2;
            } else if (c.type === ComponentType.PolygonCollider && 'vertices' in c) {

                for (let i = 0; i < c.vertices.length - 1; i++) {
                    const A = c.vertices[i];
                    const B = c.vertices[i + 1];

                    const mass_tri = c.density * 0.5 * Math.abs(Vector2.cross(A, B));
                    const inertia_tri = mass_tri * (A.magnitudeSquared + B.magnitudeSquared + Vector2.dot(A, B)) / 6;
                    inertia += inertia_tri;
                }

            }
        }

        return inertia;
    }
    public updateInertia(): void {
        this._inertia = this.computeInertia();
    }

    /**
     * 
     * Apply an impulse at a relative position.
     * 
     */
    public applyImpulse(impulse: Vector2, at: Vector2 = Vector2.zero): void {
        this.velocity.add(impulse.clone.scale(this.invMass));
        //this.angularVelocity += this.invInertia * Vector2.cross(at, impulse);
    }

    /**
     * 
     * Apply forces.
     * 
     */
    public update(gameTime: GameTime, currentCollisions: Collision[]): void {
        if (this.mass === 0 || !this.gameObject.active) return;


        const solvedCollisions = [];
        const contactPoints = [];

        for (const collision of currentCollisions) {
            if (collision.solved) {
                if (collision.A.gameObject.rigidbody.id === this.id) {
                    solvedCollisions.push(collision.solved.A);
                    if (collision.contactPoints) contactPoints.push(...collision.contactPoints);
                } else if (collision.B.gameObject.rigidbody.id === this.id) {
                    solvedCollisions.push(collision.solved.B);
                    if (collision.contactPoints) contactPoints.push(...collision.contactPoints);
                }
            }
        }

        if (solvedCollisions.length > 0) {
            for (const _c of solvedCollisions)
                for (const c of _c.impulses)
                    this.applyImpulse(c.impulse, c.at);

            this.gameObject.transform.relativePosition.add(...solvedCollisions.map(c => c.project));
        }


        this.force.add(Physics.gravity);


        this.velocity.add(this.force.clone.scale(this.invMass * gameTime.deltaTime * Physics.timeScale));
        this.force = Vector2.zero;

        this.angularVelocity += this.torque * this.invInertia * gameTime.deltaTime * Physics.timeScale;
        this.torque = 0;


        if (!this.freezePosition) this.gameObject.transform.relativePosition.add(this.velocity.clone.scale(gameTime.deltaTime / 1000 * Physics.timeScale));
        if (!this.freezeRotation) this.gameObject.transform.relativeRotation.radian += this.angularVelocity * gameTime.deltaTime / 1000 * Physics.timeScale;
    }
}