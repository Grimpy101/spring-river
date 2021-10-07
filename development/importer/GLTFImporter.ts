import Accessor from "../data/Accessor.js";
import BufferView from "../data/BufferView.js";
import Light from "../data/light/Light.js";
import Material from "../data/Material.js";
import Mesh from "../data/Mesh.js";
import Node from "../data/Node.js";
import Camera from "../data/camera/Camera.js";
import PerspectiveCamera from "../data/camera/PerspectiveCamera.js";
import OrthographicCamera from "../data/camera/OrthographicCamera.js";
import Primitive from "../data/Primitive.js";
import Sampler from "../data/Sampler.js";
import Scene from "../data/Scene.js";
import Texture from "../data/Texture.js";
import { GlTf } from "../schemas/GLTF_types.js";
import SpotLight from "../data/light/SpotLight.js";
import PointLight from "../data/light/PointLight.js";

export default class GLTFImporter {

    gltf: GlTf;
    gltfUlr: URL;
    dirname: string;
    
    defaultScene: number;
    cache: Map<any, any>;

    constructor() {
        this.gltf = null;
        this.gltfUlr = null;
        this.dirname = null;

        this.cache = new Map();
    }

    async fetchJson(url: string) {
        const response = await fetch(url);
        return await response.json();
    }
    
    async fetchBuffer(url: string) {
        const response = await fetch(url);
        return await response.arrayBuffer();
    }

    async fetchImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', e => resolve(image));
            image.addEventListener('error', reject);
            image.src = url;
        });
    }

    async load(url: string) {
        this.gltfUlr = new URL(url, window.location.href);
        this.gltf = await this.fetchJson(url);
        this.defaultScene = this.gltf.scene || 0;
    }

    findByNameOrIndex(set: Array<any>, nameOrIndex: string | number) {
        if (typeof nameOrIndex === 'number') {
            return set[nameOrIndex];
        } else {
            return set.find(element => element.name === nameOrIndex);
        }
    }

    async loadBuffer(nameOrIndex: string | number): Promise<ArrayBuffer> {
        const gltfBuffer = this.findByNameOrIndex(this.gltf.buffers, nameOrIndex);
        if (this.cache.has(gltfBuffer)) {
            return this.cache.get(gltfBuffer);
        }

        const url = new URL(gltfBuffer.uri, this.gltfUlr);
        const buffer = await this.fetchBuffer(url.href);
        this.cache.set(gltfBuffer, buffer);
        return buffer;
    }

    async loadBufferView(nameOrIndex: string | number): Promise<BufferView> {
        const gltfBufferView = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex);
        if (this.cache.has(gltfBufferView)) {
            return this.cache.get(gltfBufferView);
        }

        const bufferView = new BufferView({
            ...gltfBufferView,
            buffer: await this.loadBuffer(gltfBufferView.buffer),
        });
        this.cache.set(gltfBufferView, BufferView);
        return bufferView;
    }

    async loadAccessor(nameOrIndex: string | number): Promise<Accessor> {
        const gltfAccessor = this.findByNameOrIndex(this.gltf.accessors, nameOrIndex);
        if (this.cache.has(gltfAccessor)) {
            return this.cache.get(gltfAccessor);
        }

        const accessorTypeToNumComponentsMap: {[name: string]: number} = {
            SCALAR  : 1,
            VEC2    : 2,
            VEC3    : 3,
            VEC4    : 4,
            MAT2    : 4,
            MAT3    : 9,
            MAT4    : 16
        };

        const bufferView = await this.loadBufferView(gltfAccessor.bufferView);

        const accessor = new Accessor({
            ...gltfAccessor,
            bufferView: bufferView,
            numComponents: accessorTypeToNumComponentsMap[gltfAccessor.type]
        });
        this.cache.set(gltfAccessor, accessor);
        return accessor;
    }

    async loadSampler(nameOrIndex: string | number): Promise<Sampler> {
        const gltfSampler = this.findByNameOrIndex(this.gltf.samplers, nameOrIndex);
        if (this.cache.has(gltfSampler)) {
            return this.cache.get(gltfSampler);
        }

        const sampler = new Sampler({
            min:    gltfSampler.minFilter,
            mag:    gltfSampler.magFilter,
            wrapS:  gltfSampler.wrapS,
            wrapT:  gltfSampler.wrapT
        });
        this.cache.set(gltfSampler, sampler);
        return sampler;
    }

    async loadImage(nameOrIndex: string | number): Promise<HTMLImageElement> {
        const gltfImage = this.findByNameOrIndex(this.gltf.images, nameOrIndex);
        if (this.cache.has(gltfImage)) {
            return this.cache.get(gltfImage);
        }

        if (gltfImage.uri) {
            const url = new URL(gltfImage.uri, this.gltfUlr);
            const image = await this.fetchImage(url.href);
            this.cache.set(gltfImage, image);
            return image;
        } else {
            const bufferView = await this.loadBufferView(gltfImage.bufferView);
            const blob = new Blob([bufferView], { type: gltfImage.mimeType });
            const url = URL.createObjectURL(blob);
            const image = await this.fetchImage(url);
            URL.revokeObjectURL(url);
            this.cache.set(gltfImage, image);
            return image;
        }
    }

    async loadTexture(nameOrIndex: string | number): Promise<Texture> {
        const gltfTexture = this.findByNameOrIndex(this.gltf.textures, nameOrIndex);
        if (this.cache.has(gltfTexture)) {
            return this.cache.get(gltfTexture);
        }

        let options: {[name: string]: any} = {};
        if (gltfTexture.source !== undefined) {
            options.image = await this.loadImage(gltfTexture.source);
        }
        if (gltfTexture.sampler !== undefined) {
            options.sampler = await this.loadSampler(gltfTexture.sampler);
        }

        const texture = new Texture(options);
        this.cache.set(gltfTexture, texture);
        return texture;
    }

    async loadMaterial(nameOrIndex: string | number): Promise<Material> {
        const gltfMaterial = this.findByNameOrIndex(this.gltf.materials, nameOrIndex);
        if (this.cache.has(gltfMaterial)) {
            return this.cache.get(gltfMaterial);
        }

        let options: {[name: string]: any} = {};
        const pbr = gltfMaterial.pbrMetallicRoughness;
        if (pbr !== undefined) {
            if (pbr.baseColorTexture !== undefined) {
                options.baseColorTexture = await this.loadTexture(pbr.baseColorTexture.index);
                options.baseColorTexCoord = pbr.baseColorTexture.texCoord;
            }
            if (pbr.metallicRoughnessTexture !== undefined) {
                options.metallicRoughnessTexture = await this.loadTexture(pbr.metallicRoughnessTexture.index);
                options.metallicRoughnessTexCoord = pbr.metallicRoughnessTexture.texCoord;
            }
            options.baseColorFactor = pbr.baseColorFactor;
            options.metallicFactor = pbr.metallicFactor;
            options.roughnessFactor = pbr.roughnessFactor;

            if (gltfMaterial.normalTexture !== undefined) {
                options.normalTexture = await this.loadTexture(gltfMaterial.normalTexture.index);
                options.normalTexCoord = gltfMaterial.normalTexture.texCoord;
                options.normalFactor = gltfMaterial.normalTexture.scale;
            }

            if (gltfMaterial.occlusionTexture !== undefined) {
                options.occlusionTexture = await this.loadTexture(gltfMaterial.occlusionTexture.index);
                options.occlusionTexCoord = gltfMaterial.occlusionTexture.texCoord;
                options.occlusionFactor = gltfMaterial.occlusionTexture.strength;
            }

            if (gltfMaterial.emissiveTexture !== undefined) {
                options.emissiveTexture = await this.loadTexture(gltfMaterial.emissiveTexture.index);
                options.emissiveTexCoord = gltfMaterial.emissiveTexture.texCoord;
                options.emissiveFactor = gltfMaterial.emissiveFactor;
            }

            options.alphaMode = gltfMaterial.alphaMode;
            options.alphaCutoff = gltfMaterial.alphaCutoff;
            options.doubleSided = gltfMaterial.doubleSided;

            const material = new Material(options);
            this.cache.set(gltfMaterial, material);
            return material;
        }
    }

    async loadMesh(nameOrIndex: string | number): Promise<Mesh> {
        const gltfMesh = this.findByNameOrIndex(this.gltf.meshes, nameOrIndex);
        if (this.cache.has(gltfMesh)) {
            return this.cache.get(gltfMesh);
        }

        let options: {[name: string]: any} = {
            name: gltfMesh.name,
            primitives: []
        }
        for (const primitiveSpec of gltfMesh.primitives) {
            let primitiveOptions: any = {};
            primitiveOptions.attributes = {};
            for (const name in primitiveSpec.attributes) {
                primitiveOptions.attributes[name] = await this.loadAccessor(primitiveSpec.attributes[name]);
            }
            if (primitiveSpec.indices !== undefined) {
                primitiveOptions.indices = await this.loadAccessor(primitiveSpec.indices);
            }
            if (primitiveSpec.material !== undefined) {
                primitiveOptions.material = await this.loadMaterial(primitiveSpec.material);
            }
            primitiveOptions.mode = primitiveSpec.mode;
            const primitive = new Primitive(primitiveOptions);
            options.primitives.push(primitive);
        }

        const mesh = new Mesh(options);
        this.cache.set(gltfMesh, mesh);
        return mesh;
    }

    async loadCamera(nameOrIndex: string | number): Promise<Camera> {
        const gltfCamera = this.findByNameOrIndex(this.gltf.cameras, nameOrIndex);
        if (this.cache.has(gltfCamera)) {
            return this.cache.get(gltfCamera);
        }

        if (gltfCamera.type === 'perspective') {
            const persp = gltfCamera.perspective;
            const camera = new PerspectiveCamera({
                aspect: persp.aspectRatio,
                fov:    persp.yfov,
                near:   persp.znear,
                far:    persp.zfar,
                name:   gltfCamera.name,
                type:   gltfCamera.type
            });
            this.cache.set(gltfCamera, camera);
            return camera;
        } else if (gltfCamera.type === 'orthographic') {
            const ortho = gltfCamera.orthographic;
            const camera = new OrthographicCamera({
                left:   -ortho.xmag,
                right:   ortho.xmag,
                bottom: -ortho.ymag,
                top:     ortho.ymag,
                near:    ortho.znear,
                far:     ortho.zfar,
                name:    gltfCamera.name,
                type: gltfCamera.type
            });
            this.cache.set(gltfCamera, camera);
            return camera;
        } else {
            throw new Error("Tip kamere ni podprt.");
        }
    }

    async loadLight(nameOrIndex: string | number): Promise<Light> {
        const gltfLight = this.findByNameOrIndex(this.gltf.extensions.KHR_lights_punctual.lights, nameOrIndex);
        if (this.cache.has(gltfLight)) {
            return this.cache.get(gltfLight);
        }

        let options: {[name: string]: any} = {};

        if (gltfLight.color !== undefined) {
            options.color = gltfLight.color;
        }
        if (gltfLight.intensity !== undefined) {
            options.intensity = gltfLight.intensity;
        }
        if (gltfLight.name !== undefined) {
            options.name = options.name;
        }

        if (gltfLight.type === 'point') {
            const light = new PointLight(options);
            this.cache.set(gltfLight, light);
            return light;
        } else {
            throw new Error("Tip luci ni podprt.")
        }
    }

    async loadNode(nameOrIndex: string | number): Promise<Node> {
        const gltfNode = this.findByNameOrIndex(this.gltf.nodes, nameOrIndex);
        if (this.cache.has(gltfNode)) {
            return this.cache.get(gltfNode);
        }

        let options: {[name: string]: any} = {
            ...gltfNode,
            children: []
        };

        if (gltfNode.children) {
            for (const nodeIndex of gltfNode.children) {
                const node = await this.loadNode(nodeIndex);
                options.children.push(node);
            }
        }
        if (gltfNode.camera !== undefined) {
            options.camera = await this.loadCamera(gltfNode.camera);
        }
        if (gltfNode.mesh !== undefined) {
            options.mesh = await this.loadMesh(gltfNode.mesh);
        }
        if (gltfNode.extensions !== undefined) {
            if (gltfNode.extensions.KHR_lights_punctual !== undefined) {
                options.light = await this.loadLight(gltfNode.extensions.KHR_lights_punctual.light);
            }
        }

        const node = new Node(options);
        this.cache.set(gltfNode, node);
        return node;
    }

    async loadScene(nameOrIndex: string | number): Promise<Scene> {
        const gltfScene = this.findByNameOrIndex(this.gltf.scenes, nameOrIndex);
        if (this.cache.has(gltfScene)) {
            return this.cache.get(gltfScene);
        }

        let options: { [name: string]: any[] } = {
            nodes: []
        };

        if (gltfScene.nodes) {
            for (const nodeIndex of gltfScene.nodes) {
                const node = await this.loadNode(nodeIndex);
                options.nodes.push(node);
            }
        }

        const scene = new Scene(options);
        this.cache.set(gltfScene, scene);
        return scene;
    }
}