import { Container } from '@pixi/display';
import { Debug } from 'SnowballEngine/Debug';
import { Scene } from 'SnowballEngine/Scene';
import { ComponentEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Behaviour } from './Components/Behaviour';
import { Component } from './Components/Component';
import { Transform } from './Components/Transform/Transform';
import { ComponentType } from './ComponentType';
import { Destroy, Destroyable } from './Destroy';

/**
 * 
 * Created gameObjects correspond to the currently loaded Scene. A Scene must be loaded before Instantiating a GameObject.
 * @category Scene
 * 
 */
export class GameObject implements Destroyable {
    public readonly id: number;
    public readonly name: string;

    public readonly children: GameObject[];

    public scene: Scene;

    public drawPriority: number;
    public hasCollider: boolean;

    private static _nextID = 0;

    private readonly _components: Map<ComponentType, Component<ComponentEventTypes>[]>;
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

        this._components = new Map();
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

    public get parent(): GameObject | undefined {
        return this._parent;
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
    public async addComponent<T extends Component<ComponentEventTypes>>(type: Constructor<T>, ...initializer: ((component: T) => void | Promise<void>)[]): Promise<T> {
        const component = new type(this);

        if (component.type !== ComponentType.Transform &&
            component.type !== ComponentType.RigidBody &&
            component.type !== ComponentType.AudioListener &&
            component.type !== ComponentType.TileMap &&
            component.type !== ComponentType.ParallaxBackground ||
            component.type === ComponentType.RigidBody && this.getComponents(ComponentType.RigidBody).length === 0 ||
            component.type === ComponentType.Transform && this.getComponents(ComponentType.Transform).length === 0 ||
            component.type === ComponentType.AudioListener && !this.scene.audioListener ||
            component.type === ComponentType.TileMap && this.getComponents(ComponentType.TileMap).length === 0 ||
            component.type === ComponentType.ParallaxBackground && this.getComponents(ComponentType.ParallaxBackground).length === 0) {
            const components = this._components.get(component.type) || [];
            components.push(component);
            this._components.set(component.type, components);
        } else if (component.type === ComponentType.Transform || component.type === ComponentType.RigidBody || component.type === ComponentType.AudioListener || component.type === ComponentType.TileMap || component.type === ComponentType.ParallaxBackground) {
            const type = component.type;
            if (component.prepareDestroy) component.prepareDestroy();
            component.destroy();
            throw new Error(`Can't add component(type: ${ComponentType[type]})`);
        }



        if (component.type === ComponentType.AudioListener) (<Mutable<Scene>>this.scene).audioListener = <any>component;


        if (initializer) {
            for (const c of initializer) {
                await c(component);
            }
        }

        if (component.type === ComponentType.Behaviour) {
            await (<Behaviour><unknown>component).dispatchEvent('awake');
            if (this.scene.isRunning || this.scene.isStarting) {
                await (<Behaviour><unknown>component).dispatchEvent('start');
                (<Mutable<Behaviour>><unknown>component).__initialized__ = true;
            }
        }

        return component;
    }

    /**
     * 
     * Remove a component.
     * Component will be destroyed by default.
     * 
     */
    public removeComponent<T extends Component<ComponentEventTypes>>(component: T, destroy = true): void {
        if (!component) return Debug.warn('Component undefined');

        const components = this._components.get(component.type);

        if (!components) return Debug.warn('Component not found on gameObject');

        const i = components.findIndex(c => c.componentId === component.componentId);

        if (i === -1) return Debug.warn('Component not found on gameObject');


        if (component.componentId === this.scene.audioListener?.componentId) (<Mutable<Scene>>this.scene).audioListener = undefined;

        const c = components.splice(i, 1)[0];
        (<Mutable<Partial<T>>><unknown>c).gameObject = undefined;
        Destroy(c);
    }

    /**
     * 
     * Returns all components of type.
     * 
     */
    public getComponents<T extends Component<ComponentEventTypes>>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T[] {
        if (typeof type === 'number') {
            if (this._components.has(type)) return <T[]>this._components.get(type);
            if (type === ComponentType.Component) return <T[]>[...this._components.values()].flat(1);
            if (type === ComponentType.Renderable) return <T[]>[...this.getComponents(ComponentType.AnimatedSprite), ...this.getComponents(ComponentType.ParallaxBackground), ...this.getComponents(ComponentType.ParticleSystem), ...this.getComponents(ComponentType.Texture), ...this.getComponents(ComponentType.TileMap), ...this.getComponents(ComponentType.Video)];
            if (type === ComponentType.Collider) return <T[]>[...this.getComponents(ComponentType.PolygonCollider)];

            return [];
        }

        return <T[]>[...this._components.values()].flat(1).filter((c: Component<ComponentEventTypes>) => {
            return c.constructor.name === type.name || c instanceof type;
        });
    }

    /**
     *
     * Returns the first component of type.
     *
     */
    public getComponent<T extends Component<ComponentEventTypes>>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T | undefined {
        if (typeof type === 'number') {
            if (this._components.has(type)) return <T>this._components.get(type)![0];
            if (type === ComponentType.Component) return <T>[...this._components.values()].flat(1)[0];
            if (type === ComponentType.Renderable) return this.getComponent(ComponentType.AnimatedSprite) || this.getComponent(ComponentType.ParallaxBackground) || this.getComponent(ComponentType.ParticleSystem) || this.getComponent(ComponentType.Texture) || this.getComponent(ComponentType.TileMap) || this.getComponent(ComponentType.Video);
            if (type === ComponentType.Collider) return this.getComponent(ComponentType.PolygonCollider);

            return undefined;
        }


        for (const c of [...this._components.values()].flat(1)) {
            if (c.constructor.name === type.name || c instanceof type) return <T>c;
        }

        return undefined;
    }

    /**
     *
     * Get components of type of direct children
     *
     */
    public getComponentsInChildren<T extends Component<ComponentEventTypes>>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T[] {
        return this.children.flatMap(c => c.getComponents(type));
    }

    /**
     * 
     * Get component of type of direct children
     * 
     */
    public getComponentInChildren<T extends Component<ComponentEventTypes>>(type: Constructor<T> | AbstractConstructor<T> | ComponentType): T | undefined {
        for (const child of this.children) {
            const c = child.getComponent(type);
            if (c) return c;
        }

        return undefined;
    }

    /**
     * 
     * Add a child gameObject.
     * 
     */
    public addChild(gameObject: GameObject): void {
        gameObject.setParent(this);

        this.children.push(gameObject);
    }

    public removeChild(gameObject: GameObject): void {
        if (this.id !== gameObject._parent?.id) return;

        const i = this.children.findIndex(c => c.id === gameObject.id);

        if (i === -1) return;

        this.children.splice(i, 1);

        gameObject.setParent(undefined);
    }

    /**
     *  
     * Set gameObject to be the parent of this
     * 
     */
    private setParent(gameObject: GameObject | undefined): void {
        if (this._parent) {
            this._parent.removeChild(this);
        }

        this._parent = gameObject;

        this.connectCamera();
    }

    /**
     * 
     * Update children, behaviours, ParticleSystem, AnimatedSprite and AudioListener.
     * 
     */
    public async update(): Promise<void> {
        if (this.active) {
            for (const b of this.getComponents<Behaviour>(ComponentType.Behaviour)) {
                if (b.__initialized__ && b.active) await b.dispatchEvent('update');
            }
        }

        this.children.forEach(c => c.update());

        for (const ctype of this._components) {
            for (const c of ctype[1]) {
                if (c.type !== ComponentType.Camera)
                    (<Component<ComponentEventTypes>>c).dispatchEvent('update');
            }
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

    public prepareDestroy(): void {
        [...this._components.values()].flat(1).forEach(c => Destroy(c));
        this.children.forEach(c => Destroy(c));
    }

    /**
     * 
     * Remove this from scene and delete all references.
     * All components, children and their components will be destroyed.
     * @internal
     * 
     */
    public destroy(): void {
        this.scene.gameObjects.delete(this.name);

        this.parent?.removeChild(this);
    }
}