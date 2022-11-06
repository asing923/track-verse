require('dotenv').config()
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 4000

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true })
const cors = require("cors")

const db = mongoose.connection;
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to database'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
 
const apiRoute = '/api';
const router = express.Router();

var fs = require("fs");
var artists = JSON.parse(fs.readFileSync(__dirname + "/" + "raw_artists.json", 'utf8'));
var tracks = JSON.parse(fs.readFileSync(__dirname + "/" + "raw_tracks.json", 'utf8'));
var genres = JSON.parse(fs.readFileSync(__dirname + "/" + "raw_genres.json", 'utf8'));

app.use(express.static(__dirname + "/" + "frontend/static"));

//Serve root HTML, JS, CSS
app.get("/", (req, res) => {
    res.status(200).sendFile();
});

// 1. List all genres
router.get('/listAllGenres', cors(), async (req, res) => {
    let allGenres = genres;
    let listOfGenre = [];
    try {
        allGenres.forEach(genre => {
            let genreElement = {};
            genreElement.title = genre.title;
            genreElement.genre_id = genre.genre_id;
            genreElement.parent = genre.parent;
            listOfGenre.push(genreElement);
        })
        res.status(200).send(listOfGenre);
    }
    catch(err) {
        res.status(500).send('Error fetching list of genre!')
    }
})


//Register All router
app.use(apiRoute, router);

//Listening to port 
app.listen(port, () => {
    console.log(`Server started and listening at http://localhost:${port}`)
})