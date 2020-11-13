# SnowballEngine

**SnowballEngine is a 2D TypeScript game engine.**
It manages scenes, game assets, simulates physics, renders assets, provides a simple structure and more

### setup
<pre>npm i</pre>

### build
<pre>npm run build</pre>

### debug build
<pre>npm run builddebug</pre>

### generate AssetList.json from Assets folder
<pre>npm run newal</pre>

### generate AssetList.json from Assets folder and merge with existing AssetList.json
<pre>npm run mnewal</pre>

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

#### Configurables
Configurables contains engine files the user will edit during the development process.\
e.g. InputType.d.ts for input mapping

#### Prefabs
Prefabs are functions that initialize a GameObject.

<br>

### Engine code structure
<pre>
SceneManager
  Scene
    GameObject
      Component
</pre>


### The main file 'Game.ts' looks like this
```typescript
import { LoadingScreenScene } from './Scenes/LoadingScreenScene.js';
import { MainScene } from './Scenes/MainScene.js';
import { Assets, SceneManager } from './SnowballEngine/SE.js';

export class Game {
    private sceneManager: SceneManager;
    public constructor() {
        this.sceneManager = new SceneManager();

        this.initialize(this.sceneManager);
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        sceneManager.create('Loadingscreen', LoadingScreenScene);
        sceneManager.create('Game', MainScene);

        await sceneManager.load('Loadingscreen');

        await Assets.loadFromAssetList();

        await sceneManager.load('Game');
    }
}
```

### Behaviour
A Behaviour is a Component whose functionality is defined by the user.

### Component
A Component controls the behavior of the corresponding GameObject.

### GameObject
A GameObject is a container for components.
It has a Transform component by default.

<br>

## Components
### AnimatedSprite
</br>

### AudioListener
Can exist once per scene, it's the "ears" of the player.
It's the audio counterpart of Camera.
</br>

### AudioSource
</br>

### Behaviour
Base class for all Behaviours.
</br>

### Camera
</br>

### CircleCollider
</br>

### CircleRenderer
Debug renderer, renders the CircleCollider on the same GameObject.
</br>

### Collider
Base class for CircleCollider and PolygonCollider.
</br>

### Component
Base class for all components.
</br>

### ParticleSystem
</br>

### PolygonCollider
</br>

### PolygonRenderer
Debug renderer, renders the PolygonCollider on the same GameObject.
</br>

### RigidBody
</br>

### Texture
Controls the rendering of an image.
</br>

### TileMap
</br>

### Transform
A Transform Component stores position, rotation and scale of their GameObject.
A child-GameObjects Transform is relative to their parents.
</br>

<br>

## Assets
Assets are all non-script files utilized by the game.

**All asset types**
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

### AssetList
Assets/AssetList.json contains information about all assets.\
It can be generated with **npm run newal**

Typescript signature of 'AssetList.json's content:
```typescript
{ path: string, type: AssetType, name?: string, clone?: boolean }[];
```

<br>

### InputMapping
InputMappingAxes.json and InputMappingButtons.json, placed in the Asset root, contain input mapping information.

the signature of an input mapping file looks like this
```typescript
interface InputMapping {
    keyboard: { [key: string]: string },
    mouse: { [key: string]: string | number },
    gamepad:  { [key: string]: string | number },
    touch: { [key: string]: number }
}
```
[key: string] is a member of InputType(src/Configurables/InputType.d.ts).
