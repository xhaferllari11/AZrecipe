const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    googleId: String,
    name: String,
    email: String,
    profilePic: String
},{
    timestamps: true
})

module.exports = mongoose.model('Fakeuser', userSchema);