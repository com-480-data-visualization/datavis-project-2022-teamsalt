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

// d3.csv("data/actor_dataset.csv")
//   .row(function(d) {
//         return {
//           nid: data.nconst,
//           name: data.primaryName,
//           knownFor: data.knownForTitles
//         };
//    })
//   .get(function(data) {
//       console.log(data);
//   });

// // Part 1: Ranking lists
// // Define ranking metrics and movies genres (static)
// const rankingMetrics = ['averageRating', 'numVotes'];
//
// const allGenres = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy',
// 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Game-Show', 'History', 'Horror',
// 'Music', 'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sport',
// 'Talk-Show', 'Thriller', 'War', 'Western'];
//
// const rankingDiv = d3.select('#ranking').append('h1').attr('id', 'top').text('Movie Rankings');
//
// const optionsDiv = rankingDiv.append('div').attr('id', 'options');
// const metricDiv = optionsDiv.append('div').attr('id', 'metrics');
// const genreDiv = optionsDiv.append('div').attr('id', 'genres');
//
// metricDiv.append('label').attr('class', 'select-label').text('Select Metric:');

d3.csv("data/movie_dataset.csv").then(function(data) {
  genres = Array.from(new Set(data.map(element => element.genres))).sort();

// =============================================================================
  // Part 1: Ranking lists
  // Define ranking metrics and movies genres (static)
  const rankingMetrics = ['averageRating', 'numVotes'];

  const allGenres = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy',
  'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Game-Show', 'History', 'Horror',
  'Music', 'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sport',
  'Talk-Show', 'Thriller', 'War', 'Western'];

  const rangeOfYears = (start, end) =>
    Array(end - start + 1)
      .fill(start)
      .map((year, index) => year + index);
  const minYear = 1990;
  const maxYear = 2022;

  // Define divs
  const rankingDiv = d3.select('#ranking').append('h1').attr('id', 'top').text('Movie Rankings');

  const moviesDiv = rankingDiv.append('div').attr('id', 'movieData');

  const optionsDiv = rankingDiv.append('div').attr('id', 'options');
  const metricDiv = optionsDiv.append('div').attr('id', 'metrics');
  const genreDiv = optionsDiv.append('div').attr('id', 'genres');
  const yearDiv = optionsDiv.append('div').attr('id', 'years');

  // Metric dropdown selection
  metricDiv.append('label').attr('class', 'select-label').text('Select Metric:');
  const metricSelect = metricDiv
    .append('select')
    .attr('id', 'metricSelect')
    .on('change', function (event) {
      const currentGenre = document.getElementById('genreSelect').value;
      const currentMetric = document.getElementById('metricSelect').value;
      const currentYear = document.getElementById('yearSelect').value;
      getMovieData(currentMetric, currentGenre, currentYear);
    });

  metricSelect
    .selectAll('option')
    .data(rankingMetrics)
    .enter()
    .append('option')
    .text(function (d) {
      if (d === "averageRating") {
        return "Average Rating"
      } else {
        return "Number of votes"
      }
    });

  // Genres dropdown selection
  genreDiv.append('label').attr('class', 'select-label').text('Select Genre:');
  const genreSelect = genreDiv
    .append('select')
    .attr('id', 'genreSelect')
    .on('change', function (event) {
      const currentGenre = document.getElementById('genreSelect').value;
      const currentMetric = document.getElementById('metricSelect').value;
      const currentYear = document.getElementById('yearSelect').value;
      getMovieDataForMetric(currentMetric, currentGenre, currentYear);
    });

  genreSelect
    .selectAll('option')
    .data(allGenres)
    .enter()
    .append('option')
    .text(function (d) {
      return d;
    })

    // Years dropdown selection
    genreDiv.append('label').attr('class', 'select-label').text('Select Year:');
    const yearSelect = yearDiv
      .append('select')
      .attr('id', 'yearSelect')
      .on('change', function (event) {
        const currentGenre = document.getElementById('genreSelect').value;
        const currentMetric = document.getElementById('metricSelect').value;
        const currentYear = document.getElementById('yearSelect').value;
        getMovieDataForMetric(currentMetric, currentGenre, currentYear);
      });

    yearSelect
      .selectAll('option')
      .data(rangeOfYears(minYear, maxYear).reverse())
      .enter()
      .append('option')
      .text(function (d) {
        return d;
      })

    // Function called on each selection
    const getMovieDataForYear = async (metric, genre, year) => {
      // clear
      moviesDiv.html('');


    };

// =============================================================================

  // Part 2: Plots
  d3.select('#genre_select')
    .selectAll('option')
    .data(genres)
    .enter()
    .append("option")
    .text(d => d)
    .attr('value', d => d);

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
