const vertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uViewModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

out vec2 vTexCoord;
out vec3 vVertexPosition;
out vec3 vNormal;
out vec4 vVertexRelativeToLight;

void main() {
    vVertexRelativeToLight = uShadowMatrix * aPosition;
    vVertexPosition = (uViewModelMatrix * aPosition).xyz;
    vNormal = aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * vec4(vVertexPosition, 1);
}
`;
const fragment = `#version 300 es
precision mediump float;

uniform mat4 uViewModelMatrix;

uniform mediump sampler2D uTexture;
uniform mediump sampler2D uShadowMap;
uniform mediump sampler2D uNormalMap;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;

uniform float uShininess;
uniform float uLightRange;
uniform vec4 uLightPosition;

in vec3 vVertexPosition;
in vec3 vNormal;
in vec2 vTexCoord;

in vec4 vVertexRelativeToLight;

out vec4 oColor;

float shadowFactor() {
    float visibility = 1.0;
    float dLight2Occluder = texture(uShadowMap, vVertexRelativeToLight.xy / vVertexRelativeToLight.z).r;
    float dLight2Fragment = vVertexRelativeToLight.z;
    if (dLight2Occluder < dLight2Fragment) {
        visibility = 0.5;
    }
    if (vVertexRelativeToLight.z == 1.0) {
        visibility = 0.0;
    }
    return visibility;
}

vec3 lightFactor() {
    vec3 lightPosition = uLightPosition.xyz;
    float d = distance(vVertexPosition, lightPosition);
    float atten1 = 1.0 - pow(d / uLightRange, 4.0);
    float atten2 = min(atten1, 1.0);
    float attenuation = max(atten2, 0.0) / (d * d);

    vec3 N = (uViewModelMatrix * vec4(vNormal, 0)).xyz;
    vec3 L = normalize(lightPosition - vVertexPosition);
    vec3 E = normalize(-vVertexPosition);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N));
    float phong = pow(max(0.0, dot(E, R)), uShininess);

    vec3 ambient = uAmbientColor;
    vec3 diffuse = uDiffuseColor * lambert;
    vec3 specular = uSpecularColor * phong;

    return ((ambient + diffuse + specular) * attenuation);
}

void main() {
    oColor = vec4(0.0);

    vec3 light = lightFactor() * shadowFactor();

    oColor += texture(uTexture, vTexCoord) * vec4(light, 1);
    //oColor = texture(uShadowMap, vVertexRelativeToLight.xy) * vec4(0.5, 1, 1, 1);
}
`;
const shadow_vertex = `#version 300 es
precision mediump float;

layout (location = 0) in vec4 aPosition;

uniform mat4 uMVPMatrix;

void main() {
    gl_Position = uMVPMatrix * aPosition;
}
`;
const shadow_fragment = `#version 300 es
precision mediump float;

void main() {}
`;
export default {
    shader1: { vertex, fragment },
    shader_shadow: {
        "vertex": shadow_vertex,
        "fragment": shadow_fragment
    }
};
//# sourceMappingURL=shaders.js.map