/*	Narcissa

Aluno 1: 62618 Jaime Silva <-- mandatory to fill
Aluno 2: 62656 Gil Arroteia <-- mandatory to fill

Comentario:

O ficheiro "Narcissa.js" tem de incluir, logo nas primeiras linhas,
um comentário inicial contendo: o nome e número dos dois alunos que
realizaram o projeto; indicação de quais as partes do trabalho que
foram feitas e das que não foram feitas (para facilitar uma correção
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementação que possam ser menos óbvios para o avaliador.

0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
*/



// GLOBAL CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 8;
const SCORE_PER_BERRY = 50;

const IMAGE_NAME_EMPTY = "empty";
const IMAGE_NAME_INVALID = "invalid";
const IMAGE_NAME_SHRUB = "shrub";
const IMAGE_NAME_BERRY_BLUE = "berryBlue";
const IMAGE_NAME_SNAKE_HEAD = "snakeHead";
const IMAGE_NAME_SNAKE_BODY = "snakeBody";
const IMAGE_NAME_DARKGREEN = "berryDarkGreen"; 
const IMAGE_NAME_GREEN = "berryGreen"; 
const IMAGE_NAME_ORANGE = "berryOrange"; 
const IMAGE_NAME_PURPLE = "berryPurple"; 
const IMAGE_NAME_RED = "berryRed"; 


// GLOBAL VARIABLES

let control;
let hasWon = false;	// Try not no define more global variables
let bestTime = Infinity;


// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.atime = 0;	// This has a very technical role in the control of the animations
		this.imageName = imageName;
		this.show();
	}
	draw(x, y, image) {
		control.ctx.drawImage(image, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}
	show() {
		this.checkPosition();
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y, GameImages[this.imageName]);
	}
	hide() {
		control.world[this.x][this.y] = control.getEmpty();
		this.draw(this.x, this.y, GameImages[IMAGE_NAME_EMPTY]);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	animation(x, y) {
		
	}
	checkPosition() {
		
	}
}


class Shrub extends Actor {
	constructor(x, y, color) {
		super(x, y, IMAGE_NAME_SHRUB);
		this.growthTimer = this.getRandomGrowthTime();
		this.leaves = new Array();
		this.leaves.push([x,y]);
	}

	getRandomGrowthTime() {
		return Math.floor(Math.random() * (81*ANIMATION_EVENTS_PER_SECOND) + 20*ANIMATION_EVENTS_PER_SECOND);
	}

	grow() {
		const adjacentCells = this.getAdjacentEmptyCells();
		const randomCell = adjacentCells[Math.floor(Math.random() * adjacentCells.length)];
		const newLeaf = new Leaf(randomCell.x, randomCell.y);
		this.leaves.push([randomCell.x, randomCell.y]);
		this.draw(randomCell.x, randomCell.y, GameImages[IMAGE_NAME_SHRUB]);
		this.growthTimer = this.getRandomGrowthTime();
	}

	getAdjacentEmptyCells() {
		const adjacentCells = [];
		for(let i = 0; i< this.leaves.length; i++) {
			const directions = [
				{ dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
				{ dx: -1, dy: 0 }, { dx: 1, dy: 0 },
				{ dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
			];

			for (const direction of directions) {
				const cellX = this.leaves[i][0] + direction.dx;
				const cellY = this.leaves[i][1] + direction.dy;

				if (this.isValidCell(cellX, cellY) && control.world[cellX][cellY] instanceof Empty) {
					adjacentCells.push({ x: cellX, y: cellY });
				}
			}

		}

		return adjacentCells;
	}

	isValidCell(x, y) {
		return x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT;
	}

	animation(x, y) {
		super.animation(x, y);

		this.growthTimer--;

		if (this.growthTimer <= 0) {
			this.grow();
		}
	}
}

class Leaf extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SHRUB);
	}
}




class Empty extends Actor {
	constructor() {
		super(-1, -1, IMAGE_NAME_EMPTY);
		this.atime = Number.MAX_SAFE_INTEGER;	// This has a very technical role
	}
	show() {}
	hide() {}
}

class Invalid extends Actor {
	constructor(x, y) { super(x, y, IMAGE_NAME_INVALID); }
}


class Berry extends Actor {
    constructor(x, y, color) {
        super(x, y, color);
        this.isFalling = false;
        this.isVisible = true;
        this.fallTimer = this.getRandomTimer(1, 11);
        this.survivalTimer = this.getRandomTimer(20, 100);
        this.flickerInterval = null;
    }

    getRandomTimer(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min) * ANIMATION_EVENTS_PER_SECOND;
    }

    updateFalling() {
        this.fallTimer--;
        if (this.fallTimer <= 0) {
            this.isFalling = true;
            this.stopFlicker();
            this.hide();
        } else {
            this.toggleVisibility();
        }
    }

    updateSurvival() {
        this.survivalTimer--;
        if (this.survivalTimer <= 0) {
            this.isFalling = true;
            this.stopFlicker();
            this.hide();
        }
    }

    animation(x, y) {
        super.animation(x, y);
        if (!this.isFalling) {
            this.updateSurvival();
        } else {
            this.updateFalling();
        }
    }

    startFlicker() {
        this.flickerInterval = setInterval(() => {
            this.toggleVisibility();
        }, 500); // Set the interval time according to your preference
    }

    toggleVisibility() {
        if (this.isVisible) {
            this.hide();
            this.isVisible = false;
        } else {
            const boardPiece = control.world[this.x][this.y];
			if (!(boardPiece instanceof Snake)) {
				this.show();
				this.isVisible = true;
			}
        }
    }

    stopFlicker() {
        clearInterval(this.flickerInterval);
        this.hide();
        this.isVisible = false;
    }
}


  


class Snake extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_HEAD);
		[this.movex, this.movey] = [1, 0];
		this.body = [[this.x,this.y]];
		this.stomach= [];
		this.stomachSize = 0;
		this.bodySize = 5;
		this.createBody();
        this.allBerries = this.getAllBerries();
	}

	
	createBody() {
		for (let i = 1; i < this.bodySize; i++) {
			this.body.push([this.x-i,this.y]);
		}
	}

    animation(x, y) {
        if(control.autoPilotOn) this.autoPilot();
        else this.handleKey();
        this.draw(this.body[this.bodySize-1][0], this.body[this.bodySize-1][1], GameImages[IMAGE_NAME_EMPTY]);
        this.move(this.movex, this.movey);
    }

    autoPilot() {
        const resultBerries = this.getAllBerries();
        if(resultBerries.length>0) {
            this.allBerries = resultBerries;
        }
        const target = this.findClosestBerry(this.allBerries);
        const possibleMoves = this.getPossibleMoves();
        [this.movex,this.movey] = this.nextBestMove(possibleMoves, target);
    }

    getAllBerries() {
        let berries = [];
        for(let i = 0; i < control.world.length - 1; i++) {
            for(let j = 0; j < control.world[0].length - 1; j++) {
                const boardPiece = control.world[i][j];
                if(boardPiece instanceof Berry) {
                    if(!this.isDuplicateBerry(boardPiece)) {
                        if(!boardPiece.isFalling) {
                            berries.push([i,j]);
                        } else {
                            if(boardPiece.fallTimer * ANIMATION_EVENTS_PER_SECOND > distance(this.x,this.y,j,i))
                            berries.push([i,j]);
                        }
                    }
                }
            }
        }
        return berries;
    }

    findClosestBerry(allBerries) {
        let closestBerry = null;
        let shortestDistance = Infinity;
        for(const berry of allBerries) {
            const berryDistance = distance(this.x, this.y, berry[0], berry[1]);
            if(berryDistance <= shortestDistance || control.world[berry[0]][berry[1].isFalling]) {
                shortestDistance = berryDistance;
                closestBerry = berry;
            }
        }
        return closestBerry;
    }
    getPossibleMoves() {
        let array = [];
    let currentMove = [this.movex, this.movey];

    const moves = [
      [-1, 0], // Up
      [0, -1], // Left
      [1, 0],  // Down
      [0, 1],  // Right
    ];

    for (let i = 0; i < moves.length; i++) {
      const subarray = moves[i];

      if (!isReverse(subarray, currentMove) && !this.isDeath(subarray, this.x, this.y, this.body)) {
        array.push(subarray);
      }
    }

    return array;

        function isReverse(newMove, oldMove) {
            return (newMove[0] + oldMove[0]) === 0 && (newMove[1] + oldMove[1]) === 0;
        }

        

        
    }
    isDeath(newMove,x,y,body) {
        let newX = x + newMove[0];
        let newY = y + newMove[1];
    
        if (newX < 0 || newX >= control.world.length - 1 || newY < 0 || newY >= control.world[0].length - 1) {
            return true;
        }
    
        let boardPiece = control.world[newX][newY];
        if (boardPiece instanceof Shrub || boardPiece instanceof Leaf) {
            return true;
        }

        if (boardPiece instanceof Berry) {
            if(this.isDuplicateBerry(boardPiece)) {
                return true;
            }
        }
    
        for (let i = 1; i < body.length; i++) {
            const bodyPart = body[i];
            if (bodyPart[0] === newX && bodyPart[1] === newY) {
            return true;
            }
        }

    
        return false;
    }

    nextBestMove(possibleMoves, target) {
        let bestMove = null;
        let shortestDistance = Infinity;
        for(const move of possibleMoves) {
            const moveDistance = distance(this.x + move[0], this.y + move[1], target[0], target[1]);
            if(moveDistance < shortestDistance) {
                shortestDistance = moveDistance;
                bestMove = move;
            }
        }
        return bestMove;
    }

	handleKey() {
		let k = control.getKey();
		if (k === null)	// ignore
			;
		else if (typeof(k) === "string")	// special command
			;
		else {	// change direction
			let kx, ky;
			[kx, ky] = k;
			if((this.movex + kx) === 0  && (this.movey + ky) === 0);
			else {
				this.movex = kx;
				this.movey = ky;
			}
		}
	}
	
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		if (this.x>WORLD_WIDTH-1) this.x=0;
		if (this.x<0) this.x=WORLD_WIDTH-1;
		if (this.y>WORLD_HEIGHT-1) this.y=0;
		if (this.y<0) this.y=WORLD_HEIGHT-1;

        
		for(let i = this.bodySize-1; i > 0 ; i--){
			this.body[i] = this.body[i-1];
		}
		this.body[0] = [this.x,this.y];
		for(let i=this.bodySize-1; i>this.stomachSize;i--){
			this.draw(this.body[i][0],this.body[i][1], GameImages[IMAGE_NAME_SNAKE_BODY]);	
		}
		for(let i=this.stomachSize; i>0;i--){
			this.draw(this.body[i][0],this.body[i][1], GameImages[this.stomach[i-1]]);	
		}
		this.draw(this.x,this.y, GameImages[IMAGE_NAME_SNAKE_HEAD]);
		this.show();
	}

	

	checkPosition() {
		let boardPiece = control.world[this.x][this.y];
		if(boardPiece instanceof Shrub || boardPiece instanceof Leaf) {
			control.deathScreen();
			pauseGame();
		}
		else if(boardPiece instanceof Berry){
			this.eatBerry(boardPiece);
		}
		else {
			for (let i = 1; i < this.bodySize; i++) {
			const bodyPart = this.body[i];
			if (bodyPart[0] === this.x && bodyPart[1] === this.y) {
                control.deathScreen();
				pauseGame();
			  }
			}
		  }
		
	}

	eatBerry(berry) {
        if (this.isDuplicateBerry(berry)) {
            if (this.stomachSize < 3) {
                this.stomachSize++;
                this.bodySize++;
                control.score += SCORE_PER_BERRY;
                this.body.push([berry.x, berry.y]);
            } else {
                this.stomach.pop();
            }
            this.stomach.unshift(berry.imageName);
    
            let amount = Math.floor(this.body.length / 2);
            if (this.body.length - amount < 5) {
                amount = this.body.length - 5;
            }
            for (let j = 0; j < amount; j++) {
                this.draw(this.body[this.body.length - 1][0], this.body[this.body.length - 1][1], GameImages[IMAGE_NAME_EMPTY]);
                this.body.pop();
                this.bodySize--;
                control.score -= SCORE_PER_BERRY;
            }
    
        } else {
            if(berry.isFalling) {
                this.bodySize++;
                control.score += SCORE_PER_BERRY;
                this.body.push([berry.x, berry.y]);
            }
            this.bodySize++;
            control.score += SCORE_PER_BERRY;
            this.body.push([berry.x, berry.y]);
    
            if (this.stomachSize < 3) {
                this.stomachSize++;
            } else {
                this.stomach.pop();
            }
            this.stomach.unshift(berry.imageName);
        }  
    }

	isDuplicateBerry(berry) {
		return this.stomach.includes(berry.imageName);
	}
}



class Timer {
	constructor(){
		this.hours = 0;
		this.seconds = 0;
		this.minutes = 0;
		this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
	}

	startTimer() {
		this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
	}

	stopTimer() {
		clearInterval(this.timerInterval);
	}

	resetTimer() {
		this.stopTimer();
		this.hours = 0;
		this.minutes = 0;
		this.seconds = 0;
		let timerElement = document.getElementById("timer");
		timerElement.textContent = "0:00:00";
	}

	updateTimer() {
		this.seconds++;
		if (this.seconds === 60) {
			this.seconds = 0;
			this.minutes++;
		}
		if (this.minutes === 60) {
			this.minutes = 0;
			this.hours++;
		}
		let timerElement = document.getElementById("timer");
		timerElement.textContent = this.hours + ":" + (this.minutes < 10 ? "0" + this.minutes : this.minutes) + ":" + (this.seconds < 10 ? "0" + this.seconds : this.seconds);
	}
}


class BerrySpawner {
    constructor() {
        this.spawnTimeout = null;
        this.spawnBerries();
    }

    spawnBerries() {
        const minSpawnTime = 1000; // 1 second
        const maxSpawnTime = 11000; // 11 seconds
        const minBerries = 1;
        const maxBerries = 5;

        const getRandomSpawnTime = () => {
            return Math.floor(Math.random() * (maxSpawnTime - minSpawnTime + 1)) + minSpawnTime;
        };

        const getRandomBerryColor = () => {
            const colors = [IMAGE_NAME_BERRY_BLUE, IMAGE_NAME_DARKGREEN, IMAGE_NAME_GREEN, IMAGE_NAME_ORANGE, IMAGE_NAME_PURPLE, IMAGE_NAME_RED];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        const spawnBerry = () => {
            const randomX = Math.floor(Math.random() * WORLD_WIDTH);
            const randomY = Math.floor(Math.random() * WORLD_HEIGHT);
            const berryColor = getRandomBerryColor();
            control.world[randomX][randomY] = new Berry(randomX, randomY, berryColor);
        };

        const spawnMultipleBerries = () => {
            const numBerries = Math.floor(Math.random() * (maxBerries - minBerries + 1)) + minBerries;
            for (let i = 0; i < numBerries; i++) {
                spawnBerry();
            }
        };

        const scheduleSpawn = () => {
            const spawnTime = getRandomSpawnTime();
            this.spawnTimeout = setTimeout(() => {
                spawnMultipleBerries();
                if (this.spawnTimeout) {
                    scheduleSpawn();
                }
            }, spawnTime);
        };

        scheduleSpawn();
    }
}

// GAME CONTROL

class GameControl {
	constructor() {
		let c = document.getElementById('canvas1');
		control = this;	// setup global var
		this.key = 0;
		this.time = 0;
        this.score = 0;
		this.isPaused = false;
        this.autoPilotOn = false;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		this.empty = new Empty();	// only one empty actor needed, global var
		this.world = this.createWorld();
		this.loadLevel(1);
		this.setupEvents();
		this.timer= new Timer();
		this.berrySpawner = new BerrySpawner();
        
		
	}

	getEmpty() {
		return this.empty;
	}

	createWorld() { // matrix needs to be stored by columns
		let world = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = this.empty;
			world[x] = a;
		}
		return world;
	}

	loadLevel(level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];	// -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map is stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
	}

	getKey() {
		let k = this.key;
		this.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0];	// LEFT, O, J
			case 38: case 81: case 73: return [0, -1];	// UP, Q, I
			case 39: case 80: case 76: return [1, 0];	// RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];	// DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	}

	setupEvents() {
		addEventListener("keydown", e => this.keyDownEvent(e), false);
		addEventListener("keyup", e => this.keyUpEvent(e), false);
		setInterval(() => this.animationEvent(), 1000 / ANIMATION_EVENTS_PER_SECOND);
	}


	deathScreen() {
		const highScore = document.getElementById("highest_score");
		const winScreen = document.getElementById("win_screen");
		const winTitle = document.getElementById("win_title");
		const messageText = document.getElementById("win_text");
		if(!hasWon) highScore.textContent = this.score;
		winTitle.textContent = "GAME OVER";
		winScreen.style.display = "flex";
		winTitle.style.display = "block";
		messageText.style.display = "block";

	}

	resetScore() {
		restart();
		const scoreDisplay =document.getElementById("current_score");
		const winScreen = document.getElementById("win_screen");
		const winTitle = document.getElementById("win_title");
		const messageText = document.getElementById("win_text");
		scoreDisplay.textContent=0;
		winScreen.style.display = "none";
		winTitle.style.display = "none";
		messageText.style.display = "none";
		this.score = 0;
	}

	compareTimes() {
		const newTime =((((this.timer.hours*60) + this.timer.minutes)*60) + this.timer.seconds);
		if(bestTime>newTime) {
			bestTime = newTime;
			return true;
		} 
		return false;
	}

	animationEvent()	 {
		if (!this.isPaused){
			const scoreDisplay =document.getElementById("current_score");
			const highScore = document.getElementById("highest_score");
			const winScreen = document.getElementById("win_screen");
			const winTitle = document.getElementById("win_title");
			const messageText = document.getElementById("win_text");
			if(this.score >=(40*SCORE_PER_BERRY)) {
				hasWon = true;
				pauseGame();
				if(this.compareTimes()) {
					highScore.textContent = this.timer.hours + ":" + (this.timer.minutes < 10 ? "0" + this.timer.minutes : this.timer.minutes) + ":" + (this.timer.seconds < 10 ? "0" + this.timer.seconds : this.timer.seconds);
				}
				winTitle.textContent = "YOU WON!";
				winScreen.style.display = "flex";
				winTitle.style.display = "block";
				messageText.style.display = "block";
			}
			else {
				scoreDisplay.textContent=this.score;
				this.time++;
				for(let x=0 ; x < WORLD_WIDTH ; x++){
					for(let y=0 ; y < WORLD_HEIGHT ; y++) {
						let a = this.world[x][y];
						if( a.atime < this.time ) {
							a.atime = this.time;
							a.animation(x, y);
						}
					}
				}
			}
        }
	}
	
	keyDownEvent(e) {
		this.key = e.keyCode;
	}
	keyUpEvent(e) {
	}
}


// Functions called from the HTML page
function restart() {
	clearInterval(control.animationInterval);
	control.ctx.clearRect(0,0,control.ctx.canvas.width, control.ctx.canvas.height);
	control.timer.resetTimer();
	control = new GameControl();
	document.getElementById("button_pause").value = "Pause";
}
function onLoad() {
	// Asynchronously load the images an then run the game
	GameImages.loadAll(() => new GameControl());
}







function pauseGame() { 
	if(!control.isPaused) {
		control.timer.stopTimer();
		control.isPaused = !control.isPaused;
		control.berrySpawner.spawnTimeout = null;
		document.getElementById("button_pause").value = "Play";
	}
	else {
		control.timer.startTimer();
        control.berrySpawner = new BerrySpawner();
		control.isPaused = !control.isPaused;
		control.berrySpawner.spawnBerries();
		document.getElementById("button_pause").value = "Pause";
	}
}

function startAutoPilot() { control.autoPilotOn = !control.autoPilotOn; }