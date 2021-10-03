import GLTFImporter from "./importer/GLTFImporter.js";
window.addEventListener('load', () => {
    console.log("Dela!");
    const importer = new GLTFImporter();
    let json = importer.fetchJson("level_01/test_scene.gltf");
    console.log(json);
});
//# sourceMappingURL=main.js.map