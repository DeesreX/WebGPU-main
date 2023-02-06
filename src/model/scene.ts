import { Triangle } from "./triangle";
import { Quad } from "./quad";
import { Camera } from "./camara";
import { vec3, mat4 } from "gl-matrix";
import { objectTypes, renderData } from "./definitions";

export class Scene {
    triangles!: Triangle[]
    quads!: Quad[]
    player!: Camera
    objectData: Float32Array;
    triangle_count: number;
    quad_count!: number;

    constructor() {
        // Traingles
        this.triangles = [];

        this.quads = [];

        this.objectData = new Float32Array(16 * 1024)
        this.triangle_count = 0;
        this.quad_count = 0

        this.makeTriangles()
        this.makeQuads()


        this.player = new Camera(
            [-1, 0, 0.5], 0, 0
        )
    }

    makeTriangles() {
        var i: number = 0;
        for (var y: number = -5; y <= 5; y++) {
            let triangle = new Triangle([0, y, 2], 0)
            this.triangles.push(triangle)
            var blank_matrix = mat4.create();
            for (var j: number = 0; j < 16; j++) {
                this.objectData[16 * i + j] = <number>blank_matrix.at(j)
            }

            i++;
            this.triangle_count++;
        }
    }

    makeQuads() {
        var i: number = this.triangle_count;

        for (var x: number = -2; x <= 2; x++) {
            for (var y: number = -2; y <= 2; y++) {
                let quad = new Quad([x, y, 0])
                this.quads.push(quad)
                var blank_matrix = mat4.create();
                for (var j: number = 0; j < 16; j++) {
                    this.objectData[16 * i + j] = <number>blank_matrix.at(j)
                }
                i++;
                this.quad_count++;
            }
        }
    }

    update() {

        var i: number = 0
        this.triangles.forEach(
            (triangle) => {
                triangle.update()
                var model = triangle.getModel();
                for (var j: number = 0; j < 16; j++) {
                    this.objectData[16 * i + j] = <number>model.at(j)
                }
                i++
            }
        )

        this.quads.forEach(
            (quad) => {
                quad.update()
                var model = quad.getModel();
                for (var j: number = 0; j < 16; j++) {
                    this.objectData[16 * i + j] = <number>model.at(j)
                }
                i++
            }
        )


        this.player.update()
    }

    spin_player(dX: number, dY: number) {
        this.player.eulers[2] -= dX
        this.player.eulers[2] %= 360

        this.player.eulers[1] = Math.min(
            89, Math.max(
                -89,
                this.player.eulers[1] + dY
            )
        )
    }

    move_player(forwardAmmount: number, rightAmmount: number) {

        vec3.scaleAndAdd(
            this.player.positition, this.player.positition,
            this.player.forward, forwardAmmount
        )

        vec3.scaleAndAdd(
            this.player.positition, this.player.positition,
            this.player.right, rightAmmount
        )
    }

    get_player(): Camera {
        return this.player
    }

    get_triangles(): Float32Array {
        return this.objectData
    }

    getRenderables(): renderData {
        return {
            viewTransforms: this.player.getView(),
            modelTransforms: this.objectData,
            objectCounts: {
                [objectTypes.triangle]: this.triangle_count,
                [objectTypes.quad]: this.quad_count
            }

        }
    }
}