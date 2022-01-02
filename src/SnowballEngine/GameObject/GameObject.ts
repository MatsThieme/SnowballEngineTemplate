import { Container } from "@pixi/display";
import { Debug } from "SnowballEngine/Debug";
import { Scene } from "SnowballEngine/Scene";
import { EventHandler } from "Utility/Events/EventHandler";
import { EventTarget } from "Utility/Events/EventTarget";
import {
    ComponentEventTypes,
    GameObjectEventTypes,
} from "Utility/Events/EventTypes";
import { Vector2 } from "Utility/Vector2";
import { Component } from "./Components/Component";
import { Transform } from "./Components/Transform/Transform";
import { ComponentType } from "./ComponentType";
import { Destroy, Destroyable } from "./Destroy";

/**
 *
 * Created gameObjects correspond to the currently loaded Scene. A Scene must be loaded before Instantiating a GameObject.
 * @category Scene
 *
 */
export class GameObject
    extends EventTarget<GameObjectEventTypes>
    implements Destroyable
{
    private static _nextID = 0;

    public static readonly gameObjects: GameObject[];

    public readonly id: number;
    public readonly name: string;

    public readonly children: GameObject[];

    public scene: Scene;

    public drawPriority: number;

    private readonly _components: Partial<
        Record<ComponentType, Component<ComponentEventTypes>[]>
    >;
    private _active: boolean;
    private _parent?: GameObject;

    public readonly container: Container;

    public readonly transform!: Transform;

    private _initialized: boolean;

    public constructor(name: string, initialize = true) {
        super();

        if (name.includes("/"))
            throw new Error("GameObject name must not include /");

        if (!Scene.currentScene)
            throw new Error(
                "No Scene loaded! Load a Scene before creating a gameObject"
            );
        this.scene = Scene.currentScene;

        this.id = GameObject._nextID++;
        this.name = name;

        GameObject.gameObjects.push(this);

        this.container = new Container();
        this.container.name = name;

        this.children = [];

        this.drawPriority = 0;

        this._components = {};
        this._active = true;

        this.addComponent(Transform);

        this.transform = this.getComponent(ComponentType.Transform)!;

        this.connectCamera();

        const transformListener = new EventHandler(
            (transform, posDiff, rotDiff, scaleDiff) => {
                const globalTransform = this.transform.toGlobal();

                if (posDiff) {
                    this.container.position.copyFrom(
                        globalTransform.position.scale(new Vector2(1, -1))
                    );
                }

                if (rotDiff) {
                    this.container.rotation = globalTransform.rotation.radian;
                }

                if (scaleDiff) {
                    this.container.scale.copyFrom(globalTransform.scale);
                }
            }
        );

        this.transform.addListener("change", transformListener);
        this.transform.addListener("parentchange", transformListener);

        this._initialized = false;
        if (initialize) this.start();
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
        this.scene.cameraManager.addGameObject(this);
    }

    private disconnectCamera(): void {
        this.scene.cameraManager.removeGameObject(this);
    }

    /**
     *
     * Initialize components and children
     *
     */
    public start(): void {
        if (this._initialized) return;
        this._initialized = true;

        Object.values(this._components)
            .flat()
            .map((component) => component.dispatchEvent("start"));

        const globalTransform = this.transform.toGlobal();
        this.container.position.copyFrom(
            globalTransform.position.scale(new Vector2(1, -1))
        );
        this.container.rotation = globalTransform.rotation.radian;
        this.container.scale.copyFrom(globalTransform.scale);

        for (const c of this.children) {
            c.start();
        }
    }

    /**
     *
     * @param initializer Callbacks are executed after component initialisation.
     * Returns a Promise resolving the created component or null if the component cant be created
     *
     */
    public async addComponent<T extends Component<ComponentEventTypes>>(
        type: Constructor<T>,
        ...initializer: ((component: T) => void | Promise<void>)[]
    ): Promise<T> {
        const component = new type(this);

        if (
            (component.type !== ComponentType.Transform &&
                component.type !== ComponentType.Rigidbody &&
                component.type !== ComponentType.AudioListener &&
                component.type !== ComponentType.TilemapRenderer &&
                component.type !== ComponentType.TilemapCollider &&
                component.type !== ComponentType.TerrainRenderer &&
                component.type !== ComponentType.TerrainCollider &&
                component.type !== ComponentType.ParallaxBackground) ||
            (component.type === ComponentType.Rigidbody &&
                !GameObject.componentInTree(this, ComponentType.Rigidbody) &&
                !GameObject.componentInParents(this, ComponentType.Collider)) ||
            (component.type === ComponentType.Transform &&
                this.getComponents(ComponentType.Transform).length === 0) ||
            (component.type === ComponentType.AudioListener &&
                !this.scene.audioListener) ||
            (component.type === ComponentType.TilemapRenderer &&
                this.getComponents(ComponentType.TilemapRenderer).length ===
                    0) ||
            (component.type === ComponentType.TilemapCollider &&
                this.getComponents(ComponentType.TilemapCollider).length ===
                    0) ||
            (component.type === ComponentType.TerrainRenderer &&
                this.getComponents(ComponentType.TerrainRenderer).length ===
                    0) ||
            (component.type === ComponentType.TerrainCollider &&
                this.getComponents(ComponentType.TerrainCollider).length ===
                    0) ||
            (component.type === ComponentType.ParallaxBackground &&
                this.getComponents(ComponentType.ParallaxBackground).length ===
                    0)
        ) {
            const components = this._components[component.type] || [];
            components.push(component);
            this._components[component.type] = components;
        } else {
            const type = component.type;
            if (component.prepareDestroy) component.prepareDestroy();
            (<Mutable<Component<ComponentEventTypes>>>component).__destroyed__ =
                true;
            component.destroy();
            throw new Error(
                `Can't add component(type: ${ComponentType[type]})`
            );
        }

        if (initializer) {
            for (const c of initializer) {
                await c(component);
            }
        }

        await component.dispatchEvent("awake");
        if (this._initialized) await component.dispatchEvent("start");

        this.dispatchEvent("componentadd", component);

        return component;
    }

    /**
     *
     * Remove a component.
     * Component will be destroyed by default.
     *
     */
    public removeComponent<T extends Component<ComponentEventTypes>>(
        component: T
    ): void {
        if (!component) return Debug.warn("Component undefined");

        const components = this._components[component.type];

        if (!components) return Debug.warn("Component not found on gameObject");

        const i = components.findIndex(
            (c) => c.componentID === component.componentID
        );

        if (i === -1) return Debug.warn("Component not found on gameObject");

        this.dispatchEvent("componentremove", component);

        components.splice(i, 1)[0];

        if (!component.__destroyed__) {
            (<Mutable<Component<ComponentEventTypes>>>component).__destroyed__ =
                true;
            Destroy(component);
        }
    }

    /**
     *
     * Returns all components of type.
     *
     */
    public getComponents<T extends Component<ComponentEventTypes>>(
        type: Constructor<T> | AbstractConstructor<T> | ComponentType
    ): T[] {
        if (typeof type === "number") {
            if (this._components[type] !== undefined)
                return <T[]>this._components[type]!.slice();
            if (type === ComponentType.Component)
                return <T[]>Object.values(this._components).flat();
            if (type === ComponentType.Renderable)
                return <T[]>[
                    ...this.getComponents(ComponentType.AnimatedSprite),
                    ...this.getComponents(ComponentType.ParallaxBackground),
                    ...this.getComponents(ComponentType.ParticleSystem),
                    ...this.getComponents(ComponentType.Texture),
                    ...this.getComponents(ComponentType.TilemapRenderer),
                    ...this.getComponents(ComponentType.Video),
                ];
            if (type === ComponentType.Collider)
                return <T[]>[
                    ...this.getComponents(ComponentType.CircleCollider),
                    ...this.getComponents(ComponentType.PolygonCollider),
                    ...this.getComponents(ComponentType.TilemapCollider),
                    ...this.getComponents(ComponentType.TerrainCollider),
                    ...this.getComponents(ComponentType.RectangleCollider),
                ];

            return [];
        }

        return <T[]>Object.values(this._components)
            .flat(1)
            .filter((c: Component<ComponentEventTypes>) => {
                return c.constructor.name === type.name || c instanceof type;
            });
    }

    /**
     *
     * Returns the first component of type.
     *
     */
    public getComponent<T extends Component<ComponentEventTypes>>(
        type: Constructor<T> | AbstractConstructor<T> | ComponentType
    ): T | undefined {
        if (typeof type === "number") {
            if (this._components[type] !== undefined)
                return <T>this._components[type]![0];
            if (type === ComponentType.Component) {
                for (const components of Object.values(this._components)) {
                    if (components[0]) return <T>components[0];
                }
            }
            if (type === ComponentType.Renderable)
                return (
                    this.getComponent(ComponentType.AnimatedSprite) ||
                    this.getComponent(ComponentType.ParallaxBackground) ||
                    this.getComponent(ComponentType.ParticleSystem) ||
                    this.getComponent(ComponentType.Texture) ||
                    this.getComponent(ComponentType.TilemapRenderer) ||
                    this.getComponent(ComponentType.Video)
                );
            if (type === ComponentType.Collider)
                return (
                    this.getComponent(ComponentType.CircleCollider) ||
                    this.getComponent(ComponentType.PolygonCollider) ||
                    this.getComponent(ComponentType.TilemapCollider) ||
                    this.getComponent(ComponentType.TerrainCollider) ||
                    this.getComponent(ComponentType.RectangleCollider)
                );

            return undefined;
        }

        for (const c of Object.values(this._components).flat(1)) {
            if (c.constructor.name === type.name || c instanceof type)
                return <T>c;
        }

        return undefined;
    }

    /**
     *
     * Get components of type of direct children
     *
     */
    public getComponentsInChildren<T extends Component<ComponentEventTypes>>(
        type: Constructor<T> | AbstractConstructor<T> | ComponentType
    ): T[] {
        return this.children.flatMap((c) => c.getComponents(type));
    }

    /**
     *
     * Get component of type of direct children
     *
     */
    public getComponentInChildren<T extends Component<ComponentEventTypes>>(
        type: Constructor<T> | AbstractConstructor<T> | ComponentType
    ): T | undefined {
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

        this.dispatchEvent("childadd", gameObject);
    }

    public removeChild(gameObject: GameObject): void {
        if (this.id !== gameObject._parent?.id) return;

        const i = this.children.findIndex((c) => c.id === gameObject.id);

        if (i === -1) return;

        this.children.splice(i, 1);

        gameObject.setParent(undefined);

        this.dispatchEvent("childremove", gameObject);
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

        this.dispatchEvent("parentchanged", gameObject);
        this.children.forEach((c) =>
            c.dispatchEvent("parentchanged", gameObject)
        );
    }

    /**
     *
     * @internal
     *
     */
    public static componentInTree<T extends Component<ComponentEventTypes>>(
        gameObject: GameObject,
        type: ComponentType
    ): T | undefined {
        return (
            gameObject.getComponent<T>(type) ||
            GameObject.componentInParents<T>(gameObject, type) ||
            GameObject.componentInChildren<T>(gameObject, type)
        );
    }

    /**
     *
     * @internal
     *
     */
    public static componentInParents<T extends Component<ComponentEventTypes>>(
        gameObject: GameObject,
        type: ComponentType
    ): T | undefined {
        while (gameObject.parent) {
            const c = gameObject.parent.getComponent<T>(type);

            if (c) return c;

            gameObject = gameObject.parent;
        }

        return undefined;
    }

    /**
     *
     * @internal
     *
     */
    public static componentInChildren<T extends Component<ComponentEventTypes>>(
        gameObject: GameObject,
        type: ComponentType
    ): T | undefined {
        const c = gameObject.getComponentInChildren<T>(type);
        if (c) return c;

        for (const child of gameObject.children) {
            const c = GameObject.componentInChildren<T>(child, type);
            if (c) return c;
        }

        return undefined;
    }

    /**
     *
     * @internal
     *
     */
    public static componentsInTree<T extends Component<ComponentEventTypes>>(
        gameObject: GameObject,
        type: ComponentType
    ): T[] {
        return (
            gameObject.getComponents<T>(type) ||
            GameObject.componentsInParents<T>(gameObject, type) ||
            GameObject.componentsInChildren<T>(gameObject, type)
        );
    }

    /**
     *
     * @internal
     *
     */
    public static componentsInParents<T extends Component<ComponentEventTypes>>(
        gameObject: GameObject,
        type: ComponentType
    ): T[] {
        const c = [];

        while (gameObject.parent) {
            c.push(...gameObject.parent.getComponents<T>(type));

            gameObject = gameObject.parent;
        }

        return c;
    }

    /**
     *
     * @internal
     *
     */
    public static componentsInChildren<
        T extends Component<ComponentEventTypes>
    >(gameObject: GameObject, type: ComponentType): T[] {
        const c = gameObject.getComponentsInChildren<T>(type);

        for (const child of gameObject.children) {
            c.push(...GameObject.componentsInChildren<T>(child, type));
        }

        return c;
    }

    /**
     *
     * @internal
     *
     */
    public prepareDestroy(): void {
        const destroyables: Destroyable[] = [
            ...Object.values(this._components).flat(),
            ...this.children,
        ];

        const destroyInFrames =
            this.parent?.__destroyInFrames__ || this.getMaxDestroyInFrames();

        for (const d of destroyables) {
            d.__destroyInFrames__ = destroyInFrames;
            Destroy(d);
        }
    }

    private getMaxDestroyInFrames(
        gameObject: GameObject = this,
        max?: number
    ): number | undefined {
        const components = Object.values(gameObject._components).flat();

        max = Math.max(
            max || 0,
            components.reduce((p, c) => {
                if (
                    c.__destroyInFrames__ !== undefined &&
                    p < c.__destroyInFrames__
                )
                    return c.__destroyInFrames__;
                else return p;
            }, 0)
        );

        return gameObject.children
            .map((c) => c.getMaxDestroyInFrames(c, max))
            .filter(Boolean)
            .sort((a, b) => b! - a!)[0];
    }

    /**
     *
     * Remove this from scene and delete all references.
     * All components, children and their components will be destroyed.
     * @internal
     *
     */
    public destroy(): void {
        if (this.parent && this.parent.removeChild)
            this.parent.removeChild(this);

        this.container.destroy({
            children: false,
            texture: true,
            baseTexture: false,
        });

        const i = GameObject.gameObjects.findIndex((g) => g.id === this.id);
        GameObject.gameObjects.splice(i, 1);
    }

    /**
     *
     * For performance reasons, it is recommended to not use this function every frame. Instead, cache the result in a member variable at startup.
     * @param query name of a gameObject or a/path/to/a/gameObject or /an/absolute/path
     * @param gameObjects
     *
     */
    public static find(
        query: string,
        gameObjects?: GameObject[]
    ): GameObject | undefined {
        if (!/^\/?[^/]+(?:\/[^/]+)*$/.test(query))
            throw new Error("Wrong query format");

        if (!gameObjects) {
            if (query[0] === "/") {
                const gOs = [];

                for (const g of GameObject.gameObjects) {
                    if (!g.parent) gOs.push(g);
                }

                return GameObject.find(query, gOs);
            } else {
                const gOs = [];

                const names = query.split("/");

                if (names.length === 0) return undefined;

                for (const g of GameObject.gameObjects) {
                    if (g.name === names[0] && names.length === 1) return g;
                    if (g.name === names[0]) gOs.push(...g.children);
                }

                if (gOs.length === 0) return undefined;

                return GameObject.find(names.slice(1).join("/"), gOs);
            }
        }

        if (query[0] === "/") query = query.substr(1);

        if (!query.includes("/")) {
            for (const g of gameObjects) {
                if (g.name === query) return g;
            }

            return undefined;
        }

        let children: GameObject[] | undefined = gameObjects;

        const names = query.split("/");

        for (const name of names) {
            const g = GameObject.find(name, children);

            if (!g) return undefined;

            if (g.name === name && g.name === names[names.length - 1]) return g;
            else children = g.children;
        }

        return undefined;
    }

    /**
     *
     * Returns GameObject with id if exists.
     *
     */
    public static get(id: number): GameObject | undefined {
        const i = GameObject.gameObjects.findIndex((g) => g.id === id);
        return i !== -1 ? GameObject.gameObjects[i] : undefined;
    }

    public static prepareDestroy(): void {
        for (const gameObject of GameObject.gameObjects) {
            Destroy(gameObject);
        }
    }

    public static reset(): void {
        (<any>GameObject)._nextID = 0;
        (<Mutable<typeof GameObject>>GameObject).gameObjects = [];
    }
}

export interface GameObject
    extends EventTarget<GameObjectEventTypes>,
        Destroyable {}
