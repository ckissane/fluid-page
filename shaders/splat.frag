precision highp float;
precision mediump sampler2D;

varying vec2 coords;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main () {
    vec2 p = coords - point.xy;
    p.x *= aspectRatio;
    float splat = exp(-dot(p, p) / radius);
    vec4 base = texture2D(uTarget, coords).xyzw;
    gl_FragColor = vec4(base.xyz*(1.0-splat) + splat*color, splat+base.w*(1.0-splat));
}
