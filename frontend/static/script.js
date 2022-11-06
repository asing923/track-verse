var nameInput = document.getElementById("search-by-track-input");
nameInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("search-by-track-btn").click();
    }
});

var fetchedTracks = [];
var rootApiPath = '/api'

async function searchByTrackName(sortParam) {

    let trackNameInput = document.getElementById("search-by-track-input").value
    let findByVal = document.getElementById("find-by");
    let value = findByVal.value;
    if(sortParam === undefined) {
        sortParam = 'track';
    }
    
    if (trackNameInput.trim().length === 0 ) {
        resetSearchResult();
        alert('Please provide input to search track data')
        return;
    } else {
        const url = rootApiPath + '/track/findByAll' + '/' + trackNameInput.trim();
        const newUrl = url;

        fetch(
            newUrl,
            {
                headers: { "Content-Type": "application/json", "Sort": sortParam, "findBy": value},
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
    galleryContainer.innerHTML = "";
}
