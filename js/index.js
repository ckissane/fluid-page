import "zenscroll";
import { regl } from "./canvas";
import * as config from "./config";
import { fullscreen, update, display, drawLogo, createSplat } from "./shaders";
import AOS from "aos";
import "aos/dist/aos.css";

function getRepos() {
	var req = new XMLHttpRequest();
	req.open("GET", "https://api.github.com/users/cm-tech/repos?per_page=1000", false);
	req.send(null);
	var repos = JSON.parse(req.responseText);
	repos.forEach(function (e) {
		var a = document.createElement("div");
		a.className = "column is-12-mobile is-half-tablet is-one-third-desktop";

		a.innerHTML = `
        <figure class="image is-2by1">
        <img class="project-thumb" src="https://raw.githubusercontent.com/CM-Tech/${e.name.toLowerCase()}/master/README.png" onerror="this.style.display='none';this.parentElement.classList.add('no-image')"/>
          
            <figcaption>
                <h1 class="title is-size-5 is-size-4-widescreen">${e.name}</h1>
                
                <a class="button is-warning is-outlined is-rounded" href="${
									e.has_pages ? "http://cm-tech.github.io/" + e.name : e.html_url
								}" target="_blank"><span>Visit ${
			e.has_pages ? "Website" : "Repo"
		}</span><span class="icon"><i class="fas fa-angle-right"></i><!-- <i class="fas fa-angle-right"></i> --></span></a>
            </figcaption>
            <div class="overlay"></div>
        </figure>
    `;
		document.getElementById("project-grid-columns").appendChild(a);
	});
}
// getRepos();

regl.frame(() => {
	fullscreen(() => {
		if (window.scrollY < window.innerHeight / 4||true) drawLogo(1.0 - config.DENSITY_DISSIPATION);

		createSplat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color, config.SPLAT_RADIUS);

		update(config);
		display();
	});
});

let pointer = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0,
	color: [0,0,1],
};
document.addEventListener("mousemove", (e) => {
	pointer.dx = (e.clientX - pointer.x) * 10;
	pointer.dy = (e.clientY - pointer.y) * 10;
	pointer.x = e.clientX;
	pointer.y = e.clientY;
});
document.addEventListener("mousedown", () => {
	pointer.color = [Math.round(Math.random() ),Math.round(Math.random() ),Math.round(Math.random() )];
});

AOS.init();
