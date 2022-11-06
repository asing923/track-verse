require('dotenv').config()
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 4000
const CustomPlayList = require('./models/customPlaylist')

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

// 2. Fetch Artist details based on artist ID
router.get('/artist/:id', cors(), async (req, res) => {
    let id = +req.params.id.trim();
    try {

        let foundArtist = artists.find(artist => artist.artist_id === id);
        if(foundArtist) {
            res.status(200).send(foundArtist);
        } else {
            res.status(404).send('Artist not found with give ID!');
        }
        
    } catch(err) {
        res.status(500).send('Error fetching artist details!')
    }
});

// 3. Fetch track detail based on track ID
router.get('/track/:id', cors(), async (req, res) => {
    let id = +req.params.id;
    try {
        let foundTrack = tracks.find(track => track.track_id === id);
        if(foundTrack) {
            let responseObject = {};
            responseObject.album_id = foundTrack.album_id;
            responseObject.album_title = foundTrack.album_title;
            responseObject.artist_id = foundTrack.artist_id;
            responseObject.artist_name = foundTrack.artist_name;
            responseObject.tags = foundTrack.tags;
            responseObject.track_date_created = foundTrack.track_date_created;
            responseObject.track_date_recorded = foundTrack.track_date_recorded
            responseObject.track_duration = foundTrack.track_duration;
            responseObject.track_genres = foundTrack.track_genres;
            responseObject.track_number = foundTrack.track_number;
            responseObject.track_title = foundTrack.track_title;
            res.status(200).send(responseObject);
        } else {
            res.status(404).send('Track not found with given ID!')
        }
    } catch(err) {
        res.status(500).send('Error fetching track details!')
    }
});

// 4. Find first 10 track by album name or track title
router.get('/track/find/:name', cors(), async (req, res) => {
    let name = req.params.name.toLowerCase().trim();
    try {
        let foundTrack = tracks.filter(track => {
            return track.album_title.toLowerCase().includes(name) || track.track_title.toLowerCase().includes(name);
        });
        if(foundTrack.length){
            //sending only 10 or less matching tracks
            res.status(200).send(foundTrack.slice(0, 10));
        } else {
            res.status(404).send('No track found with matching album name or track name!');
        }
    } catch(err) {
        res.status(500).send('Error fetching matching track details!')
    }
});

// 5. Find artists based on matching artist name
router.get('/artist/find/:name', cors(), async (req, res) => {
    let inputName = req.params.name.trim();
    try {

        let foundArtist = artists.filter(artist => {
            return artist.artist_name.toString().toLowerCase().includes(inputName.toLowerCase())
        });
        if(foundArtist.length){
            res.status(200).send(foundArtist);
        } else {
            res.status(404).send('Artist not found with given name!');
        }
    } catch(err) {
        res.status(500).send('Error fetching artist details!')
    }
});

// 6. Create custom playlist and save in DB
router.post('/customPlaylist', async (req, res) => {
    let playlistName = req.body.name.toLowerCase().trim();
    await CustomPlayList.findOne({ name: playlistName }).then(async playlist => {
        if (playlist) {
            res.status(403).json("Custom playlist already exist in database")
        } else {
            const customPlayList = new CustomPlayList({
                name: playlistName,
                tracks: req.body.tracks
            });
            try {
                const newCustomPlaylist = await customPlayList.save();
                res.status(200).json(`Playlist has been created with name: ${capitalFirstCase(newCustomPlaylist.name)}`);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        }
    })
    .catch(err => {
        res.status('Internal server error while checking if list exists!')
    })
});

// 7. Modify custom playlist with name and update new details
router.put('/customPlaylist/modify', async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Please provide data as it can't be empty!"
        });
    }
    const playlistName = req.body.name.toLowerCase().trim();
    if (playlistName.length === 0 || playlistName === undefined) {
        res.status(400).send("Please provide the playlist name!")
    } else {
        req.body.name = req.body.name.toLowerCase();
        await CustomPlayList.findOneAndUpdate({ name: playlistName }, req.body, { useFindAndModify: true, new: true })
            .then(data => {
                if (!data) {
                    res.status(404).send({
                        message: `Cannot update custom playlist as playlist with name: ${playlistName} not found!`
                    });
                } else res.send({ message: "Custom playlist has been updated successfully." });
            })
            .catch(err => {
                res.status(500).send({
                    message: `Error updating Custom playlist with name: ${playlistName} + ${err}`
                });
            });
    }
});

//Register All router
app.use(apiRoute, router);

//Listening to port 
app.listen(port, () => {
    console.log(`Server started and listening at http://localhost:${port}`)
})

function capitalFirstCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}