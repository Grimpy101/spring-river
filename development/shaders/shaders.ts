const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform vec4 uTransform;
uniform mat4 uMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 newPosition = uTransform + aPosition;
    gl_Position = uMatrix * newPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
}
`;

export default {
    shader1: { vertex, fragment }
};