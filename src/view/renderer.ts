import shader from "./shaders/shader.wgsl"

import { TraingleMesh } from "./meshes/triangle_mesh";
import { QuadMesh } from "./meshes/quad_mesh ";

import { mat4 } from "gl-matrix";
import { Material } from "./materials/material";
import { objectTypes,renderData } from "../model/definitions";


export class Renderer {
    canvas: HTMLCanvasElement;

    adapter!: GPUAdapter;
    device!: GPUDevice;
    context!: GPUCanvasContext;
    format!: GPUTextureFormat;

    depthStencilState!: GPUDepthStencilState;
    depthStencilBuffer!: GPUTexture;
    depthStencilView!: GPUTextureView;
    depthStencilAttactchment!: GPURenderPassDepthStencilAttachment;
    // GPURenderPassDepthStencilAttachment ()
    

    uniformBuffer!: GPUBuffer;
    triangleBindGroup!: GPUBindGroup;
    quadBindGroup!: GPUBindGroup;
    pipeline!: GPURenderPipeline;

    triangleMesh!: TraingleMesh;
    quadMesh!: QuadMesh;

    triangleMaterial!: Material;
    quadMaterial!: Material;
    objectBuffer!: GPUBuffer;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    async Initialize() {
        await this.setupDevice();

        await this.createAssets();

        await this.makeDepthBufferResources

        await this.makePipeline();
    }

    async makeDepthBufferResources() {
        
        this.depthStencilState = {
            format:"depth24plus-stencil8",
            depthWriteEnabled: true,
            depthCompare: "less-equal"
        };

        const size:GPUExtent3D = {
            width: this.canvas.width,
            height: this.canvas.height,
            depthOrArrayLayers: 1
        }

        const depthBufferDescriptor: GPUTextureDescriptor = {
            size: size,
            format: "depth24plus-stencil8",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor)
        
        const viewDescriptor : GPUTextureViewDescriptor = {
            format: "depth24plus-stencil8",
            dimension: "2d",
            aspect: "all",
        }
        
        this.depthStencilView = this.depthStencilBuffer.createView(viewDescriptor)

        this.depthStencilAttactchment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: "clear",
            depthStoreOp: "store",

            stencilLoadOp: "clear",
            stencilStoreOp: "discard"
        }


    }

    async setupDevice() {
        this.adapter = <GPUAdapter>await navigator.gpu?.requestAdapter();
        this.device = <GPUDevice>await this.adapter?.requestDevice();
        this.context = <GPUCanvasContext>this.canvas.getContext('webgpu');
        this.format = "bgra8unorm";
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: "opaque"
        });
    }

    async makePipeline() {
        this.uniformBuffer = this.device.createBuffer({
            size: 64 * 2,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {},
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false,
                        minBindingSize: 16 * 1024
                    }
                },
            ],
        });

        this.triangleBindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: this.triangleMaterial.view,
                },
                {
                    binding: 2,
                    resource: this.triangleMaterial.sampler
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.objectBuffer
                    }
                }
            ]
        });

        this.quadBindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                },
                {
                    binding: 1,
                    resource: this.quadMaterial.view,
                },
                {
                    binding: 2,
                    resource: this.quadMaterial.sampler
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.objectBuffer
                    }
                }
            ]
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: shader
                }),
                entryPoint: "vs_main",
                buffers: [this.triangleMesh.bufferLayout]
            },

            fragment: {
                module: this.device.createShaderModule({
                    code: shader
                }),
                entryPoint: "fs_main",
                targets: [{
                    format: this.format
                }]
            },

            primitive: {
                topology: "triangle-list"
            },



            layout: pipelineLayout,
            depthStencil: this.depthStencilState
        });
    }

    async createAssets() {
        this.triangleMesh = new TraingleMesh(this.device);
        this.triangleMaterial = new Material();
        this.quadMesh = new QuadMesh(this.device)
        this.quadMaterial = new Material();
        
        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: 16 * 4 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }

        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor)

        await this.triangleMaterial.initialize(this.device, "img/iron_texture.png")
        await this.quadMaterial.initialize(this.device, "img/iron_texture2.png")
    }

    async render(renderables: renderData) {


        const projection = mat4.create();
        mat4.perspective(projection, Math.PI / 4, 1920 / 1080, 0.1, 10);

        const view = renderables.viewTransforms;

        this.device.queue.writeBuffer(
            this.objectBuffer, 0, renderables.modelTransforms, 0, renderables.modelTransforms.length
            )
        this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>view);
        this.device.queue.writeBuffer(this.uniformBuffer, 64, <ArrayBuffer>projection);

        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();
        const textureView: GPUTextureView = this.context.getCurrentTexture().createView();
        
        
        const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.5, g: 0.0, b: 0.5, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }],
            depthStencilAttachment: this.depthStencilAttactchment
        });

        renderpass.setPipeline(this.pipeline);

        var objectsDrawn: number = 0;


        renderpass.setVertexBuffer(0, this.triangleMesh.buffer)
        renderpass.setBindGroup(0, this.triangleBindGroup)
        renderpass.draw(3, renderables.objectCounts[objectTypes.triangle], 0, objectsDrawn);
        objectsDrawn += renderables.objectCounts[objectTypes.triangle]

        renderpass.setVertexBuffer(0, this.quadMesh.buffer)
        renderpass.setBindGroup(0, this.quadBindGroup)
        renderpass.draw(6, renderables.objectCounts[objectTypes.quad], 0, objectsDrawn);
        objectsDrawn += renderables.objectCounts[objectTypes.quad]



        renderpass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }
}