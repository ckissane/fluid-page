precision mediump float;
precision mediump sampler2D;

varying vec2 coords;
uniform vec2 ratio;
uniform sampler2D image;
uniform float scroll;

void main(void) {
  vec2 pos = vec2(coords.x,coords.y+scroll);//vec2(coords.x - 0.5, 0.75 - coords.y+scroll) * ratio * 2.0 + vec2(0.5, 0.5);
  vec4 logo = texture2D(image, pos);
  
  gl_FragColor = logo;
  if(pos.y<0.0 ||pos.y>1.0){
gl_FragColor = vec4(0.0);
  }
}