var colors = [[255, 0, 0, 128, 0, 0],               //red
              [0, 90, 160, 0, 0, 255],              //blue
              [255, 255, 0, 180, 180, 0],           //yellow
              [0, 200, 0, 0, 100, 0],               //green
              //[200, 200, 200, 170, 170, 170]];      //white
              [170, 170, 170, 200, 200, 200]];      //white
              
    //"#FF0000", "#5555FF", "#FFFF00", "#00BB00"];

function Board(){
    this.size = 20;
    this.piece = new Piece(4, []);
    for(var i = 0; i < this.size; i++){
        if(i>=5)
            this.piece.shape.push([0, 0, 0, 0, 0]);
        for(var j = 0; j < this.size; j++){
            if(j>=5)
                this.piece.shape[i].push([0]);
            this.piece.shape[i][j] = 1;
        }
    }
    this.piece.setSize();
    this.piece.w = this.size;
    this.piece.h = this.size;
}
 

function Piece(id, coords){
    this.used = false;
    this.id = id;
    this.size = 0;      //number of squares for this piece
    this.w = 0;         //number of columns
    this.h = 0;         //number of rows 
    this.squareSize = squareSize;
    this.xOff = 0;      //position of the top left corner, in pixels
    this.yOff = 0;
    this.color1 = 'rgb('+colors[id][0]+', '+colors[id][1]+', '+colors[id][2]+')' || '#AAAAAA';
    if(colors[id].length>5)
        this.color2 = 'rgb('+colors[id][3]+', '+colors[id][4]+', '+colors[id][5]+')';
    else
        this.color2 = 'rgb('+colors[id][0]+', '+colors[id][1]+', '+colors[id][2]+')';
    this.canBeMoved = true;
    this.active = false;        //selected piece
    this.shape = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    for(var i = 0; i < coords.length; i++){
        y = coords[i][0];
        x = coords[i][1];
        this.shape[y][x] = 1;
    }

    this.setWH();
    this.setSize = function(){
        this.size = 0;
        for(var i = 0; i < this.shape.length; i++){
            for(var j = 0; j < this.shape[i].length; j++){
                if(this.shape[i][j] === 1){
                    this.size++;
                }
            }
        }
    }
    this.setSize();
}

function Bag(id)
{
    this.id = id;
    this.pieces = [];
    this.pieces.push(new Piece(id, [[0, 0], [1, 0], [1, 1], [1, 2], [2, 1]]));
    this.pieces.push(new Piece(id, [[1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]));
    this.pieces.push(new Piece(id, [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]));   
    this.pieces.push(new Piece(id, [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]]));
    this.pieces.push(new Piece(id, [[1, 0], [1, 1], [2, 0], [2, 1]]));
    this.pieces.push(new Piece(id, [[0, 1], [1, 1], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[1, 1], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[1, 2], [2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece(id, [[0, 1], [1, 0], [1, 1], [2, 0]]));
    this.pieces.push(new Piece(id, [[1, 2], [1, 3], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[1, 0], [2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece(id, [[1, 0], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[1, 0], [2, 0], [2, 1]]));
    this.pieces.push(new Piece(id, [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]]));
    this.pieces.push(new Piece(id, [[2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece(id, [[2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(id, [[2, 0], [2, 1]]));
    this.pieces.push(new Piece(id, [[2, 0]]));
//    this.pieces.push(new Piece([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]));
}

function Player(ids){
    this.score = 0;
    this.name = "";
    this.bag = [];
    for(var i = 0; i < ids.length; i++){
        this.bag.push(new Bag(ids[i]));    
    }
    this.updateScore = function(){
        for(var b = 0; b < this.bag.length; b++){
            for(var p = 0; p < this.bag[b].pieces.length; p++){
                if(this.bag[b].pieces[p].canBeMoved){
                    this.score += this.bag[b].pieces[p].size;
                }
            }
        }
    }
}

//computes the size (in number of rows/lines) of a piece
Piece.prototype.setWH = function(){
        this.imin = 200;
        this.imax = 0;
        this.jmin = 200;
        this.jmax = 0;
        for(var i = 0; i < this.shape.length; i++){            
            for(var j = 0; j < this.shape[i].length; j++){
                if(this.shape[i][j]==1){
                    if(i < this.imin)    {this.imin = i;}
                    if(j < this.jmin)    {this.jmin = j;}
                    if(i > this.imax)    {this.imax = i;}
                    if(j > this.jmax)    {this.jmax = j;}
                }
            }
        }
        this.w = this.jmax - this.jmin + 1;
        this.h = this.imax - this.imin + 1;
    }

