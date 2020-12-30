uniform float RADIUS_PLANET;
uniform float RADIUS_ATMOSPHERE;
uniform vec2 RESOLUTION;
uniform vec3 LIGHTDIR;
// uniform vec3 cameraPosition;

varying vec3 vPos;

void main() {

    gl_FragColor = vec4((dot(normalize(vPos), LIGHTDIR) + 1.0) * 0.5);
    return;

    gl_FragColor = vec4(0.1, 0.8, 0.1, 1.0);
}