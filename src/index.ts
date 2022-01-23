import { Common } from "matter-js";
import * as PIXI from "pixi.js";
import { Ticker } from "pixi.js";
import * as poly_decomp from "poly-decomp";

PIXI.utils.skipHello(); // don't show PIXIs hello in console
Ticker.system.autoStart = false;

Common.setDecomp(poly_decomp);

export * from "./SnowballEngine";
