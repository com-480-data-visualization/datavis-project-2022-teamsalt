// yep

// Load dataset
var movie_path = "data/movies_dataset.csv"
var actor_path = "data/actor_dataset.csv"
d3.csv(movie_path, row_movie)
d3.csv(actor_path, row_actor)

function row_movie(d) {
  return {
    tid: d.tconst,
    averageRating: d.averageRating,
    numVotes: d.numVotes,
    title: d.primaryTitle,
    year: d.startYear,
    runtime: d.runtimeMinutes,
    genre: d.genres
    };
}

function row_actor(d) {
  return {
    nid: d.nconst,
    name: d.primaryName,
    knownFor: d.knownForTitles
    };
}