# Milestone 1 | Team Salt!
## Dataset
We will work with the IMDb (International Movie Database) downloaded from [here](https://datasets.imdbws.com/) on the 05.04.2022, with details on the different data files [here](https://www.imdb.com/interfaces/). <br>
Our focus will be mainly on the ratings, genres, number of votes and actors, but others parameters are available and could be considered. Additional external datasets can also be considered for additional informations related to movies or actors if needed for the visualizations. <br>
The dataset is clean, we only joined the differents files and kept relevant attributes for our project.

## Problematic
In this project, we would want to have a clear and compact representation of the dataset for all the cinema enthousiasts out there, like us. The goal is to first have a nice visualization of the IMDb dataset, for instance movie ratings ranking with respect to genres, number of votes, actors that played in those movies, etc... <br>
Next, we will observe the change through the years of the best rated movies with respect to their genre and popularity. We will also have a deeper look at the actors: which movie genre they usually play in, with which other actors do they play with in general. And finally with the previous observations, we can see whether there is a bias in the ratings in recent years, with the popularisation of the IMDb website. More precisely, is there a relationship between a movie's genre or actors and the movie's popularity or rating and how it changed through the years.

## Exploratory data analysis
Exploration and preparation of the dataset can be found in the python jupyter notebook `data_exploration.ipynb` [here](https://github.com/com-480-data-visualization/datavis-project-2022-teamsalt/blob/main/data_exploration.ipynb).

## Related work
The IMDb datasets and other movies databases are quite popular and also frequently used for data analysis and visualization studies. With a quick search online, it is easy to find a lot of visualizations on movie datasets and IMDb in general. Some examples: [here](https://public.tableau.com/app/profile/digitalteam/viz/Movie_2/MoviesDashboard), [here](http://metabase.intellimenta.com/public/dashboard/eae564a4-d9a3-46b1-9cd4-1f95ab5b1b18?item_type=Movie&years_%253E_%253F=2000&rating____=7.5&__votes____=50000) and a lot more. <br>
The goal of our approach is to have a nicer visualization if possible, but also to get some insight on how the average ratings changed with the popularisation of the website.
