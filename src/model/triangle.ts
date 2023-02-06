import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math_lib";

export class Triangle {
    positition: vec3
    eulers: vec3
    model!: mat4;

    constructor (position: vec3, theta: number){
        this.positition = position
        this.eulers = vec3.create()
        this.eulers[2] = theta
    }

    update() {
        this.eulers[2] += 1;
        this.eulers[2] %= 360;

        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.positition)
        mat4.rotateZ(this.model, this.model, Deg2Rad(this.eulers[2]))
    }

    getModel(): mat4 {
        return this.model;
    }

}
