let mongoose = require('mongoose');

let articleSchema = mongoose.Schema({
    user:{
        type: String,
        required: true 
    },
    password:{
        type: String,
        required: true
    },
    wins:{
        type: Number,
        required: true
    },
    loses:{
        type: Number,
        required: true
    }
});

let Article = module.exports = mongoose.model('Article', articleSchema);