// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/normalized-stacked-area-chart
function StackedAreaChart(temp, {
    x = ([x]) => x, // given d in data, returns the (ordinal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    zDomain, // array of z-values
    offset = d3.stackOffsetExpand, // stack offset method
    order = d3.stackOrderNone, // stack order method
    yLabel, // a label for the y-axis
    xFormat, // a format specifier string for the x-axis
    yFormat = "%", // a format specifier string for the y-axis
    colors = d3.schemeTableau10, // an array of colors for the (z) categories
} = {}) {
    // Compute values.
    const X = d3.map(temp, x);
    const Y = d3.map(temp, y);
    const Z = d3.map(temp, z);
    console.log(X)
    console.log(Y)
    console.log(Z)

    // Compute default x- and z-domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (zDomain === undefined) zDomain = Z;
    zDomain = new d3.InternSet(zDomain);
    console.log(xDomain)
    console.log(zDomain)

    // Omit any data not present in the z-domain.
    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));

    // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
    // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
    // each tuple has an i (index) property so that we can refer back to the
    // original data point (data[i]). This code assumes that there is only one
    // data point for a given unique x- and z-value.
    const series = d3.stack()
        .keys(zDomain)
        .value(([x, I], z) => Y[I.get(z)])
        .order(order)
        .offset(offset)
        (d3.rollup(I, ([i]) => i, i => X[i], i => Z[i]))
        .map(s => s.map(d => Object.assign(d, { i: d.data[1].get(s.key) })));
    console.log(series)

    // Compute the default y-domain. Note: diverging stacks can be negative.
    if (yDomain === undefined) yDomain = d3.extent(series.flat(2));
    console.log(yDomain)

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const color = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

    const area = d3.area()
        .x(({ i }) => xScale(X[i]))
        .y0(([y1]) => yScale(y1))
        .y1(([, y2]) => yScale(y2));

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .selectAll("path")
        .data(series)
        //.join("path")
        .enter().append('path')
        .attr("fill", ([{ i }]) => color(Z[i]))
        .attr("d", area)
        .append("title")
        .text(([{ i }]) => Z[i]);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .filter(d => d === 0 || d === 1)
            .clone()
            .attr("x2", width - marginLeft - marginRight))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    return Object.assign(svg.node(), { scales: { color } });
}

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
        .on('change', function(event) {
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
        .text(function(d) {
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
        .on('change', function(event) {
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
        .text(function(d) {
            return d;
        })

    // Years dropdown selection
    yearDiv.append('label').attr('class', 'select-label').text('Select Year:');
    const yearSelect = yearDiv
        .append('select')
        .attr('id', 'yearSelect')
        .on('change', function(event) {
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
        .text(function(d) {
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
        .text(function(d) {
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
                .text(function(d) {
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
  //const stackedDiv = part2Div.append('div').attr('id', 'stacked');

  const optionsDivPart2 = part2Div.append('div').attr('id', 'options');
  const metricDivPart2 = optionsDivPart2.append('div').attr('id', 'metrics');
  const genreDivPart2 = optionsDivPart2.append('div').attr('id', 'genres');

  const margin = { top: 40, right: 90, bottom: 80, left: 60 };
  const width = 950 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

    // ====================================================================================================================================================
    // Stacked Area Chart
    // test = []
    // for (var i = 0; i < data.length; ++i) {
    //     //console.log(data[i].genres)
    //     var genreArray = data[i].genres.split(",")
    //     //console.log(genreArray)
    //     for (var j = 0; j < genreArray.length; ++j) {
    //         //var date = data[i].startYear.slice(0, -2) + "-01-01";
    //         test.push({ year: data[i].startYear.slice(0, -2), averageRating: +data[i].averageRating, numVotes: +data[i].numVotes, genre: genreArray[j] });
    //     }
    // }
    // console.log(test)
    // test.sort()
    //
    // const allKeys = ['Action', 'Adult', 'Adventure', 'Animation', 'Biography', 'Comedy',
    //     'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Game-Show', 'History', 'Horror',
    //     'Music', 'Musical', 'Mystery', 'News', 'Reality-TV', 'Romance', 'Sci-Fi', 'Short', 'Sport',
    //     'Talk-Show', 'Thriller', 'War', 'Western'];
    //
    // const chart = StackedAreaChart(test, {
    //     x: d => +d.year,
    //     y: d => +d.numVotes,
    //     z: d => d.genre,
    //     yLabel: "Number of votes",
    //     width,
    //     height: 600,
    //     xType: d3.scaleLinear,
    //     xDomain: rangeOfYears(minYear, maxYear),
    //     yDomain: rangeOfYears(10000, 260000),
    //     zDomain: allKeys
    // });

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
        .on('change', function(event) {
            const currentGenre = document.getElementById('genreSelectPart2').value;
            const currentMetric = document.getElementById('metricSelectPart2').value;
            getPlotData(currentMetric, currentGenre, svg);
        });
    genreSelectPart2
        .selectAll('option')
        .data(allGenres)
        .enter()
        .append('option')
        .text(function(d) {
            return d;
        })

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
        .attr("transform", "translate(" + ((width / 2) - 60) + " ," + (height + margin.top) + ")")
        .text("Years");
    // y-axis label
    svg.append("text")
        .attr("transform", "rotate(270)")
        .attr("y", - margin.left / 2)
        .attr("x", - height / 2 - 60)
        .text("Average Rating");

    let xScale = d3.scaleBand()
        .domain(rangeOfYears(minYear, maxYear))
        .padding(0.2)
        .range([0, width]);
    let yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(xScale));
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Create initial barplot
    svg.selectAll("rect")
        .data(plotData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(+(d.year)))
        .attr("width", xScale.bandwidth())
        .attr("fill", "#910657")
        .attr("height", function(d) { return height - yScale(0); })
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

});
  // =============================================================================
  // Part 3
{
    Promise.all([d3.csv("data/actors_top.csv"), d3.csv("data/edge_list.csv")]).then((values) => {
        let actor_data = values[0];
        let edge_list = values[1];
        cy = cytoscape({
            container: document.getElementById("cy"),
            style: [
                {
                    selector: "node",
                    style: {
                        "width": 20,
                        "height": 20,
                        "background-color": "#111",
                        "content": "data(primaryName)",
                        "color": "#fff",
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "width": 1,
                        "line-color": "rgba(0.2,0.2,0.2,0.4)",
                        "target-arrow-color": "rgba(0.2,0.2,0.2,0.4)",
                    }
                }
            ],
        });
        // Add the nodes
        cy.add(Array.from(actor_data.map((actor) => {
            return {
                group: "nodes",
                data: { id: actor["nconst"], primaryName: actor["primaryName"] },
                position: { x: 200, y: 200 }
            }
        })));
        // Add the edges
        cy.add(Array.from(edge_list.map((edge) => {
            return {
                group: "edges",
                data: { source: edge["src"], target: edge["dst"] }
            }
        })));
        // Layout
        let layout = cy.layout({
            name: "cose",
            nodeDimensionsIncludeLabels: true,
            animate: false,
        });
        layout.run();
    })
}

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}
