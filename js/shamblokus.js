var colors = [[255, 0, 0, 128, 0, 0],               //red
              [0, 90, 160, 255, 0, 0, 255],         //blue
              [255, 255, 0, 180, 180, 0],           //yellow
              [0, 200, 0, 0, 100, 0],               //green
              //[200, 200, 200, 170, 170, 170]];      //white
              [170, 170, 170, 200, 200, 200]];      //white
              
    //"#FF0000", "#5555FF", "#FFFF00", "#00BB00"];

function Board(){
    this.size = 20;
    this.piece = new Piece([]);
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
 

function Piece(coords){
    this.used = false;
    this.color = "";        // 0 - red;  1 - blue;  2 - yellow;  3 - green
    this.size = 0;      //number of squares for this piece
    this.w = 0;         //number of columns
    this.h = 0;         //number of rows 
    this.canBeMoved = true;
    this.shape = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    for(var i = 0; i < coords.length; i++){
        y = coords[i][0];
        x = coords[i][1];
        this.shape[y][x] = 1;
        if (x > this.w)
            this.w = x;
        if (y > this.h)
            this.h = y;
    }
    this.w++;
    this.h++;
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
    this.pieces.push(new Piece([[0, 0], [1, 0], [1, 1], [1, 2], [2, 1]]));
    this.pieces.push(new Piece([[1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]));
    this.pieces.push(new Piece([[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]));   
    this.pieces.push(new Piece([[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]]));
    this.pieces.push(new Piece([[1, 0], [1, 1], [2, 0], [2, 1]]));
    this.pieces.push(new Piece([[0, 1], [1, 1], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[1, 1], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[1, 2], [2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece([[0, 1], [1, 0], [1, 1], [2, 0]]));
    this.pieces.push(new Piece([[1, 2], [1, 3], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[1, 0], [2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece([[1, 0], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[1, 0], [2, 0], [2, 1]]));
    this.pieces.push(new Piece([[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]]));
    this.pieces.push(new Piece([[2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece([[2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece([[2, 0], [2, 1]]));
    this.pieces.push(new Piece([[2, 0]]));
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
