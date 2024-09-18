const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BALLS = [];

let LEFT, RIGHT, UP, DOWN;
let friction = 0.1;

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	}
	subt(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	}
	mag() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}
	mult(n) {
		return new Vector(this.x * n, this.y * n);
	}
	normal() {
		return new Vector(-this.y, this.x).unit();
	}
	unit() {
		if (this.mag() === 0) {
			return new Vector(0, 0);
		}
		return new Vector(this.x / this.mag(), this.y / this.mag());
	}

	static dot(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}
	drawVec(start_x, start_y, n, color) {
		ctx.beginPath();
		ctx.moveTo(start_x, start_y);
		ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
		ctx.strokeStyle = color;
		ctx.stroke();
	}
}

class Ball {
	constructor(x, y, r) {
		this.pos = new Vector(x, y);
		this.r = r;
		this.vel = new Vector(0, 0);
		this.acc = new Vector(0, 0);
		this.acceleration = 1;
		this.player = false;
		BALLS.push(this);
	}
	drawBall() {
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
		ctx.strokeStyle = "black";
		ctx.stroke();
		ctx.fillStyle = "red";
		ctx.fill();
	}
	display() {
		this.vel.drawVec(980, 620, 10, "#28ff00");
		this.acc.unit().drawVec(980, 620, 50, "White");
		// this.acc.normal().drawVec(980, 620, 50, "Pink");
		ctx.beginPath();
		ctx.arc(980, 620, 50, 0, 2 * Math.PI);
		ctx.strokeStyle = "black";
		ctx.stroke();
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

	if (LEFT) { b.acc.x = -b.acceleration; }
	if (UP) { b.acc.y = -b.acceleration; }
	if (RIGHT) { b.acc.x = b.acceleration; }
	if (DOWN) { b.acc.y = b.acceleration; }
	if (!UP && !DOWN) { b.acc.y = 0; }
	if (!RIGHT && !LEFT) { b.acc.x = 0; }

	b.acc = b.acc.unit().mult(b.acceleration);
	b.vel = b.vel.add(b.acc);
	b.vel = b.vel.mult(1 - friction);
	b.pos = b.pos.add(b.vel);
}

let distanceVec = new Vector(0, 0);

function coll_det_bb(b1, b2) {
	if (b1.r + b2.r >= b2.pos.subt(b1.pos).mag()) {
		return true;
	} else {
		return false;
	}
}

function pen_res_bb(b1, b2) {
	let dist = b1.pos.subt(b2.pos);
	let pen_depth = b1.r + b2.r - dist.mag();
	let pen_res = dist.unit().mult(pen_depth / 2);
	b1.pos = b1.pos.add(pen_res);
	b2.pos = b2.pos.add(pen_res.mult(-1));
}

function mainLoop() {
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	BALLS.forEach((b) => {
		b.drawBall();
		if (b.player) {
			keyControl(b);
		}
		b.display();
	});

	distanceVec = Ball2.pos.subt(Ball1.pos);
	ctx.fillText("Distance: " + distanceVec.mag().toFixed(4), 930, 520);

	if (coll_det_bb(Ball1, Ball2)) {
		pen_res_bb(Ball1, Ball2);
		ctx.fillText("Collision: True", 930, 540);
	} else {
		ctx.fillText("Collision: False", 930, 540);
	}
	requestAnimationFrame(mainLoop);
}

let Ball1 = new Ball(200, 200, 30);
let Ball2 = new Ball(300, 250, 40);

Ball1.player = true;
// Ball2.player = false;


requestAnimationFrame(mainLoop);
