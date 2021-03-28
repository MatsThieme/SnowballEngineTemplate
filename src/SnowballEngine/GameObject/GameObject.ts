import { Container } from '@pixi/display';
import { Debug } from '../Debug';
import { Collision } from '../Physics/Collision';
import { Scene } from '../Scene';
import { clearObject } from '../Utilities/Helpers';
import { Vector2 } from '../Utilities/Vector2';
import { Behaviour } from './Components/Behaviour';
import { Collider } from './Components/Collider';
import { Component } from './Components/Component';
import { RigidBody } from './Components/RigidBody';
import { Transform } from './Components/Transform/Transform';
import { ComponentType } from './ComponentType';

/**
 * 
 * Created gameObjects correspond to the currently loaded Scene. A Scene must be loaded before Instantiating a GameObject.
 * @category Scene
 * 
 */
export class GameObject {
    public readonly id: number;
    public readonly name: string;

    public children: GameObject[];

    public scene: Scene;

    public drawPriority: number;
    public hasCollider: boolean;

    private static _nextID = 0;

    private __destroyed__: boolean;
    private readonly _components: Component[];
    private _active: boolean;
    private _parent?: GameObject;

    public readonly container: Container;


    public readonly transform!: Transform;

    public constructor(name: string) {
        if (!Scene.currentScene) throw new Error('No Scene loaded!');
        this.scene = Scene.currentScene;

        this.id = GameObject._nextID++;
        this.name = `${name} (${this.id})`;

        this.scene.gameObjects.set(this.name, this);

        this.container = new Container();
        this.container.name = this.name;


        this.children = [];


        this.drawPriority = 0;
        this.hasCollider = false;

        this.__destroyed__ = false;
        this._components = [];
        this._active = true;

        this.addComponent(Transform);

        this.transform = this.getComponent(ComponentType.Transform)!;

        this.connectCamera();
    }

    public get active(): boolean {
        if (this._parent) return this._active && this._parent.active;
        else return this._active;
    }
    public set active(val: boolean) {
        this._active = val;

        this.container.visible = val;
    }

    public get zIndex(): number {
        return this.container.zIndex;
    }
    public set zIndex(val: number) {
        this.container.zIndex = val;
        this.container.parent.sortChildren();
    }

    /**
     *
     * Returns the only rigidbody present on parents, children and this recursively.
     *
     */
    public get rigidbody(): RigidBody {
        const rb = this.getComponent<RigidBody>(ComponentType.RigidBody);

        if (!rb) {
            this._components.push(new RigidBody(this))
            return this.rigidbody;
        }

        return rb;
    }

    /**
     * 
     * Returns all collider on parents, children and this recursively.
     * 
     */
    public get collider(): Collider[] {
        return [...this.getComponents<Collider>(ComponentType.Collider), ...this.getComponentsInChildren<Collider>(ComponentType.Collider), ...this.getComponentsInParents<Collider>(ComponentType.Collider)];
    }


    private connectCamera(): void {
        if (this.container.parent) this.disconnectCamera();

        if (!this._parent) this.scene.cameraManager.addGameObject(this);
        else this._parent.container.addChild(this.container);
    }

    private disconnectCamera(): void {
        if (!this._parent) this.scene.cameraManager.removeGameObject(this);
        else this._parent.container.removeChild(this.container);
    }

    /** 
     *  
     * @param initializer Callbacks are executed after component creation.
     * Returns a Promise resolving the created component or null if the component cant be created
     * 
     */
    public async addComponent<T extends Component>(type: Constructor<T>, ...initializer: ((component: T) => void | Promise<void>)[]): Promise<T | null> {
        const component = new type(this);

        if (component.type !== ComponentType.Camera &&
            component.type !== ComponentType.Transform &&
            component.type !== ComponentType.RigidBody &&
            component.type !== ComponentType.AudioListener &&
            component.type !== ComponentType.TileMap ||
            component.type === ComponentType.RigidBody && this.getComponents(ComponentType.RigidBody).length === 0 ||
            component.type === ComponentType.Transform && this.getComponents(ComponentType.Transform).length === 0 ||
            component.type === ComponentType.Camera && this.getComponents(ComponentType.Camera).length === 0 ||
            component.type === ComponentType.AudioListener && !this.scene.audioListener ||
            component.type === ComponentType.TileMap && this.getComponents(ComponentType.TileMap).length === 0) {
            this._components.push(component);
        } else if (component.type === ComponentType.Camera || component.type === ComponentType.Transform || component.type === ComponentType.RigidBody || component.type === ComponentType.AudioListener || component.type === ComponentType.TileMap) {
            component.destroy();
            return null;
        }

        if ((component.type === ComponentType.CircleCollider || component.type === ComponentType.PolygonCollider || component.type === ComponentType.TileMap) && !this.rigidbody) this.addComponent(RigidBody);

        if (component.type === ComponentType.CircleCollider || component.type === ComponentType.PolygonCollider || component.type === ComponentType.TileMap) this.hasCollider = true;

        if (component.type === ComponentType.AudioListener) (<Mutable<Scene>>this.scene).audioListener = <any>component;


        if (initializer) {
            for (const c of initializer) {
                await c(component);
            }
        }

        if (component.type === ComponentType.Behaviour) {
            if ((<Behaviour><unknown>component).awake) await (<Behaviour><unknown>component).awake!();
            if (this.scene.isRunning || this.scene.isStarting) {
                if ((<Behaviour><unknown>component).start) await (<Behaviour><unknown>component).start!();
                (<any>component).__initialized__ = true;
            }
        }

        return component;
    }

    /**
     * 
     * Remove a component.
     * 
     */
    public removeComponent<T extends Component>(component: T | number): void {
        if (!component) {
            Debug.warn('Component undefined');
            return;
        }

        const i = this._components.findIndex(c => c.componentId === (typeof component === 'number' ? component : component.componentId));

        if (i === this.scene.audioListener?.componentId) (<Mutable<Scene>>this.scene).audioListener = undefined;

        if (i !== -1) this._components.splice(i, 1)[0].destroy(true);
        else Debug.warn('Component not found on gameObject');
    }

    /**
     * 
     * Returns all components of type.
     * 
     */
    public getComponents<T extends Component>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T[] {
        return <T[]>this._components.filter((c: Component) => {
            if (typeof type === 'number') {
                return c.type === type ||
                    type === ComponentType.Component ||
                    type === ComponentType.Collider && (c.type === ComponentType.CircleCollider || c.type === ComponentType.PolygonCollider || c.type === ComponentType.TileMap)
            }

            return c.constructor.name === type.name || c instanceof type;
        });
    }

    /**
     *
     * Returns the first component of type.
     *
     */
    public getComponent<T extends Component>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T | undefined {
        for (const c of this._components) {
            if (typeof type === 'number') {
                if (c.type === type ||
                    type === ComponentType.Component ||
                    type === ComponentType.Collider && (c.type === ComponentType.CircleCollider || c.type === ComponentType.PolygonCollider || c.type === ComponentType.TileMap)) return <T>c;
                continue;
            }

            if (c.constructor.name === type.name || c instanceof type) return <T>c;
        }

        return undefined;
    }

    /**
     *
     * Get components of type of direct children
     *
     */
    public getComponentsInChildren<T extends Component>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T[] {
        const ret: T[] = [];

        for (const child of this.children) {
            ret.push(...child.getComponents(type));
        }

        return ret;
    }

    /**
     * 
     * Get component of type of direct children
     * 
     */
    public getComponentInChildren<T extends Component>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T | undefined {
        for (const child of this.children) {
            const c = child.getComponent(type);
            if (c) return c;
        }

        return undefined;
    }

    public getComponentsInParents<T extends Component>(type: Constructor<T> | ComponentType): T[] {
        return [...(this._parent?.getComponents(type) || []), ...(this._parent?.getComponentsInParents(type) || [])];
    }

    public getComponentInParents<T extends Component>(type: Constructor<T> | ComponentType): T | undefined {
        return this._parent?.getComponent(type) || this._parent?.getComponentInParents(type);
    }

    /**
     * 
     * Add a child gameObject.
     * 
     */
    public addChild(gameObject: GameObject): void {
        if (gameObject._parent) {
            gameObject._parent.removeChild(gameObject);
        }

        this.children.push(gameObject);

        gameObject.setParent(this);
    }

    public removeChild(gameObject: GameObject): void {
        if (this.id !== gameObject._parent?.id) return;

        const i = this.children.findIndex(c => c.id === gameObject.id);

        if (i === -1) return;

        this.children.splice(i, 1);

        gameObject.setParent(undefined);
    }

    private setParent(gameObject: GameObject | undefined): void {
        this._parent = gameObject;

        this.connectCamera();
    }

    public get parent(): GameObject | undefined {
        return this._parent;
    }

    /**
     * 
     * Update children, behaviours, ParticleSystem, AnimatedSprite and AudioListener.
     * 
     */
    public async update(currentCollisions: Collision[]): Promise<void> {
        if (!this._parent && this.active && this.hasCollider) this.rigidbody.update(currentCollisions);


        if (this.active) {
            for (const b of this.getComponents<Behaviour>(ComponentType.Behaviour)) {
                if (b.__initialized__ && b.active && b.update) await b.update();
            }
        }

        this.children.forEach(c => c.update(currentCollisions));

        for (const c of this._components) {
            if (c.type === ComponentType.ParticleSystem ||
                c.type === ComponentType.AnimatedSprite ||
                c.type === ComponentType.AudioListener ||
                c.type === ComponentType.Texture ||
                c.type === ComponentType.ParallaxBackground ||
                c.type === ComponentType.Renderable ||
                c.type === ComponentType.TileMap)
                (<any>c).update();
        }

        if (!this.container.children.length) return;

        // update PIXI container

        // position
        this.container.position.copyFrom(this.transform.position.clone.scale(new Vector2(1, -1)));

        // rotation
        this.container.rotation = this.transform.rotation.radian;

        // scale
        this.container.scale.copyFrom(this.transform.scale);
    }

    /**
     * 
     * Remove this from scene and delete all references.
     * All components, children and their components will be destroyed.
     * 
     */
    public destroy(): void {
        if (this.__destroyed__ !== false) return;
        this.__destroyed__ = true;

        this.children.forEach(c => c.destroy());

        const d = () => {
            this.scene.gameObjects.delete(this.name);

            const i = this._parent?.children.findIndex(v => v.name === this.name);
            if (i && i !== -1) this._parent?.children.splice(i, 1);

            this._components.forEach(c => c.destroy());

            clearObject(this, true);
        };

        if (this.scene.isRunning) (<any>this.scene)._destroyCbs.push(d);
        else d();
    }
}