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

d3.csv("data/movie_dataset.csv").then(function(data) {
    let cy = cytoscape({
        container: document.getElementById("cy")
    })
    cy.add([
        { group: 'nodes', data: { id: 'n0' }, position: { x: 100, y: 100 } },
        { group: 'nodes', data: { id: 'n1' }, position: { x: 200, y: 200 } },
        { group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1' } }
    ]);
    cy.on("click", "node", (_) => { console.log("helloo !!") })

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

    var tooltip = rankingDiv.append('div').attr('id', 'tooltip')
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
    // .text("Nothing to show");

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
            //console.log(d)
            // Highlight selected item in list
            d3.select(".selected").classed("selected", false);
            d3.select(this).classed("selected", true);

            d3.select("#tooltip")
                .text("Average rating: " + d.averageRating)
                .text("Year: " + d.startYear.slice(0, -2))
                .text("Genres: " + d.genres);
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

                    d3.select("#tooltip")
                        .text("Average rating: " + d.averageRating)
                        .text("Year: " + d.startYear.slice(0, -2))
                        .text("Genres: " + d.genres);
                    return tooltip.style("visibility", "visible");
                })
            rankingDiv.selectAll('.lds-ring').remove();
        }, 2000);
    }

    // =============================================================================

    const part2Div = d3.select('#part2div').append('h1').attr('id', 'top').text('Plots');
    // Part 2: Plots
    const optionsDivPart2 = part2Div.append('div').attr('id', 'options');
    const metricDivPart2 = optionsDivPart2.append('div').attr('id', 'metrics');
    const genreDivPart2 = optionsDivPart2.append('div').attr('id', 'genres');

    // Metric dropdown selection
    metricDivPart2.append('label').attr('class', 'select-label').text('Select Metric:');
    const metricSelectPart2 = metricDivPart2
        .append('select')
        .attr('id', 'metricSelectPart2')
        .on('change', function(event) {
            const currentGenre = document.getElementById('genreSelectPart2').value;
            const currentMetric = document.getElementById('metricSelectPart2').value;
            getPlotData(currentMetric, currentGenre);
        });

    metricSelectPart2
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
    genreDivPart2.append('label').attr('class', 'select-label').text('Select Genre:');
    const genreSelectPart2 = genreDivPart2
        .append('select')
        .attr('id', 'genreSelectPart2')
        .on('change', function(event) {
            const currentGenre = document.getElementById('genreSelectPart2').value;
            const currentMetric = document.getElementById('metricSelectPart2').value;
            getPlotData(currentMetric, currentGenre);
        });

    genreSelectPart2
        .selectAll('option')
        .data(allGenres)
        .enter()
        .append('option')
        .text(function(d) {
            return d;
        })

    const margin = { top: 40, right: 90, bottom: 80, left: 60 };
    const width = 950 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    let svg = d3.select("#plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Prepare data for plots
    const moviePerYear = d3.groups(data, d => d.startYear).sort()//.filter(d => +d.startYear >= 1990);
    var plotData = [];
    for (var i = 0; i < moviePerYear.length; ++i) {
        if (moviePerYear[i][0] >= 1990) {
            let sumVotes = 0;
            let sumRating = 0;
            let count = 0;
            let genres = []
            for (var j = 0; j < moviePerYear[i][1].length; ++j) {
                sumVotes += +moviePerYear[i][1][j].numVotes;
                sumRating += +moviePerYear[i][1][j].averageRating;
                count += 1;
                for (g in moviePerYear[i][1][j].genres) {
                    if (!genres.includes(g)) {
                        genres.push(g);
                    }
                }
            }
            plotData.push({ year: moviePerYear[i][0].slice(0, -2), meanRating: (sumRating / count), meanVotes: (sumVotes / count), count: count, genres: genres });
        }
    }
    // console.log(plotData)

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
        .attr("y", function(d) { return yScale(d.meanRating); })
        .attr("height", function(d) { return Math.abs(height - yScale(d.meanRating)); })
        .delay(function(d, i) { console.log(i); return (i * 100) })

    // UPDATE PLOT
    const getPlotData = async (metric, genre) => {
        svg.selectAll("rect").remove()
        svg.selectAll("text").remove()

        if (genre === 'Any') {
            var newPlotData = plotData;
        } else {
            var newPlotData = plotData.filter(function(row) {
                return row['genres'].includes(genre)
            });
        }
        const moviePerGenre = data.filter(function(row) {
            for (genre in allGenres) {
                return row['genres'].includes(genre)
            }
        });
        console.log(moviePerGenre)

        // x-axis label
        svg.append("text")
            .attr("transform", "translate(" + ((width / 2) - 60) + " ," + (height + margin.top) + ")")
            .text("Years");
        // let xScale= d3.scaleBand()
        //     .domain(rangeOfYears(minYear, maxYear))
        //     .padding(0.2)
        //     .range([0, width]);
        if (metric === "Number of votes") {
            yScale = d3.scaleLinear()
                .domain([0, 200000])
                .range([height, 0]);
            svg.append("text")
                .attr("transform", "rotate(270)")
                .attr("y", - margin.left / 2 - 20)
                .attr("x", - height / 2 - 60)
                .text("Number of votes");
        } else {
            yScale = d3.scaleLinear()
                .domain([0, 10])
                .range([height, 0]);
            svg.append("text")
                .attr("transform", "rotate(270)")
                .attr("y", - margin.left / 2)
                .attr("x", - height / 2 - 60)
                .text("Average Rating");
        }
        svg.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(xScale));
        svg.append("g")
            .call(d3.axisLeft(yScale));

        svg.selectAll("rect")
            .data(newPlotData)
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
            .delay(function(d, i) { console.log(i); return (i * 100) })
    }

    // =============================================================================
    // Part 3
    const part3Div = d3.select('#part3div').append('h1').attr('id', 'top').text('Jugs');



});

function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}
