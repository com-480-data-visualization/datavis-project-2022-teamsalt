// yep

// Load dataset
//var movie_path = "https://github.com/com-480-data-visualization/datavis-project-2022-teamsalt/tree/main/data/movie_dataset.csv"
//var actor_path = "https://github.com/com-480-data-visualization/datavis-project-2022-teamsalt/tree/main/data/actor_dataset.csv"

// const movie_promise = d3.csv("data/movie_dataset.csv").then((data) => {
//   return {
//     tid: data.tconst,
//     averageRating: data.averageRating,
//     numVotes: data.numVotes,
//     title: data.primaryTitle,
//     year: data.startYear,
//     runtime: data.runtimeMinutes,
//     genre: data.genres
//     };
// });
//
// const actor_promise = d3.csv("data/actor_dataset.csv").then((data) => {
//   return {
//     nid: data.nconst,
//     name: data.primaryName,
//     knownFor: data.knownForTitles
//     };
// });
//
// Promise.all([movie_promise, actor_promise]).then((results) => {
//   let movies = results[0];
//   let actors = results[1];

d3.csv("data/movie_dataset.csv").then(function(data) {
  genres = Array.from(new Set(data.map(element=>element.genres))).sort();

  d3.select('#genre_select')
          .selectAll('option')
          .data(genres)
          .enter()
          .append("option")
          .text(d => d)
          .attr('value', d => d);
//});

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
      .text("Years");

  svg.append("text")
      .attr("transform", "rotate(270)")
      .attr("y", - margin.left/2 -10)
      .attr("x",  -height/2 -60)
      .text("TBD");

  let xScale= d3.scaleLinear()
      .domain([1900,2022])
      .range([0,width]);
  let yScale = d3.scaleLinear()
      .domain([0,100])
      .range([height,0]);

  svg.append("g")
      .attr("transform","translate(0,"+height+")")
      .call(d3.axisBottom(xScale));
  svg.append("g")
      .call(d3.axisLeft(yScale));

});

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}
