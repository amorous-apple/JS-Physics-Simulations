const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BALLS = [];

let LEFT, RIGHT, UP, DOWN;


class Ball {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.player = false;
		BALLS.push(this);
	}
	drawBall() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
		ctx.strokeStyle = "black";
		ctx.stroke();
		ctx.fillStyle = "red";
		ctx.fill();
	}
}

function keyControl(b) {
	canvas.addEventListener('keydown', function(e) {
		if (e.code === "ArrowLeft") { LEFT = true; }
		if (e.code === "ArrowUp") { UP = true; }
		if (e.code === "ArrowRight") { RIGHT = true; }
		if (e.code === "ArrowDown") { DOWN = true; }
	});

	canvas.addEventListener('keyup', function(e) {
		if (e.code === "ArrowLeft") { LEFT = false; }
		if (e.code === "ArrowUp") { UP = false; }
		if (e.code === "ArrowRight") { RIGHT = false; }
		if (e.code === "ArrowDown") { DOWN = false; }
	});

	if (LEFT) { b.x--; }
	if (UP) { b.y--; }
	if (RIGHT) { b.x++; }
	if (DOWN) { b.y++; }


}

function mainLoop() {
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	BALLS.forEach((b) => {
		b.drawBall();
		if (b.player) {
			keyControl(b);
		}
	})
	requestAnimationFrame(mainLoop);
}

let Ball1 = new Ball(200, 200, 30);
let Ball2 = new Ball(300, 300, 20);

Ball1.player = true;
Ball2.player = true;


requestAnimationFrame(mainLoop);
