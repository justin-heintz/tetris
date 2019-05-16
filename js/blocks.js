 //https://www.colinfahey.com/tetris/tetris_diagram_pieces_orientations_new.jpg
class block{
	constructor(id, shapeId){
		this.id = id;
		this.shapeId = shapeId;
		this.pos = {x:30, y:0};
		this.colors = ['red', 'blue', 'green', 'orange', 'yellow', 'black', 'purple', 'pink', 'DarkOliveGreen'];
		this.rotated = 0;
		this.falling = true;
		this.buildBlock();
		this.widthChart();
		this.heightChart();
	}
	rotate(){
		this.rotated++;
		if(this.rotated > 3){this.rotated = 0;}
		if(this.pieces[this.shapeId][this.rotated].length == 0){this.rotated = 0;}
		if(this.pos.x < 0){ this.pos.x = 0;}
		if(this.pos.x + this.width[this.shapeId][this.rotated] > 300){this.pos.x = this.pos.x - (this.pos.x + this.width[this.shapeId][this.rotated] - 300);}

		this.buildBlock();
	}
	draw(cnv, img){
		if(cnv.canvas.id == 'nextBlock' ){
			this.pos = {x:10, y:20};
			this.buildBlock();
		}
		for(let i=0; i < this.pieces[this.shapeId][this.rotated].length; i++){
			cnv.drawImage(img, (this.shapeId * 30), 0, 30, 30, this.pieces[this.shapeId][this.rotated][i].x, this.pieces[this.shapeId][this.rotated][i].y, 30, 30);
		}
	}	
	emptyArray(){
		let emptyArray = [];
		for(let i = 0; i <7; i++){
			emptyArray[i] = [];
			for(let e = 0; e <4; e++){
				emptyArray[i][e] = [];
			}
		}
		return emptyArray;
	}
	heightChart(){
		this.height = this.emptyArray();
		//O
		this.height[0][0] = 60;
		//I
		this.height[1][0] = 30;
		this.height[1][1] = 120;
		//S
		this.height[2][0] = 60;
		this.height[2][1] = 90;
		//Z
		this.height[3][0] = 60;
		this.height[3][1] = 90;
		//L
		this.height[4][0] = 60;
		this.height[4][1] = 90;
		this.height[4][2] = 60;
		this.height[4][3] = 90;
		//J
		this.height[5][0] = 60;
		this.height[5][1] = 90;
		this.height[5][2] = 60;
		this.height[5][3] = 90;
		//T
		this.height[6][0] = 60;
		this.height[6][1] = 90;
		this.height[6][2] = 60;
		this.height[6][3] = 90;			
	}
	widthChart(){
		this.width = this.emptyArray();
		//O
		this.width[0][0] = 60;
		//I
		this.width[1][0] = 120;
		this.width[1][1] = 30;
		//S
		this.width[2][0] = 90;
		this.width[2][1] = 60;
		//Z
		this.width[3][0] = 90;
		this.width[3][1] = 60;
		//L
		this.width[4][0] = 90;
		this.width[4][1] = 60;
		this.width[4][2] = 90;
		this.width[4][3] = 60;
		//J
		this.width[5][0] = 90;
		this.width[5][1] = 60;
		this.width[5][2] = 90;
		this.width[5][3] = 60;
		//T
		this.width[6][0] = 90;
		this.width[6][1] = 60;
		this.width[6][2] = 90;
		this.width[6][3] = 60;	
	}	
	buildBlock(){
		this.pieces = this.emptyArray();
		//O
		this.pieces[0][0].push({x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y+30}),
		//I
		this.pieces[1][0].push({x:this.pos.x+60,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+90,y:this.pos.y}),
		this.pieces[1][1].push({x:this.pos.x,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y},{x:this.pos.x,y:this.pos.y+60},{x:this.pos.x,y:this.pos.y+90}),
		//S
		this.pieces[2][0].push({x:this.pos.x+30,y:this.pos.y},{x:this.pos.x+60,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y+30}),
		this.pieces[2][1].push({x:this.pos.x,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y+60}),
		//Z
		this.pieces[3][0].push({x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x+60,y:this.pos.y+30}),
		this.pieces[3][1].push({x:this.pos.x,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y+60}),
		//L
		this.pieces[4][0].push({x:this.pos.x+30,y:this.pos.y},{x:this.pos.x+60,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x,y:this.pos.y+30}),
		this.pieces[4][1].push({x:this.pos.x,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y},{x:this.pos.x,y:this.pos.y+60},{x:this.pos.x+30,y:this.pos.y+60}),
		this.pieces[4][2].push({x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y+30},{x:this.pos.x+60,y:this.pos.y+30},{x:this.pos.x+60,y:this.pos.y}),
		this.pieces[4][3].push({x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+60}),
		//J
		this.pieces[5][0].push({x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+60,y:this.pos.y},{x:this.pos.x+60,y:this.pos.y+30}),
		this.pieces[5][1].push({x:this.pos.x,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y+60},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y}),
		this.pieces[5][2].push({x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+60,y:this.pos.y+30}),
		this.pieces[5][3].push({x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+60},{x:this.pos.x,y:this.pos.y+60}),
		//T
		this.pieces[6][0].push({x:this.pos.x+30,y:this.pos.y},{x:this.pos.x,y:this.pos.y},{x:this.pos.x+60,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+30}),
		this.pieces[6][1].push({x:this.pos.x,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y},{x:this.pos.x,y:this.pos.y+60},{x:this.pos.x+30,y:this.pos.y+30}),
		this.pieces[6][2].push({x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x,y:this.pos.y+30},{x:this.pos.x+60,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y}),
		this.pieces[6][3].push({x:this.pos.x+30,y:this.pos.y+30},{x:this.pos.x+30,y:this.pos.y},{x:this.pos.x+30,y:this.pos.y+60},{x:this.pos.x,y:this.pos.y+30});
	}
}
