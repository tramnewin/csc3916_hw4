var mongoose2 = require('mongoose');
var Schema = mongoose2.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose2.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose2.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose2.set('useCreateIndex', true);
var ReviewSchema = new Schema({
    Title: {type:String, required: true},
    Name: {type:String},
    Rating: { type: Number},
    Review: { type: String}
});

//return the model to server
module.exports = mongoose2.model('Review',ReviewSchema);