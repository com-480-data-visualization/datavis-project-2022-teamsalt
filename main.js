// yep

// Load dataset
// var movie_path = "data/movies_dataset.csv"
// var actor_path = "data/actor_dataset.csv"
// d3.csv(movie_path, row_movie)
// d3.csv(actor_path, row_actor)
//
// function row_movie(d) {
//   return {
//     tid: d.tconst,
//     averageRating: d.averageRating,
//     numVotes: d.numVotes,
//     title: d.primaryTitle,
//     year: d.startYear,
//     runtime: d.runtimeMinutes,
//     genre: d.genres
//     };
// }
//
// function row_actor(d) {
//   return {
//     nid: d.nconst,
//     name: d.primaryName,
//     knownFor: d.knownForTitles
//     };
// }

const margin = {top: 40, right:90, bottom: 80, left: 60};
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

let svg = d3.select("#plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
    .attr("transform","translate(" + ((width/2)-60) + " ," + (height + margin.top + 30) + ")")
    .text("Average Player Rating");

svg.append("text")
    .attr("transform", "rotate(270)")
    .attr("y", - margin.left/2 -10)
    .attr("x",  -height/2 -60)
    .text("Team Point Percentage");

let xScale= d3.scaleLinear()
    .domain([45,90])
    .range([0,width]);
let yScale = d3.scaleLinear()
    .domain([0,100])
    .range([height,0]);

svg.append("g")
    .attr("transform","translate(0,"+height+")")
    .call(d3.axisBottom(xScale));
svg.append("g")
    .call(d3.axisLeft(yScale));
