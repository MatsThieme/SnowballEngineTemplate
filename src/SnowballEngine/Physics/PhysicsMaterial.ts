export class PhysicsMaterial {
    public restitution: number;
    public dynamicFriction: number;
    public staticFriction: number;
    public constructor(restitution: number = 1, dynamicFriction: number = 1, staticFriction: number = 1) {
        this.restitution = restitution;
        this.dynamicFriction = dynamicFriction;
        this.staticFriction = staticFriction;
    }
}