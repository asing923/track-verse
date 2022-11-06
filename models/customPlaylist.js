const mongoose = require('mongoose')

const customPlayListSchema =  new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tracks: [{
        id: Number,
        track: String,
        duration: String,
        artist: String,
        album: String
    }],
    duration: {
        type: String,
    }
})

module.exports = mongoose.model('customplaylist', customPlayListSchema)