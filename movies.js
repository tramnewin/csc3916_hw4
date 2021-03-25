var mongoose1 = require('mongoose');
var Schema = mongoose1.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose1.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose1.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose1.set('useCreateIndex', true);
var MovieSchema = new Schema({
    Title: {type:String, required: true},
    Year: { type: String, required: true},
    Genre: { type: String, required: true, enum:['Action', 'Adventure',  'Comedy',  'Drama',  'Fantasy',  'Horror',  'Mystery',  'Thriller', 'Western'] },
    Actors : { type : Array,ActorName:{type:String},CharacterName:{type:String} }
});

//return the model to server
module.exports = mongoose1.model('Movie',MovieSchema);