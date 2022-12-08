precision mediump float;
precision mediump sampler2D;

varying vec2 coords;
uniform vec2 ratio;
uniform sampler2D density;
uniform sampler2D image;
uniform float scroll;

void main(void) {
  vec2 pos = vec2(coords.x,1.0-coords.y);//vec2(coords.x - 0.5, 0.75 - coords.y+scroll) * ratio * 2.0 + vec2(0.5, 0.5);
  vec4 logo = texture2D(image, pos);
  float ler = 1.0;
  if(logo.xyz==vec3(1.0)){
    ler=0.1;
  }
  if(logo.w<0.5){ler=0.0; }
  ler=0.0;
  
  vec4 newColor=texture2D(density, coords)*(1.0-ler)+ logo * ler;
  gl_FragColor = newColor;
}