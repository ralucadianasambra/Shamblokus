var colors = [['rgba(220, 0, 0, 0.99)', 'rgba(128, 0, 0, 0.99)', 'rgba(255, 100, 100, 0.99)'],                 //red
              //['rgba(60, 80, 255, 0.99)', 'rgba(40, 60, 180, 0.99)', 'rgba(140, 200, 255, 0.99)'],                //blue
              ['rgba(50, 50, 235, 0.99)', 'rgba(20, 20, 180, 0.99)', 'rgba(120, 120, 255, 0.99)'],                //blue
              //['rgba(140, 65, 220, 0.99)', 'rgba(100, 30, 180, 0.99)', 'rgba(200, 160, 245, 0.99)'],                //blue
              //['rgba(255, 180, 0, 0.99)', 'rgba(220, 165, 0, 0.99)', 'rgba(255, 215, 120, 0.99)'],                //blue
              ['rgba(255, 245, 100, 0.99)', 'rgba(240, 220, 0, 0.99)', 'rgba(255, 255, 230, 0.99)'],               //yellow
              ['rgba(0, 150, 0, 0.99)', 'rgba(0, 100, 0, 0.99)', 'rgba(80, 220, 80, 0.99)'],                 //green
              ['rgba(200, 200, 200, 0.99)', 'rgba(220, 220, 220, 0.99)', 'rgba(200, 200, 200, 0.99)']];        //white
              //['rgba(170, 170, 170, 0.99)', 'rgba(200, 200, 200, 0.99)', 'rgba(200, 200, 200, 0.99)']];        //white

function Piece(id, coords){
    this.id = id;
    this.w = 0;         //number of columns
    this.h = 0;         //number of rows 
    this.xOff = 0;      //position of the top left corner, in pixels
    this.yOff = 0;
	this.available = true;
    this.active = false;        //selected piece
    this.squares = coords;
	
    this.color1 = colors[id][0];
    this.color2 = colors[id][1];
    this.color3 = colors[id][2];

    this.setWH();
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
        this.score = 0;
        for(var b = 0; b < this.bag.length; b++){
            for(var p = 0; p < this.bag[b].pieces.length; p++){
                if(this.bag[b].pieces[p].available){
                    this.score += this.bag[b].pieces[p].squares.length;
                }
            }
        }
    }
    this.updateScore();
}

//computes the size (in number of rows/lines) of a piece
Piece.prototype.setWH = function(){
	this.imin = 200;
	this.imax = 0;
	this.jmin = 200;
	this.jmax = 0;
	for(var sq = 0; sq < this.squares.length; sq++){     
		var i = this.squares[sq][0];
		var j = this.squares[sq][1];
		if(i < this.imin)    {this.imin = i;}
		if(j < this.jmin)    {this.jmin = j;}
		if(i > this.imax)    {this.imax = i;}
		if(j > this.jmax)    {this.jmax = j;}
	}
	this.w = this.jmax - this.jmin + 1;
	this.h = this.imax - this.imin + 1;
}


Piece.prototype.flipH = function(){
	if(!this.available)
		return;
	for(sq = 0; sq < this.squares.length; sq++){
		this.squares[sq][1] = this.jmax - (this.squares[sq][1] - this.jmin);
	}
}

Piece.prototype.flipV = function(){
	if(!this.available)
		return;
	for(sq = 0; sq < this.squares.length; sq++){
		this.squares[sq][0] = this.imax - (this.squares[sq][0] - this.imin);
	}
}

Piece.prototype.rotate = function(){
	if(!this.available)
		return;
	for(sq = 0; sq < this.squares.length; sq++){
		var i = this.squares[sq][0];
		var j = this.squares[sq][1];
		this.squares[sq][1] = this.jmin + (this.imax - i);
		this.squares[sq][0] = this.imin + (j - this.jmin);
	}
	this.setWH();
}

Player.prototype.rearrangePieces = function(){
	x = 0;
    y = 0;
    var maxH = 1;
    var pieceOff = 0;
    for(var b = 0; b < this.bag.length; b++){
        if(b>0) //new bag, new line
        {
            x = 0;
            maxH = 1;
            y += maxH * squareSize + piecesDist;
            pieceOff = p;
        }
        for(var p = 0; p < this.bag[b].pieces.length; p++)
        {
            var cPiece = this.bag[b].pieces[p];
			if(cPiece.available == false)
				continue;		//skip
            if(x + (cPiece.w)*squareSize + piecesDist > boardXoff)  //new line
            {
                x = 0;
				maxH = cPiece.h;						//update maxH to the height of the current piece
                y += maxH*squareSize + piecesDist;		//use maxH of the previous line
                pieceOff = p;
            }
            if(cPiece.h > maxH)
            {
                hDif = cPiece.h - maxH;					//current piece is taller then any other piece on the line ==> shift them down
                y += hDif * squareSize;
                for(var i = pieceOff; i < p - 1; i++){
                    this.bag[b].pieces[i].yOff = y;
                }
                maxH = cPiece.h;			//update maxH to the height of the current piece
            }
            cPiece.xOff = x;
            cPiece.yOff = y;
            x += (cPiece.w)*squareSize + piecesDist;
        }
    }
}

Piece.prototype.isOverTheBoard = function(){
    var xmin, xmax, ymin, ymax;
    xmin = this.xOff + this.jmin * squareSize;
    xmax = this.xOff + (this.jmax + 1) * squareSize;
    ymin = this.yOff + this.imin * squareSize;
    ymax = this.yOff + (this.imax + 1) * squareSize;
    if(xmin < board.xOff || xmax > (board.xOff + boardSize*squareSize) || ymin < board.yOff || ymax > (board.yOff + boardSize * squareSize)){
       return false;
    }
    else
       return true;
}

Piece.prototype.isPartlyOverTheBoard = function(){
    var xmin, xmax, ymin, ymax;
    xmin = this.xOff + this.jmin * squareSize;
    xmax = this.xOff + (this.jmax + 1) * squareSize;
    ymin = this.yOff + this.imin * squareSize;
    ymax = this.yOff + (this.imax + 1) * squareSize;
    if(xmax < board.xOff || xmin > (board.xOff + boardSize*squareSize) || ymax < board.yOff || ymin > (board.yOff + boardSize * squareSize)){
       return false;
    }
    else
       return true;
}
       

Piece.prototype.canBePlaced = function(){
    //test if over the board
    if(!this.isOverTheBoard())    
        return false;

    var xbs, ybs, xps, yps;     //bs - board square;    ps - piece squace
    var cornerCdt = false;      //shared corner with a square of the same color
    for(var ps = 0; ps < this.squares.length; ps++){
        xps = this.xOff + this.squares[ps][1]*squareSize;
        yps = this.yOff + this.squares[ps][0]*squareSize;
        for(var bs = 0; bs < board.squares.length; bs++){
            if(board.squares[bs][2] == 4)       //skip cause free square
                continue;
            xbs = board.xOff + board.squares[bs][1]*squareSize;
            ybs = board.yOff + board.squares[bs][0]*squareSize;
            
            //test if square is free
            if( xps == xbs && yps == ybs)
                return false;
            
            if(board.squares[bs][2] != this.id)       //skip cause not same color
                continue;
            
            //test for side condition (no share side with a square of the same color)
            if(( xps == (xbs - squareSize) && yps == ybs) || ( xps == (xbs + squareSize) && yps == ybs) ||
               ( xps == xbs && yps == (ybs - squareSize)) || ( xps == xbs && yps == (ybs + squareSize))){
                return false;
            }
            
            //test for corner condition (shared corner with a square of the same color)
            if(( xps == (xbs - squareSize) || xps == (xbs + squareSize)) && ( yps == (ybs - squareSize) || yps == (ybs + squareSize) ))
                cornerCdt = true;
        }
    }
    return cornerCdt;
}


    // Draws this piece to a given context
    Piece.prototype.draw = function(ctx) {
        ctx.strokeStyle = "#444444";
        ctx.lineWidth = 1;
        var c1, c2, c3;
        for(var sq = 0; sq < this.squares.length; sq++){
            var i = this.squares[sq][0];
            var j= this.squares[sq][1];
            ctx.strokeRect(this.xOff + j*squareSize, this.yOff + i*squareSize, squareSize, squareSize);
            var grd = ctx.createRadialGradient(
                this.xOff + (j+0.5)*squareSize, this.yOff + (i+0.5)*squareSize, squareSize/7, 
                this.xOff + (j+0.5)*squareSize, this.yOff + (i+0.5)*squareSize, squareSize/2);
            if(this.squares[sq].length == 3){       //for board
                id = this.squares[sq][2];
                c1 = colors[id][0];
                c2 = colors[id][1];
                c3 = colors[id][2];
            }
            else{
                c1 = this.color1;
                c2 = this.color2;
                c3 = this.color3;
            }
            if(this.active){
                grd.addColorStop(0, c3);
                grd.addColorStop(1, c1);
            }
            else{
                grd.addColorStop(0, c1);
                grd.addColorStop(1, c2);
            }
            ctx.fillStyle = grd;
            ctx.fillRect(this.xOff + j*squareSize, this.yOff + i*squareSize, squareSize, squareSize);
        }
    }
    
    
    // Determine if a point is inside the shape's bounds
    Piece.prototype.contains = function(mx, my) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Width) and its Y and (Y + Height)
        test = false;
        var i, j, xmin, xmax, ymin, ymax;
        for(var sq = 0; sq < this.squares.length; sq++){
            i = this.squares[sq][0];
            j = this.squares[sq][1];
            xmin = this.xOff + j * squareSize;
            xmax = this.xOff + (j+1) * squareSize;
            ymin = this.yOff + i * squareSize;
            ymax = this.yOff + (i+1) * squareSize;
            if(mx >= xmin && mx < xmax && my >= ymin && my < ymax){
                test = true;
                break;
            }
        } 

        return  test;
    }