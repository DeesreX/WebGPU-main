import { vec3, mat4 } from "gl-matrix";
import { Deg2Rad } from "./math_lib";

export class Camera {
    positition: vec3
    eulers: vec3
    view!: mat4;
    forward!: vec3
    right!: vec3
    up!: vec3

    constructor (position: vec3, theta: number, phi: number){
        this.positition = position
        this.eulers = <vec3>[0, phi, theta]
        this.forward = vec3.create()
        this.right = vec3.create()
        this.up = vec3.create()
    }

    update() {
        this.forward = [
            Math.cos(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
            Math.sin(Deg2Rad(this.eulers[2])) * Math.cos(Deg2Rad(this.eulers[1])),
            Math.sin(Deg2Rad(this.eulers[1])),
        ]

        vec3.cross(this.right, this.forward, [0,0,1])
        vec3.cross(this.up, this.right, this.forward)

        var target: vec3 = vec3.create();
        vec3.add(target, this.positition, this.forward)

        this.view = mat4.create()
        mat4.lookAt(this.view, this.positition, target, this.up)
    }

    getView(): mat4 {
        return this.view;
    }

}
