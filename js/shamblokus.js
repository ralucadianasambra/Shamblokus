var colors = [['rgba(220, 0, 0, 0.99)', 'rgba(128, 0, 0, 0.99)', 'rgba(255, 100, 100, 0.99)', 'rgba(220, 0, 0, 0.7)', 'rgba(128, 0, 0, 0.7)'],                 //red
              ['rgba(80, 100, 255, 0.99)', 'rgba(40, 60, 180, 0.99)', 'rgba(140, 200, 255, 0.99)', 'rgba(80, 100, 255, 0.7)', 'rgba(40, 60, 180, 0.7)'],
              ['rgba(255, 245, 100, 0.99)', 'rgba(240, 220, 0, 0.99)', 'rgba(255, 255, 230, 0.99)', 'rgba(255, 245, 100, 0.7)', 'rgba(240, 220, 0, 0.7)'],               //yellow
              ['rgba(0, 150, 0, 0.99)', 'rgba(0, 100, 0, 0.99)', 'rgba(80, 220, 80, 0.99)', 'rgba(0, 150, 0, 0.7)', 'rgba(0, 100, 0, 0.7)'],                 //green
              ['rgba(200, 200, 200, 0.99)', 'rgba(220, 220, 220, 0.99)', 'rgba(200, 200, 200, 0.99)', 'rgba(200, 200, 200, 0.99)', 'rgba(220, 220, 220, 0.99)']];        //white

function Piece(colorId, coords){
    this.colorId = colorId;
    this.w = 0;         //number of columns
    this.h = 0;         //number of rows 
    this.xOff = 0;      //position of the top left corner, in pixels
    this.yOff = 0;
	this.available = true;       //wasn't already used 
    this.active = false;         //selected piece
    this.squares = coords;
	
    this.color1 = colors[colorId][0];
    this.color2 = colors[colorId][1];
    this.color3 = colors[colorId][2];

    this.setWH();
}

function Bag(colorId)
{
    this.colorId = colorId;
    this.available = false;
    this.pieces = [];
    this.pieces.push(new Piece(colorId, [[0, 0], [1, 0], [1, 1], [1, 2], [2, 1]]));
    this.pieces.push(new Piece(colorId, [[1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]));
    this.pieces.push(new Piece(colorId, [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]]));   
    this.pieces.push(new Piece(colorId, [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1]]));
    this.pieces.push(new Piece(colorId, [[1, 0], [1, 1], [2, 0], [2, 1]]));
    this.pieces.push(new Piece(colorId, [[0, 1], [1, 1], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[1, 1], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[1, 2], [2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece(colorId, [[0, 1], [1, 0], [1, 1], [2, 0]]));
    this.pieces.push(new Piece(colorId, [[1, 2], [1, 3], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[1, 0], [2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece(colorId, [[1, 0], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[1, 0], [2, 0], [2, 1]]));
    this.pieces.push(new Piece(colorId, [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]]));
    this.pieces.push(new Piece(colorId, [[2, 0], [2, 1], [2, 2], [2, 3]]));
    this.pieces.push(new Piece(colorId, [[2, 0], [2, 1], [2, 2]]));
    this.pieces.push(new Piece(colorId, [[2, 0], [2, 1]]));
    this.pieces.push(new Piece(colorId, [[2, 0]]));
//    this.pieces.push(new Piece([[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]));
}

function Player(ids){
    this.score = 0;
    this.name = "";
    this.bag = [];
    this.available = false;
    for(var i = 0; i < ids.length; i++){
        this.bag.push(new Bag(ids[i]));    
    }
}

Bag.prototype.setAvailability = function(available){
    this.available = available;
    for(p = 0; p < this.pieces.length; p++){
        this.pieces[p].available = available;
    }
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
    var maxH = 0;
    var pieceOff = 0;
    for(var b = 0; b < this.bag.length; b++){
        if(b>0) //new bag, new line
        {
            x = 0;
            y = Math.max(Math.floor(board.h/this.bag.length+0.49) * squareSize, y + maxH * squareSize + piecesDist);
            pieceOff = 0;           //id of the first piece on the line
        }
        for(var p = 0; p < this.bag[b].pieces.length; p++)
        {
            var cPiece = this.bag[b].pieces[p];
			if(cPiece.available == false)
				continue;		//skip
            if(x + (cPiece.jmax) * squareSize + piecesDist > boardXoff-squareSize)  //new line
            {
                x = 0;
                y += maxH*squareSize + piecesDist;		//use maxH of the previous line
                maxH = cPiece.h;
                pieceOff = p;
            }
            if(cPiece.h > maxH)
            {
                hDif = cPiece.h - maxH;					//current piece is taller then any other piece on the line ==> shift them down
                for(var i = pieceOff; i < p; i++){
                    if(this.bag[b].pieces[i].available)
                        this.bag[b].pieces[i].yOff += hDif*squareSize;      //shift them down, so they are all on the same down-line
                }
                maxH = cPiece.h;			//update maxH to the height of the current piece
            }
            cPiece.xOff = x - cPiece.jmin * squareSize;
            cPiece.yOff = y + (maxH - 1 - cPiece.imax) * squareSize;
            x += (cPiece.w) * squareSize + piecesDist;
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
            
            if(board.squares[bs][2] != this.colorId)       //skip cause not same color
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
        //ctx.lineWidth = 0;
        var c1, c2, c3;
        for(var sq = 0; sq < this.squares.length; sq++){
            var i = this.squares[sq][0];
            var j= this.squares[sq][1];
            
            var grd = ctx.createRadialGradient(
                this.xOff + (j+0.5)*squareSize, this.yOff + (i+0.5)*squareSize, squareSize/7, 
                this.xOff + (j+0.5)*squareSize, this.yOff + (i+0.5)*squareSize, squareSize/2);
            if(this.squares[sq].length == 3){       //for board
                colorId = this.squares[sq][2];
                c1 = colors[colorId][0];
                c2 = colors[colorId][1];
                c3 = colors[colorId][2];
            }
            else{
                c1 = this.color1;
                c2 = this.color2;
                c3 = this.color3;
            }
            if(this.active){
                grd.addColorStop(0, c3);
                grd.addColorStop(1, c1);
                ctx.strokeStyle = c3;
            }
            else{
                grd.addColorStop(0, c1);
                grd.addColorStop(1, c2);
                ctx.strokeStyle = c1;
            }
            ctx.strokeRect(this.xOff + j*squareSize, this.yOff + i*squareSize, squareSize-1, squareSize-1);
            ctx.fillStyle = grd;
            ctx.fillRect(this.xOff + j*squareSize, this.yOff + i*squareSize, squareSize-1, squareSize-1);
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
    
    
    
    createBoard = function(boardSize, boardXoff, boardYoff){
        corners = [[-1, -1, 0], [boardSize, -1, 1], [boardSize, boardSize, 2], [-1, boardSize, 3]];

        //create the board as a huge piece
        coords = [];
        for(var i = 0; i < boardSize; i++)
        for(var j = 0; j < boardSize; j++){
            coords.push([i, j, 4]);
        }
        for(var c = 0; c < corners.length; c++) {
            coords.push(corners[c]);
        }

        board = new Piece(4, coords);
        board.xOff = boardXoff;
        board.yOff = boardYoff;   
        board.canBeMoved = false;
        boardXoff -= boardSize;
        return board;
    }