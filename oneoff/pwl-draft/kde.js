var scale = 1 / Math.sqrt(2 * Math.PI);

function gaussian(x, mean, sigma) {
    var z = (x - mean) / sigma;
    return scale * Math.exp(-0.5 * z * z) / sigma;
};

function getPointsForKDE(data){
    d3.range(0, 30, 0.01)
        .concat(data.map(function(x) {return x.value}))
        .sort(function(a,b){return a-b})
        .map(function (x,i,a) {
            var y = 0;
            data.forEach(function(d) {
                y += gaussian(x, d.value, stddev);
            });
            return {value: x, height: y};
        });
}
