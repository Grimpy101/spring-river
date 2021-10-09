const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform vec4 uTransform;
uniform mat4 uMatrix;
uniform vec4 uRotor;
uniform vec3 uScale;

out vec2 vTexCoord;

vec4 rotate(vec4 v, vec4 r) {
    vec3 q;
    q.x = r.x * v.x + r.y * v.y + r.w * v.z;
    q.y = r.x * v.y + r.y * v.x + r.z * v.z;
    q.z = r.x * v.z + r.w * v.x + r.z * v.y;
    float xyz;
    xyz = r.z * v.x - r.w * v.y + r.y * v.z;
    vec4 newVector;
    newVector.x = r.x * q.x + r.y * q.y + r.w * q.z + r.z * xyz;
    newVector.y = r.x * q.y - r.y * q.x - r.w * xyz + r.z * q.z;
    newVector.z = r.x * q.z + r.y * xyz - r.w * q.x - r.z * q.y;
    newVector.w = 1.0;
    return newVector;
}

vec4 scale(vec4 v, vec3 s) {
    vec4 scaledVector;
    scaledVector.x = v.x * s.x;
    scaledVector.y = v.y * s.y;
    scaledVector.z = v.z * s.z;
    return scaledVector;
}

void main() {
    vTexCoord = aTexCoord;
    vec4 newPosition = uTransform + aPosition;
    newPosition = rotate(newPosition, uRotor);
    newPosition = scale(newPosition, uScale);
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