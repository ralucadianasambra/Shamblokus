var sham = angular.module('Shamblokus', ['ui']);
var boardSize = 20;		//number of squares
var squareSize = Math.floor(Math.max(15, ($(window).height())/(boardSize+6)));		//TODO
var boardXoff = $(window).width() - squareSize * (boardSize+2);		//TODO
boardXoff = Math.floor(boardXoff/squareSize)*squareSize;
var boardYoff = squareSize;
var p1, s, pcs, coords, corners;
var piecesDist = 0.2*squareSize;
sham.controller('Main', function($scope) {
    corners = [[-1, -1, 0], [boardSize, -1, 1], [boardSize, boardSize, 2], [-1, boardSize, 3]];
    var players = [];
    players.push(new Player([0, 2]));
    players.push(new Player([1, 3]));
    $scope.p1 = players[0];
    $scope.p2 = players[1];     
    $scope.p1.name = "Raluca";
    $scope.p2.name = "Andrei";
	
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

    p1 = $scope.p1;
	pcs = p1.bag[0].pieces;
	
    s = new CanvasState(document.getElementById('bag1'));
	p1.rearrangePieces();

});




