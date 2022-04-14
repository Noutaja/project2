"use strict";

var express = require("express");
var site = express();
var bodyParser = require("body-parser");
var fs = require("fs");
var axios = require("axios");
var PORT = process.env.PORT || 8081;
const apiUrl = "http://www.omdbapi.com/?apikey=24c608e2&s=";

site.use(express.static("./views/pages"));
site.use(bodyParser.urlencoded({ extended: true }));
site.set("view engine", "ejs");
site.locals.pretty = true;

site.get("/", function (request, response) {
	var temp = [];
	var newEntry = {
		title: "",
		year: "",
		link: "",
		poster: "",
	}
	temp.push(newEntry);
	response.render("pages/index", {
		list: temp,
		title: "Movie search",
		error: ""
	});
});

site.post("/moviesearch", async function (request, response) {
	const body = request.body;
	const movieTitle = body.title;
	const movieYear = body.year;

	var url = apiUrl + movieTitle;
	if (movieYear >= 1900) {
		url += "&y=" + movieYear;
	}
	url += "&type=movie";

	var temp = [];
	var errorMessage = "";
	const promise = await axios.get(url)
		.then(response => {
			const data = response.data;

			for (var i = 0; i < data.Search.length; i++) {
				const movie = data.Search[i];
				const newEntry = {
					title: movie.Title,
					year: movie.Year,
					link: "https://www.imdb.com/title/" + movie.imdbID + "/",
					poster: movie.Poster,
				}
				temp.push(newEntry);
			}
		})
		.catch(e => {
			const newEntry = {
				title: "",
				year: "",
				link: "",
				poster: "",
			}
			temp.push(newEntry);
			errorMessage = "Movie not found!";
		})
	response.render("pages/index", {
		list: temp,
		title: "Movie search results",
		error: errorMessage
	});
});

site.get("*", function (request, response) {
	response.status(404).send("Not found");
});

site.listen(PORT, () => {
	console.log("it werks");
})