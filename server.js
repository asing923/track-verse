require('dotenv').config()
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 4000
const CustomPlayList = require('./models/customPlaylist')
const Joi = require('joi')

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
    catch (err) {
        res.status(500).send('Error fetching list of genre!')
    }
})

// 2. Fetch Artist details based on artist ID
router.get('/artist/:id', cors(),
    async (req, res) => {
        const schema = Joi.object({
            id: Joi.string().regex(/[0-9]$/).max(6).required()
        });
        const result = schema.validate(req.params);
        if (result.error) {
            res.status(400).send("Bad Request. Id cant be more then 6 digits")
        } else {
            let id = +req.params.id.trim();
            try {

                let foundArtist = artists.find(artist => artist.artist_id === id);
                if (foundArtist) {
                    res.status(200).send(foundArtist);
                } else {
                    res.status(404).send('Artist not found with give ID!');
                }

            } catch (err) {
                res.status(500).send('Error fetching artist details!')
            }
        }


    });

// 3. Fetch track detail based on track ID
router.get('/track/:id', cors(), async (req, res) => {

    const schema = Joi.object({
        id: Joi.string().regex(/[0-9]$/).max(6).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request. Id cant be more then 6 digits")
    } else {
        let id = +req.params.id;
        try {
            let foundTrack = tracks.find(track => track.track_id === id);
            if (foundTrack) {
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
        } catch (err) {
            res.status(500).send('Error fetching track details!')
        }
    }
});

// 4. Find first 10 track by album name or track title
router.get('/track/find/:name', cors(), async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().max(20).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request! Name cant be more then 20 characters!")
    } else {
        let name = req.params.name.toLowerCase().trim();
        try {
            let foundTrack = tracks.filter(track => {
                return track.album_title.toLowerCase().includes(name) || track.track_title.toLowerCase().includes(name);
            });
            if (foundTrack.length) {
                //sending only 10 or less matching tracks
                res.status(200).send(foundTrack.slice(0, 10));
            } else {
                res.status(404).send('No track found with matching album name or track name!');
            }
        } catch (err) {
            res.status(500).send('Error fetching matching track details!')
        }
    }
});

// 5. Find artists based on matching artist name
router.get('/artist/find/:name', cors(), async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().max(20).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request. Name cant be more then 20 characters!")
    }

    let inputName = req.params.name.trim();
    try {

        let foundArtist = artists.filter(artist => {
            return artist.artist_name.toString().toLowerCase().includes(inputName.toLowerCase())
        });
        if (foundArtist.length) {
            res.status(200).send(foundArtist);
        } else {
            res.status(404).send('Artist not found with given name!');
        }
    } catch (err) {
        res.status(500).send('Error fetching artist details!')
    }
});

// 6. Create custom playlist and save in DB
router.post('/customPlaylist', async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().max(20).required(),
        tracks: Joi.allow()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).send("Bad Request! Name cant be more then 20 characters!")
    }
    else {
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
    }
});

// 7. Modify custom playlist with name and update new details
router.put('/customPlaylist/modify', async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().max(20).required(),
        tracks: Joi.allow()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).send("Bad Request! Playlist name cant be more then 20 characters!")
    } else {
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
                    } else res.send({ message: `Custom playlist ${playlistName} has been updated successfully.` });
                })
                .catch(err => {
                    res.status(500).send({
                        message: `Error updating Custom playlist with name: ${playlistName} + ${err}`
                    });
                });
        }
    }
});

// 8. Get all tracks of provided custom playlist name
router.get('/customPlaylist/tracks/:name', cors(), async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().max(20).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request. Playlist name cant be more then 20 characters!")
    } else {
        let trackName = req.params.name.toLowerCase().trim();
        let allTracks = [];
        await CustomPlayList.findOne({ name: trackName }).then(playlist => {
            if (!playlist) {
                res.status(404).send('Playlist not found in Database');
            } else {
                playlist.tracks.forEach(track => {
                    allTracks.push(track);
                })
                res.status(200).send(allTracks);
            }
        })
            .catch(err => {
                res.status(500).send('Error fetching list of custom playlists');
            })
    }
});

// 9. Delete a custom playlist by name
router.delete('/customPlaylist/:name', cors(), async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().max(20).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request. Playlist name cant be more then 20 characters!")
    } else {
        let playlistName = req.params.name.toLowerCase().trim();
        await CustomPlayList.deleteOne({ name: playlistName }).then(playlist => {
            if (!playlist) {
                res.status(404).send('Playlist not found in Database')
            } else {
                res.status(200).json(`Playlist with name: ${playlistName} has been deleted`);
            }
        })
            .catch(err => {
                res.status(500).json(`Error deleting custom playlists with name: ${playlistName}`);
            })
    }
});

// 10. Get all custom playlists
router.get('/allCustomPlayLists', cors(), async (req, res) => {
    let response = []
    let sortParam = req.get('sortBy') === 'name' ? 'name' : null;
    await CustomPlayList.find().sort(sortParam).then(async playlist => {
        playlist.forEach(element => {
            let item = {}
            let playlistDuration = 0;
            item.name = element.name;
            element.tracks.forEach(track => {
                if (track.duration) {
                    const [minutes, seconds] = track.duration.toString().split(':');
                    let durationSeconds = convertToSeconds(minutes, seconds)
                    playlistDuration += durationSeconds;
                }
            })
            item.tracks = [...element.tracks];
            item.duration = new Date(playlistDuration * 1000).toISOString().substring(14, 19);
            item.totalTrakcs = element.tracks.length;
            response.push(item)
        })
        if (req.get('sortBy') === 'duration') {
            response.sort((a, b) => {
                const [minutesA, secondsA] = a.duration.split(':');
                let durationSecondsA = convertToSeconds(minutesA, secondsA)
                const [minutesB, secondsB] = b.duration.split(':');
                let durationSecondsB = convertToSeconds(minutesB, secondsB)
                return durationSecondsB - durationSecondsA;
            })
        }
        res.status(200).send(response);
    })
        .catch(err => {
            res.status(500).send(err);
        })
});

// List all tracks
router.get('/listAlltracks', cors(), async (req, res) => {
    let allTracks = tracks;
    try {
        res.status(200).send(allTracks);
    }
    catch (err) {
        res.status(500).send('Error fetching list of tracks!')
    }
})

// Fetch all tracks based on provided genre name
router.get('/genre/:name', cors(), async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().min(1).max(20).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request. Genre name cant be more then 20 characters!")
    } else {
        let selectedGenre = req.params.name.trim();
        let availableTracks = [];
        try {
            tracks.forEach(track => {
                let trackGenresString = track.track_genres.replace(/(^,)|(,$)/g, '');
                let trackGenres = JSON.parse(trackGenresString.replace(/'/g, '"'));
                let existingGenres = Object.values(trackGenres)
                existingGenres.forEach(
                    genre => {
                        if (genre.genre_title.toLowerCase() === selectedGenre.toString().toLowerCase()) {
                            if (!availableTracks.includes(track)) {
                                availableTracks.push(track);
                            }

                        }
                    }
                )
            });
            res.status(200).send(availableTracks);
        } catch (err) {
            res.status(500).send('Error fetching genre!')
        }
    }
});

// Find all track by track name, artist name, album name and sort the response
router.get('/track/findByAll/:name', cors(), async (req, res) => {

    const schema = Joi.object({
        name: Joi.string().max(20).required()
    });
    const result = schema.validate(req.params);
    if (result.error) {
        res.status(400).send("Bad Request. Name cant be more then 20 characters!")
    } else {
        let name = req.params.name.toLowerCase().trim();
        let sortParam = req.get('Sort');
        let findBy = req.get('findBy');
        let foundTrack = [];
        try {
            //for matching track name
            if (findBy == 1) {
                foundTrack = tracks.filter(track => {
                    return track.track_title.toLowerCase().includes(name);
                })
            }
            //for matching artist name 
            else if (findBy == 2) {
                foundTrack = tracks.filter(track => {
                    return track.artist_name.toLowerCase().includes(name);
                })
            }
            //for matching album name 
            else if (findBy == 3) {
                foundTrack = tracks.filter(track => {
                    return track.album_title.toLowerCase().includes(name);
                })
            } else {
                foundTrack = tracks.filter(track => {
                    return track.track_title.toLowerCase().includes(name) || track.album_title.toLowerCase().includes(name) || track.artist_name.toLowerCase().includes(name);;
                })
            }
            if (sortParam === 'track') {
                foundTrack.sort((one, two) => {
                    let elementOne = one.track_title.toLowerCase(),
                        elementtwo = two.track_title.toLowerCase();

                    if (elementOne < elementtwo) {
                        return -1;
                    }
                    if (elementOne > elementtwo) {
                        return 1;
                    }
                    return 0;
                })
            } else if (sortParam === 'duration') {
                foundTrack.sort((one, two) => {
                    const [minutesOne, secondsOne] = one.track_duration.split(':');
                    let durationSecondsOne = convertToSeconds(minutesOne, secondsOne)
                    const [minutesTwo, secondsTwo] = two.track_duration.split(':');
                    let durationSecondsTwo = convertToSeconds(minutesTwo, secondsTwo)
                    return durationSecondsTwo - durationSecondsOne;
                })
            } else if (sortParam === 'artist') {
                foundTrack.sort((one, two) => {
                    let elementOne = one.artist_name.toLowerCase(),
                        elementTwo = two.artist_name.toLowerCase();
                    if (elementOne < elementTwo) {
                        return -1;
                    }
                    if (elementOne > elementTwo) {
                        return 1;
                    }
                    return 0;
                })
            } else if (sortParam === 'album') {
                foundTrack.sort((one, two) => {
                    let elementOne = one.album_title.toLowerCase(),
                        elementTwo = two.album_title.toLowerCase();
                    if (elementOne < elementTwo) {
                        return -1;
                    }
                    if (elementOne > elementTwo) {
                        return 1;
                    }
                    return 0;
                })
            }
            res.status(200).send(foundTrack);
        } catch (err) {
            res.status(500).send('Error fetching ltrack details!')
        }
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

function convertToSeconds(minutes, seconds) {
    return Number(minutes) * 60 + Number(seconds);
}
