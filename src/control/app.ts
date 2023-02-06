import { Renderer } from "../view/renderer";
import { Scene } from "../model/scene";
import $ from "jquery";

export class App {
    canvas: HTMLCanvasElement
    renderer: Renderer
    scene: Scene
    keyLabel: HTMLElement
    mouseXLabel!: HTMLElement
    mouseYLabel!: HTMLElement

    forwardAmmount!: number
    rightAmmount!: number



    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.renderer = new Renderer(canvas)
        this.scene = new Scene()

        this.forwardAmmount = 0
        this.rightAmmount = 0

        this.keyLabel = <HTMLElement>document.getElementById("key-label")
        $(document).on("keydown", (event) => { this.handleKeyPress(event) })
        $(document).on("keyup", (event) => { this.handleKeyRelease(event) })

        this.mouseXLabel = <HTMLElement>document.getElementById('mouse-x-label')
        this.mouseYLabel = <HTMLElement>document.getElementById('mouse-y-label')

        this.canvas.ondblclick = () => {
            this.canvas.requestPointerLock()
            this.canvas.requestFullscreen()
            this.canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event))
        }

    }

    async initialize() {
        await this.renderer.Initialize();
    }

    run = () => {
        var running: boolean = true
        this.scene.update()
        this.scene.move_player(this.forwardAmmount, this.rightAmmount)


        // running = false
        this.renderer.render(this.scene.getRenderables())

        if (running) {
            requestAnimationFrame(this.run)
        }
    }

    handleKeyPress(event: JQuery.KeyDownEvent) {
        this.keyLabel.innerText = event.code;

        switch (event.code) {
            case "ShiftLeft":
                this.forwardAmmount = 0.10
                break
            case "KeyW":
                this.forwardAmmount = 0.02
                break;
            case "KeyA":
                this.rightAmmount = -0.02
                break;
            case "KeyS":
                this.forwardAmmount = -0.02
                break;
            case "KeyD":
                this.rightAmmount = 0.02
                break;
            default:
                break;
        }
    }

    handleKeyRelease(event: JQuery.KeyUpEvent) {
        this.keyLabel.innerText = event.code;

        switch (event.code) {
            case "KeyW":
                this.forwardAmmount = 0
                break;
            case "KeyA":
                this.rightAmmount = 0
                break;
            case "KeyS":
                this.forwardAmmount = 0
                break;
            case "KeyD":
                this.rightAmmount = 0
                break;
                break;
            default:
                break;
        }
    }

    handleMouseMove(event: MouseEvent) {
        this.scene.spin_player(
            event.movementX / 2, -event.movementY / 2
        )
    }
}