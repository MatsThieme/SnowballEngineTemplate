# SnowballEngine

SnowballEngine is a resolution independent 2D TypeScript game engine.
SnowballEngine manages scenes, game assets, simulates physics, renders assets and provides an easy to understand structure similar to Unity. It integrates [pixi.js](https://github.com/pixijs/pixi.js) for fast rendering and [matter-js](https://github.com/liabru/matter-js) for accurate and performant physics simulation.

[Documentation](https://matsthieme.github.io/SnowballEngineTemplate)


### Example games:
[Tetrong](https://github.com/MatsThieme/Tetrong)

<br>

### setup
Requires [nodejs](https://nodejs.org) and npm.

<pre>npm i</pre>

### build
<pre>npm run build</pre>

### generate AssetDB.json
<pre>npm run createadb</pre>

### update AssetDB.json
<pre>npm run updateadb</pre>

### start debug server
<pre>npm run server</pre>

### generate documentation
<pre>npm run doc</pre>

<br>

## Getting Started

### Recommended directory structure
<pre>
Assets/
src/
  Behaviours/
  Configurables/
  Prefabs/
  Scenes/
  SnowballEngine/
  Game.ts
dist/
</pre>

### Assets/
Contains all [Assets](#assets-1), [inputmappings](#inputmapping) and [AssetDB.json](#assetdb).

### dist/
Contains build files(index.html, main.js, Asset directory).

### src/

#### Behaviours
Contains files with classes derived from Behaviour.

#### Configurables
Contains typedefinition files (.d.ts) the user may edit during the development process, e.g. InputAction.d.ts for input mapping

#### Prefabs
Contains files that export a function to initialize a GameObject.

#### Scenes
Contains files that export a function to initialize a Scene.

#### SnowballEngine
Contains all the GameEngine files.

#### Game.ts
src/Game.ts is the entry point, it may look like this:
```typescript
import { LoadingScreenScene } from 'Scenes/LoadingScreenScene';
import { MainScene } from 'Scenes/MainScene';
import { Assets, SceneManager } from 'SE';

export class Game {
    public constructor() {
        this.initialize(new SceneManager());
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        sceneManager.add('Loading Screen Scene', LoadingScreenScene);
        sceneManager.add('Main Scene', MainScene);

        await sceneManager.load('Loading Screen Scene');

        await Assets.loadFromAssetDB();

        await sceneManager.load('Main Scene');
    }
}
```

</br>

## Engine code structure
<pre>
SceneManager
  Scene
    GameObject
      Component
    UI
</pre>

### SceneManager
A SceneManager instance loads Scenes and stores their Initializer-function.

### Scene
A Scene manages GameObjects and the graphical user interface. It contains the gameloop.

### GameObject
A GameObject is a container for components.
It has a Transform component by default.

### Components
A Component controls the behavior of the corresponding GameObject.



| **Component** | description |
| --- | --- |
| **AnimatedSprite** | Manages SpriteAnimation instances to render and switch sprite animations. |
| **AudioListener** | Can exist once per scene, it's the "ears" of the player. It's the audio equivalent of Camera. |
| **AudioSource** | Emits positional Audio. Can hold an AudioMixer object to filter/modify output, requires an AudioListener in the Scene. |
| **Behaviour** | A Behaviour is a Component with user-defined functionality. The Base class for all Behaviours. |
| **Camera** | The size and position of a camera component specify which area of the scene is rendered to the screen. |
| **CircleCollider** |  |
| **Collider** |  |
| **Component** | The Base class for all components. |
| **ParallaxBackground** | A graphical component for rendering parallax scrolling images. [Wikipedia: Parallax scrolling](https://en.wikipedia.org/wiki/Parallax_scrolling) |
| **ParticleSystem** |  |
| **PolygonCollider** |  |
| **RectangleCollider** |  |
| **Renderable** | The Base class for all renderable components. Examlpes are [Texture](#texture), [Video](#video), [ParallaxBackground](#parallaxbackground) and [Text](#text). |
| **Rigidbody** |  |
| **TerrainCollider** |  |
| **TerrainRenderer** |  |
| **Text** | Render a string. |
| **Texture** | Render an image. |
| **TilemapCollider** |  |
| **TilemapRenderer** |  |
| **Transform** | The Transform Component is by default added to every new GameObject on creation, only one Transform is allowed per GameObject. A Transform Component stores position, rotation and scale of their GameObject, which will affect the GameObjects other components and children. |
| **Video** | Render a Video/Movie, playback is controlled through an HTMLVideoElement. |




## Assets
Assets are all non-script files utilized by the game.

#### All asset types
```typescript
enum AssetType {
    Image = 0,
    Audio = 1,
    Video = 2,
    Text = 3,
    Blob = 4,
    JSON = 5,
    Font = 6
}
```

#### Using Assets
```typescript
// create the Asset
const name = 'name';
const data = 'text';
const asset = new Asset(name, AssetType.Text, data);

// register the Asset
Assets.set(name, asset);

// access the Asset
Assets.get(name);
```

### Loading Assets
Load Assets with
```typescript
Assets.load(path: string, type: AssetType, name?: AssetID);
```
or with AssetDB.

#### AssetDB
Assets/AssetDB.json contains all asset information required for loading.\
It can be generated from the Assets directory with <code>[npm run createadb](#generate-assetdbjson)</code>.

Typescript signature of 'AssetDB.json's content:
```typescript
type AssetDB = { [path: string]: { type: AssetType, "optional asset name"?: 0 } }; // path is relative to the Assets directory
```

### Creating Assets
```typescript
const name = 'name';
const data = 'text';
const asset = new Asset(name, AssetType.Text, data);
```

Create Assets of type AssetType.Image with
```typescript
Shape.createSprite
```

<br>

### InputMapping
InputMappingAxes.json and InputMappingButtons.json, placed in the Asset root, contain input mapping information.

The signature of an input mapping file looks like this:
```typescript
interface InputMapping {
    keyboard?: { [key in InputAction]?: KeyboardButton | KeyboardAxis },
    mouse?: { [key in InputAction]?: MouseButton | MouseAxis },
    gamepad?:  { [key in InputAction]?: GamepadButton | GamepadAxis },
    touch?: { [key in InputAction]?: TouchButton | TouchAxis }
}
```