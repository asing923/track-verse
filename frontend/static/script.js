var nameInput = document.getElementById("search-by-track-input");
nameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("search-by-track-btn").click();
    }
});

var nameInput = document.getElementById("search-by-track-input-two");
nameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("search-by-track-btn-two").click();
    }
});

var nameInput = document.getElementById("search-by-track-input-three");
nameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("search-by-track-btn-three").click();
    }
});

window.onload = function () {
    getAllGenres();
    loadAllCustomPlaylists('name');
};

var fetchedTracks = [];
var customPlaylistTracks = [];
var sortByShow = false;
var rootApiPath = '/api'
var fetchedPlaylistTracksList = []

async function searchByTrackName(sortParam) {

    let trackNameInput = document.getElementById("search-by-track-input").value
    let findByVal = document.getElementById("find-by");
    let value = findByVal.value;
    if (sortParam === undefined) {
        sortParam = 'track';
    }

    if (trackNameInput.trim().length === 0) {
        resetSearchResult();
        alert('Please provide input to search track data')
        return;
    } else {
        const url = rootApiPath + '/track/findByAll' + '/' + trackNameInput.trim();
        const newUrl = url;

        fetch(
            newUrl,
            {
                headers: { "Content-Type": "application/json", "Sort": sortParam, "findBy": value },
                method: "GET"
            }
        )
            .then(tracks => tracks.json()
                .then(tracks => {
                    if (tracks.length) {
                        populateTrackData(tracks)
                    } else {
                        document.getElementById("search-by-track-input").value = '';
                        alert('No track found with entered details!')
                        resetSearchResult();
                    }
                }))
            .catch(err => {
                console.log('Error fetching the results')
            })
    }
}



function populateTrackData(trackList) {

    resetSearchResult();
    let maintrackContainer = document.getElementById('genre-tracks-one');
    let primaryContainer = document.createElement('div');
    primaryContainer.id = 'primary-container-one';

    let label = document.createElement('span');
    label.appendChild(document.createTextNode('Found matched tracks: ' + trackList.length));
    primaryContainer.appendChild(label);

    trackList.forEach(track => {

        let trackContainer = document.createElement('div');
        trackContainer.id = 'track-container';
        trackContainer.classList.add('track-container')

        let trackName = document.createElement('div');
        trackName.id = 'track-name';
        trackName.classList.add('track-name')

        let trackNameLabel = document.createElement('span');
        trackNameLabel.classList.add('track-name-label')
        trackNameLabel.appendChild(document.createTextNode('Track Name: '));

        let trackNameValue = document.createElement('span');
        trackNameValue.classList.add('track-name-label-value')
        trackNameValue.appendChild(document.createTextNode(track.track_title));
        trackName.appendChild(trackNameLabel);
        trackName.appendChild(trackNameValue);


        let trackArtist = document.createElement('div');
        trackArtist.id = 'track-artist';
        trackArtist.classList.add('track-artist')

        let artistNameLabel = document.createElement('span');
        artistNameLabel.classList.add('artist-name-label')
        artistNameLabel.appendChild(document.createTextNode('Artist Name: '));
        let artistNameValue = document.createElement('span');
        artistNameValue.classList.add('artist-name-label-value')
        artistNameValue.appendChild(document.createTextNode(track.artist_name));
        trackArtist.appendChild(artistNameLabel);
        trackArtist.appendChild(artistNameValue);



        let trackAlbum = document.createElement('div');
        trackAlbum.id = 'track-album';
        trackAlbum.classList.add('track-album')

        let albumNameLabel = document.createElement('span');
        albumNameLabel.classList.add('album-name-label')
        albumNameLabel.appendChild(document.createTextNode('Album Name: '));
        let albumNameValue = document.createElement('span');
        albumNameValue.classList.add('album-name-label-value')
        albumNameValue.appendChild(document.createTextNode(track.album_title));
        trackAlbum.appendChild(albumNameLabel);
        trackAlbum.appendChild(albumNameValue);


        let trackDuration = document.createElement('div');
        trackDuration.id = 'track-duration';
        trackDuration.classList.add('track-duration')

        let durationNameLabel = document.createElement('span');
        durationNameLabel.classList.add('duration-name-label')
        durationNameLabel.appendChild(document.createTextNode('Duration: '));
        let durationNameValue = document.createElement('span');
        durationNameValue.classList.add('duration-name-label-value')
        durationNameValue.appendChild(document.createTextNode(track.track_duration));
        trackDuration.appendChild(durationNameLabel);
        trackDuration.appendChild(durationNameValue);


        trackContainer.appendChild(trackName);
        trackContainer.appendChild(trackArtist);
        trackContainer.appendChild(trackAlbum);
        trackContainer.appendChild(trackDuration);
        primaryContainer.appendChild(trackContainer);
    })

    maintrackContainer.appendChild(primaryContainer);
}

function resetSearchResult() {
    let galleryContainer = document.getElementById('genre-tracks-one')
    galleryContainer.innerText = "";
}

function getAllGenres() {
    const url = rootApiPath + '/listAllGenres';
    const newUrl = url;

    fetch(
        newUrl,
        {
            headers: { "Content-Type": "application/json" },
            method: "GET"
        }
    )
        .then(genres => genres.json()
            .then(genres => {
                populateGenres(genres);
            }))
        .catch(err => {
            console.log('Error fetching the genres')
        })
}

function populateGenres(genres) {

    let genreRootContainer = document.getElementById('genre-container');

    let unorderedList = document.createElement('ul');
    unorderedList.classList.add("unordered-list-genre");

    genres.forEach(genre => {
        let genreElement = document.createElement('li');
        genreElement.classList.add("genre-element");


        let label = document.createElement('button');
        label.onclick = function () {
            fetchGenreDetails(genre.title)
        }
        label.classList.add('genre-button');
        label.appendChild(document.createTextNode(genre.title));
        genreElement.appendChild(label);
        unorderedList.appendChild(genreElement);
    })

    genreRootContainer.appendChild(unorderedList);

}

function fetchGenreDetails(genreName) {

    const url = rootApiPath + '/genre/' + genreName;
    const newUrl = url;


    fetch(
        newUrl,
        {
            headers: { "Content-Type": "application/json" },
            method: "GET"
        }
    )
        .then(tracks => tracks.json()
            .then(tracks => {
                if (tracks.length) {
                    populateTracks(tracks);
                } else {
                    resetTracksGenre()
                    alert('No track found in the genre!')
                }

            }))
        .catch(err => {
            console.log('Error fetching the genres')
        })

}

function populateTracks(trackList) {
    resetTracksGenre();
    let maintrackContainer = document.getElementById('genre-tracks');
    let primaryContainer = document.createElement('div');
    primaryContainer.id = 'primary-container';

    let label = document.createElement('span');
    label.appendChild(document.createTextNode('Found matched tracks: ' + trackList.length));
    primaryContainer.appendChild(label);

    trackList.forEach(track => {

        let trackContainer = document.createElement('div');
        trackContainer.id = 'track-container';
        trackContainer.classList.add('track-container')

        let trackName = document.createElement('div');
        trackName.id = 'track-name';
        trackName.classList.add('track-name')

        let trackNameLabel = document.createElement('span');
        trackNameLabel.classList.add('track-name-label')
        trackNameLabel.appendChild(document.createTextNode('Track Name: '));

        let trackNameValue = document.createElement('span');
        trackNameValue.classList.add('track-name-label-value')
        trackNameValue.appendChild(document.createTextNode(track.track_title));
        trackName.appendChild(trackNameLabel);
        trackName.appendChild(trackNameValue);

        let trackArtist = document.createElement('div');
        trackArtist.id = 'track-artist';
        trackArtist.classList.add('track-artist')

        let artistNameLabel = document.createElement('span');
        artistNameLabel.classList.add('artist-name-label')
        artistNameLabel.appendChild(document.createTextNode('Artist Name: '));
        let artistNameValue = document.createElement('span');
        artistNameValue.classList.add('artist-name-label-value')
        artistNameValue.appendChild(document.createTextNode(track.artist_name));
        trackArtist.appendChild(artistNameLabel);
        trackArtist.appendChild(artistNameValue);

        let trackAlbum = document.createElement('div');
        trackAlbum.id = 'track-album';
        trackAlbum.classList.add('track-album')

        let albumNameLabel = document.createElement('span');
        albumNameLabel.classList.add('album-name-label')
        albumNameLabel.appendChild(document.createTextNode('Album Name: '));
        let albumNameValue = document.createElement('span');
        albumNameValue.classList.add('album-name-label-value')
        albumNameValue.appendChild(document.createTextNode(track.album_title));
        trackAlbum.appendChild(albumNameLabel);
        trackAlbum.appendChild(albumNameValue);

        let trackDuration = document.createElement('div');
        trackDuration.id = 'track-duration';
        trackDuration.classList.add('track-duration')

        let durationNameLabel = document.createElement('span');
        durationNameLabel.classList.add('duration-name-label')
        durationNameLabel.appendChild(document.createTextNode('Duration: '));
        let durationNameValue = document.createElement('span');
        durationNameValue.classList.add('duration-name-label-value')
        durationNameValue.appendChild(document.createTextNode(track.track_duration));
        trackDuration.appendChild(durationNameLabel);
        trackDuration.appendChild(durationNameValue);

        trackContainer.appendChild(trackName);
        trackContainer.appendChild(trackArtist);
        trackContainer.appendChild(trackAlbum);
        trackContainer.appendChild(trackDuration);
        primaryContainer.appendChild(trackContainer);
    })

    maintrackContainer.appendChild(primaryContainer);

}

function resetTracksGenre() {
    let genreTracksContainer = document.getElementById('genre-tracks')
    let trackSection = document.getElementById('primary-container');
    if (trackSection) {
        trackSection.appendChild(document.createTextNode(""));
        genreTracksContainer.removeChild(trackSection);
    }
}

function searchByTrackNameForPlaylist() {
    let trackNameInput = document.getElementById("search-by-track-input-two").value;

    if (trackNameInput.length === 0) {
        resetSearchResult();
        return;
    }

    if (trackNameInput !== '' && trackNameInput.length > 0) {
        const url = rootApiPath + '/track/findByAll' + '/' + trackNameInput;
        const newUrl = url;

        fetch(
            newUrl,
            {
                headers: { "Content-Type": "application/json" },
                method: "GET"
            }
        )
            .then(tracks => tracks.json()
                .then(tracks => {
                    if (tracks.length) {
                        fetchedTracks = [...tracks];
                        populateTrackDataTwo(tracks)
                    } else {
                        document.getElementById("search-by-track-input-two").value = '';
                        alert('No track found with entered details!')
                        resetSearchResultTwo();
                    }
                }))
            .catch(err => {
                console.log('Error fetching the results', err)
            })
    }
}

function populateTrackDataTwo(trackList) {

    resetSearchResultTwo();
    let maintrackContainer = document.getElementById('matched-tracks');
    let primaryContainer = document.createElement('div');
    primaryContainer.id = 'primary-container-2';

    let label = document.createElement('span');
    label.appendChild(document.createTextNode('Found matched tracks: ' + trackList.length + '\u00A0'));
    primaryContainer.appendChild(label);

    trackList.forEach(track => {

        let trackContainer = document.createElement('button');

        trackContainer.id = track.track_id;
        trackContainer.onclick = function () {
            updatePlaylistTracks(track);
            trackContainer.classList.add('checked')
        }

        customPlaylistTracks.forEach(element => {
            if (element.track_id === track.track_id) {
                trackContainer.classList.add('checked')
            }
        })
        trackContainer.classList.add('track-container')

        let trackName = document.createElement('div');
        trackName.id = 'track-name';
        trackName.classList.add('track-name')

        let trackNameLabel = document.createElement('span');
        trackNameLabel.classList.add('track-name-label')
        trackNameLabel.appendChild(document.createTextNode('Track Name: '));

        let trackNameValue = document.createElement('span');
        trackNameValue.classList.add('track-name-label-value')
        trackNameValue.appendChild(document.createTextNode(track.track_title));
        trackName.appendChild(trackNameLabel);
        trackName.appendChild(trackNameValue);


        let trackArtist = document.createElement('div');
        trackArtist.id = 'track-artist';
        trackArtist.classList.add('track-artist')

        let artistNameLabel = document.createElement('span');
        artistNameLabel.classList.add('artist-name-label')
        artistNameLabel.appendChild(document.createTextNode('Artist Name: '));
        let artistNameValue = document.createElement('span');
        artistNameValue.classList.add('artist-name-label-value')
        artistNameValue.appendChild(document.createTextNode(track.artist_name));
        trackArtist.appendChild(artistNameLabel);
        trackArtist.appendChild(artistNameValue);



        let trackAlbum = document.createElement('div');
        trackAlbum.id = 'track-album';
        trackAlbum.classList.add('track-album')

        let albumNameLabel = document.createElement('span');
        albumNameLabel.classList.add('album-name-label')
        albumNameLabel.appendChild(document.createTextNode('Album Name: '));
        let albumNameValue = document.createElement('span');
        albumNameValue.classList.add('album-name-label-value')
        albumNameValue.appendChild(document.createTextNode(track.album_title));
        trackAlbum.appendChild(albumNameLabel);
        trackAlbum.appendChild(albumNameValue);


        let trackDuration = document.createElement('div');
        trackDuration.id = 'track-duration';
        trackDuration.classList.add('track-duration')

        let durationNameLabel = document.createElement('span');
        durationNameLabel.classList.add('duration-name-label')
        durationNameLabel.appendChild(document.createTextNode('Duration: '));
        let durationNameValue = document.createElement('span');
        durationNameValue.classList.add('duration-name-label-value')
        durationNameValue.appendChild(document.createTextNode(track.track_duration));
        trackDuration.appendChild(durationNameLabel);
        trackDuration.appendChild(durationNameValue);


        trackContainer.appendChild(trackName);
        trackContainer.appendChild(trackArtist);
        trackContainer.appendChild(trackAlbum);
        trackContainer.appendChild(trackDuration);
        primaryContainer.appendChild(trackContainer);
    })

    maintrackContainer.appendChild(primaryContainer);

}

function resetSearchResultTwo() {
    let matchedTracks = document.getElementById('matched-tracks')
    let trackSection = document.getElementById('primary-container-2');
    if (trackSection) {
        trackSection.appendChild(document.createTextNode(""));
        matchedTracks.removeChild(trackSection);
    }
}

function updatePlaylistTracks(track) {
    if (customPlaylistTracks.length) {
        let found = customPlaylistTracks.find(element => {
            return element.track_id === track.track_id
        })
        if (!found) {
            customPlaylistTracks.push(track);
        }
    } else {
        customPlaylistTracks.push(track)
    }
}

async function createPlaylist() {
    let playlistName = document.getElementById("custom-palylist-input").value
    if (playlistName === '' || playlistName === undefined) {
        alert("Please provide playlist name!")
    } else {
        let request = {};
        request.name = playlistName;
        let tracks = [];
        customPlaylistTracks.forEach(element => {
            let trackItem = {};
            trackItem.id = element.track_id;
            trackItem.track = element.track_title;
            trackItem.duration = element.track_duration;
            trackItem.album = element.album_title;
            trackItem.artist = element.artist_name;
            tracks.push(trackItem);
        })
        request.tracks = [...tracks];
        await postData(rootApiPath + '/customPlaylist', request)
            .then((data) => {
                alert(data)
                customPlaylistTracks = [];
                resetSearchResultTwo();
                document.getElementById("custom-palylist-input").value = '';
                document.getElementById("search-by-track-input-two").value = '';
                location.reload();
            })
            .catch(err => {
                alert(err);
            });
    }

    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}

function loadAllCustomPlaylists(sortParam) {
    const url = rootApiPath + '/allCustomPlayLists';
    const newUrl = url;

    fetch(
        newUrl,
        {
            headers: { "Content-Type": "application/json", "SortBy": sortParam },
            method: "GET"
        }
    )
        .then(playlists => playlists.json()
            .then(playlists => {
                console.log(playlists)
                populatePlaylistData(playlists);
            }))
        .catch(err => {
            console.log('Error fetching the playlists', err)
        })
}

function populatePlaylistData(playlists) {

    let maintrackContainer = document.getElementById('playlist-details');
    let primaryContainer = document.createElement('div');
    primaryContainer.id = 'primary-container-3';

    let label = document.getElementById('custom-list-count');
    label.appendChild(document.createTextNode('Custom Playlist Count: ' + playlists.length + '\u00A0'));

    let count = 0;
    playlists.forEach(playlist => {
        count = count + 1;
        let playlistContainer = document.createElement('div');
        playlistContainer.classList.add('track-container')
        playlistContainer.id = count;
        let playlistName = document.createElement('div');
        playlistName.id = 'track-name';
        playlistName.classList.add('track-name')

        let playlistNameLabel = document.createElement('span');
        playlistNameLabel.classList.add('track-name-label')
        playlistNameLabel.appendChild(document.createTextNode('Playlist Name: '));

        let playlistNameValue = document.createElement('span');
        playlistNameValue.classList.add('track-name-label-value')
        playlistNameValue.appendChild(document.createTextNode(capitalFirstCase(playlist.name)));
        playlistName.appendChild(playlistNameLabel);
        playlistName.appendChild(playlistNameValue);

        let playlistDuration = document.createElement('div');
        playlistDuration.classList.add('track-album')

        let durationNameLabel = document.createElement('span');
        durationNameLabel.classList.add('album-name-label')
        durationNameLabel.appendChild(document.createTextNode('Playlist Duration: '));
        let durationNameValue = document.createElement('span');
        durationNameValue.classList.add('album-name-label-value')
        durationNameValue.appendChild(document.createTextNode(playlist.duration));
        playlistDuration.appendChild(durationNameLabel);
        playlistDuration.appendChild(durationNameValue);

        let allTracksDuration = document.createElement('div');
        allTracksDuration.classList.add('track-album')

        let allTracksNameLabel = document.createElement('span');
        allTracksNameLabel.classList.add('album-name-label')
        allTracksNameLabel.appendChild(document.createTextNode('Total Tracks: '));
        let allTracksNameValue = document.createElement('span');
        allTracksNameValue.classList.add('album-name-label-value')
        allTracksNameValue.appendChild(document.createTextNode(playlist.totalTrakcs));
        allTracksDuration.appendChild(allTracksNameLabel);
        allTracksDuration.appendChild(allTracksNameValue);

        playlistContainer.appendChild(playlistName);
        playlistContainer.appendChild(playlistDuration);
        playlistContainer.appendChild(allTracksDuration);


        let getTracksButton = document.createElement('button');
        getTracksButton.onclick = function () {
            getTracksForPlaylist(playlist.name, playlistContainer.id)
        }

        getTracksButton.classList.add('view-all-tracks');
        getTracksButton.appendChild(document.createTextNode('Show All Tracks'));
        if (playlist.tracks.length) {
            playlistContainer.appendChild(getTracksButton);
        }

        let btnDiv = document.createElement('div');
        btnDiv.id = 'button-delete-' + count;
        btnDiv.classList.add('btn-delete-div')

        let label = document.createElement('button');
        label.onclick = function () {
            deletePlaylist(playlist.name)
        }
        label.classList.add('button-delete');
        label.appendChild(document.createTextNode('Delete Playlist'));

        btnDiv.appendChild(label);

        playlistContainer.appendChild(btnDiv);
        primaryContainer.appendChild(playlistContainer)
    })

    maintrackContainer.appendChild(primaryContainer);
}

async function deletePlaylist(playlistName) {
    const url = rootApiPath + '/customPlaylist' + '/' + playlistName;
    const newUrl = url;
    await fetch(newUrl, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        }
    })
        .then(data => data.json())
        .then(data => {
            alert(data)
            location.reload();
        })
        .catch(err => {
            console.log(err)
        });
}

function capitalFirstCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function sort(param) {
    resetPlaylistSpace();
    loadAllCustomPlaylists(param)
}

function sortTrack(sortParam) {
    resetSearchResult();
    searchByTrackName(sortParam);
}

function resetPlaylistSpace() {

    let galleryContainer = document.getElementById('playlist-details')
    let filteredSection = document.getElementById('primary-container-3');
    let label = document.getElementById('custom-list-count');
    label.innerText = "";
    if (filteredSection || label) {
        filteredSection.appendChild(document.createTextNode(""));

        galleryContainer.removeChild(filteredSection);
    }
}

function getTracksForPlaylist(playlistName, id) {
    const url = rootApiPath + '/customPlaylist/tracks/' + playlistName;
    const newUrl = url;

    fetch(
        newUrl,
        {
            headers: { "Content-Type": "application/json" },
            method: "GET"
        }
    )
        .then(tracks => tracks.json()
            .then(tracks => {
                populateTracksCustomplaylist(tracks, id);
            }))
        .catch(err => {
            console.log('Error fetching the tracks for custom playlist', err)
        })
}

function populateTracksCustomplaylist(allTracks, id) {
    let btnDiv = document.getElementById('button-delete-' + id);
    let playlistContainer = document.getElementById(id);
    if (document.getElementById('p-container-' + id)) {
        playlistContainer.removeChild('p-container-' + id);
    } else {
        let primaryContainer = document.createElement('div')
        primaryContainer.id = 'p-container-' + id;
        primaryContainer.innerText = '';
        playlistContainer.appendChild(primaryContainer);

        allTracks.forEach(track => {

            let trackContainer = document.createElement('div');
            trackContainer.classList.add('track-container-extra')

            let trackName = document.createElement('div');
            trackName.id = 'track-name';
            trackName.classList.add('track-name')

            let trackNameLabel = document.createElement('span');
            trackNameLabel.classList.add('track-name-label')
            trackNameLabel.appendChild(document.createTextNode('Track Name: '));

            let trackNameValue = document.createElement('span');
            trackNameValue.classList.add('track-name-label-value')
            trackNameValue.appendChild(document.createTextNode(track.track));
            trackName.appendChild(trackNameLabel);
            trackName.appendChild(trackNameValue);


            let trackArtist = document.createElement('div');
            trackArtist.id = 'track-artist';
            trackArtist.classList.add('track-artist')

            let artistNameLabel = document.createElement('span');
            artistNameLabel.classList.add('artist-name-label')
            artistNameLabel.appendChild(document.createTextNode('Artist Name: '));
            let artistNameValue = document.createElement('span');
            artistNameValue.classList.add('artist-name-label-value')
            artistNameValue.appendChild(document.createTextNode(track.artist));
            trackArtist.appendChild(artistNameLabel);
            trackArtist.appendChild(artistNameValue);



            let trackAlbum = document.createElement('div');
            trackAlbum.id = 'track-album';
            trackAlbum.classList.add('track-album')

            let albumNameLabel = document.createElement('span');
            albumNameLabel.classList.add('album-name-label')
            albumNameLabel.appendChild(document.createTextNode('Album Name: '));
            let albumNameValue = document.createElement('span');
            albumNameValue.classList.add('album-name-label-value')
            albumNameValue.appendChild(document.createTextNode(track.album));
            trackAlbum.appendChild(albumNameLabel);
            trackAlbum.appendChild(albumNameValue);


            let trackDuration = document.createElement('div');
            trackDuration.id = 'track-duration';
            trackDuration.classList.add('track-duration')

            let durationNameLabel = document.createElement('span');
            durationNameLabel.classList.add('duration-name-label')
            durationNameLabel.appendChild(document.createTextNode('Duration: '));
            let durationNameValue = document.createElement('span');
            durationNameValue.classList.add('duration-name-label-value')
            durationNameValue.appendChild(document.createTextNode(track.duration));
            trackDuration.appendChild(durationNameLabel);
            trackDuration.appendChild(durationNameValue);


            trackContainer.appendChild(trackName);
            trackContainer.appendChild(trackArtist);
            trackContainer.appendChild(trackAlbum);
            trackContainer.appendChild(trackDuration);
            // playlistContainer.appendChild(trackContainer);
            primaryContainer.appendChild(trackContainer);

        })

        // trackContainer.appendChild(primaryContainer)

        // primaryContainer.appendChild(playlistContainer);
        playlistContainer.insertBefore(primaryContainer, btnDiv);
    }

}

function fetchPlaylistTracks() {

    let playlistName = document.getElementById("playlist-input").value
    if (playlistName === undefined || playlistName === '') {
        alert('Please provide playlist name to search!')
        return;
    }
    const url = rootApiPath + '/customPlaylist/tracks/' + playlistName;
    const newUrl = url;

    fetch(
        newUrl,
        {
            headers: { "Content-Type": "application/json" },
            method: "GET"
        }
    )
        .then(tracks => tracks.json()
            .then(tracks => {
                if (tracks.length === 0) {
                    alert('No tracks found!')
                } else {
                    populateListTracks(tracks);
                }

            }))
        .catch(err => {
            console.log('Error fetching the tracks for custom playlist', err)
        })
}
function populateListTracks(tracks) {
    fetchedPlaylistTracksList = [];
    let primaryContainer = document.getElementById('list-tracks');

    if (tracks.length) {
        labelSpan = document.createElement('span');
        labelSpan.classList.add('track-name-label')
        labelSpan.appendChild(document.createTextNode('Select tracks to delete: '));
        primaryContainer.appendChild(labelSpan)
    }

    tracks.forEach(track => {

        fetchedPlaylistTracksList.push(track);
        let trackContainer = document.createElement('button');
        trackContainer.classList.add('track-container-extra')
        trackContainer.onclick = function () {
            deleteTrack(track)
            trackContainer.classList.add('checked-track')
            trackContainer.classList.remove('track-container-extra')
        }

        let trackName = document.createElement('div');
        trackName.id = 'track-name';
        trackName.classList.add('track-name')

        let trackNameLabel = document.createElement('span');
        trackNameLabel.classList.add('track-name-label')
        trackNameLabel.appendChild(document.createTextNode('Track Name: '));

        let trackNameValue = document.createElement('span');
        trackNameValue.classList.add('track-name-label-value')
        trackNameValue.appendChild(document.createTextNode(track.track));
        trackName.appendChild(trackNameLabel);
        trackName.appendChild(trackNameValue);

        let trackArtist = document.createElement('div');
        trackArtist.id = 'track-artist';
        trackArtist.classList.add('track-artist')

        let artistNameLabel = document.createElement('span');
        artistNameLabel.classList.add('artist-name-label')
        artistNameLabel.appendChild(document.createTextNode('Artist Name: '));
        let artistNameValue = document.createElement('span');
        artistNameValue.classList.add('artist-name-label-value')
        artistNameValue.appendChild(document.createTextNode(track.artist));
        trackArtist.appendChild(artistNameLabel);
        trackArtist.appendChild(artistNameValue);

        let trackAlbum = document.createElement('div');
        trackAlbum.id = 'track-album';
        trackAlbum.classList.add('track-album')

        let albumNameLabel = document.createElement('span');
        albumNameLabel.classList.add('album-name-label')
        albumNameLabel.appendChild(document.createTextNode('Album Name: '));
        let albumNameValue = document.createElement('span');
        albumNameValue.classList.add('album-name-label-value')
        albumNameValue.appendChild(document.createTextNode(track.album));
        trackAlbum.appendChild(albumNameLabel);
        trackAlbum.appendChild(albumNameValue);


        let trackDuration = document.createElement('div');
        trackDuration.id = 'track-duration';
        trackDuration.classList.add('track-duration')

        let durationNameLabel = document.createElement('span');
        durationNameLabel.classList.add('duration-name-label')
        durationNameLabel.appendChild(document.createTextNode('Duration: '));
        let durationNameValue = document.createElement('span');
        durationNameValue.classList.add('duration-name-label-value')
        durationNameValue.appendChild(document.createTextNode(track.duration));
        trackDuration.appendChild(durationNameLabel);
        trackDuration.appendChild(durationNameValue);


        trackContainer.appendChild(trackName);
        trackContainer.appendChild(trackArtist);
        trackContainer.appendChild(trackAlbum);
        trackContainer.appendChild(trackDuration);
        primaryContainer.appendChild(trackContainer);


    })

}

function deleteTrack(track) {
    let finalList = fetchedPlaylistTracksList.filter(trackSaved => {
        return trackSaved.id !== track.id;
    })
    fetchedPlaylistTracksList = finalList;
}

function searchByTrackNameForPlaylistThree() {
    let trackNameInput = document.getElementById("search-by-track-input-three").value;

    if (trackNameInput.length === 0) {
        resetSearchResultThree();
        return;
    }

    if (trackNameInput !== '' && trackNameInput.length > 0) {
        const url = rootApiPath + '/track/findByAll' + '/' + trackNameInput;
        const newUrl = url;

        fetch(
            newUrl,
            {
                headers: { "Content-Type": "application/json" },
                method: "GET"
            }
        )
            .then(tracks => tracks.json()
                .then(tracks => {
                    if (tracks.length) {
                        fetchedTracks = [...tracks];
                        populateTrackDataThree(tracks)
                    } else {
                        document.getElementById("search-by-track-input-three").value = '';
                        alert('No track found with entered details!')
                        resetSearchResultThree();
                    }
                }))
            .catch(err => {
                console.log('Error fetching the results', err)
            })
    }
}

function populateTrackDataThree(trackList) {

    resetSearchResultThree();
    let maintrackContainer = document.getElementById('matched-tracks-three');
    let primaryContainer = document.createElement('div');
    primaryContainer.id = 'primary-container-4';

    let label = document.createElement('span');
    label.appendChild(document.createTextNode('Found matched tracks: ' + trackList.length + '\u00A0'));
    primaryContainer.appendChild(label);

    trackList.forEach(track => {

        let trackContainer = document.createElement('button');

        trackContainer.id = track.track_id;
        trackContainer.onclick = function () {
            addPlayListTracks(track);
            trackContainer.classList.add('checked')
        }
        customPlaylistTracks.forEach(element => {
            if (element.track_id === track.track_id) {
                trackContainer.classList.add('checked')
            }
        })
        trackContainer.classList.add('track-container')

        let trackName = document.createElement('div');
        trackName.id = 'track-name';
        trackName.classList.add('track-name')

        let trackNameLabel = document.createElement('span');
        trackNameLabel.classList.add('track-name-label')
        trackNameLabel.appendChild(document.createTextNode('Track Name: '));

        let trackNameValue = document.createElement('span');
        trackNameValue.classList.add('track-name-label-value')
        trackNameValue.appendChild(document.createTextNode(track.track_title));
        trackName.appendChild(trackNameLabel);
        trackName.appendChild(trackNameValue);

        let trackArtist = document.createElement('div');
        trackArtist.id = 'track-artist';
        trackArtist.classList.add('track-artist')

        let artistNameLabel = document.createElement('span');
        artistNameLabel.classList.add('artist-name-label')
        artistNameLabel.appendChild(document.createTextNode('Artist Name: '));
        let artistNameValue = document.createElement('span');
        artistNameValue.classList.add('artist-name-label-value')
        artistNameValue.appendChild(document.createTextNode(track.artist_name));
        trackArtist.appendChild(artistNameLabel);
        trackArtist.appendChild(artistNameValue);

        let trackAlbum = document.createElement('div');
        trackAlbum.id = 'track-album';
        trackAlbum.classList.add('track-album')

        let albumNameLabel = document.createElement('span');
        albumNameLabel.classList.add('album-name-label')
        albumNameLabel.appendChild(document.createTextNode('Album Name: '));
        let albumNameValue = document.createElement('span');
        albumNameValue.classList.add('album-name-label-value')
        albumNameValue.appendChild(document.createTextNode(track.album_title));
        trackAlbum.appendChild(albumNameLabel);
        trackAlbum.appendChild(albumNameValue);

        let trackDuration = document.createElement('div');
        trackDuration.id = 'track-duration';
        trackDuration.classList.add('track-duration')

        let durationNameLabel = document.createElement('span');
        durationNameLabel.classList.add('duration-name-label')
        durationNameLabel.appendChild(document.createTextNode('Duration: '));
        let durationNameValue = document.createElement('span');
        durationNameValue.classList.add('duration-name-label-value')
        durationNameValue.appendChild(document.createTextNode(track.track_duration));
        trackDuration.appendChild(durationNameLabel);
        trackDuration.appendChild(durationNameValue);

        trackContainer.appendChild(trackName);
        trackContainer.appendChild(trackArtist);
        trackContainer.appendChild(trackAlbum);
        trackContainer.appendChild(trackDuration);
        primaryContainer.appendChild(trackContainer);
    })

    maintrackContainer.appendChild(primaryContainer);

}

function resetSearchResultThree() {
    let matchedTracks = document.getElementById('matched-tracks-three')
    let trackSection = document.getElementById('primary-container-4');
    if (trackSection) {
        trackSection.appendChild(document.createTextNode(""));
        matchedTracks.removeChild(trackSection);
    }
}

function addPlayListTracks(track) {
    let matchingTrack = fetchedPlaylistTracksList.find(trackStored => {
        return track.track_id === trackStored.id
    })
    if (matchingTrack == undefined) {
        let trackItem = {};
        trackItem.id = track.track_id;
        trackItem.track = track.track_title;
        trackItem.duration = track.track_duration;
        trackItem.album = track.album_title;
        trackItem.artist = track.artist_name;
        fetchedPlaylistTracksList.push(trackItem);
    }

}

async function modifyPlaylist() {
    let playlistName = document.getElementById("playlist-input").value
    if (playlistName === undefined || playlistName === '') {
        alert('Please provide playlist name to search!')
        return;
    }
    let request = {};
    request.name = playlistName;
    request.tracks = [...fetchedPlaylistTracksList];
    await putData(rootApiPath + '/customPlaylist/modify', request)
        .then((data) => {
            alert(data.message);
            location.reload();
        })
        .catch(err => {
            alert(err);
        });
}

async function putData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}