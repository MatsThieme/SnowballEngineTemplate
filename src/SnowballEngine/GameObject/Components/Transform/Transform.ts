import { DisplayObject } from 'pixi.js';
import { Angle } from '../../../Angle';
import { Vector2 } from '../../../Vector2';
import { ComponentType } from '../../ComponentType';
import { GameObject } from '../../GameObject';
import { Component } from '../Component';
import { Transformable, TransformRealation } from './Transformable';

export class Transform extends Component implements Transformable {
    public position: Vector2;
    public rotation: Angle;
    public scale: Vector2;
    public parent?: Transform;

    public readonly id: number;

    private static nextID: number = 0;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Transform);

        this.position = new Vector2();
        this.rotation = new Angle();
        this.scale = new Vector2(1, 1);
        this.parent = gameObject.parent?.transform;

        this.id = Transform.nextID++;
    }

    public get children() {
        return this.gameObject.getComponentsInChildren(ComponentType.Transform);
    }

    public toLocal(tranform: Transformable): Transformable {
        return Transform.toLocal(tranform, this);
    }

    /**
     * 
     * Returns a new Transformable object
     * 
     */
    public toGlobal(): Transformable {
        return Transform.toGlobal(this);
    }

    /**
     * 
     * Find the relation between two transformables
     * Returns undefined if no relation was found
     * 
     * @param transform1
     * @param transform2
     * 
     */
    public static findRelation(transform1: Transformable, transform2: Transformable): TransformRealation | undefined {
        if (transform1.id === transform2.id) return;

        let thParent = 1;
        let lastTransform: Transformable | undefined = transform2.parent;

        while (lastTransform) {
            if (lastTransform.id === transform1.id) {
                return {
                    transform1,
                    transform2,
                    thParentOf2: thParent
                }
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
                }
            }

            lastTransform = lastTransform.parent;
            thParent++;
        }

        return;
    }

    /**
     * 
     * Transform position, scale and rotation to another transforms space
     * 
     * @param transform The Transform that should be transformed to the local space of localTransform
     * @param localTransform The target Transform space
     * @param relation transform = transform1, localTransform = transform2; will be computed if not provided
     * 
     */
    public static toLocal(transform: Transformable, localTransform: Transformable, relation?: TransformRealation): Transformable {
        if (!relation || relation.thParentOf1 !== undefined && relation.thParentOf2 !== undefined || relation.transform1.id !== transform.id || relation.transform2.id !== localTransform.id) relation = Transform.findRelation(transform, localTransform);

        if (!relation) {
            let parentCounter = 0;
            let lastParent = localTransform.parent;

            while (lastParent) {
                parentCounter++;
                lastParent = lastParent.parent;
            }


            const globalTransform = Transform.toGlobal(transform);

            return Transform.toLocal(globalTransform, localTransform, { transform1: globalTransform, transform2: localTransform, thParentOf2: parentCounter });
        }


        const transformIsChild = relation.thParentOf2 === undefined;

        const childTransform = Transform.clone(transformIsChild ? relation.transform1 : relation.transform2);
        const parentTransform = Transform.clone(transformIsChild ? relation.transform2 : relation.transform1);


        // create a linked list containing the transforms in transform to localTransform order
        const transforms = [childTransform];

        while (transforms[transforms.length - 1].parent?.parent) {
            transforms.push(Transform.clone(transforms[transforms.length - 1].parent!));
        }

        /** specifies that transform and localTransform are not in a parent-child relation */
        const siblings = transforms[transforms.length - 1].parent && transforms[transforms.length - 1].parent!.id !== parentTransform.id;


        if (siblings) transforms.push(transforms[transforms.length - 1].parent!);
        else transforms.push(parentTransform);


        for (let i = 0; i < transforms.length - 1; i++) {
            transforms[i].parent = transforms[i + 1];
        }


        if (!transformIsChild) transforms.reverse();



        // transform transforms using toParent or toChild to transform into local space
        let currentTransform!: Transformable;

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

        return currentTransform;
    }

    /**
     * 
     * Transforms child into parent space
     * Does not check child.parent == parent
     * 
     * @param child
     * @param parent
     * 
     */
    public static toParent(child: Transformable, parent: Transformable): Transformable {
        return {
            position: parent.position.clone.add(child.position.clone.scale(parent.scale).rotateAroundTo(new Vector2(), new Angle(parent.rotation.radian))),
            rotation: new Angle(parent.rotation.radian + child.rotation.radian),
            scale: child.scale.clone.scale(parent.scale),
            parent: parent.parent,
            id: Transform.nextID++
        };
    }

    /**
     * 
     * Transforms parent into child space
     * Does not check child.parent == parent
     * 
     * @param child
     * @param parent
     * 
     */
    public static toChild(parent: Transformable, child: Transformable): Transformable {
        const scale = Vector2.divide(1, child.scale).scale(parent.scale);

        return {
            position: child.position.flipped.scale(scale).rotateAroundTo(new Vector2(), new Angle(-child.rotation.radian)),
            rotation: new Angle(-child.rotation.radian),
            scale,//
            parent,
            id: Transform.nextID++
        };
    }

    /**
     *
     * TODO: review
     *
     *
     * @param sibling
     * @param targetSibling
     * @param parent optionally pass the parent of the siblings, necessary if !sibling.parent || !targetSibling.parent
     */
    public static toSibling(sibling: Transformable, targetSibling: Transformable, parent?: Transformable): Transformable {
        return {
            position: Vector2.divide(sibling.position.clone.sub(targetSibling.position), (parent || sibling.parent || targetSibling.parent)?.scale || new Vector2(1, 1))/*.scale(Vector2.divide(1, targetSibling.scale))*/, // ??? TODO: test rotation
            rotation: new Angle(sibling.rotation.radian - targetSibling.rotation.radian),
            scale: Vector2.divide(targetSibling.scale, sibling.scale),
            parent: targetSibling,
            id: Transform.nextID++
        }
    }

    public static toGlobal(transform: Transformable): Transformable {
        while (transform.parent) {
            transform = Transform.toParent(transform, transform.parent);
        }

        return transform;
    }

    public static fromPIXI(pixiObject: DisplayObject, parent?: Transformable): Transformable {
        return {
            position: new Vector2(pixiObject.position.x, -pixiObject.position.y),
            rotation: new Angle(pixiObject.rotation),
            scale: new Vector2().copy(pixiObject.scale),
            parent,
            id: (<any>pixiObject).__transformID__ || ((<any>pixiObject).__transformID__ = Transform.nextID++)
        };
    }

    public static clone(transformable: Transformable): Transformable {
        return {
            position: transformable.position.clone,
            rotation: transformable.rotation.clone,
            scale: transformable.scale.clone,
            parent: transformable.parent,
            id: transformable.id
        }
    }
}