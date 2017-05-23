"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parkSchema = new Schema({                         // changed user to park
    name: {                                             // name of park
        required: [true, `Please a name man!`],
        type: String                                    // String = text
    },
    location: {
        required: [true, `Where is this park?`],
        type: Object                                    // latitude and longitude, can create object
    },
    address: {
        required: [true, `Where is this park?`],
        type: String                                    // latitude and longitude, can create object
    },
    description: {
        required: [true, `Describe the park, include address and other info?`],
        type: String                                     // String = text
    },
    images: {
        required: [true, `Provide images of the park.`],
        type: Array                                     // can do an array of links (forEach)
    },
});

module.exports = mongoose.model('park', parkSchema);
