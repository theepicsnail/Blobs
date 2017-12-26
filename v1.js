const ARGS = getArgs();
const CELL_SIZE = 50;
const RADIUS_SIZE = CELL_SIZE / 8; 
const SIZE = ARGS.size || 8;
const COLORS = [
	"red",
	"green",
	"blue",
	"yellow",
	"cyan",
	"magenta",
	"black"
].slice(0,ARGS.colors || 7)

const search = `?size=${SIZE}&colors=${COLORS.length}`;
if(window.location.search != search)
window.location.search =search ;



class Board {
	constructor(size) {
		this.size = size;
		
		this.canvas = document.createElement("canvas");
		this.canvas.onclick = this.onclick.bind(this);
		this.ctx = this.canvas.getContext("2d");
		this.canvas.style.width = (this.canvas.width = window.innerWidth) + "px";
		this.canvas.style.height = (this.canvas.height = window.innerHeight) + "px";
		document.body.appendChild(this.canvas);
		this.resetBoard();

		this.animating = [];
		this.newAnimations = [];
		this.update();
	}
	resetBoard() {
		this.ammo = {};
		this.selected = COLORS[0];
		COLORS.forEach((c)=>{this.ammo[c]=2});

		let totals = this.size * this.size * 2/COLORS.length;

		this.pieces = array2d(this.size, ()=>{
			return {
				size: 0,
				color: COLORS[Math.random()*COLORS.length|0]
			}
		});

		let toPlace = [];
		COLORS.forEach((color)=>{
			for(const x of range(totals))
				toPlace.push(color);
		});
		shuffle(toPlace);
		toPlace.forEach((color)=> {
			for(let i = 0 ; i < 100; i++) {
				let row = (Math.random()*this.size)|0;
				let col = (Math.random()*this.size)|0;
				let piece = this.pieces[row][col];
				if(piece.size == 3) continue;
				if(piece.size == 0) {
					piece.size = 1;
					piece.color = color;
					return;
				}
				if(piece.color != color) continue;
				piece.size ++;
				return;
			}
		});

	}
	update() {
		requestAnimationFrame(()=>{this.update();});
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for(const r of range(this.size)) {
			for(const c of range(this.size)) {
				this.ctx.rect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
			}
		}
		this.ctx.stroke();

		this.ctx.fillStyle = "black";

		let colorsOnBoard = {};
		for(const r of range(this.size)) {
			for(const c of range(this.size)) {
				const piece = this.pieces[r][c];
				this.ctx.beginPath();
				const radius = piece.size * RADIUS_SIZE;
				if(piece.size >0 )
					colorsOnBoard[piece.color] = true;

				this.ctx.fillStyle = piece.color;
				this.ctx.ellipse(
					(c+0.5) * CELL_SIZE, 
					(r+0.5) * CELL_SIZE, 
					radius, radius, 
					0, 0, 2*Math.PI);
				this.ctx.fill();
			}
		}

		COLORS.forEach((color, idx)=>{
			this.ctx.beginPath();
			this.ctx.font="20px Monospace";
			this.ctx.fillStyle = color;
			this.ctx.fillText(this.ammo[color], (idx+.2)*CELL_SIZE, CELL_SIZE * (this.size+.5));
			//this.ctx.fill();
			if(color == this.selected) {
				this.ctx.strokeRect(
					idx * CELL_SIZE-.5, 
					this.size * CELL_SIZE, CELL_SIZE, CELL_SIZE);
			}
		});



		this.animating = this.animating.filter((anim)=>{
			anim.step(this);
			return !anim.completed;
		});
		this.animating = this.animating.concat(this.newAnimations);
		this.newAnimations = [];

		if(Object.keys(colorsOnBoard).length != COLORS.length && this.animating.length == 0) {
			document.getElementById("winScreen").style.display="block";
			this.resetBoard();
		}

	}
	inBounds(r,c){
		if(r < 0 || c < 0 || r >= this.size || c >= this.size) return false;
		return true;
	}
	addBloblet(r, c, color) {
		console.log("Add bloblet", r, c, color);
		if(!this.inBounds(r,c)) {
			if(color) {
				console.log("Add color", color);
				this.ammo[color]++;
			}
			return true;
		}
		const piece = this.pieces[r][c];
		console.log("Color match", color, piece.color, piece.size);
		if(color != piece.color && piece.size > 0) {

			return false;
		}
		piece.color = color;

		piece.size += 1;
		let idx = [0,1,2,3];
		shuffle(idx);

		if(piece.size >= 4) {
			piece.size -= 4;
			this.newAnimations.push(blobletAnimation(r,c,r-1,c, piece.color));//COLORS[idx[0]]));
			this.newAnimations.push(blobletAnimation(r,c,r+1,c, piece.color));//COLORS[idx[1]]));
			this.newAnimations.push(blobletAnimation(r,c,r,c-1, piece.color));//COLORS[idx[2]]));
			this.newAnimations.push(blobletAnimation(r,c,r,c+1, piece.color));//COLORS[idx[3]]));
		}
		return true;
	}

	onclick(e) {
		if(this.animating.length > 0 || this.newAnimations.length > 0) {
			console.log("ignoring click while animations are playing");
			return;
		}


		var x;
		var y;
		if (e.pageX || e.pageY) { 
		  x = e.pageX;
		  y = e.pageY;
		}
		else { 
		  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		} 
		x -= this.canvas.offsetLeft;
		y -= this.canvas.offsetTop;

		console.log(x,y);

		const col = Math.floor(x / CELL_SIZE);
		const row = Math.floor(y / CELL_SIZE);
		if(row >= this.size) {
			this.selected = COLORS[col];
			return;
		}
		console.log(this.ammo, this.selected);
		if(this.ammo[this.selected]) {
			if(this.addBloblet(row, col, this.selected))
				this.ammo[this.selected] --;
		}

		let piece =this.pieces[row][col]; 
		if(piece.size > 0 && this.selected != piece.color){
			this.selected = piece.color;
		}
	}
}

class Animation {
	constructor(length, draw, onComplete) {
		this.length = length;
		this.draw = draw;
		this.onComplete = onComplete;
		this.start = +new Date();
		this.completed = false;
	}
	step(arg) {
		if(this.completed) return;

		const percentage = ((+new Date()) - this.start)/this.length;
		if(percentage > 1) {
			this.completed  = true;
			this.onComplete(arg);
		}
		this.draw(percentage, arg);
	}
}

function blobletAnimation(sr, sc, er, ec, color) {
	return new Animation(200 + Math.random() * 200, (p, board)=>{
		board.ctx.beginPath();
		const r = lerp(sr, er, p);
		const c = lerp(sc, ec, p);
		const radius = RADIUS_SIZE;
		board.ctx.ellipse(
			(c+0.5) * CELL_SIZE, 
			(r+0.5) * CELL_SIZE, 
			radius, radius, 
			0, 0, 2*Math.PI);
		board.ctx.fillStyle = color;
		board.ctx.fill();
	}, (board)=>{
		if(board.addBloblet(er, ec, color)) 
			return
		board.newAnimations.push(blobletAnimation(
			er, ec, lerp(sr,er,2), lerp(sc,ec,2), color
		));
	})
}


const board = new Board(SIZE);