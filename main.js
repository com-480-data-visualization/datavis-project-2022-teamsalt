
d3.csv("data/movie_dataset.csv").then(function(data) {
  genres = Array.from(new Set(data.map(element => element.genres))).sort();

  const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };

  const createLoadingAnimation = () => {
      const loadingAnimation = d3.create('div').attr('class', 'lds-ring');
      loadingAnimation.append('div');
      loadingAnimation.append('div');
      loadingAnimation.append('div');
      return loadingAnimation;
    };

// =============================================================================
  // Part 1: Ranking lists
  // Define ranking metrics and movies genres (static)
  const rankingMetrics = ['averageRating', 'numVotes'];

  const allGenres = ['Any', 'Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy',
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
  const rankingDiv = d3.select('#part1div').append('h1').attr('id', 'top').text('Movie Rankings');

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
      getMovieData(currentMetric, currentGenre, currentYear);
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
    yearDiv.append('label').attr('class', 'select-label').text('Select Year:');
    const yearSelect = yearDiv
      .append('select')
      .attr('id', 'yearSelect')
      .on('change', function (event) {
        const currentGenre = document.getElementById('genreSelect').value;
        const currentMetric = document.getElementById('metricSelect').value;
        const currentYear = document.getElementById('yearSelect').value;
        getMovieData(currentMetric, currentGenre, currentYear);
      });
    var yearsList = rangeOfYears(minYear, maxYear)
    yearsList.push("All")
    yearsList = yearsList.reverse()
    yearSelect
      .selectAll('option')
      .data(yearsList)
      .enter()
      .append('option')
      .text(function (d) {
        return d;
      })

    // Create initial ranking (average rating, any genres, any year)
    var topData = data.sort(function(a, b) {
      return d3.descending(+a.averageRating, +b.averageRating);
    }).slice(0, 10);
    //console.log(topData)

    // Fetch movie poster from https://www.themoviedb.org/documentation/api
    var getPoster = function(film_name) {
        $.getJSON("https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=" + film_name + "&callback=?", function(json) {
            if (json != "Nothing found.") {
                  $('#poster').html('</p><img id="temp" src=\"http://image.tmdb.org/t/p/w500/' + json.results[0].poster_path + '\" class=\"img-responsive\" >');
            } else {
                  $.getJSON("https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=goonies&callback=?", function(json) {
                  $('#poster').html('<div class="alert"><p>We\'re afraid nothing was found for that search.</p></div><p>Perhaps you were looking for The Goonies?</p><img id="thePoster" src="http://image.tmdb.org/t/p/w500/' + json[0].poster_path + ' class="img-responsive" />');
                  });
            }
        });
    }

    var tooltip = rankingDiv.append('div').attr('id', 'tooltip')
      .style("position", "absolute")
      //.style("z-index", "10")
      .style("visibility", "hidden")
      //.text("Nothing to show");

    const rankingList = rankingDiv
      .append('ul')
      .attr('id', 'ranked')
      .attr('class', 'ranked')
      .selectAll('li')
      .data(topData)
      .enter()
      .append('li')
      .attr('id', 'ranked')
      .text(function (d) {
         return d.primaryTitle;
       })
      .on("click", function(d) {
        // Highlight selected item in list
        d3.select(".selected").classed("selected", false);
        d3.select(this).classed("selected", true);

        d3.selectAll('#temp').remove();

        d3.select("#tooltip")
        .append('div').attr('id', 'temp')
        .text("Average rating: " + d.averageRating)
        .append('div').attr('id', 'temp')
        .text("Year: " + d.startYear.slice(0, -2))
        .append('div').attr('id', 'temp')
        .text("Genres: " + d.genres)
        .append('div').attr('id', 'poster');

        // Loading animation for movie poster
        d3.select('#tooltip').append(() => createLoadingAnimation().node());
        setTimeout(function() {
          getPoster(d.primaryTitle);
          d3.select('#tooltip').selectAll('.lds-ring').remove();
        }, 500);
        return tooltip.style("visibility", "visible");
      })

    // Function called on each selection
    const getMovieData = async (metric, genre, year) => {
      // Clear previous ranking
      rankingDiv.selectAll('.ranked').remove();
      d3.select("#tooltip").style("visibility", "hidden")
      // Add loading animation
      rankingDiv.append(() => createLoadingAnimation().node());
      setTimeout(function() {
        // Compute new ranking
        // Treat Years
        if (year == 'All') {
          var byYears = data;
        } else {
          var byYears = data.filter(function(row) {
            return row['startYear'].slice(0, -2) == year
          });
        }
        // Treat Genres
        if (genre === 'Any') {
          var byGenre = byYears;
        } else {
          var byGenre = byYears.filter(function(row) {
            return row['genres'].includes(genre)
          });
        }
        // Treat Metric
        var newTopData = byGenre.sort(function(a, b) {
          if (metric === "Number of votes") {
            return d3.descending(+a.numVotes, +b.numVotes);
          } else {
            return d3.descending(+a.averageRating, +b.averageRating);
          }
        }).slice(0, 10);
        //console.log(newTopData)
        // Create new ranking list
        rankingDiv.append('ul')
                  .attr('id', 'ranked')
                  .attr('class', 'ranked')
                  .selectAll('li')
                  .data(newTopData)
                  .enter()
                  .append('li')
                  //.attr('onmouseover', 'hover(this)')
                  .attr('id', 'ranked')
                  .text(function (d) {
                     return d.primaryTitle;
                   })
                  .on("click", function(d) {
                    // Highlight selected item in list
                    d3.select(".selected").classed("selected", false);
                    d3.select(this).classed("selected", true);

                    d3.selectAll('#temp').remove();

                    d3.select("#tooltip").append('div').attr('id', 'temp')
                    .text("Average rating: " + d.averageRating)
                    .append('div', 'temp').attr('id', 'temp')
                    .text("Year: " + d.startYear.slice(0, -2))
                    .append('div', 'temp').attr('id', 'temp')
                    .text("Genres: " + d.genres)
                    .append('div').attr('id', 'poster');

                    // Loading animation for movie poster
                    d3.select('#tooltip').append(() => createLoadingAnimation().node());
                    setTimeout(function() {
                      getPoster(d.primaryTitle);
                      d3.select('#tooltip').selectAll('.lds-ring').remove();
                    }, 500);
                    return tooltip.style("visibility", "visible");
                  })
        rankingDiv.selectAll('.lds-ring').remove();
      }, 1000);
    }

// =============================================================================
  // Part 2: Plots
  const part2Div = d3.select('#part2div').append('h1').attr('id', 'top').text('Plots');

  // Stacked area chart
  const stackedDiv = part2Div.append('div').attr('id', 'stacked');

  const optionsDivPart2 = part2Div.append('div').attr('id', 'options');
  const metricDivPart2 = optionsDivPart2.append('div').attr('id', 'metrics');
  const genreDivPart2 = optionsDivPart2.append('div').attr('id', 'genres');

  // Metric dropdown selection
  metricDivPart2.append('label').attr('class', 'select-label').text('Select Metric:');
  const metricSelectPart2 = metricDivPart2
    .append('select')
    .attr('id', 'metricSelectPart2')
    .on('change', function (event) {
      const currentGenre = document.getElementById('genreSelectPart2').value;
      const currentMetric = document.getElementById('metricSelectPart2').value;
      getPlotData(currentMetric, currentGenre, svg);
      //getPlotData(currentMetric, currentGenre, svg_2);
    });
  metricSelectPart2
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
  genreDivPart2.append('label').attr('class', 'select-label').text('Select Genre:');
  const genreSelectPart2 = genreDivPart2
    .append('select')
    .attr('id', 'genreSelectPart2')
    .on('change', function (event) {
      const currentGenre = document.getElementById('genreSelectPart2').value;
      const currentMetric = document.getElementById('metricSelectPart2').value;
      getPlotData(currentMetric, currentGenre, svg);
    });
  genreSelectPart2
    .selectAll('option')
    .data(allGenres)
    .enter()
    .append('option')
    .text(function (d) {
      return d;
    })

  const margin = {top: 40, right:90, bottom: 80, left: 60};
  const width = 950 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // ====================================================================================================================================================
  // Stacked Area Chart

  d3.csv("data/counting.csv").then(function(data) {
    // var svg = d3.select("#my_dataviz")
    //             .append("svg")
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
    let svg = d3.select("#stacked")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                // .append("g")
                // .attr("transform",
                //     "translate(" + margin.left + "," + margin.top + ")");

    function type(d, i, columns) {
      d.startYear = parseDate(d.startYear);
      for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = d[columns[i]] / 100;
      return d;
    }

    console.log(data)

    var keys = data.columns.slice(1);

    var parseDate = d3.timeParse("%Y");

    var stack = d3.stack()
    //   .keys(keys)
    //   (data);
    // console.log(stack)

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    var area = d3.area()
    .x(function(d, i) { return x(d.data.startYear); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

    //var svg = d3.select("svg")

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function(d) { return d.startYear; }));
    z.domain(keys);
    stack.keys(keys);
    console.log(stack(data))

    var layer = g.selectAll(".layer")
      .data(stack(data))
      .enter().append("g")
        .attr("class", "layer");

    layer.append("path")
        .attr("class", "area")
        .style("fill", function(d) { return z(d.key); })
        .attr("d", area);

    layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
      .append("text")
        .attr("x", width)
        .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
        .attr("dy", ".35em")
        .style("font", "10px sans-serif")
        .style("text-anchor", "end")
        .text(function(d) { return d.key; });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "%"));

  });
  // ====================================================================================================================================================
  // Prepare data for plots
  function prepare_data(array) {
      const moviePerYear = d3.groups(array, d => d.startYear).sort()//.filter(d => +d.startYear >= 1990);
      var plotData = [];
      // iterate through years
      for (var i=0; i < moviePerYear.length; ++i) {
          if (moviePerYear[i][0] >= 1990) {
              let sumVotes = 0;
              let sumRating = 0;
              let count = 0;
              // iterate through movies
              for (var j=0; j < moviePerYear[i][1].length; ++j) {
                  sumVotes += +moviePerYear[i][1][j].numVotes;
                  sumRating += +moviePerYear[i][1][j].averageRating;
                  count += 1;
              }
              plotData.push({year: moviePerYear[i][0].slice(0, -2), meanRating: (sumRating / count), meanVotes: (sumVotes / count), count: count});
          }
      }
      return plotData
  }
  var plotData = prepare_data(data)
  //console.log(plotData)
  // ====================================================================================================================================================
  function create_plot(svg, plot_data, metric) {
    // x-axis label
    svg.append("text")
        .attr("transform", "translate(" + ((width/2)-60) + " ," + (height + margin.top) + ")")
        .text("Years");
    let xScale = d3.scaleBand()
        .domain(rangeOfYears(minYear, maxYear))
        .padding(0.2)
        .range([0, width]);
    let yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([height, 0]);
    // y-axis label
    if (metric === "Number of votes") {
      yScale = d3.scaleLinear()
          .domain([0, 200000])
          .range([height, 0]);
      svg.append("text")
          .attr("transform", "rotate(270)")
          .attr("y", - margin.left/2 - 20 )
          .attr("x", - height/2 -60)
          .text("Number of votes");
    } else {
      yScale = d3.scaleLinear()
          .domain([0, 10])
          .range([height, 0]);
      svg.append("text")
          .attr("transform", "rotate(270)")
          .attr("y", - margin.left/2)
          .attr("x", - height/2 -60)
          .text("Average Rating");
    }

    svg.append("g")
        .attr("transform","translate(0, "+height+")")
        .call(d3.axisBottom(xScale));
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Create initial barplot
    svg.selectAll("rect")
        .data(plot_data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(+(d.year)))
        .attr("width", xScale.bandwidth())
        .attr("fill", "#910657")
        .attr("height", function(d) { return height - yScale(0);})
        .attr("y", d => yScale(0))
    // Animation
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) {
          if (metric === "Number of votes") {
            return yScale(d.meanVotes);
          } else {
            return yScale(d.meanRating);
          }
        })
        .attr("height", function(d) {
          if (metric === "Number of votes") {
            return Math.abs(height - yScale(d.meanVotes));
          } else {
            return Math.abs(height - yScale(d.meanRating));
          }
        })
        .delay(function(d, i){ console.log(i); return(i*100)})
  }

  let svg = d3.select("#plot")
              .append("svg")
              .attr("width", (width + margin.left + margin.right))
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

  //const genreDivPart2_2 = d3.select("#plot").append('div').attr('id', 'genres');

  // let svg_2 = d3.select("#plot")
  //             .append("svg")
  //             .attr("width", (width + margin.left + margin.right))
  //             .attr("height", height + margin.top + margin.bottom)
  //             .append("g")
  //             .attr("transform",
  //                 "translate(" + margin.left + "," + margin.top + ")");
  // Genre selector for second plot
  // genreDivPart2_2.append('label').attr('class', 'select-label').text('Select Genre:');
  // const genreSelectPart2_2 = genreDivPart2_2
  //   .append('select')
  //   .attr('id', 'genreSelectPart2_2')
  //   .on('change', function (event) {
  //     const currentGenre = document.getElementById('genreSelectPart2_2').value;
  //     const currentMetric = document.getElementById('metricSelectPart2').value;
  //     getPlotData(currentMetric, currentGenre, svg_2);
  //   });
  // genreSelectPart2_2
  //   .selectAll('option')
  //   .data(allGenres)
  //   .enter()
  //   .append('option')
  //   .text(function (d) {
  //     return d;
  //   })

  create_plot(svg, plotData, "Average Rating")
  // add eventual other plots
  //create_plot(svg_2, plotData, "Average Rating")

  // UPDATE PLOT
  const getPlotData = async (metric, genre, svg) => {
      svg.selectAll("rect").remove()
      svg.selectAll("text").remove()

      // Projector flickering effect
      for (var i=0; i<50000; i++) {
        setTimeout(() => {
            d3.selectAll('.arrow-left').style("visibility", "visible");
        }, 1750);
        setTimeout(() => {
            d3.select('.arrow-left').style("visibility", "hidden");
        }, 1750);
      }

      if (genre === 'Any') {
        var newPlotData = plotData;
      } else {
        var newData = data.filter(function(row) {
          return row['genres'].includes(genre)
        });
        var newPlotData = prepare_data(newData)
      }
      console.log(newPlotData)

      create_plot(svg, newPlotData, metric)
  }

  // =============================================================================
  // Part 3
  //const part3Div = d3.select('#part3div').append('h1').attr('id', 'top').text('Jugs');


});

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}
