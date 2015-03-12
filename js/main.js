var sham = angular.module('Shamblokus', ['ui']);
var squareSize = 20;
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
    var shapeOff = 0;
    for(b = 0; b < p1.bag.length; b++){
        cColor = colors[p1.bag[b].id];
        if(b>0) //new bag, new line
        {
            x = 0;
            maxH = 1;
            y += maxH * squareSize + piecesDist;
            shapeOff = s.shapes.length;
        }
        for(p = 0; p < p1.bag[b].pieces.length; p++)
        {
            if(x + (p1.bag[b].pieces[p].w)*squareSize + piecesDist> boardXoff)  //new line
            {
                x = 0;
                maxH = 1;
                y += maxH*squareSize + piecesDist;
                shapeOff = s.shapes.length;
            }
            if(p1.bag[b].pieces[p].h > maxH)
            {
                hDif = p1.bag[b].pieces[p].h - maxH;
                console.log(maxH, p1.bag[b].pieces[p].h, p, y, y + hDif * squareSize, shapeOff, s.shapes.length);
                y += hDif * squareSize;
                for(var i = shapeOff; i <s.shapes.length; i++){
                    s.shapes[i].y = y;
                }
                maxH += hDif;
            }
            s.addShape(new Shape(p1.bag[b].pieces[p], x, y, cColor, squareSize, true));
            x += (p1.bag[b].pieces[p].w)*squareSize + piecesDist;
        }
    }
    s.addShape(new Shape(board.piece, boardXoff, boardYoff, colors[4], squareSize, false));

});

