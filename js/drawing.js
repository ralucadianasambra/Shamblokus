
// Draws this piece to a given context
Piece.prototype.draw = function(ctx) {
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 1;
    for(var i = 0; i < this.shape.length; i++){
        for(var j = 0; j < this.shape[i].length; j++){
            if(this.shape[i][j]==1){ 
                ctx.strokeRect(this.xOff + j*this.squareSize, this.yOff + i*this.squareSize, this.squareSize, this.squareSize);
                var grd = ctx.createRadialGradient(
                    this.xOff + (j+0.5)*this.squareSize, this.yOff + (i+0.5)*this.squareSize, this.squareSize/7, 
                    this.xOff + (j+0.5)*this.squareSize, this.yOff + (i+0.5)*this.squareSize, this.squareSize/2);
                grd.addColorStop(0, this.color1);
                grd.addColorStop(1, this.color2);
                ctx.fillStyle = grd;
                ctx.fillRect(this.xOff + j*this.squareSize, this.yOff + i*this.squareSize, this.squareSize, this.squareSize);
            }
        }
    }
}


// Determine if a point is inside the shape's bounds
Piece.prototype.contains = function(mx, my) {
    // All we have to do is make sure the Mouse X,Y fall in the area between
    // the shape's X and (X + Width) and its Y and (Y + Height)
    //TODO: sa fie musai pe un patratel!!
    return  (this.xOff <= mx) && (this.xOff + this.w*this.squareSize >= mx) &&
            (this.yOff <= my) && (this.yOff + this.h*this.squareSize >= my);
}


function CanvasState(canvas) {
  // **** First some setup! ****
  
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
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  
    // Up, down, and move are for dragging
  canvas.addEventListener('mousedown', function(e) {
    var mouse = myState.getMouse(e);
    var mx = mouse.x;
    var my = mouse.y;
    for(b = 0; b < p1.bag.length; b++){
      for(p = 0; p < p1.bag[b].pieces.length; p++){
        var cPiece = p1.bag[b].pieces[p];
        if(cPiece.contains(mx, my) && cPiece.canBeMoved){
          myState.dragoffx = mx - cPiece.xOff;
          myState.dragoffy = my - cPiece.yOff;
          myState.dragging = true;
          myState.selection = cPiece;
          myState.valid = false;
          return;
        }
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
      myState.selection.active = true;
    }
  }, true);     //end of 'mousemove'
  canvas.addEventListener('mouseup', function(e) {
      if(myState.selection){
          if(myState.selection.xOff >= boardXoff-myState.selection.w*myState.selection.squareSize){
              myState.selection.xOff = Math.floor(myState.selection.xOff/myState.selection.squareSize+0.5)*myState.selection.squareSize;
              myState.selection.yOff = Math.floor(myState.selection.yOff/myState.selection.squareSize+0.5)*myState.selection.squareSize;
              myState.valid = false;
              myState.selection.active = false;     //not active anymore
              //myState.selection.canBeMoved = false;
          }
      }
      myState.dragging = false;
  }, true); //end of 'mouseup'
    
  // double click for making new shapes
  //canvas.addEventListener('dblclick', function(e) {
    //var mouse = myState.getMouse(e);
    //myState.addShape(new Shape(mouse.x - 10, mouse.y - 10, 20, 20, 'rgba(0,255,0,.6)'));
  //}, true);
  
  // **** Options! ****
  
  this.selectionColor = '#CC0000';
  this.selectionWidth = 2;  
  this.interval = 30;
  setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
  this.shapes.push(shape);
  this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx;
    this.clear();
    
    // ** Add stuff you want drawn in the background all the time here **
    
    // draw all shapes
    board.piece.draw(ctx);  
    for(b = 0; b < p1.bag.length; b++){
      for(p = 0; p < p1.bag[b].pieces.length; p++){
        var cPiece = p1.bag[b].pieces[p];
        //TODO: skip if out       if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
        cPiece.draw(ctx);
      }
    }
    if(this.selection){
      this.selection.draw(ctx);     //bring to front the selected piece
    }

    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
//    if (this.selection != null) {
//        ctx.strokeStyle = this.selectionColor;
//        ctx.lineWidth = this.selectionWidth;
//        var mySel = this.selection;
//        ctx.stroke(mySel.x,mySel.y,mySel.w,mySel.h);
//    }
    
    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
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
