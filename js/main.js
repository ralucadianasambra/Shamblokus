// Globals
var boardSize = 20;   //number of squares
var squareSize = Math.floor(Math.max(15, ($(window).height())/(boardSize+5)));    //TODO
var boardXoff = $(window).width() - squareSize * (boardSize+1)+5;   //TODO
boardXoff = Math.floor(boardXoff/squareSize)*squareSize;
var boardYoff = squareSize;
var piecesDist = Math.floor(0.2*squareSize);
var _scope, _p1, _pcs;

var PROXY = "https://data.fm/proxy?uri={uri}";
var AUTH_PROXY = "https://rww.io/auth-proxy?uri=";
var RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
var LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
var POSIX = $rdf.Namespace("http://www.w3.org/ns/posix/stat#");
var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
var ACL = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
var SHAM = $rdf.Namespace("http://example.org/shamblokus#");
$rdf.Fetcher.crossSiteProxyTemplate=PROXY;
var TIMEOUT = 90000;

// Angular
var sham = angular.module('Shamblokus', ['ui', 'ui.router']);
sham.config( function AppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/' );
  $stateProvider.state( 'home', {
    url: '/:game/:pid/:colors',
    views: {
      "main": {
        controller: 'Main'
      }
    },
    data:{ pageTitle: 'Shamblokus' }
  });
});
sham.run( function run () {} );
// filters
sham.filter('toString', function() {
  return function(arr) {
    return arr.toString();
  };
});
sham.filter('atob', function() {
  return function(str) {
    return unescape(decodeURIComponent(window.atob(str)));
  };
});
sham.filter('btoa', function() {
  return function(str) {
    return window.btoa(encodeURIComponent(escape(str)));
  };
});
//controller
sham.controller('Main', function MainCtrl ($scope, $http, $state, $stateParams) {
  // init
  $scope.providedBoard = 'https://shamblokus.databox.me/Games/';
  $scope.boardReady = false;
  $scope.authenticated = false;
  $scope.appuri = window.location.origin +window.location.pathname+'#/';
  $scope.userProfile = {};
  $scope.selectPlayers = [{id:2, name:"2 players"}, {id:4, name:"4 players"}];
  $scope.nrPlayers = 2;
  $scope.playersJoined = 0;
  $scope.myId = 0;

  // login user into the app
  $scope.login = function() {
    console.log("Logging in..");
    $http({
      method: 'HEAD',
      url: "https://rww.io/",
      withCredentials: true
    }).success(function(data, status, headers) {
      // add dir to local list
      var user = headers('User');
      if (user && user.length > 0 && user.slice(0,4) == 'http') {
        if (!$scope.me) {
          $scope.me = user;
        }
        $scope.getUserProfile(user, true).then(function(profile) {
          $scope.userProfile = profile;
          $scope.authenticated = true;
          $scope.saveCredentials();
          $scope.configBoardSpace();
          $scope.$apply();
        });
      } else {
        console.log('WebID-TLS authentication failed.');
      }
    }).error(function(data, status, headers) {
      console.log('Could not connect to auth server: HTTP '+status);
    });
  };

  // cache user credentials in sessionStorage to avoid double sign in
  $scope.saveCredentials = function () {
    var app = {};
    app.userProfile = $scope.userProfile;
    sessionStorage.setItem($scope.appuri, JSON.stringify(app));
  };

  // clear sessionStorage
  $scope.clearLocalCredentials = function () {
    sessionStorage.removeItem($scope.appuri);
  };

  $scope.logout = function () {
    // Logout WebID (only works in Firefox and IE)
    if (document.all == null) {
      if (window.crypto) {
          try{
              window.crypto.logout(); //firefox ok -- no need to follow the link
          } catch (err) {//Safari, Opera, Chrome -- try with tis session breaking
          }
      }
    } else { // MSIE 6+
      document.execCommand('ClearAuthenticationCache');
    }

    // clear sessionStorage
    $scope.clearLocalCredentials();
    $scope.userProfile = {};
    $scope.authenticated = false;
    $scope.boardReady = false;
    $scope.gameStarted = false;
    $scope.gameEnded = false;
    $scope.waitingForStart = false;
    $scope.myPlayer = undefined;
  };

  $scope.connectToSocket = function() {
    var parser = document.createElement('a');
    parser.href = $scope.gameURI;
    parser.host; // => "example.com"
    parser.pathname; // => "/pathname/"

    var wss = 'wss://'+parser.host;
    wss += parser.pathname;
    console.log("WSS URI: "+wss);

    $scope.socket = new WebSocket(wss);
    $scope.socket.onopen = function(){
      this.send('sub ' + $scope.gameURI);
    }
    $scope.socket.onmessage = function(msg){
      if (msg.data && msg.data.slice(0, 3) === 'pub') {
        // resource updated
        $scope.gameUpdated(msg.data.slice(4, msg.data.length));
      }
    }
    $scope.socket.onclose = function() {
      console.log("Websocket connection closed. Restarting...");
      $scope.connectToSocket();
    }
  }

  $scope.sendSPARQLPatch = function (uri, query) {
    return new Promise(function(resolve) {
      $http({
        method: 'PATCH',
        url: uri,
        headers: {
          'Content-Type': 'application/sparql-update'
        },
        withCredentials: true,
        data: query
      }).success(function(data, status, headers) {
        resolve('success');
      }).error(function(data, status, headers) {
        console.log(data, status, headers);
        resolve('error');
      });
    })
  };

  $scope.createGameSpace = function(uri) {
    return new Promise(function(resolve) {
      $http({
        method: 'PUT',
        url: uri,
        headers: {
          'Content-Type': 'text/turtle',
          'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"' 
        },
        withCredentials: true,
        data: ''
      }).success(function(data, status, headers) {
        console.log("Created new game space at "+uri);
        $scope.userProfile.boardsURI = uri;
        $scope.configBoardSpace();
        resolve(headers('Location'));
      }).error(function(data, status, headers) {
        console.log('Could not create board space: HTTP '+status);
        resolve('');
      });
    });
  }

  // configure where to store all the games
  $scope.configBoardSpace = function () {
    if ($scope.userProfile.storage && $scope.userProfile.storage.length > 0) {
      var shamURI = $scope.userProfile.storage+'shamblokus/';

      $http({
      method: 'HEAD',
      url: shamURI,
      withCredentials: true
      }).success(function(data, status, headers) {
        console.log("Found games space "+shamURI);        
        $scope.userProfile.boardsURI = shamURI;
        $scope.saveCredentials();
        // var g = new $rdf.graph();
        // var f = $rdf.fetcher(g, TIMEOUT);
        // console.log("Looking for previous games...");
        // f.nowOrWhenFetched(shamURI,undefined,function(ok, body, xhr) {
        //   if (!ok) {
        //     console.log('Error fetching from game space: HTTP '+xhr.status);
        //   } else {
        //     // get list of games
        //     if (!$scope.userProfile.games) {
        //       $scope.userProfile.games = [];
        //     }

        //     var files = g.statementsMatching(undefined, RDF("type"), SHAM("Shamblokus"));
        //     for (i in files) {
        //       var game = {
        //         uri: files[i].subject.value,
        //         name: decodeURIComponent(files[i].subject.value),
        //         date: new Date(g.any(files[i].subject, POSIX("mtime")).value * 1000)
        //       };
        //       $scope.userProfile.games.push(game);
        //       $scope.$apply();
        //     }
        //     if ($scope.userProfile.games.length === 0) {
        //       console.log("Cound not find any previous games :(");
        //     }
        //     $scope.saveCredentials();
        //   }
        // });
      }).error(function(data, status, headers) {
        if (status == 404) {
          console.log("Game space doesn't exist, creating..");
          $scope.createGameSpace(shamURI);
        }
      });
    } else {
      console.log("It appears you don't have storage space");
    }
  };

  // get relevant info for a webid
  $scope.getUserProfile = function(webid, authenticated) {
    console.log("Getting user info for: "+webid);
    var userProfile = {};

    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);

    var docURI = webid.slice(0, webid.indexOf('#'));
    var webidRes = $rdf.sym(webid);

    // fetch user data
    return new Promise(function (resolve) {
      f.nowOrWhenFetched(docURI,undefined,function(ok, body, xhr) {
        if (!ok) {
          console.log('Warning', 'WebID profile not found: '+webid);
          resolve(userProfile);
        } else {
          // get some basic info
          var name = g.any(webidRes, FOAF('name'));
          // Clean up name
          name = (name)?name.value:'';
          var pic = g.any(webidRes, FOAF('img'));
          var depic = g.any(webidRes, FOAF('depiction'));
          // set avatar picture
          if (pic) {
            pic = pic.value;
          } else {
            if (depic) {
              pic = depic.value;
            }
          }
          // get storage endpoints
          var storage = g.any(webidRes, SPACE('storage'));
          if (storage !== undefined) {
            storage = storage.value;
            if (storage.slice(-1) != '/') {
              storage += '/';
            }
          }
          
          userProfile.webid = webid;
          userProfile.name = name;
          userProfile.picture = pic;
          userProfile.storage = storage;

          // cache user credentials in sessionStorage
          if (authenticated) {
            $scope.saveCredentials();
          }
          resolve(userProfile);
        }
      });
    });
  };

  // initialize by retrieving user info from sessionStorage
  // retrieve from sessionStorage
  if (sessionStorage.getItem($scope.appuri)) {
    var app = JSON.parse(sessionStorage.getItem($scope.appuri));
    if (app.userProfile) {
      if (!$scope.userProfile) {
        $scope.userProfile = {};
      }
      $scope.userProfile = app.userProfile;
      $scope.authenticated = true;
    } else {
      // clear sessionStorage in case there was a change to the data structure
      sessionStorage.removeItem($scope.appuri);
    }
  }

  $scope.prepareGame = function() {
    $scope.userProfile.boardsURI = $scope.providedBoard;
  };

  $scope.newGame = function() {
    var now = new Date().getTime();
    var g = new $rdf.graph();
    g.add($rdf.sym(''), RDF("type"), SHAM("Shamblokus"));
    var s = new $rdf.Serializer(g).toN3(g);
    $http({
      method: 'PUT',
      url: $scope.userProfile.boardsURI+'game-'+now,
      withCredentials: true,
      headers: {
        'Content-Type': 'text/turtle',
        'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"' 
      },
      data: s
    }).success(function(data, status, headers) {
      var gameURI = $scope.userProfile.boardsURI+'game-'+now;
      var game = {
        uri: gameURI,
        name: gameURI,
        date: new Date()
      };
      $scope.configNewGame(gameURI);
      // $scope.userProfile.games.push(game);
      $scope.saveCredentials();
    }).error(function(data, status, headers) {
      console.log('Could not create new game file: HTTP '+status);
    });
  };

  $scope.deleteGame = function(uri) {
    var gameId = 0;
    for (var i = $scope.userProfile.games.length - 1; i >= 0; i--){
      if ($scope.userProfile.games[i].uri == uri) {
        gameId = i;
      }
    }
    $scope.userProfile.games[gameId].deleting = true;
    $http({
      method: 'DELETE',
      url: uri,
      withCredentials: true,
    }).success(function(data, status, headers) {
      $scope.userProfile.games.splice(gameId,1);
      $scope.saveCredentials();
    }).error(function(data, status, headers) {
      $scope.userProfile.games[gameId].deleting = false;
      console.log('Could not delete game file: HTTP '+status);
    });
  };

  $scope.configNewGame = function (uri) {
    $scope.config = true;
    $scope.players = [];
    $scope.activeBagId = 0;

    if ($scope.nrPlayers == 2) {
      $scope.players[0] = new Player([]);
      $scope.players[0].colors = [0, 2];
      $scope.players[0].name = $scope.userProfile.name;
      $scope.myPlayer = new Player([0, 2]);
      $scope.players[1] = new Player([]);
      $scope.players[1].colors = [1, 3];
    } else {
      $scope.players[0] = new Player([]);
      $scope.players[0].colors = [0];
      $scope.players[0].name = $scope.userProfile.name;
      $scope.myPlayer = new Player([0]);
      $scope.players[1] = new Player([]);
      $scope.players[1].colors = [1];
      $scope.players[2] = new Player([]);
      $scope.players[2].colors = [2];
      $scope.players[3] = new Player([]);
      $scope.players[3].colors = [3];
    }

    var query = '';
    for (var i=0; i<$scope.players.length; i++) {
      query += 'INSERT DATA { <#player'+i+'> <'+RDF("type").value+'> <'+SHAM("Player").value+'> . } ;\n';
      query += 'INSERT DATA { <#player'+i+'> <'+SHAM('playerId').value+'> "'+i+'" . } ;\n';
      query += 'INSERT DATA { <#player'+i+'> <'+SHAM('playerColors').value+'> "'+$scope.players[i].colors.toString()+'" . } ;\n';
      if (i == 0) {
        query += 'INSERT DATA { <#player'+i+'> <'+SHAM('playerName').value+'> "'+$scope.userProfile.name+'" . } ;\n';
        query += 'INSERT DATA { <#player'+i+'> <'+SHAM('playerJoined').value+'> "true"^^<http://www.w3.org/2001/XMLSchema#boolean> . }';
      }
      if (i <= $scope.players.length-1) {
        query += " ;\n";
      }
    }

    $scope.sendSPARQLPatch(uri, query).then(function(status) {
      if (status == 'success') {
        $scope.board = $scope.RecreateBoard(boardSize, boardXoff, boardYoff, []);
        $scope.gameURI = uri;
        $scope.$apply();

        $scope.waitForPlayers();
      }
    });
  };


  $scope.gameUpdated = function(gameURI) {
    console.log("Received updated game state from: "+gameURI);

    // fetch the game state (and board) from the server
    var g = $rdf.graph();
    var f = $rdf.fetcher(g, TIMEOUT);

    f.nowOrWhenFetched(gameURI,undefined,function(ok, body, xhr) {
      if (!ok) {
        console.log('Could not fetch game state: HTTP '+xhr.status);
      } else {
        // get activePlayerId
        var activePlayerId = g.any($rdf.sym(gameURI), SHAM('activePlayer'));
        if (activePlayerId) {
            $scope.activePlayerId = parseInt(activePlayerId.value, 10);
            console.log("Received active player ID: ", $scope.activePlayerId);
        }

        // get all players
        var players = g.statementsMatching(undefined, RDF("type"), SHAM("Player"));
        if (!$scope.nrPlayers) {
          $scope.nrPlayers = players.length;
        }
        if ($scope.playersJoined < $scope.nrPlayers) {
          players.forEach(function(player){
            var joined = g.any(player.subject, SHAM("playerJoined"));
            var name = g.any(player.subject, SHAM("playerName"));
            var pid = g.any(player.subject, SHAM("playerId"));
            if (pid !== undefined && pid.value) {
              pid = parseInt(pid.value, 10);
              if (!$scope.players) {
                $scope.players = [];
              }
              $scope.players[pid] = new Player([]);
              var colors = g.any(player.subject, SHAM("playerColors"));
              if (colors && colors.value) {
                $scope.players[pid].colors = colors.value.split(',')
              }
              $scope.players[pid].name = (name && name.value)?name.value:'';
              if (joined && (joined.value == '1' || joined.value == 'true')) {
                $scope.playersJoined++;
              }
            }
          });
        }

        // get board pieces
        var playedPieces = [];
        var pieces = g.statementsMatching(undefined, RDF("type"), SHAM("Piece"));
        pieces.forEach(function(piece) {
          var id = g.any(piece.subject, SHAM("colorId")).value;
          var sq = g.any(piece.subject, SHAM("squares")).value.split(',');
          if(sq == ""){
              playedPieces.push({
                colorId: id,
                squaresIds: []
              });
          }
          else{
              playedPieces.push({
                colorId: id,
                squaresIds: sq
              });
          }
        });

        if (playedPieces.length > 0) {
          
          $scope.board = $scope.RecreateBoard(boardSize, boardXoff, boardYoff, playedPieces);
          var coords = [];
          for(var i = 0; i< playedPieces[playedPieces.length-1].squaresIds.length; i++){
              var sqId = playedPieces[playedPieces.length-1].squaresIds[i];
              coords.push([Math.floor(sqId/boardSize), sqId - boardSize*Math.floor(sqId/boardSize)]);
          }
            
          //update from another player
          if(playedPieces[playedPieces.length-1].squaresIds.length>0){
              if(($scope.activePlayerId - 1 + $scope.players.length) % $scope.players.length != $scope.myId){
                  $scope.canvas.lastPlayedPiece =  new Piece(playedPieces[playedPieces.length-1].colorId, coords);
                  $scope.canvas.lastPlayedPiece.active = true;
                  $scope.canvas.lastPlayedPiece.canBeMoved = false;
                  $scope.canvas.lastPlayedPiece.xOff = board.xOff;
                  $scope.canvas.lastPlayedPiece.yOff = board.yOff;   
              }
          }
          else{     //test if 4 consecutive skip ==> end game
              if(playedPieces.length>=4){
                  var i = playedPieces.length;
                  if(playedPieces[i-4].squaresIds.length == 0 && playedPieces[i-3].squaresIds.length == 0 &&
                     playedPieces[i-2].squaresIds.length == 0 && playedPieces[i-1].squaresIds.length == 0){
                      $scope.endGame();
                  }
              }
          }
            
          
          //my turn => the bag is no longer in stand by
          if($scope.activePlayerId == $scope.myId)
          {
              if($scope.soundOn)
                  $scope.playSound('bing');
              $scope.myPlayer.bag[$scope.activeBagId].setStandBy(false);
          }

          $scope.updateScore();
          $scope.canvas.valid = false;
        }
        var started = g.any($rdf.sym(gameURI), SHAM("gameStarted"));
        if ($scope.playersJoined == $scope.nrPlayers && started === undefined) {
            $scope.boardReady = true;
            $scope.waitingForStart = false;


            // also init the board for the first player
            if ($scope.myId === 0) {
              $scope.initGame();
            }
        }

        if (started) {
          $scope.gameStarted = true;
          if($scope.nrPlayers == 2)
            $scope.playIn2 = true;
          else
            $scope.playIn4 = true;

        }
        $scope.$apply();
      }
    });
  };

  // save bags + pieces on the server for all players and init board
  $scope.waitForPlayers = function() {
    $scope.personalizeUser = false;
    $scope.waitingForStart = true;

    // create board for other players
    if ($scope.myId !== 0) {
      $scope.initGame();
    }
    // start listening for updates
    $scope.connectToSocket();

    $scope.$apply();
    console.log("Waiting for other players...");    
  }

  $scope.joinGame = function () {
    var query = '';
    var setJoined = new $rdf.st(
      $rdf.sym('#player'+$scope.myId), 
      SHAM("playerJoined"),
      $rdf.lit('true', undefined, $rdf.sym('http://www.w3.org/2001/XMLSchema#boolean'))
    );
    var setName = new $rdf.st(
        $rdf.sym('#player'+$scope.myId),
        SHAM('playerName'),
        $rdf.lit($scope.myName)
      );

    query += 'INSERT DATA { ' + setJoined.toNT() + " } ;\n";
    query += 'INSERT DATA { ' + setName.toNT() + '}';
    $scope.sendSPARQLPatch($scope.gameURI, query).then(function(status) {
      if (status == 'success') {
        $scope.waitForPlayers();
      }
    });
  };



    $scope.endTurn = function(lastPlayedPiece) {

    $scope.myPlayer.bag[$scope.activeBagId].setAvailability(false);
    $scope.myPlayer.bag[$scope.activeBagId].setStandBy(true);
    $scope.activeBagId = ($scope.activeBagId+1)% $scope.myPlayer.bag.length;
    $scope.myPlayer.bag[$scope.activeBagId].setAvailability(true);
      
    var lastPlayerId = $scope.activePlayerId;
    $scope.activePlayerId = ($scope.activePlayerId + 1) % $scope.players.length;

    var query = '';
    // next player
    query += 'DELETE DATA { <'+$scope.gameURI+'> <'+SHAM("activePlayer").value+'> "'+ lastPlayerId +'" . } ;\n';
    query += 'INSERT DATA { <'+$scope.gameURI+'> <'+SHAM("activePlayer").value+'> "'+ $scope.activePlayerId +'" . }';
      // piece
    if (lastPlayedPiece) {
      query += " ;\n";
      var pieceID = '#'+Date.now();
      query += 'INSERT DATA { <'+pieceID+'> <'+RDF('type').value+'> <'+SHAM("Piece").value+'> . } ;\n';
      query += 'INSERT DATA { <'+pieceID+'> <'+SHAM('colorId').value+'> "'+lastPlayedPiece.colorId+'" . } ;\n';
      query += 'INSERT DATA { <'+pieceID+'> <'+SHAM('squares').value+'> "'+lastPlayedPiece.squaresIds.toString()+'" . }';
    }
    //@@TODO end timer

    $scope.sendSPARQLPatch($scope.gameURI, query);
  }

  // check if we came through link (this is ugly)
  $scope.state = $state;
  $scope.$watch('state.params', function(newVal, oldVal) {
    if (newVal.game && newVal.pid && newVal.colors && !$scope.myPlayer) {
      $scope.personalizeUser = true;
      $scope.gameURI = unescape(decodeURIComponent(window.atob($state.params.game)));
      $scope.myId = $state.params.pid;
      $scope.myName = '';
      $scope.myPlayer = new Player($state.params.colors.split(','))
      $scope.activeBagId = 0;
      $scope.myPlayer.bag[$scope.activeBagId].setAvailability(true);

    }
  });

  $scope.$watch('userProfile.name', function(newVal, oldVal) {
    if (newVal && newVal !== undefined && newVal.length > 0) {
      $scope.noPlayerName = false;
    } else {
      $scope.noPlayerName = true;
    }
  });


  ////// CANVAS CODE BEGINS HERE ///////    
  board = createBoard(boardSize, boardXoff, boardYoff);

  $scope.CanvasState = function(canvas, activePlayer) {
      
    // **** First some setup! ****
    this.activePlayer = activePlayer;
    this.canvas = canvas;
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = Math.max(window.innerHeight, 350);
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
    // the current selected object. 
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
      
    
    
   
    
//    this.rotatePiece = function(){
//        if(myState.selection){
//            myState.selection.rotate();
//            myState.valid = false;
//        }
//    }
//
//    this.flipVerticallyPiece = function(){
//        if(myState.selection){
//            myState.selection.flipV();
//            myState.valid = false;
//        }
//    }
//        
//    this.flipHotizontallyPiece = function(){
//        if(myState.selection){
//            myState.selection.flipH();
//            myState.valid = false;
//        }
//    }
    
    
    // While draw is called as often as the INTERVAL variable demands,
    // It only ever does something if the canvas gets invalidated by our code
    this.draw = function() {
        // if our state is invalid, redraw and validate!
        if (!this.valid) {
            var ctx = this.ctx;
            this.clear();


            // draw all shapes
            board.draw(ctx);              

            for(b = 0; b < $scope.myPlayer.bag.length; b++){
                for(p = 0; p < $scope.myPlayer.bag[b].pieces.length; p++){
                    var cPiece = $scope.myPlayer.bag[b].pieces[p];
                    cPiece.draw(ctx);
                }
            }
            if(myState.selection){
                myState.selection.draw(ctx);
            }
            if(myState.lastPlayedPiece)
                myState.lastPlayedPiece.draw(ctx);

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
      if(myState.lastPlayedPiece){
          myState.lastPlayedPiece = null;
          myState.valid=false;
      }
      var mouse = myState.getMouse(e);
      var mx = mouse.x;
      var my = mouse.y;
      for(b = 0; b < myState.activePlayer.bag.length; b++){
        if(!myState.activePlayer.bag[b].available)
            continue;     //skip this bag 
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
            }
        }
        myState.dragging = false;
    }, true); //end of 'mouseup'

    canvas.addEventListener('dblclick', function(e) {
          $scope.placePiece();
    }, true); //end of 'mouseup'


      window.onkeydown = function(e) {
          var c = e.keyCode;
          console.log(c);
          if(c === 82)		//r - rotate
              $scope.rotatePiece();
          else if(c === 86)	//v - vertical flip
              $scope.flipVerticallyPiece();
          else if(c === 72)	//h - horizontal flip
              $scope.flipHotizontallyPiece();
          else if(c === 13)	//enter - enter
              $scope.placePiece();
          else if(c === 65){ //a - arrange
              myState.activePlayer.rearrangePieces();
              myState.valid = false;
              myState.dragging = false;
          }
          else if(c === 27) //esc
              $scope.skipTurn();
      }; //end of 'onkeydown'

    // **** Options! ****
    this.selectionColor = '#CC0000';
    this.selectionWidth = 2;  
    this.interval = 30;
    setInterval(function() { myState.draw(); }, myState.interval);
  }


  $scope.initGame = function () {
    $scope.canvas = new $scope.CanvasState(document.getElementById('game'), $scope.myPlayer);
    $scope.canvas.valid = false;
    $scope.myPlayer.rearrangePieces();
  }

  $scope.startGame = function() {
    $scope.gameStarted = true;
    $scope.boardReady = false;
    $scope.activePlayerId = 0;
    $scope.activeBagId = 0;
    $scope.myPlayer.bag[$scope.activeBagId].setAvailability(true);
    $scope.myPlayer.bag[$scope.activeBagId].setStandBy(false);
    $scope.canvas.valid = false;

    // set gameStarted
    var query = 'INSERT DATA { <'+$scope.gameURI+'> <'+SHAM("gameStarted").value+'> "'+ Date.now() +'" . }';
    $scope.sendSPARQLPatch($scope.gameURI, query);
  }
  
  
  $scope.RecreateBoard = function(boardSize, boardXoff, boardYoff, playedPieces) {
    board = createBoard(boardSize, boardXoff, boardYoff);
    for(i = 0; i < playedPieces.length; i++){
        for(j = 0; j < playedPieces[i].squaresIds.length; j++){
            board.squares[playedPieces[i].squaresIds[j]][2] = playedPieces[i].colorId;
        }
    }
    return board;
  }

  $scope.updateScore = function(){
      var cc;
      var playerOfColorId = [];
      for(i = 0; i < $scope.players.length; i++){
          $scope.players[i].score = 0;
          for(j = 0; j < $scope.players[i].colors.length; j++){
              playerOfColorId[$scope.players[i].colors[j]] = i;
              $scope.players[i].score --;
          }
      }
      for(i = 0; i<$scope.board.squares.length; i++){
          cc = $scope.board.squares[i][2];
          if(cc == 4)
              continue;
          cp = playerOfColorId[cc];
          $scope.players[cp].score++;
      }
      $scope.$apply();
  }
  
  
    $scope.skipTurn = function(){
        var lastPlayedPiece = {colorId: 4, squaresIds: []};     //send a void piece
        $scope.endTurn(lastPlayedPiece);
        $scope.canvas.valid = false;
        if($scope.canvas.selection){
            $scope.canvas.selection.active = false;
            $scope.canvas.selection=null;
        }
    }
    
    $scope.endGame = function(){
        var winnerId = 0;
        var winnerScore = $scope.players[0].score;
        for(var i = 1; i < $scope.players.length; i++){
            if($scope.players[i].score > winnerScore){
                winnerScore = $scope.players[i].score;
                winnerId = i;
            }
        }
        //message for the winner
        var message = "<h2>";
        message += $scope.players[winnerId].name + " wins!";
        message += "<img src=\"images/winnerCup.png\" style=\"height:100px; vertical-align: middle;\">";
        message += "</h2>";
        
        //message for losers
        for(i = 0; i < $scope.players.length; i++){
            if(i != winnerId){
                if($scope.players[i].score == winnerScore )
                    message += "<h2>" + $scope.players[i].name + " wins too!<img src=\"images/winnerCup.png\" style=\"height:100px; vertical-align: middle;\"></h2>";
                else if($scope.players[i].score > winnerScore - 5)
                    message += "<h4>" + $scope.players[i].name + ", that was really close!</h4>";
                else if($scope.players[i].score > winnerScore - 15)
                    message += "<h4>" + $scope.players[i].name + ", not bad!</h4>";
                else
                    message += "<h4>" + $scope.players[i].name + ", you need more practice!</h4>";
            }
        }
        message += "<br>";   
        document.getElementById("endGameDiv").innerHTML = message;
        $scope.gameEnded = true;
        //TODO: different messages according to the score difference
    }
    
    $scope.rotatePiece = function(){
        if($scope.canvas.selection){
            $scope.canvas.selection.rotate();
            $scope.canvas.valid = false;
        }
    }

    $scope.flipVerticallyPiece = function(){
        if($scope.canvas.selection){
            $scope.canvas.selection.flipV();
            $scope.canvas.valid = false;
        }
    }
        
    $scope.flipHotizontallyPiece = function(){
        if($scope.canvas.selection){
            $scope.canvas.selection.flipH();
            $scope.canvas.valid = false;
        }
    }
    
     $scope.placePiece = function(){
        if($scope.canvas.selection && $scope.activePlayerId == $scope.myId){
            
            //test if can fit in that place
            if($scope.canvas.selection.canBePlaced()){              

                //change id on the board
                var lastPlayedPiece = {colorId: $scope.canvas.selection.colorId, squaresIds: []};
                for(sq = 0; sq < $scope.canvas.selection.squares.length; sq++){
                    i = ($scope.canvas.selection.yOff - board.yOff)/squareSize + $scope.canvas.selection.squares[sq][0];
                    j = ($scope.canvas.selection.xOff - board.xOff)/squareSize + $scope.canvas.selection.squares[sq][1];
                    board.squares[i*boardSize + j][2] = $scope.canvas.selection.colorId;
                    lastPlayedPiece.squaresIds.push([i*boardSize + j]);
                }

                //delete piece
                var pieces = $scope.myPlayer.bag[$scope.activeBagId].pieces;
                pieces.splice(pieces.length-1, 1);      
                $scope.canvas.selection.active = false;
                $scope.canvas.selection = null;

                // end turn
                $scope.endTurn(lastPlayedPiece);
                $scope.updateScore();
                $scope.canvas.valid = false;      //continue drawing cause there was a modification
            }
        }
        else{
            //TODO: message: wrong position!
        }
    }
     
    $scope.playSound = function(filename){   
        document.getElementById("sound").innerHTML='<audio autoplay="autoplay"><source src="audio/' + filename + '.mp3" type="audio/mpeg" /><embed hidden="true" autostart="true" loop="false" src="' + filename +'.mp3" /></audio>';
    }
    
    $scope.soundOn = true;
    $scope.turnOnSound = function(){
        $scope.soundOn = true;
    }
    $scope.turnOffSound = function(){
        $scope.soundOn = false;
    }

  
  //for debugging
  _scope = $scope;
});



