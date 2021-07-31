byteArrayToGame = function(bytes) {
    var headerSplit = bytes.indexOf(10);
    var header = String.fromCharCode.apply(null, bytes.slice(0, headerSplit))
    if (header != "HLT 9") {
	alert("Invalid header: " + header)
    }

    var detailSplit = bytes.indexOf(10, headerSplit + 1);
    var details = String.fromCharCode.apply(null, bytes.slice(headerSplit + 1, detailSplit))

    var game = {version: header};
    [game.width, game.height, game.numPlayers, game.numFrames] = details.split(" ");
    var cellCount = game.height * game.width;

    game.players = []
    var playerSplit = detailSplit;
    for (i = 0; i < game.numPlayers; i++) {
	var nextPlayerSplit = bytes.indexOf(10, playerSplit + 1);
	var playerLine = String.fromCharCode.apply(null, bytes.slice(playerSplit + 1, nextPlayerSplit));
	var playerDetails = playerLine.split("\0");
	game.players.push({name: playerDetails[0], color: playerDetails[1]});
	playerSplit = nextPlayerSplit;
    }

    game.productions = []
    var offset = 0;
    for (var i = 0; i < cellCount; ++i) {
	game.productions.push(
	    {index: i, production: bytes[playerSplit + 1 + i]})
    }

    game.frames = []
    game.moves = []
    var currIndex = playerSplit + 1 + cellCount + 1;
    for (var frameCount = 0; frameCount < game.numFrames; frameCount++) {
	var cellsRead = 0;
	var frame = [];
	while (cellsRead < cellCount) {
	    var counter = bytes[currIndex++]
	    var owner = bytes[currIndex++];
	    if (counter + cellsRead <= cellCount) {
		for (var i = 0; i < counter; i++) {
		    var strength = bytes[currIndex++]
		    frame.push({owner: owner, strength: strength});
		}
		cellsRead += counter;
	    } else {
		console.log("Gonna read: " + counter);
		cellsRead = cellCount
	    }
	}
	game.frames.push(frame);

	if (frameCount < game.numFrames - 1) {
	    var moves = [];
	    for (var i = 0; i < cellCount; i++) {
		moves.push(bytes[currIndex++])
	    }
	    game.moves.push(moves);
	}
    }
    return game

}
