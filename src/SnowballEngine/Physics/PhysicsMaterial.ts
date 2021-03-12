export class PhysicsMaterial {
    public restitution: number;
    public dynamicFriction: number;
    public staticFriction: number;

    public constructor(restitution = 1, dynamicFriction = 1, staticFriction = 1) {
        this.restitution = restitution;
        this.dynamicFriction = dynamicFriction;
        this.staticFriction = staticFriction;
    }
}