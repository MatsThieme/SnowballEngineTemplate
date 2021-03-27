import { GameTime } from '../../GameTime';
import { Collision } from '../../Physics/Collision';
import { Physics } from '../../Physics/Physics';
import { Vector2 } from '../../Utilities/Vector2';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { CircleCollider } from './CircleCollider';
import { Collider } from './Collider';
import { Component } from './Component';
import { PolygonCollider } from './PolygonCollider';

/**@category Component */
export class RigidBody extends Component {
    private static _nextID = 0;
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

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.RigidBody);
        this._mass = 0;
        this.useAutoMass = false;
        this.velocity = new Vector2();
        this.angularVelocity = 0;
        this.torque = 0;
        this.force = new Vector2();
        this._inertia = this.computeInertia();
        this.freezePosition = false;
        this.freezeRotation = false;

        this.id = RigidBody._nextID++;
    }

    public get mass(): number {
        return this.useAutoMass ? this.autoMass : this._mass;
    }
    public set mass(val: number) {
        this._mass = val;
        this.velocity = new Vector2();
    }

    public get invMass(): number {
        return this.mass === 0 ? 0 : 1 / this.mass;
    }

    public get invInertia(): number {
        return this.inertia === 0 ? 0 : 1 / this.inertia;
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
    public update(currentCollisions: Collision[]): void {
        if (this.mass === 0 || !this.gameObject.active || !this.active) return;


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

            this.gameObject.transform.position.add(...solvedCollisions.map(c => c.project));
        }


        this.force.add(Physics.gravity);


        this.velocity.add(this.force.clone.scale(this.invMass * GameTime.deltaTime * Physics.timeScale));
        this.force = Vector2.zero;

        this.angularVelocity += this.torque * this.invInertia * GameTime.deltaTime * Physics.timeScale;
        this.torque = 0;


        if (!this.freezePosition) this.gameObject.transform.position.add(this.velocity.clone.scale(GameTime.deltaTime / 1000 * Physics.timeScale));
        if (!this.freezeRotation) this.gameObject.transform.rotation.radian += this.angularVelocity * GameTime.deltaTime / 1000 * Physics.timeScale;
    }
}