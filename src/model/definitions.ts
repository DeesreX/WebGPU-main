import { mat4 } from "gl-matrix";

export enum objectTypes{
    triangle, quad
}

export interface renderData {
    viewTransforms: mat4;
    modelTransforms: Float32Array;
    objectCounts: { [obj in objectTypes]: number }
}