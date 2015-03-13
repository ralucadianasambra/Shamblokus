var sham = angular.module('Shamblokus', ['ui']);
var boardSize = 20;		//number of squares
var squareSize = Math.floor(Math.max(15, ($(window).height())/(boardSize+5)));		//TODO
var boardXoff = $(window).width() - squareSize * (boardSize+2);		//TODO
boardXoff = Math.floor(boardXoff/squareSize)*squareSize;
var boardYoff = squareSize;
var p1, s, pcs;
var piecesDist = 0.2*squareSize;
var idActivePlayer = 0;
var idActiveBag = 0;
var _scope;
sham.controller('Main', function($scope) {
    corners = [[-1, -1, 0], [boardSize, -1, 1], [boardSize, boardSize, 2], [-1, boardSize, 3]];

    $scope.p = [];
    $scope.p[0] = new Player([0, 2]);
    $scope.p[1] = new Player([1, 3]);     
    $scope.p[0].name = "Raluca";
    $scope.p[1].name = "Andrei";
    _scope = $scope;

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

    p1 = $scope.p[0];
	pcs = p1.bag[0].pieces;
	
    s = new CanvasState(document.getElementById('bag1'), $scope.p[idActivePlayer]);
    p1.rearrangePieces();
});




