import { DisplayObject } from "@pixi/display";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Angle } from "Utility/Angle";
import { EventHandler } from "@snowballengine/events";
import { Vector2 } from "Utility/Vector2";
import { Component, ComponentEventTypes } from "../Component";
import { TransformRelation } from "./TransformRelation";

export type TransformEventTypes = {
    /** Triggered when position, rotation or scale were modified by the engine */
    modifiedinternal: [
        transform: Transform,
        positionDifference?: Readonly<IVector2>,
        rotationDifference?: Readonly<IAngle>,
        scaleDifference?: Readonly<IVector2>
    ];
    /** Triggered when position, rotation or scale of the parent transform were modified by the engine */
    parentmodifiedinternal: [
        transform: Transform,
        positionDifference?: Readonly<IVector2>,
        rotationDifference?: Readonly<IAngle>,
        scaleDifference?: Readonly<IVector2>
    ];
    /** Triggered when position, rotation or scale were modified, excluding changes made by the engine */
    modified: [
        transform: Transform,
        positionDifference?: Readonly<IVector2>,
        rotationDifference?: Readonly<IAngle>,
        scaleDifference?: Readonly<IVector2>
    ];
    /** Triggered when position, rotation or scale of the parent transform were modified, excluding changes made by the engine */
    parentmodified: [
        transform: Transform,
        positionDifference?: Readonly<IVector2>,
        rotationDifference?: Readonly<IAngle>,
        scaleDifference?: Readonly<IVector2>
    ];
    /** Triggered when position, rotation or scale were modified */
    change: [
        transform: Transform,
        positionDifference?: Readonly<IVector2>,
        rotationDifference?: Readonly<IAngle>,
        scaleDifference?: Readonly<IVector2>
    ];
    /** Triggered when position, rotation or scale of the parent transform were modified */
    parentchange: [
        transform: Transform,
        positionDifference?: Readonly<IVector2>,
        rotationDifference?: Readonly<IAngle>,
        scaleDifference?: Readonly<IVector2>
    ];
} & ComponentEventTypes;

/** @category Component */
export class Transform extends Component<TransformEventTypes> implements Transformable {
    public position: Vector2;
    public rotation: Angle;
    public scale: Vector2;

    private _prevPosition: Vector2;
    private _prevRotation: Angle;
    private _prevScale: Vector2;

    private _globalTransform?: Transformable;

    private readonly engineModified: { position?: Vector2; rotation?: Angle; scale?: Vector2 };

    public readonly id: number;

    private static _nextID = 0;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Transform);

        this.position = new Vector2();
        this.rotation = new Angle();
        this.scale = new Vector2(1, 1);

        this._prevPosition = new Vector2();
        this._prevRotation = new Angle();
        this._prevScale = new Vector2(1, 1);

        this.engineModified = {};

        this.id = Transform._nextID++;

        this.addListener("change", new EventHandler(this.onChange, this));
        this.addListener("parentchange", new EventHandler(this.onChange, this));
        this.addListener("modified", new EventHandler(this.onModified, this));
        this.addListener("parentmodified", new EventHandler(this.onModified, this));
        this.addListener("modifiedinternal", new EventHandler(this.onModifiedInternal, this));
        this.addListener("parentmodifiedinternal", new EventHandler(this.onModifiedInternal, this));
    }

    public get children(): Transform[] {
        return this.gameObject.getComponentsInChildren(ComponentType.Transform);
    }

    public get parent(): Transform | undefined {
        return this.gameObject.parent?.transform;
    }

    /**
     * Set position, rotation and scale without triggering the modified event.
     * Used by Rigidbody to set position, rotation and scale. Needed to track if a body needs to be updated.
     * @internal
     */
    public internalSet(position?: IVector2, rotation?: IAngle, scale?: IVector2): void {
        if (position && !this.position.equal(position)) {
            this.position.copy(position);
            this.engineModified.position = Vector2.from(position);
        }

        if (rotation && !this.rotation.equal(rotation)) {
            this.rotation.copy(rotation);
            this.engineModified.rotation = new Angle(rotation.radian);
        }

        if (scale && !this.scale.equal(scale)) {
            this.scale.copy(scale);
            this.engineModified.scale = Vector2.from(scale);
        }
    }

    private onChange(
        transform: Transform,
        posDiff?: Readonly<IVector2>,
        rotDiff?: Readonly<IAngle>,
        scaleDiff?: Readonly<IVector2>
    ) {
        this._globalTransform = undefined;

        for (const child of this.children) {
            child.dispatchEvent("parentchange", transform, posDiff, rotDiff, scaleDiff);
        }
    }

    private onModified(
        transform: Transform,
        posDiff?: Readonly<IVector2>,
        rotDiff?: Readonly<IAngle>,
        scaleDiff?: Readonly<IVector2>
    ) {
        for (const child of this.children) {
            child.dispatchEvent("parentmodified", transform, posDiff, rotDiff, scaleDiff);
        }
    }

    private onModifiedInternal(
        transform: Transform,
        posDiff?: Readonly<IVector2>,
        rotDiff?: Readonly<IAngle>,
        scaleDiff?: Readonly<IVector2>
    ) {
        for (const child of this.children) {
            child.dispatchEvent("parentmodifiedinternal", transform, posDiff, rotDiff, scaleDiff);
        }
    }

    /**
     * Transform into this local space
     *
     * @param tranform
     * @returns
     */
    public toLocal(tranform: Transformable): Transformable {
        return Transform.toLocal(tranform, this);
    }

    /**
     *
     * Returns a new Transformable object.
     * The result is cached until position, rotation or scale are modified.
     */
    public toGlobal(): Transformable {
        if (!this._globalTransform) this._globalTransform = Transform.toGlobal(this);

        return Transform.clone(this._globalTransform);
    }

    protected override earlyUpdate(): void {
        let posDiff;
        let rotDiff;
        let scaleDiff;

        if (!this.position.equal(this._prevPosition)) {
            posDiff = this.position.clone.sub(this._prevPosition);
            this._prevPosition = this.position.clone;
        }
        if (!this.rotation.equal(this._prevRotation)) {
            rotDiff = new Angle(this.rotation.radian - this._prevRotation.radian);
            this._prevRotation = this.rotation.clone;
        }
        if (!this.scale.equal(this._prevScale)) {
            scaleDiff = this.scale.clone.sub(this._prevScale);
            this._prevScale = this.scale.clone;
        }

        const positionSetByEngine =
            this.engineModified.position && this.engineModified.position.equal(this.position);
        const rotationSetByEngine =
            this.engineModified.rotation && this.engineModified.rotation.equal(this.rotation);
        const scaleSetByEngine = this.engineModified.scale && this.engineModified.scale.equal(this.scale);

        if (posDiff || rotDiff || scaleDiff) {
            this.dispatchEvent("change", this, posDiff, rotDiff, scaleDiff);

            if (
                (posDiff && !positionSetByEngine) ||
                (rotDiff && !rotationSetByEngine) ||
                (scaleDiff && !scaleSetByEngine)
            ) {
                this.dispatchEvent(
                    "modified",
                    this,
                    !positionSetByEngine ? posDiff : undefined,
                    !rotationSetByEngine ? rotDiff : undefined,
                    !scaleSetByEngine ? scaleDiff : undefined
                );
            }

            if (
                (posDiff && positionSetByEngine) ||
                (rotDiff && rotationSetByEngine) ||
                (scaleDiff && scaleSetByEngine)
            ) {
                this.dispatchEvent(
                    "modifiedinternal",
                    this,
                    positionSetByEngine ? posDiff : undefined,
                    rotationSetByEngine ? rotDiff : undefined,
                    scaleSetByEngine ? scaleDiff : undefined
                );
            }
        }

        this.gameObject.transform.engineModified.position =
            this.gameObject.transform.engineModified.scale =
            this.gameObject.transform.engineModified.rotation =
                undefined;
    }

    /**
     * Find the relation between two transformables
     * Returns undefined if no relation was found
     *
     * @param transform1
     * @param transform2
     */
    public static findRelation(
        transform1: ITransformable,
        transform2: ITransformable
    ): TransformRelation | undefined {
        if (transform1.id === transform2.id) return;

        let thParent = 1;
        let lastTransform: ITransformable | undefined = transform2.parent;

        while (lastTransform) {
            if (lastTransform.id === transform1.id) {
                return {
                    transform1,
                    transform2,
                    thParentOf2: thParent
                };
            }

            lastTransform = lastTransform.parent;
            thParent++;
        }

        thParent = 1;
        lastTransform = transform1.parent;

        while (lastTransform) {
            if (lastTransform.id === transform2.id) {
                return {
                    transform1,
                    transform2,
                    thParentOf1: thParent
                };
            }

            lastTransform = lastTransform.parent;
            thParent++;
        }

        return;
    }

    /**
     * Transform position, scale and rotation to another transforms space
     * Looks for a relation between the two transforms, it uses Transform.toChild, Transform.toParent and Transform.toSibling to transform 'transform' into the space of 'localTransform'
     *
     * @param transform The Transform that should be transformed to the local space of localTransform
     * @param localTransform The target Transform space
     * @param relation transform = transform1, localTransform = transform2; will be computed if not provided
     */
    public static toLocal(
        transform: ITransformable,
        localTransform: ITransformable,
        relation?: TransformRelation
    ): Transformable {
        if (
            !relation ||
            (relation.thParentOf1 !== undefined && relation.thParentOf2 !== undefined) ||
            relation.transform1.id !== transform.id ||
            relation.transform2.id !== localTransform.id
        )
            relation = Transform.findRelation(transform, localTransform);

        if (!relation) {
            let parentCounter = 0;
            let lastParent = localTransform.parent;

            while (lastParent) {
                parentCounter++;
                lastParent = lastParent.parent;
            }

            const globalTransform = Transform.toGlobal(transform);

            return Transform.toLocal(globalTransform, localTransform, {
                transform1: globalTransform,
                transform2: localTransform,
                thParentOf2: parentCounter
            });
        }

        const transformIsChild = relation.thParentOf2 === undefined;

        const childTransform = Transform.clone(transformIsChild ? relation.transform1 : relation.transform2);
        const parentTransform = Transform.clone(transformIsChild ? relation.transform2 : relation.transform1);

        // create a linked list containing the transforms in transform to localTransform order
        const transforms: ITransformable[] = [childTransform];

        while (transforms[transforms.length - 1].parent?.parent) {
            transforms.push(Transform.clone(transforms[transforms.length - 1].parent!));
        }

        /** true == transform and localTransform are not in a parent-child relation */
        const siblings =
            (transforms[transforms.length - 1].parent &&
                transforms[transforms.length - 1].parent!.id !== parentTransform.id) ||
            !transform.parent ||
            !localTransform.parent; // TEST

        if (siblings)
            transforms.push(transforms[transforms.length - 1].parent || Transform.createTransformable());
        else transforms.push(parentTransform);

        for (let i = 0; i < transforms.length - 1; i++) {
            transforms[i].parent = transforms[i + 1];
        }

        if (!transformIsChild) transforms.reverse();

        // transform transforms using toParent or toChild to transform into local space
        let currentTransform!: ITransformable;

        if (siblings) {
            currentTransform = parentTransform;

            for (const t of transforms) {
                currentTransform = Transform.toSibling(currentTransform, t);
            }
        } else {
            for (const t of transforms) {
                if (!currentTransform) {
                    currentTransform = t;
                    continue;
                }

                if (transformIsChild) {
                    currentTransform = Transform.toParent(currentTransform, t);
                } else {
                    currentTransform = Transform.toChild(currentTransform, t);
                }
            }
        }

        return <Transformable>currentTransform;
    }

    /**
     * Transforms child into parent space
     * Does not check child.parent == parent
     *
     * @param child
     * @param parent
     */
    public static toParent(child: ITransformable, parent: ITransformable): Transformable {
        return {
            position: Vector2.from(parent.position).add(
                Vector2.from(child.position)
                    .scale(parent.scale)
                    .rotateAroundBy(new Vector2(), new Angle(parent.rotation.radian))
            ),
            rotation: new Angle(parent.rotation.radian + child.rotation.radian),
            scale: Vector2.from(child.scale).scale(parent.scale),
            parent: parent.parent,
            id: Transform._nextID++
        };
    }

    /**
     * Transforms parent into child space
     * Does not check child.parent == parent
     *
     * @param child
     * @param parent
     */
    public static toChild(parent: ITransformable, child: ITransformable): Transformable {
        const scale = Vector2.divide(parent.scale, child.scale);

        return {
            position: Vector2.from(child.position)
                .flip()
                .scale(scale)
                .rotateAroundBy(new Vector2(), new Angle(-child.rotation.radian)),
            rotation: new Angle(-child.rotation.radian),
            scale: scale,
            parent,
            id: Transform._nextID++
        };
    }

    /**
     * Transforms a Transformable into a siblings space
     *
     * @param sibling
     * @param targetSibling
     * @param parent optionally pass the parent of the siblings, necessary if siblings are not global(have parent) and !sibling.parent && !targetSibling.parent
     */
    public static toSibling(
        sibling: ITransformable,
        targetSibling: ITransformable,
        parent: ITransformable | undefined = sibling.parent || targetSibling.parent
    ): Transformable {
        return {
            position: parent
                ? Vector2.divide(Vector2.sub(sibling.position, targetSibling.position), parent.scale)
                : Vector2.sub(sibling.position, targetSibling.position),
            rotation: new Angle(sibling.rotation.radian - targetSibling.rotation.radian),
            scale: Vector2.divide(targetSibling.scale, sibling.scale),
            parent: targetSibling,
            id: Transform._nextID++
        };
    }

    public static toGlobal(transform: ITransformable): Transformable {
        if (!transform.parent) return Transform.clone(<Transformable>transform);

        while (transform.parent) {
            transform = Transform.toParent(transform, transform.parent);
        }

        return <Transformable>transform;
    }

    public static fromPIXI(pixiObject: DisplayObject, parent?: Transformable): Transformable {
        return {
            position: new Vector2(pixiObject.position.x, -pixiObject.position.y),
            rotation: new Angle(pixiObject.rotation),
            scale: Vector2.from(pixiObject.scale),
            parent,
            id: pixiObject.__transformID__ || (pixiObject.__transformID__ = Transform._nextID++)
        };
    }

    public static clone(transformable: ITransformable, cloneParents = false): Transformable {
        return {
            position: Vector2.from(transformable.position),
            rotation: new Angle(transformable.rotation.radian),
            scale: Vector2.from(transformable.scale),
            parent:
                cloneParents && transformable.parent
                    ? Transform.clone(transformable.parent, true)
                    : transformable.parent,
            id: transformable.id
        };
    }

    public static equalValues(t1: ITransformable, t2: ITransformable): boolean {
        return (
            Vector2.from(t1.position).equal(t2.position) &&
            Vector2.from(t1.scale).equal(t2.scale) &&
            new Angle(t1.rotation.radian).equal(t2.rotation)
        );
    }

    public static createTransformable(
        position = new Vector2(),
        scale = new Vector2(1, 1),
        rotation = new Angle(),
        parent?: ITransformable,
        id = Transform._nextID++
    ): Transformable {
        return { position: position, scale: scale, rotation: rotation, id, parent };
    }
}
