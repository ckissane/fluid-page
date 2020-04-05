import { regl } from "./canvas";
import { TEXTURE_DOWNSAMPLE } from "./config";
import { velocity, density, pressure, divergenceTex } from "./fbos";
import html2canvas from "html2canvas";
import domtoimage from 'dom-to-image';
import projectShader from "../shaders/project.vert";
import splatShader from "../shaders/splat.frag";
import logoShader from "../shaders/logo.frag";
import advectShader from "../shaders/advect.frag";
import advectColorShader from "../shaders/advectColor.frag";
import divergenceShader from "../shaders/divergence.frag";
import clearShader from "../shaders/clear.frag";
import gradientSubtractShader from "../shaders/gradientSubtract.frag";
import jacobiShader from "../shaders/jacobi.frag";
import displayShader from "../shaders/display.frag";
import scrollShader from "../shaders/scroll.frag";

import imgURL from "../img/logo.png";

const texelSize = ({ viewportWidth, viewportHeight }) => [1 / viewportWidth, 1 / viewportHeight];
const viewport = ({ viewportWidth, viewportHeight }) => ({
	x: 0,
	y: 0,
	width: viewportWidth >> TEXTURE_DOWNSAMPLE,
	height: viewportHeight >> TEXTURE_DOWNSAMPLE,
});

export const fullscreen = regl({
	vert: projectShader,
	attributes: {
		points: [1, 1, 1, -1, -1, -1, 1, 1, -1, -1, -1, 1],
	},
	count: 6,
});

const splat = regl({
	frag: splatShader,
	framebuffer: regl.prop("framebuffer"),
	uniforms: {
		uTarget: regl.prop("uTarget"),
		aspectRatio: ({ viewportWidth, viewportHeight }) => viewportWidth / viewportHeight,
		point: regl.prop("point"),
		color: regl.prop("color"),
		radius: regl.prop("radius"),
	},
	viewport,
});
const scrollk = regl({
	frag: scrollShader,
	framebuffer: regl.prop("framebuffer"),
	uniforms: {
		image: regl.prop("x"),
		ratio: ({ viewportWidth, viewportHeight }) => {
			return [1, 1];// viewportWidth > viewportHeight ? [viewportWidth / viewportHeight, 1.0] : [1.0, viewportHeight / viewportWidth];
		},
		scroll: regl.prop("scroll"),
		dissipation: regl.prop("dissipation"),
	},
	viewport,
});

const img = new Image();
img.src = imgURL;
let logo_tex;
let logo;
img.onload = () => {
	logo_tex = regl.texture(img);
	logo = regl({
		frag: logoShader,
		framebuffer: () => density.write,
		uniforms: {
			density: () => density.read,
			image: logo_tex,
			ratio: ({ viewportWidth, viewportHeight }) => {
				return [1, 1];// viewportWidth > viewportHeight ? [viewportWidth / viewportHeight, 1.0] : [1.0, viewportHeight / viewportWidth];
			},
			scroll: () => 0,
			dissipation: regl.prop("dissipation"),
		},
		viewport,
	});
};
var wholeCanvas= document.createElement('canvas');
var canLogo=false;
var backCanvas = document.createElement('canvas');
var renderingScrollY=window.scrollY;
var renderedScrollY=window.scrollY;
var lastScrollY=window.scrollY+0.0;
const renderM = () => {
	renderingScrollY=window.scrollY

domtoimage.toPng(document.querySelector("#page"),{imagePlaceholder:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="})
.then(function (dataUrl) {
	var img = new Image();
	img.src = dataUrl;
	wholeCanvas = img;
	canLogo=true;
	window.setTimeout(renderM,1000);
})
.catch(function (error) {
	console.error('oops, something went wrong!', error);
});
	// html2canvas(document.querySelector("#page"),{scrollX:0,scrollY:0.0,x:0,y:window.scrollY,width:window.innerWidth,height:window.innerHeight,background:null}).then(canvas => {
	// 	wholeCanvas = canvas;
	// 	renderedScrollY=renderingScrollY+0;
	// 	//console.log(wholeCanvas)
	// 	//document.querySelector("#page").style.opacity="0";
	// 	window.setTimeout(renderM,1000);
	// });
}
window.renderM=renderM;
window.addEventListener("load",renderM)
const showCanvasTexture = () => {
	
	if (wholeCanvas) {
		backCanvas.width = window.innerWidth;
		backCanvas.height = window.innerHeight;
		var backCtx = backCanvas.getContext('2d');

		// // save main canvas contents
		backCtx.drawImage(wholeCanvas, -1.0 * window.scrollX, -1.0 * window.scrollY+renderedScrollY);
		if(logo_tex){
		logo_tex.resize(window.innerWidth, window.innerHeight);
		logo_tex.subimage(backCanvas);
		}
	}
	requestAnimationFrame(showCanvasTexture);
}
window.setTimeout(showCanvasTexture, 0);
const advect = regl({
	frag: advectShader,
	framebuffer: regl.prop("framebuffer"),
	uniforms: {
		timestep: 0.017,
		dissipation: regl.prop("dissipation"),
		color: regl.prop("color"),
		x: regl.prop("x"),
		velocity: () => velocity.read,
		texelSize,
	},
	viewport,
});
const advectColor = regl({
	frag: advectColorShader,
	framebuffer: regl.prop("framebuffer"),
	uniforms: {
		timestep: 0.017,
		dissipation: regl.prop("dissipation"),
		color: regl.prop("color"),
		x: regl.prop("x"),
		velocity: () => velocity.read,
		texelSize,
	},
	viewport,
});
const divergence = regl({
	frag: divergenceShader,
	framebuffer: divergenceTex,
	uniforms: {
		velocity: () => velocity.read,
		texelSize,
	},
	viewport,
});
const clear = regl({
	frag: clearShader,
	framebuffer: () => pressure.write,
	uniforms: {
		pressure: () => pressure.read,
		dissipation: regl.prop("dissipation"),
	},
	viewport,
});
const gradientSubtract = regl({
	frag: gradientSubtractShader,
	framebuffer: () => velocity.write,
	uniforms: {
		pressure: () => pressure.read,
		velocity: () => velocity.read,
		texelSize,
	},
	viewport,
});
const jacobi = regl({
	frag: jacobiShader,
	framebuffer: () => pressure.write,
	uniforms: {
		pressure: () => pressure.read,
		divergence: () => divergenceTex,
		texelSize,
	},
	viewport,
});
export const display = regl({
	frag: displayShader,
	uniforms: {
		density: () => density.read,
	},
});

export function createSplat(x, y, dx, dy, color, radius) {
	splat({
		framebuffer: velocity.write,
		uTarget: velocity.read,
		point: [x / window.innerWidth, 1 - y / window.innerHeight],
		radius,
		color: [dx, -dy, 1],
	});
	velocity.swap();

	splat({
		framebuffer: density.write,
		uTarget: density.read,
		point: [x / window.innerWidth, 1 - y / window.innerHeight],
		radius,
		color,
	});
	density.swap();
}
export function drawLogo(dissipation) {
	if (logo && canLogo) {
		logo({ dissipation });
		density.swap();
	}
}

export const update = (config) => {
		scrollk({
			framebuffer: velocity.write,
			x: velocity.read,
			dissipation: 0,
			color: [0, 0, 0, 0],
			scroll:-(window.scrollY-lastScrollY)/window.innerHeight
		});
		velocity.swap();
	
		scrollk({
			framebuffer: density.write,
			x: density.read,
			dissipation: 0,
			color: [243 / 255, 243 / 255, 243 / 255, 0],
			scroll:-(window.scrollY-lastScrollY)/window.innerHeight
		});
		density.swap();
		lastScrollY=window.scrollY;
	
	advect({
		framebuffer: velocity.write,
		x: velocity.read,
		dissipation: config.VELOCITY_DISSIPATION,
		color: [0, 0, 0, 0],
	});
	velocity.swap();

	advectColor({
		framebuffer: density.write,
		x: density.read,
		dissipation: config.DENSITY_DISSIPATION,
		color: [243 / 255, 243 / 255, 243 / 255, 0],
	});
	density.swap();

	divergence();

	clear({
		dissipation: config.PRESSURE_DISSIPATION,
	});
	pressure.swap();

	for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
		jacobi();
		pressure.swap();
	}

	gradientSubtract();
	velocity.swap();
};
