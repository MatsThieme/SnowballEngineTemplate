import { Collider } from '../GameObject/Components/Collider.js';
import { ComponentType } from '../GameObject/Components/ComponentType.js';
import { TileMap } from '../GameObject/Components/TileMap.js';
import { Vector2 } from '../Vector2.js';

export class Collision {
    public readonly A: Collider | TileMap;
    public readonly B: Collider | TileMap;
    public readonly normal: Vector2 | undefined;
    public readonly penetrationDepth: number | undefined;
    public readonly contactPoints: Vector2[] | undefined;
    public readonly solved: Solved | undefined;
    public readonly e: number;
    public readonly df: number;
    public readonly sf: number;
    public constructor(colliderA: Collider | TileMap, colliderB: Collider | TileMap, normal?: Vector2, penetrationDepth?: number, contactPoints?: Vector2[]) {
        this.A = colliderA;
        this.B = colliderB;
        this.normal = normal?.normalized;
        this.penetrationDepth = penetrationDepth;
        this.contactPoints = contactPoints;

        this.e = (this.A.material.restitution + this.B.material.restitution) / 2;

        this.sf = (this.A.material.staticFriction + this.B.material.staticFriction) / 2;
        this.df = (this.A.material.dynamicFriction + this.B.material.dynamicFriction) / 2;


        if (colliderA.type !== ComponentType.TileMap && colliderB.type !== ComponentType.TileMap && this.normal && this.B.position.lowestDist(this.A.position.clone.add(this.normal), this.A.position.clone.add(this.normal.flipped)) === 1) this.normal.flip(); // always point from A to B


        this.solved = this.solve();
    }
    /**
     * 
     * Calculates the collision response (impulse and position projection).
     * 
     * onTrigger and onColliding are called from within.
     * 
     */
    private solve(): Solved | undefined {
        if (!this.normal) return;

        if ((<Collider>this.A).isTrigger || (<Collider>this.B).isTrigger) {
            if (this.A.type !== ComponentType.TileMap && (<Collider>this.A).isTrigger) (<Collider>this.A).onTrigger(this);
            if (this.B.type !== ComponentType.TileMap && (<Collider>this.B).isTrigger) (<Collider>this.B).onTrigger(this);

            return;
        }

        const rbA = this.A.gameObject.rigidbody;
        const rbB = this.B.gameObject.rigidbody;

        if (rbA.mass === 0 && rbB.mass === 0 || !this.normal || !this.contactPoints || !this.penetrationDepth) return;

        const impulsesA: { impulse: Vector2, at: Vector2 }[] = [];
        const impulsesB: { impulse: Vector2, at: Vector2 }[] = [];


        //const contact = Vector2.average(...this.contactPoints);
        //const ra: Vector2 = this.A.position.clone.sub(contact);
        //const rb: Vector2 = this.B.position.clone.sub(contact);


        //const vpA = rbA.velocity.clone.add(Vector2.cross1(rbA.angularVelocity, ra));
        //const vpB = rbB.velocity.clone.add(Vector2.cross1(rbB.angularVelocity, rb));

        //const rv = vpB.clone.sub(vpA);


        //if (Vector2.dot(rv, this.normal) > 0) return;


        const j = (-(1 + this.e) * Vector2.dot(rbB.velocity.clone.sub(rbA.velocity), this.normal)) / (rbA.invMass + rbB.invMass/* + Vector2.dot(Vector2.cross1(rbA.invInertia * Vector2.cross(ra, this.normal), ra).add(Vector2.cross1(rbB.invInertia * Vector2.cross(rb, this.normal), rb)), this.normal)*/);
        const impulse = this.normal.normalized.scale(j);


        //const t = rv.clone.sub(this.normal.clone.scale(Vector2.dot(rv, this.normal))).normalize();
        //const jt = -Vector2.dot(rv, t) / (rbA.invMass + rbB.invMass + Vector2.dot(Vector2.cross1(rbA.invInertia * Vector2.cross(ra, this.normal), ra).add(Vector2.cross1(rbB.invInertia * Vector2.cross(rb, this.normal), rb)), this.normal));
        //const tangentImpulse = Math.abs(jt) < j * this.sf ? t.clone.scale(jt) : t.clone.scale(-j).scale(this.df);


        impulsesA.push({ impulse: impulse.flipped, at: Vector2.zero });
        impulsesB.push({ impulse: impulse, at: Vector2.zero });

        //impulsesA.push({ impulse: tangentImpulse.flipped, at: ra });
        //impulsesB.push({ impulse: tangentImpulse, at: rb });

        if (this.A.type !== ComponentType.TileMap) (<Collider>this.A).onCollision(this);
        if (this.B.type !== ComponentType.TileMap) (<Collider>this.B).onCollision(this);


        const project = this.normal.clone.setLength(this.penetrationDepth / 2);

        return {
            collision: this,
            A: {
                impulses: impulsesA,
                project: (rbB.mass === 0 ? project.clone.scale(2) : project).flipped
            },
            B: {
                impulses: impulsesB,
                project: rbA.mass === 0 ? project.clone.scale(2) : project
            }
        };
    }
}

declare interface Solved {
    readonly collision: Collision;
    readonly A: {
        impulses: { impulse: Vector2, at: Vector2 }[];
        project: Vector2;
    };
    readonly B: {
        impulses: { impulse: Vector2, at: Vector2 }[];
        project: Vector2;
    };
}