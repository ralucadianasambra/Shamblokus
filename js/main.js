var sham = angular.module('Shamblokus', ['ui']);
var squareSize = 22;
var boardXoff = Math.floor(500/squareSize)*squareSize;
var boardYoff = 0;
var p1, s;
var piecesDist = 0.2*squareSize;
sham.controller('Main', function($scope) {
    $scope.p1 = new Player([0, 2]);
    $scope.p2 = new Player([1, 3]);     
    $scope.p1.name = "Raluca";
    $scope.p2.name = "Andrei";
    board = new Board();
    
    p1 = $scope.p1;

    s = new CanvasState(document.getElementById('bag1'));
    x = 0;
    y = 0;
    var maxH = 1;
    board.piece.xOff = boardXoff;
    board.piece.yOff = boardYoff;
    board.piece.id = 4;
    board.piece.squareSize = squareSize;
    board.piece.canBeMoved = false;
    var pieceOff = 0;
    var p;
    for(var b = 0; b < p1.bag.length; b++){
        cColor = colors[p1.bag[b].id];
        if(b>0) //new bag, new line
        {
            x = 0;
            maxH = 1;
            y += maxH * squareSize + piecesDist;
            pieceOff = p;
        }
        for(p = 0; p < p1.bag[b].pieces.length; p++)
        {
            var cPiece = p1.bag[b].pieces[p];
            if(x + (cPiece.w)*squareSize + piecesDist> boardXoff)  //new line
            {
                x = 0;
                maxH = 1;
                y += maxH*squareSize + piecesDist;
                pieceOff = p;
            }
            if(cPiece.h > maxH)
            {
                hDif = cPiece.h - maxH;
                y += hDif * squareSize;
                for(var i = pieceOff; i < p - 1; i++){
                    console.log(p, i, b);
                    p1.bag[b].pieces[i].yOff = y;
                }
                maxH += hDif;
            }
            cPiece.xOff = x;
            cPiece.yOff = y;
          
            //s.addShape(new Shape(p1.bag[b].pieces[p], x, y, cColor, squareSize, true));
            x += (cPiece.w)*squareSize + piecesDist;
        }
    }

});




