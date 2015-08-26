
precision mediump float;

uniform sampler2D texture;

uniform vec2 resolution;

uniform float time;
uniform vec2 mouse;

vec3 rotateX(in vec3 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

vec3 rotateY(vec3 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotateZ(vec3 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
}

void main() {
  /* vec2 uv = gl_FragCoord.xy / resolution.xy; */

  float yy = gl_FragCoord.y / 200.0;
  float xx = gl_FragCoord.x / 200.0;

  vec2 o = vec2(
    40.0 * cos(time * 3.0 + yy + xx),
    80.0 * sin(time * 2.4- xx));

  float r = time + 510.0 * sin(time / 1.0);

  vec2 p = (gl_FragCoord.xy + o) / vec2(30.0, 30.0);

  int x = int(mod(p.x, 2.0));
  int y = int(mod(p.y, 2.0));
  int t = x * (1 - y) + y * (1 - x);

  float sh = float(t) / 2.0;
  float br = ((o.x-0.5)*(o.y-0.5)) / 10000.0;

  gl_FragColor = vec4(
    sh + br,
    sh + br,
    sh + br,
    1);
}
