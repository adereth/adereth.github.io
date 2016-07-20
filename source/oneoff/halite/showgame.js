endAll = function(transition, callback) {
    if (!callback) callback = function(){};
    if (transition.size() === 0) { callback() }
    var n = 0;
    transition
	.on("start", function() { ++n; })
        .on("end", function() { if (!--n) callback.apply(this, arguments); });
}

showGame = function(game) {
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
	width = 500 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
	.domain([0, game.width])
	.range([0, width]);

    var y = d3.scaleLinear()
    	.domain([0, game.height])
	.range([height, 0]);

    var svg = d3.select("body").append("svg")
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
    setPlayerMarkers = function() {
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

    var turn = 0;


    setPlayerMarkers();
    moveMarkers = function () {
	var transitionDuration = 700;
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

	var t2 = d3.transition()
	    .delay(transitionDuration / 2)
	    .duration(transitionDuration / 3)
	    .ease(d3.easeLinear);

	var prodTransition = productionSquares.transition(t2)
	    .style("fill", function(d, i) {return (game.frames[turn + 1][i].owner == 0 ?
						   d3.rgb(1/2,1/2,1/2) :
						   color(game.frames[turn + 1][i].owner))})
	    .style("opacity", function(d, i) {return 0.5 * d.production / maxProduction})

	endAll(moveTransition, function() {
	    turn++;
	    playerMarkers.remove()
	    setPlayerMarkers();
	    moveMarkers();
	})
    }
    moveMarkers()
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
	    var dropSquare = d3.select("div")
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
