const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function drawBall(x, y, r) {

	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.strokeStyle = "black";
	ctx.stroke();
	ctx.fillStyle = "red";
	ctx.fill();
}

drawBall(100, 100, 50);


ctx.beginPath();
ctx.arc(400, 400, 30, 0, 2 * Math.PI);
ctx.strokeStyle = "black";
ctx.stroke();
ctx.fillStyle = "green";
ctx.fill();
