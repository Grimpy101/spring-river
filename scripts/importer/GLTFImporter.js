var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Accessor from "../data/Accessor.js";
import BufferView from "../data/BufferView.js";
import Material from "../data/Material.js";
import Mesh from "../data/Mesh.js";
import Node from "../data/Node.js";
import PerspectiveCamera from "../data/camera/PerspectiveCamera.js";
import OrthographicCamera from "../data/camera/OrthographicCamera.js";
import Primitive from "../data/Primitive.js";
import Sampler from "../data/Sampler.js";
import Scene from "../data/Scene.js";
import Texture from "../data/Texture.js";
import PointLight from "../data/light/PointLight.js";
export default class GLTFImporter {
    constructor() {
        this.gltf = null;
        this.gltfUlr = null;
        this.dirname = null;
        this.cache = new Map();
    }
    fetchJson(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            return yield response.json();
        });
    }
    fetchBuffer(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            return yield response.arrayBuffer();
        });
    }
    fetchImage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let image = new Image();
                image.addEventListener('load', e => resolve(image));
                image.addEventListener('error', reject);
                image.src = url;
            });
        });
    }
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gltfUlr = new URL(url, window.location.href);
            this.gltf = yield this.fetchJson(url);
            this.defaultScene = this.gltf.scene || 0;
        });
    }
    findByNameOrIndex(set, nameOrIndex) {
        if (typeof nameOrIndex === 'number') {
            return set[nameOrIndex];
        }
        else {
            return set.find(element => element.name === nameOrIndex);
        }
    }
    loadBuffer(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfBuffer = this.findByNameOrIndex(this.gltf.buffers, nameOrIndex);
            if (this.cache.has(gltfBuffer)) {
                return this.cache.get(gltfBuffer);
            }
            const url = new URL(gltfBuffer.uri, this.gltfUlr);
            const buffer = yield this.fetchBuffer(url.href);
            this.cache.set(gltfBuffer, buffer);
            return buffer;
        });
    }
    loadBufferView(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfBufferView = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex);
            if (this.cache.has(gltfBufferView)) {
                return this.cache.get(gltfBufferView);
            }
            const bufferView = new BufferView(Object.assign(Object.assign({}, gltfBufferView), { buffer: yield this.loadBuffer(gltfBufferView.buffer) }));
            this.cache.set(gltfBufferView, BufferView);
            return bufferView;
        });
    }
    loadAccessor(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfAccessor = this.findByNameOrIndex(this.gltf.accessors, nameOrIndex);
            if (this.cache.has(gltfAccessor)) {
                return this.cache.get(gltfAccessor);
            }
            const accessorTypeToNumComponentsMap = {
                SCALAR: 1,
                VEC2: 2,
                VEC3: 3,
                VEC4: 4,
                MAT2: 4,
                MAT3: 9,
                MAT4: 16
            };
            const bufferView = yield this.loadBufferView(gltfAccessor.bufferView);
            const accessor = new Accessor(Object.assign(Object.assign({}, gltfAccessor), { bufferView: bufferView, numComponents: accessorTypeToNumComponentsMap[gltfAccessor.type] }));
            this.cache.set(gltfAccessor, accessor);
            return accessor;
        });
    }
    loadSampler(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfSampler = this.findByNameOrIndex(this.gltf.samplers, nameOrIndex);
            if (this.cache.has(gltfSampler)) {
                return this.cache.get(gltfSampler);
            }
            const sampler = new Sampler({
                min: gltfSampler.minFilter,
                mag: gltfSampler.magFilter,
                wrapS: gltfSampler.wrapS,
                wrapT: gltfSampler.wrapT
            });
            this.cache.set(gltfSampler, sampler);
            return sampler;
        });
    }
    loadImage(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfImage = this.findByNameOrIndex(this.gltf.images, nameOrIndex);
            if (this.cache.has(gltfImage)) {
                return this.cache.get(gltfImage);
            }
            if (gltfImage.uri) {
                const url = new URL(gltfImage.uri, this.gltfUlr);
                const image = yield this.fetchImage(url.href);
                this.cache.set(gltfImage, image);
                return image;
            }
            else {
                const bufferView = yield this.loadBufferView(gltfImage.bufferView);
                const blob = new Blob([bufferView], { type: gltfImage.mimeType });
                const url = URL.createObjectURL(blob);
                const image = yield this.fetchImage(url);
                URL.revokeObjectURL(url);
                this.cache.set(gltfImage, image);
                return image;
            }
        });
    }
    loadTexture(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfTexture = this.findByNameOrIndex(this.gltf.textures, nameOrIndex);
            if (this.cache.has(gltfTexture)) {
                return this.cache.get(gltfTexture);
            }
            let options = {};
            if (gltfTexture.source !== undefined) {
                options.image = yield this.loadImage(gltfTexture.source);
            }
            if (gltfTexture.sampler !== undefined) {
                options.sampler = yield this.loadSampler(gltfTexture.sampler);
            }
            const texture = new Texture(options);
            this.cache.set(gltfTexture, texture);
            return texture;
        });
    }
    loadMaterial(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfMaterial = this.findByNameOrIndex(this.gltf.materials, nameOrIndex);
            if (this.cache.has(gltfMaterial)) {
                return this.cache.get(gltfMaterial);
            }
            let options = {};
            const pbr = gltfMaterial.pbrMetallicRoughness;
            if (pbr !== undefined) {
                if (pbr.baseColorTexture !== undefined) {
                    options.baseColorTexture = yield this.loadTexture(pbr.baseColorTexture.index);
                    options.baseColorTexCoord = pbr.baseColorTexture.texCoord;
                }
                if (pbr.metallicRoughnessTexture !== undefined) {
                    options.metallicRoughnessTexture = yield this.loadTexture(pbr.metallicRoughnessTexture.index);
                    options.metallicRoughnessTexCoord = pbr.metallicRoughnessTexture.texCoord;
                }
                options.baseColorFactor = pbr.baseColorFactor;
                options.metallicFactor = pbr.metallicFactor;
                options.roughnessFactor = pbr.roughnessFactor;
                if (gltfMaterial.normalTexture !== undefined) {
                    options.normalTexture = yield this.loadTexture(gltfMaterial.normalTexture.index);
                    options.normalTexCoord = gltfMaterial.normalTexture.texCoord;
                    options.normalFactor = gltfMaterial.normalTexture.scale;
                }
                if (gltfMaterial.occlusionTexture !== undefined) {
                    options.occlusionTexture = yield this.loadTexture(gltfMaterial.occlusionTexture.index);
                    options.occlusionTexCoord = gltfMaterial.occlusionTexture.texCoord;
                    options.occlusionFactor = gltfMaterial.occlusionTexture.strength;
                }
                if (gltfMaterial.emissiveTexture !== undefined) {
                    options.emissiveTexture = yield this.loadTexture(gltfMaterial.emissiveTexture.index);
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
        });
    }
    loadMesh(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfMesh = this.findByNameOrIndex(this.gltf.meshes, nameOrIndex);
            if (this.cache.has(gltfMesh)) {
                return this.cache.get(gltfMesh);
            }
            let options = {
                name: gltfMesh.name,
                primitives: []
            };
            for (const primitiveSpec of gltfMesh.primitives) {
                let primitiveOptions = {};
                primitiveOptions.attributes = {};
                for (const name in primitiveSpec.attributes) {
                    primitiveOptions.attributes[name] = yield this.loadAccessor(primitiveSpec.attributes[name]);
                }
                if (primitiveSpec.indices !== undefined) {
                    primitiveOptions.indices = yield this.loadAccessor(primitiveSpec.indices);
                }
                if (primitiveSpec.material !== undefined) {
                    primitiveOptions.material = yield this.loadMaterial(primitiveSpec.material);
                }
                primitiveOptions.mode = primitiveSpec.mode;
                const primitive = new Primitive(primitiveOptions);
                options.primitives.push(primitive);
            }
            const mesh = new Mesh(options);
            this.cache.set(gltfMesh, mesh);
            return mesh;
        });
    }
    loadCamera(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfCamera = this.findByNameOrIndex(this.gltf.cameras, nameOrIndex);
            if (this.cache.has(gltfCamera)) {
                return this.cache.get(gltfCamera);
            }
            if (gltfCamera.type === 'perspective') {
                const persp = gltfCamera.perspective;
                const camera = new PerspectiveCamera({
                    aspect: persp.aspectRatio,
                    fov: persp.yfov,
                    near: persp.znear,
                    far: persp.zfar,
                    name: gltfCamera.name,
                    type: gltfCamera.type
                });
                this.cache.set(gltfCamera, camera);
                console.log(camera);
                return camera;
            }
            else if (gltfCamera.type === 'orthographic') {
                const ortho = gltfCamera.orthographic;
                const camera = new OrthographicCamera({
                    left: -ortho.xmag,
                    right: ortho.xmag,
                    bottom: -ortho.ymag,
                    top: ortho.ymag,
                    near: ortho.znear,
                    far: ortho.zfar,
                    name: gltfCamera.name,
                    type: gltfCamera.type
                });
                this.cache.set(gltfCamera, camera);
                return camera;
            }
            else {
                throw new Error("Tip kamere ni podprt.");
            }
        });
    }
    loadLight(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfLight = this.findByNameOrIndex(this.gltf.extensions.KHR_lights_punctual.lights, nameOrIndex);
            if (this.cache.has(gltfLight)) {
                return this.cache.get(gltfLight);
            }
            let options = {};
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
            }
            else {
                throw new Error("Tip luci ni podprt.");
            }
        });
    }
    loadNode(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfNode = this.findByNameOrIndex(this.gltf.nodes, nameOrIndex);
            if (this.cache.has(gltfNode)) {
                return this.cache.get(gltfNode);
            }
            let options = Object.assign(Object.assign({}, gltfNode), { children: [] });
            if (gltfNode.children) {
                for (const nodeIndex of gltfNode.children) {
                    const node = yield this.loadNode(nodeIndex);
                    options.children.push(node);
                }
            }
            if (gltfNode.camera !== undefined) {
                options.camera = yield this.loadCamera(gltfNode.camera);
            }
            if (gltfNode.mesh !== undefined) {
                options.mesh = yield this.loadMesh(gltfNode.mesh);
            }
            if (gltfNode.extensions !== undefined) {
                if (gltfNode.extensions.KHR_lights_punctual !== undefined) {
                    options.light = yield this.loadLight(gltfNode.extensions.KHR_lights_punctual.light);
                }
            }
            const node = new Node(options);
            this.cache.set(gltfNode, node);
            return node;
        });
    }
    loadScene(nameOrIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const gltfScene = this.findByNameOrIndex(this.gltf.scenes, nameOrIndex);
            if (this.cache.has(gltfScene)) {
                return this.cache.get(gltfScene);
            }
            let options = {
                nodes: []
            };
            if (gltfScene.nodes) {
                for (const nodeIndex of gltfScene.nodes) {
                    const node = yield this.loadNode(nodeIndex);
                    options.nodes.push(node);
                }
            }
            const scene = new Scene(options);
            this.cache.set(gltfScene, scene);
            return scene;
        });
    }
}
//# sourceMappingURL=GLTFImporter.js.map