import Accessor from "../data/Accessor";
import BufferView from "../data/BufferView";
import Light from "../data/light/Light";
import Material from "../data/Material";
import Mesh from "../data/Mesh";
import Node from "../data/Node";
import Camera from "../data/camera/Camera";
import PerspectiveCamera from "../data/camera/PerspectiveCamera";
import OrthographicCamera from "../data/camera/OrthographicCamera";
import Primitive from "../data/Primitive";
import Sampler from "../data/Sampler";
import Scene from "../data/Scene";
import Texture from "../data/Texture";
import { GlTf } from "../schemas/GLTF_types";

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
            buffeView: bufferView,
            numComponents: accessorTypeToNumComponentsMap[gltfAccessor.type]
        });
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
            let primitiveOptions: any = {
                attributes: {}
            };
            for (const name in primitiveOptions.attributes) {
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
            throw new Error("Tip kamere ni veljaven.");
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