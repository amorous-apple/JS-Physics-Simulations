const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const BALLS = [];
const WALLS = [];

let LEFT, RIGHT, UP, DOWN;
let friction = 0.001;

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
	constructor(x, y, r, m) {
		this.pos = new Vector(x, y);
		this.r = r;
		this.m = m;
		if (this.m === 0) {
			this.inv_m = 0;
		} else {
			this.inv_m = 1 / this.m;
		}
		this.elasticity = 1;
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
		this.vel.drawVec(this.pos.x, this.pos.y, 10, "Green");
		ctx.fillStyle = "Black";
		ctx.fillText("m = " + this.m, this.pos.x - 10, this.pos.y - 5);
		ctx.fillText("e = " + this.elasticity, this.pos.x - 10, this.pos.y + 5);
	}
	reposition() {
		this.acc = this.acc.unit().mult(this.acceleration);
		this.vel = this.vel.add(this.acc);
		this.vel = this.vel.mult(1 - friction);
		this.pos = this.pos.add(this.vel);
	}
}

class Wall {
	constructor(x1, y1, x2, y2) {
		this.start = new Vector(x1, y1);
		this.end = new Vector(x2, y2);
		WALLS.push(this);
	}
	drawWall() {
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.strokeStyle = "White";
		ctx.stroke();
	}
	wallUnit() {
		return this.end.subt(this.start).unit();
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

}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function closestPointBW(b1, w1) {
	let ballToWallStart = w1.start.subt(b1.pos);
	if (Vector.dot(w1.wallUnit(), ballToWallStart) > 0) {
		return w1.start;
	}

	let wallEndToBall = b1.pos.subt(w1.end);
	if (Vector.dot(w1.wallUnit(), wallEndToBall) > 0) {
		return w1.end;
	}

	let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
	let closestVect = w1.wallUnit().mult(closestDist);
	return w1.start.subt(closestVect);
}

function coll_det_bb(b1, b2) {
	if (b1.r + b2.r >= b2.pos.subt(b1.pos).mag()) {
		return true;
	} else {
		return false;
	}
}

function coll_det_bw(b1, w1) {
	let BallToClosest = closestPointBW(b1, w1).subt(b1.pos);
	if (BallToClosest.mag() <= b1.r) {
		return true;
	}
}

function pen_res_bb(b1, b2) {
	let dist = b1.pos.subt(b2.pos);
	let pen_depth = b1.r + b2.r - dist.mag();
	let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
	b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
	b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

function pen_res_bw(b1, w1) {
	let penVect = b1.pos.subt(closestPointBW(b1, w1));
	b1.pos = b1.pos.add(penVect.unit().mult(b1.r - penVect.mag()));
}

function coll_res_bb(b1, b2) {
	let normal = b1.pos.subt(b2.pos).unit();
	let relVel = b1.vel.subt(b2.vel);
	let sepVel = Vector.dot(relVel, normal);
	let new_sepVel = - sepVel * Math.min(b1.elasticity, b2.elasticity);

	let vsep_diff = new_sepVel - sepVel;
	let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
	let impulseVec = normal.mult(impulse);

	b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
	b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
}

function coll_res_bw(b1, w1) {
	let normal = b1.pos.subt(closestPointBW(b1, w1)).unit();
	let sepVel = Vector.dot(b1.vel, normal);
	let new_sepVel = - sepVel * b1.elasticity;
	let vsep_diff = sepVel - new_sepVel;
	b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

function mainLoop() {
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	BALLS.forEach((b, index) => {
		b.drawBall();
		if (b.player) {
			keyControl(b);
		}
		WALLS.forEach((w) => {
			if (coll_det_bw(BALLS[index], w)) {
				pen_res_bw(BALLS[index], w);
				coll_res_bw(BALLS[index], w);
			}
		})
		for (let i = index + 1; i < BALLS.length; i++) {
			if (coll_det_bb(BALLS[index], BALLS[i])) {
				pen_res_bb(BALLS[index], BALLS[i]);
				coll_res_bb(BALLS[index], BALLS[i]);
			}
		}
		b.display();
		b.reposition();
	});

	WALLS.forEach((w) => {
		w.drawWall();
	})

	requestAnimationFrame(mainLoop);
}

for (let i = 0; i < 30; i++) {
	let newBall = new Ball(randInt(100, 1000), randInt(50, 650), randInt(20, 50), randInt(0, 10));
	newBall.elasticity = randInt(5, 10) / 10;
}

let Wall1 = new Wall(200, 200, 700, 400);
let Wall2 = new Wall(350, 450, 450, 500);

let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
let edge2 = new Wall(canvas.clientWidth, 0, canvas.clientWidth, canvas.clientHeight);
let edge3 = new Wall(canvas.clientWidth, canvas.clientHeight, 0, canvas.clientHeight);
let edge4 = new Wall(0, canvas.clientHeight, 0, 0);

BALLS[0].player = true;


requestAnimationFrame(mainLoop);
