var sham = angular.module('Shamblokus', ['ui']);

var boardSize = 20;		//number of squares
var squareSize = Math.floor(Math.max(15, ($(window).height())/(boardSize+5)));		//TODO
var boardXoff = $(window).width() - squareSize * (boardSize+2);		//TODO
boardXoff = Math.floor(boardXoff/squareSize)*squareSize;
var boardYoff = squareSize;
var piecesDist = 0.2*squareSize;

var _scope, _p1, _pcs;
sham.controller('Main', function($scope) {
    corners = [[-1, -1, 0], [boardSize, -1, 1], [boardSize, boardSize, 2], [-1, boardSize, 3]];

    $scope.p = [];
    $scope.p[0] = new Player([0, 2]);
    $scope.p[1] = new Player([1, 3]);     
    $scope.p[0].name = "Raluca";
    $scope.p[1].name = "Andrei";
    $scope.activePlayerId = 0;
    $scope.activeBagId = 0;

    //create the board as a huge piece
	coords = [];
	for(var i = 0; i < boardSize; i++)
	for(var j = 0; j < boardSize; j++){
		coords.push([i, j, 4]);
	}
    for(var c = 0; c < corners.length; c++)
        coords.push(corners[c]);
    board = new Piece(4, coords);
 	board.xOff = boardXoff;
    board.yOff = boardYoff;   
	board.canBeMoved = false;
	boardXoff -= boardSize;

	
  
    
    

    $scope.CanvasState = function(canvas, activePlayer) {
        
      // **** First some setup! ****
      this.activePlayer = activePlayer;
      this.canvas = canvas;
      this.width = canvas.width = window.innerWidth;
      this.height = canvas.height = window.innerHeight;
      this.ctx = canvas.getContext('2d');

      // This complicates things a little but fixes mouse co-ordinate problems
      // when there's a border or padding. See getMouse for more detail
      var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
      if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
      }

      // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
      // They will mess up mouse coordinates and this fixes that
      var html = document.body.parentNode;
      this.htmlTop = html.offsetTop;
      this.htmlLeft = html.offsetLeft;

      // **** Keep track of state! ****

      this.valid = false; // when set to false, the canvas will redraw everything
      this.dragging = false; // Keep track of when we are dragging
      // the current selected object. In the future we could turn this into an array for multiple selection
      this.selection = null;
      this.dragoffx = 0; // See mousedown and mousemove events for explanation
      this.dragoffy = 0;

      // **** Then events! ****

      // This is an example of a closure!
      // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
      // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
      // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
      // This is our reference!
        
      var myState = this;
        
        
      this.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
        
        // While draw is called as often as the INTERVAL variable demands,
        // It only ever does something if the canvas gets invalidated by our code
        this.draw = function() {
          // if our state is invalid, redraw and validate!
          if (!this.valid) {
            var ctx = this.ctx;
            this.clear();

            // ** Add stuff you want drawn in the background all the time here **

            // draw all shapes
            board.draw(ctx);  
            for(b = 0; b < this.activePlayer.bag.length; b++){
              for(p = 0; p < this.activePlayer.bag[b].pieces.length; p++){
                var cPiece = this.activePlayer.bag[b].pieces[p];
                //TODO: skip if out       if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
                cPiece.draw(ctx);
              }
            }
            if(this.selection){
              this.selection.draw(ctx);     //bring to front the selected piece
            }

            this.valid = true;
          }
        }
        
      // Creates an object with x and y defined, set to the mouse position relative to the state's canvas
      // If you wanna be super-correct this can be tricky, we have to worry about padding and borders
      this.getMouse = function(e) {
          var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

          // Compute the total offset
          if (element.offsetParent !== undefined) {
            do {
              offsetX += element.offsetLeft;
              offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
          }

          // Add padding and border style widths to offset
          // Also add the <html> offsets in case there's a position:fixed bar
          offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
          offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

          mx = e.pageX - offsetX;
          my = e.pageY - offsetY;

          // We return a simple javascript object (a hash) with x and y defined
          return {x: mx, y: my};
        }

      //fixes a problem where double clicking causes text to get selected on the canvas
      canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);

        // Up, down, and move are for dragging
      canvas.addEventListener('mousedown', function(e) {
        var mouse = myState.getMouse(e);
        var mx = mouse.x;
        var my = mouse.y;
        for(b = 0; b < myState.activePlayer.bag.length; b++){
          for(p = myState.activePlayer.bag[b].pieces.length - 1; p >= 0; p--){
            var cPiece = myState.activePlayer.bag[b].pieces[p];
            if(cPiece.contains(mx, my) && cPiece.available){
              myState.dragoffx = mx - cPiece.xOff;
              myState.dragoffy = my - cPiece.yOff;
              myState.dragging = true;
              myState.activePlayer.bag[b].pieces.splice(p, 1);
              cPiece.active = true;
              myState.activePlayer.bag[b].pieces.push(cPiece);		//bring to front
              myState.selection = cPiece;
              myState.valid = false;
              for(p = p-1; p >= 0; p--)			//set inactive other pieces
                myState.activePlayer.bag[b].pieces[p].active = false;
              return;
            }
            else
                cPiece.active = false;
          }
        }

        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if (myState.selection) {
          myState.selection = null;
          myState.valid = false; // Need to clear the old selection border
        }
      }, true);     //end of 'mousedown'

      canvas.addEventListener('mousemove', function(e) {
        if (myState.dragging){
          var mouse = myState.getMouse(e);
          // We don't want to drag the object by its top-left corner, we want to drag it
          // from where we clicked. Thats why we saved the offset and use it here
          myState.selection.xOff = mouse.x - myState.dragoffx;
          myState.selection.yOff = mouse.y - myState.dragoffy;   
          myState.valid = false; // Something's dragging so we must redraw
        }
      }, true);     //end of 'mousemove'

      canvas.addEventListener('mouseup', function(e) {
          if(myState.selection){
              if(myState.selection.isPartlyOverTheBoard()){     //fit
                  myState.selection.xOff = Math.floor(myState.selection.xOff/squareSize+0.5)*squareSize;
                  myState.selection.yOff = Math.floor(myState.selection.yOff/squareSize+0.5)*squareSize;
                  myState.valid = false;
                  //myState.selection.active = false;     //not active anymore
                  //myState.selection.available = false;
              }
          }
          myState.dragging = false;
      }, true); //end of 'mouseup'

      canvas.addEventListener('dblclick', function(e) {
            myState.activePlayer.rearrangePieces();
            myState.valid = false;
            myState.dragging = false;
      }, true); //end of 'mouseup'


        window.onkeydown = function(e) {
            var c = e.keyCode;
            if(c === 82){		//r - rotate
                if(myState.selection){
                    myState.selection.rotate();
                    myState.valid = false;
                }
            }
            else if(c === 86){	//v - vertical flip
                if(myState.selection){
                    myState.selection.flipV();
                    myState.valid = false;
                }
            }
            else if(c === 72){	//h - horizontal flip
                if(myState.selection){
                    myState.selection.flipH();
                    myState.valid = false;
                }
            }
            else if(c === 13){	//enter - enter
                if(myState.selection){
                    //test if can fit in that place
                    if(myState.selection.canBePlaced()){              

                        //change id on the board
                        for(sq = 0; sq < myState.selection.squares.length; sq++){
                            i = (myState.selection.yOff - board.yOff)/squareSize + myState.selection.squares[sq][0];
                            j = (myState.selection.xOff - board.xOff)/squareSize + myState.selection.squares[sq][1];
                            board.squares[i*boardSize + j][2] = myState.selection.id;
                        }
                        myState.selection.active = false;
                        myState.selection.available = false;
                        myState.selection = null;
                        //TODO: delete piece from current bag
                        $scope.p[$scope.activePlayerId].updateScore();
                        $scope.$apply();
                        console.log($scope.p[$scope.activePlayerId]);
                        myState.valid = false;
                    }
                }
            }

        }; //end of 'onkeydown'

      // **** Options! ****

      this.selectionColor = '#CC0000';
      this.selectionWidth = 2;  
      this.interval = 30;
      setInterval(function() { myState.draw(); }, myState.interval);
    }






    
    
    $scope.CanvasState(document.getElementById('bag1'), $scope.p[$scope.activePlayerId]);
    $scope.p[$scope.activePlayerId].rearrangePieces();

    //TODO: nu merge!
    $scope.player0 = $scope.p[0];
    $scope.$watch('player0.score', function (newVal, oldVal){
        console.log(newVal, oldVal);
        if(newVal != undefined){
            $scope.p[0].score = newVal;
        }
    });
    
    //for debugging
    _p1 = $scope.p[0];
	_pcs = _p1.bag[0].pieces;
    _scope = $scope;
});




