import { vec3, mat4 } from "gl-matrix";

export class Quad {
    positition: vec3
    model!: mat4;

    constructor (position: vec3){
        this.positition = position
    }

    update() {
        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.positition)
    }

    getModel(): mat4 {
        return this.model;
    }

}
