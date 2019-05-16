//if keeping mobile opt code
//http://detectmobilebrowsers.com/
//need a restart game
//work on collision + flipping into another piece 
//need fix score
//i need to fix collision now with the ticks
//move general functions into their own class rather then have them in part of the game loop
window.onload = function(e){
	
	usedKeys = [37, 38, 39, 40];
	//mobile press arrow buttons
	document.getElementById('left').addEventListener("touchstart", function(event){if(g.status != 1 && g.status != 2){ g.keyAction[37].pressed = true;}});
	document.getElementById('right').addEventListener("touchstart", function(event){if(g.status != 1 && g.status != 2){ g.keyAction[39].pressed = true;}});
	document.getElementById('up').addEventListener("touchstart", function(event){if(g.status != 1 && g.status != 2){ g.keyAction[38].pressed = true;}});
	document.getElementById('down').addEventListener("touchstart", function(event){if(g.status != 1 && g.status != 2){ g.keyAction[40].pressed = true;}});
	//mobile release arrow buttons
	document.getElementById('left').addEventListener("touchend", function(event){g.keyAction[37].pressed = false;});
	document.getElementById('right').addEventListener("touchend", function(event){g.keyAction[39].pressed = false;});
	document.getElementById('up').addEventListener("touchend", function(event){g.keyAction[38].pressed = false;});
	document.getElementById('down').addEventListener("touchend", function(event){g.keyAction[40].pressed = false;});
	//key down
 	document.addEventListener("keydown", function(event){
		if(usedKeys.includes(event.which)){
			event.preventDefault();
			if(g.status != 1 && g.status != 2){
				g.keyAction[event.which].pressed = true;
			}
		}
	});	
	//key up
	document.addEventListener("keyup", function(event){
		if(usedKeys.includes(event.which)){
			event.preventDefault();
			g.keyAction[event.which].pressed = false;
		}
		//dev to make new game fast
		if( event.which == 27){
			g = new game();
		}
	});
	//start new game
	document.getElementById('new').addEventListener('click',function(e){ 
		document.getElementById('stop').style.display = "block";
		document.getElementById('titleScreen').style.display =  "none";
		document.getElementById('mobileBtns').classList.remove("onTitleScreen");

		g = new game();
	});	
	//pause button pressed
	document.getElementById('stop').addEventListener('click',function(e){ 
		g.pause(this);
	});
	window.onblur = function(){
		if(window.g != undefined && g.status == 0){ 
			g.pause(document.getElementById('stop'));
		}
	}
}; 
class tick{
	constructor(lengths){
		this.time = new Date();
		this.length = lengths;		
	}
	hasTicked(){
		if((new Date() - this.time)/1000 >= this.length.current){
			this.time = new Date();
			return true;
		}else{
			return false
		}
	}
	dec(decSpeed){
		this.length.default -= decSpeed;
		this.length.current -= decSpeed;
		//this.length.speedUp -= decSpeed;
	}
}
class game{
	constructor(){
		//Canvas
		this.cnv 		= document.getElementById('moving').getContext("2d");
		this.cnvBoard 	= document.getElementById('board').getContext("2d");
		this.cnvAni 	= document.getElementById('animations').getContext("2d");
		this.cnvNext 	= document.getElementById('nextBlock').getContext("2d"); 
		this.cnvScore 	= document.getElementById('score').getContext("2d"); 
		this.cnvLines 	= document.getElementById('lines').getContext("2d"); 
		this.cnvLevel 	= document.getElementById('level').getContext("2d"); 
		
		//load assets
		this.piecesImg = new Image();
		this.piecesImg.src = 'img/pieces.png';
		
		//Status
		this.lines = 0;
		this.score = 0;
		this.linesScore = {1:40, 2:100, 3:300, 4:1200};
		this.level = {current:0, old:0};
		this.status = 0;
		this.statusLookup = {0:'Running', 1:'Paused', 2:'Game Over', 3:'animationRunning', 4:'Title Screen'};
		this.keySpeed = {directions:0.1, rotate:0.29};
		this.keyAction = {
			37:{pressed:false, when:new Date(),tick:new tick()}, 
			38:{pressed:false, when:new Date(),tick:new tick()}, 
			39:{pressed:false, when:new Date(),tick:new tick()}, 
			40:{pressed:false, when:new Date(),tick:new tick()}
		};
		
		//sets how fast the game is running
		this.gameTick = new tick( {default:0.8, current:0.8, speedUp:0.1} );
		
		//flash animation
		this.animationRunning = false;
		this.startAnimation = false;
		this.animationColor = '#ff07f4';
		
		//Board
		this.board = new board();
		
		//Blocks
		this.blocks = [];
		this.activeBlock = 0 ;
		this.generateBlockList();
		this.nextBlock = new block(undefined, this.pickBlock());
		this.blocks.push(new block(this.activeBlock, this.pickBlock()));
		this.ab = this.blocks[this.activeBlock];
		
		//Game Loop
		MainLoop.setUpdate(this.update.bind(this)).setDraw(this.draw.bind(this)).start();
	}
	shuffle(array) {
		array.sort(() => Math.random() - 0.5);
	}	
	random(min, max){
		var rng = new Uint8Array(1);
		crypto.getRandomValues(rng);
		return Math.floor((rng[0] / 256) * (max + 1 - min) + min);		
	}	
	generateBlockList(){
		//[0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
		this.blocksToPick = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
		this.shuffle(this.blocksToPick);
	}
	pickBlock(){
		if(this.blocksToPick.length == 0){this.generateBlockList();}
		return this.blocksToPick.splice(this.random(0, this.blocksToPick.length - 1), 1)[0];;
	}
	pause(btn){
		if(this.status == 0){
			this.status = 1;
			btn.textContent = 'UnPause';
		}else if(this.status == 1){
			this.status = 0;
			btn.textContent = 'Pause Game';
		}		
	}
	update(){
		if(this.status == 0){
			//setting vars
			this.ab 	= this.blocks[this.activeBlock];
			var shapeId = this.ab.shapeId;
			var rotated = this.ab.rotated;
			var colored = this.ab.colors[shapeId];
			var pieces 	= this.ab.pieces[shapeId][rotated];
			
			//key presses and release			
			if(!this.keyAction[40].pressed){
				this.gameTick.length.current = this.gameTick.length.default;
			}
			if(this.keyAction[37].pressed){
				if((new Date() - this.keyAction[37].when)/1000 >= this.keySpeed.directions){
					if(!this.board.cc_walls(this.ab, 0) && !this.board.cc_blocks(this.ab,-1)){
						this.ab.pos.x -= 30; 
					}
					this.keyAction[37].when = new Date();
				}
			}
			if(this.keyAction[39].pressed){
				if((new Date() - this.keyAction[39].when)/1000 >= this.keySpeed.directions){
					if(!this.board.cc_walls(this.ab, 1) && !this.board.cc_blocks(this.ab,1)){
						this.ab.pos.x += 30;
					}
					this.keyAction[39].when = new Date();
				}
			}	
			if(this.keyAction[38].pressed){
				if((new Date() - this.keyAction[38].when)/1000 >= this.keySpeed.rotate){
					this.ab.rotate();
					this.keyAction[38].when = new Date();
				}
			}
			if(this.keyAction[40].pressed){
				this.gameTick.length.current = this.gameTick.length.speedUp;
			}
			
			//check collision with walls
			if(this.board.cc_walls(this.ab, 2)){
				this.ab.falling = false; 
				this.ab.pos.y = 600;
			}
			
			//check collision with blocks
			if(this.board.cc_blocks(this.ab)){
				this.ab.falling = false;
				
				//should this collision be a game over 
				if(this.board.cc_game_over(this.ab)){
					this.status = 2;	
				}
			}
			
			if(this.status != 3){
				if(this.gameTick.hasTicked()){
					this.ab.pos.y += 30;
				}
				this.ab.buildBlock();
			}

			//block isn't falling any more
			if(!this.ab.falling){
//========================
//if the block isnt falling this is where I need to give a delay to allow the player to move the block left or right
//before we insert the block into the board we need a delay
//========================
				
				//insert block into grid	
				this.board.insert(pieces, {id:this.activeBlock, color:colored, shapeId:shapeId});

				//checks to see if 1 or more rows are completed and adds to the line count
				this.removing = this.board.checkRow(pieces);
				if(this.removing.length != 0){
					this.lines += this.removing.length;
					this.level.current = parseInt(this.lines / 10);
					this.score += this.linesScore[this.removing.length] * (this.level.current + 1);
					this.startAnimation = true;
					
					if(this.level.current != this.level.old){
						this.level.old = this.level.current;	
						this.gameTick.dec(0.1);
					}
					
					//tells the game we need to pause while animating 
					this.status = 3;
				}
				
				//increase active block id
				this.activeBlock++;				
				
				//create new block with next block shapeId
				this.blocks.push(new block(this.activeBlock, this.nextBlock.shapeId)); 
				
				//set new block id
				this.nextBlock.shapeId = this.pickBlock();

				//tells the board to redraw
				this.board.redraw = true;
			}
		}
	}
	animateFlash(){
		//start animation 
		if(!this.animationRunning){
			this.startTime = this.colorTime = new Date();
			this.animationRunning = true;
		}
		
		//color flip
		this.cnvAni.fillStyle = this.animationColor;
		if((new Date() - this.colorTime)/1000 > 0.20){
			this.animationColor = (this.animationColor == '#ff07f4'?'#000':'#ff07f4');
			this.colorTime = new Date();
		}

		//draw flashing row
		if(this.animationRunning && (new Date() - this.startTime)/1000 < 1.2){
			for(let i = 0; i < this.removing.length; i++){
				this.cnvAni.beginPath();
					this.cnvAni.rect(0, this.removing[i] * 30, 400, 30);
				this.cnvAni.fill();			
			}
		}else{
			this.status = 0;
			
			//removes duplicate rows and makes sure the rows are in order then loops over them
			this.removing.forEach(function(row) {

				//removes the row
				this.grid.splice(row, 1);
				
				//inserts empty array at the top of the board
				this.grid.unshift([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
				
				//tells board to redraw at next game draw request
				this.redraw = true;

			}, this.board);			

			this.removing = [];
			this.startAnimation = this.animationRunning = false;
		}
	}	
	draw(){
		this.cnv.clearRect(0, 0, 400, 600); 
		this.cnv.save(); 
		this.cnv.scale(1, 1); 
		this.cnv.translate(0, 0);
			//main board white background
			this.cnv.beginPath();
				this.cnv.rect(0, 0, 400, 600);
				this.cnv.fillStyle = "#fff";
			this.cnv.fill();
			
			//next piece white background
			this.cnvNext.beginPath();
				this.cnvNext.rect(0, 0, 300, 200);
				this.cnvNext.fillStyle = "#fff";
			this.cnvNext.fill();	
			
			//draws the next block in the canvas on the right
			this.nextBlock.draw(this.cnvNext, this.piecesImg);
			
			//draw active block
			this.ab.draw(this.cnv, this.piecesImg);
			
			//draw game over
			this.cnv.font = "10px Arial";
			this.cnv.fillStyle = "red";
			this.cnv.fillText((this.status == 2 ? this.statusLookup[this.status] : "" ) , 220, 20);	

		this.cnv.restore();	
		
		//SCORE
		this.cnvScore.clearRect(0, 0, 120, 70); 
		this.cnvScore.save(); 
		this.cnvScore.scale(1, 1); 
		this.cnvScore.translate(0, 0);	
			//white background
			this.cnvScore.beginPath();
				this.cnvScore.rect(0, 0, 120, 70);
				this.cnvScore.fillStyle = "#fff";
			this.cnvScore.fill();
			
			//draw number of lines cleared
			this.cnvScore.font = "700 25px Arial";
			this.cnvScore.fillStyle = "#222";
			this.cnvScore.textAlign = "center";
			this.cnvScore.fillText('Score', 60,30);
			this.cnvScore.fillText(this.score, 60,60);
		this.cnvScore.restore();		
		
		//LEVEL
		this.cnvLevel.clearRect(0, 0, 120, 70); 
		this.cnvLevel.save(); 
		this.cnvLevel.scale(1, 1); 
		this.cnvLevel.translate(0, 0);	
			//white background
			this.cnvLevel.beginPath();
				this.cnvLevel.rect(0, 0, 120, 70);
				this.cnvLevel.fillStyle = "#fff";
			this.cnvLevel.fill();
			
			//draw number of lines cleared
			this.cnvLevel.font = "700 30px Arial";
			this.cnvLevel.fillStyle = "#222";
			this.cnvLevel.textAlign = "center";
			this.cnvLevel.fillText('Level', 60,30);
			this.cnvLevel.fillText(this.level.current, 60,60);
		this.cnvLevel.restore();		
		
		//LINES
		this.cnvLines.clearRect(0, 0, 120, 70); 
		this.cnvLines.save(); 
		this.cnvLines.scale(1, 1); 
		this.cnvLines.translate(0, 0);	
			//white background
			this.cnvLines.beginPath();
				this.cnvLines.rect(0, 0, 120, 70);
				this.cnvLines.fillStyle = "#fff";
			this.cnvLines.fill();
			
			//draw number of lines cleared
			this.cnvLines.font = "700 30px Arial";
			this.cnvLines.fillStyle = "#222";
			this.cnvLines.textAlign = "center";
			this.cnvLines.fillText('Lines', 60,30);
			this.cnvLines.fillText(this.lines, 60,60);
		this.cnvLines.restore();		
		
		this.cnvBoard.clearRect(0, 0, 400, 600); 
		this.cnvBoard.save(); 
		this.cnvBoard.scale(1, 1); 
		this.cnvBoard.translate(0, 0);				
			this.board.draw(this.cnvBoard, this.piecesImg);	
		this.cnvBoard.restore();

		if(this.startAnimation){
			this.cnvAni.clearRect(0, 0, 400, 600); 
			this.cnvAni.save(); 
			this.cnvAni.scale(1, 1);  
			this.cnvAni.translate(0, 0);				
				this.animateFlash();
			this.cnvAni.restore();
		}	
	}
}
class board{
	constructor(width = 300, height = 600){
		this.width = width;
		this.height = height;
		this.redraw = true;
		this.grid = this.generateGrid();
	}
	generateGrid(){
		var grid = [];
		for(let h = 0; h < this.height/30; h++){
			grid[h] = [];
			for(let w = 0; w < this.width/30; w++){
				grid[h][w] = -1;
				/*
				if(h < 17){
					grid[h][w] = -1;
				}else{
					//this is dev code
					if(w > 0 && h == 17){grid[h][w] = {id: 99, color: "red", shapeId:1};}else if(w == 0 && h == 17){grid[h][w] = -1;}
					if(w == 1 && h == 18){grid[h][w] = -1;	}
					if(w > 1 && h == 18){grid[h][w] = {id: 100, color: "green", shapeId:1};}else  if(w == 0 && h == 18){grid[h][w] = -1;}
				 	if(w > 0 && h == 19){grid[h][w] = {id: 101, color: "orange", shapeId:1};}else  if(w == 0 && h == 19){grid[h][w] = -1;}	
					//grid[h][w] = -1;					
				}
				*/
			}
		}
		return grid;
	}
	calcPos(i){
		var ri = parseInt(((i) / 30));
		ri = (ri < 0 ? 0 : ri);
		return ri;
	}
	checkRow(pieces){
		var rowsToRemove = [];
		
		//loop over each piece
		for(let i = 0; i < pieces.length; i++){
			
			//set pieceCount for each row
			var pieceCount = 0;
			
			//turns pieces y from a float to a grid position
			var y = this.calcPos(pieces[i].y);
			
			//loop over each grid space to check if its empty or not
			for(let c = 0; c < this.width / 30; c++){
				
				//if the grid space isnt empty increase pieceCount
				if(this.grid[y][c] != -1){pieceCount++;}
			}
			
			//if there are 10 pieces in a row places the row into an array to be removed
			if(pieceCount == 10){rowsToRemove.push(y);}
		}

		//return number of rows cleared sorted and no duplicates
		return [...new Set(rowsToRemove)].sort();
	}	
	cc_walls(block, dir = 0){
		var x = parseInt(block.pos.x);
		var y = parseInt(block.pos.y);
		var w = parseInt(block.width[block.shapeId][block.rotated]);
		var h = parseInt(block.height[block.shapeId][block.rotated]);
		if(dir == 0 && x < 30){return true;}
		if(dir == 1 && x + w > 270){return true;}
		if(dir == 2 && y + h >= 600){return true;}
		
		return false;
	}
	cc_blocks(block, near = 0){
		for(let i = 0; i < block.pieces[block.shapeId][block.rotated].length; i++){
			var gridX = this.calcPos(block.pieces[block.shapeId][block.rotated][i].x) + near;
			var gridY = this.calcPos(block.pieces[block.shapeId][block.rotated][i].y );
			var gridY30 = this.calcPos(block.pieces[block.shapeId][block.rotated][i].y+30);
			if(gridY30 < 20){
				//checks bottom
				if(this.grid[gridY30][gridX] != block.id && this.grid[gridY30][gridX] != -1){return true;} 
				//checks top
				if(this.grid[gridY][gridX] != block.id && this.grid[gridY][gridX] != -1){return true;} 
			} 
		}
		return false;
	}
	cc_game_over(block){
		for(let i = 0; i < block.pieces[block.shapeId][block.rotated].length; i++){
			if(block.pieces[block.shapeId][block.rotated][i].y <= 0){ return true; }
		}
		return false;
	}
	insert(pieces, id){
		for(let i = 0; i < pieces.length; i++){
			var x = this.calcPos(pieces[i].x);
			var y = this.calcPos(pieces[i].y);
			this.grid[y][x] = id;
		}
	}	
	draw(cnv, img){
		for(let h = 0; h < this.height / 30; h++){
			for(let w = 0; w < this.width / 30; w++){
				if(this.grid[h][w] != -1){
					cnv.drawImage(img, (this.grid[h][w].shapeId * 30), 0, 30, 30, w * 30, h * 30, 30, 30);
				}
			}
		}
	}
}