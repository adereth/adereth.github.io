endAll = function(transition, callback) {
    if (!callback) callback = function(){};
    if (transition.size() === 0) { callback() }
    var n = 0;
    transition
	.on("start", function() { ++n; })
        .on("end", function() { if (!--n) callback.apply(this, arguments); });
}

var turn = 0;
var playing = true;
var transitionDuration = 700;
var transitionDurationToSet = 700;

var updateFunctions = []
var updateTime = function() {
    for (var i = 0; i < updateFunctions.length; i++) {
	updateFunctions[i](turn);
    }
}

var advanceFunctions =[]
var advanceTurn = function() {
    transitionDuration = transitionDurationToSet;
    for (var i = 0; i < advanceFunctions.length; i++) {
	advanceFunctions[i](turn);
    }
    turn++;
    updateTime();
    if(playing) {
	setTimeout(advanceTurn, transitionDuration + 30);
    }
}

var setPlaying = function(p) {
    if (p) {
	d3.select("#play-icon").style("display", "none");
	d3.select("#pause-icon").style("display", "block");
	playing = true;
	advanceTurn();
    } else {
	d3.select("#play-icon").style("display", "block");
	d3.select("#pause-icon").style("display", "none");
	playing = false;
    }
}

d3.select("#play").on("click", function() {
    setPlaying(!playing)
});


d3.select("#speedSlider").on("input", function(e) {
    transitionDurationToSet = 2000 - d3.select("#speedSlider")._groups[0][0].value})

addPlot = function(label, vals) {
    var margin = {top: 20, right: 5, bottom: 20, left: 5},
	width = 133 - margin.left - margin.right,
	height = 133 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
	.domain([0, vals.length])
	.range([0, width]);

    var y = d3.scaleLinear()
    	.domain([0, d3.max(vals, function(vs) {return d3.max(d3.values(vs))})])
	.range([height, 0]);

    var color = d3.scaleOrdinal(d3.schemeCategory10)

    var svg = d3.select("#plots").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

    for (i = 0; i < vals[0].length; i++) {
	var line = d3.line()
	    .x(function(d,i2) { return x(i2) })
	    .y(function(d) { return y(d[i]) })

	svg.append("path")
	    .datum(vals)
	    .attr("class", "line")
	    .attr("d", line)
	    .attr("fill", "none")
	    .style("stroke", color(i))
    }


    var currentLine = svg.append("line")
	.attr("class", "current")
	.attr("x1", x(turn))
	.attr("x2", x(turn))
	.attr("y1", 0)
	.attr("y2", height);

    updateFunctions.push(function(turn) {
	var t = d3.transition()
	    .duration(100)
	    .ease(d3.easeLinear);
	currentLine.transition(t)
	    .attr("x1", x(turn))
	    .attr("x2", x(turn));
    });

    var bg = svg.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("height", height)
	.attr("width", width)
	.attr("fill-opacity", 0)
	.on("click", function(d) {
	    console.log(x.invert(d3.mouse(this)[0]))
	    turn = Math.floor(x.invert(d3.mouse(this)[0]));
	    setPlaying(false);
	    updateTime()
	});

    svg.append("text")
	.attr("text-anchor", "middle")
	.attr("transform", "translate("+ (width/2) +","+(height+10)+")")  // centre below axis
	.text(label);

}

getPlayerStrengthData = function(game) {
    var result = []
    for (frame = 0; frame < game.frames.length; frame++) {
	var frameResult = [];
	for (p = 0; p < game.players.length; p++) {
	    frameResult.push(0);
	}
	for (i = 0; i < game.width * game.height; i++) {
	    var currPlayer = game.frames[frame][i].owner - 1;
	    frameResult[currPlayer] += game.frames[frame][i].strength
	}
	result.push(frameResult)
    }
    return result;
}

getPlayerProductionData = function(game) {
    var result = []
    for (frame = 0; frame < game.frames.length; frame++) {
	var frameResult = [];
	for (p = 0; p < game.players.length; p++) {
	    frameResult.push(0);
	}
	for (i = 0; i < game.width * game.height; i++) {
	    var currPlayer = game.frames[frame][i].owner - 1;
	    frameResult[currPlayer] += game.productions[i].production
	}
	result.push(frameResult)
    }
    return result;
}


getPlayerTerritoryData = function(game) {
    var result = []
    for (frame = 0; frame < game.frames.length; frame++) {
	var frameResult = [];
	for (p = 0; p < game.players.length; p++) {
	    frameResult.push(0);
	}
	for (i = 0; i < game.width * game.height; i++) {
	    var currPlayer = game.frames[frame][i].owner - 1;
	    frameResult[currPlayer]++
	}
	result.push(frameResult)
    }
    return result;
}


showGame = function(game) {
    console.log(game)
    console.log(getPlayerStrengthData(game))
    addPlot("Strength", getPlayerStrengthData(game));
    addPlot("Territory", getPlayerTerritoryData(game));
    addPlot("Production", getPlayerProductionData(game));

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
	width = 500 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
	.domain([0, game.width])
	.range([0, width]);

    var y = d3.scaleLinear()
	.domain([0, game.height])
	.range([height, 0]);

    var svg = d3.select("#gameArea").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g");

    var color = d3.scaleOrdinal(d3.schemeCategory10)

    var playerList = d3.select("body").append("ul").selectAll("li")
	.data(game.players)
	.enter()
	.append("li")
	.text(function (d) { return d.name })
	.style("color", function (d, i) { return color(i+1) })

    var squareSize = Math.abs(x(1) - x(2))

    var playerMarkers;
    setPlayerMarkers = function(turn) {
	playerMarkers = svg.selectAll("circle")
	    .data(game.frames[turn]).enter()
	    .append("circle")
	    .attr("cx", function(d, i) {return x(0.5 + (i % game.width))})
	    .attr("cy", function(d, i) {return y(-0.5 + ((i - (i % game.width)) / game.width))})
	    .attr("r", function(d) {return 0.5 * squareSize * Math.sqrt(d.strength / 255)})
	    .style("fill", function(d) {return (d.owner == 0 ? d3.rgb(1/2,1/2,1/2, 0.5) : color(d.owner))})
	    .style("stroke", function(d) {return d.strength == 255 ? "black" : null})}

    var maxProduction = d3.max(game.productions, function(d) { return d.production })
    var productionSquares = svg.selectAll("rect")
	.data(game.productions).enter()
    	.append("rect")
	.attr("x", function(d, i) {return x(i % game.width)})
    	.attr("y", function(d, i) {return y((i - (i % game.width)) / game.width)})
	.attr("width", Math.abs(x(1) - x(2)))
	.attr("height", Math.abs(y(1) - y(2)))
	.style("fill", function(d) {return d3.rgb(0.5, 0.5, 0.5)})
	.style("opacity", 0);

    var t2 = d3.transition()
	.delay(transitionDuration / 2)
	.duration(transitionDuration / 3)
	.ease(d3.easeLinear);

    updateFunctions.push(function(turn) {
	var prodTransition = productionSquares.transition(t2)
	    .style("fill", function(d, i) {return (game.frames[turn][i].owner == 0 ?
						   d3.rgb(1/2,1/2,1/2) :
						   color(game.frames[turn][i].owner))})
	    .style("opacity", function(d, i) {return 0.5 * d.production / maxProduction})
    })

    setPlayerMarkers(turn);
    moveMarkers = function (turn) {
	var t = d3.transition()
	    .duration(transitionDuration)
	    .ease(d3.easeCubicInOut);

	var moveTransition = playerMarkers.transition(t)
	    .attr("cx", function(d, i) {
		if (game.moves[turn][i] == 2) {
		    return x(1.5 + (i % game.width))
		} else if (game.moves[turn][i] == 4) {
		    return x(-0.5 + (i % game.width))
		} else {
		    return x(0.5 + (i % game.width))
		}})
	    .attr("cy", function(d, i) {
		if (game.moves[turn][i] == 3) {
		    return y(+0.5 + ((i - (i % game.width)) / game.width))
		} else if (game.moves[turn][i] == 1) {
		    return y(-1.5 + ((i - (i % game.width)) / game.width))
		} else {
		    return y(-0.5 + ((i - (i % game.width)) / game.width))
		}})

    }
    updateFunctions.push(
	function (turn) {
	    setTimeout(function() {
		playerMarkers.remove()
		setPlayerMarkers(turn); }, transitionDuration + 10);

	});
    advanceFunctions.push(moveMarkers);
    advanceTurn()
}



var dropZone = document.getElementById('dropZone');

// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
dropZone.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files; // Array of all files
    for (var i=0, file; file=files[i]; i++) {
	var reader = new FileReader();

	reader.onload = function(e2) { // finished reading file data.
	    var dropSquare = d3.select("#dropZone")
	    dropSquare.transition(d3.transition()
				  .duration(500)
				  .ease(d3.easeLinear))
		.style("opacity", 0)
		.on("end", function() { dropSquare.remove();
					showGame(byteArrayToGame(new Uint8Array(e2.target.result)));
				      })
	}
	reader.readAsArrayBuffer(file); // start reading the file data.
    }   }   );

// This is what I'd use if this were embedded in the actual Halite site.
/*
  var oReq = new XMLHttpRequest();
  oReq.open("GET", "1713294040-1468940658.hlt", true);

  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
  var aBuffer = oReq.response;
  if (aBuffer) {
  var byteArray = new Uint8Array(aBuffer);
  console.log(byteArrayToGame(byteArray))
  showGame(byteArrayToGame(byteArray))
  }

  }
  oReq.send(null);
*/
