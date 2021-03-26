/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./movies')
var Review = require('./reviews')
const crypto = require("crypto");
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
var router = express.Router();
const GA_TRACKING_ID = process.env.GA_KEY;
function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});
router.route('/movies')
    .delete(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body.Title){
            res.json({success: false, msg: 'Please include Title for deletion.'});
        }
        else{
            Movie.findOne({Title: req.body.Title}).exec(function(err,result){
                if(result !== null){
                    Movie.remove({Title: req.body.Title}).exec(function(err){
                        if (err)
                            res.json({success: false, msg: "Could not find movie: "+ req.body.Title+ ""});
                        else
                            res.json({success: true, msg:'Movie deleted.'});
                    })
                }
            });
        }
    })

    .put(authJwtController.isAuthenticated, function(req, res) {
        var id = req.headers.id;
        Movie.findOne({_id: id}).exec(function(err, movie){
            if (err)
                res.send(err);
            movie.Title = req.body.Title;
            movie.Year = req.body.Year;
            movie.Genre = req.body.Genre;
            movie.Actors = req.body.Actors;
            movie.save(function(err){
                if (err){
                    if(err.code ==11000){
                        return res.json({success: false, msg: 'The movie is already exist.'});
                    }
                    else
                        return res.send(err);
                }
                res.json({message: 'Movie is updated.'});
            });
        });

    })
    .post(authJwtController.isAuthenticated, function(req, res){
        if (!req.body.Title || !req.body.Year|| !req.body.Genre|| !req.body.Actors) {
            res.json({success: false, msg: 'Please include Title, Year, Genre,Actors (there should be at least 3 actors).'});
        }else{
            if (req.body.Actors.length<3){
                res.json({success: false, msg: 'Please provide at least 3 actors.'})
            }
            else{
                var movie = new Movie();
                movie.Title = req.body.Title;
                movie.Year = req.body.Year;
                movie.Genre = req.body.Genre;
                movie.Actors = req.body.Actors;
                movie.save(function (err){
                    if (err){
                        if (err.code == 11000)
                            return res.json({success: false, msg: 'The movie is already exist.'});
                        else
                            return res.send(err);
                    }
                    res.json({message: 'Movie is created.'});
                });
            }
        }


    })
    .get(authJwtController.isAuthenticated, function(req, res){
        let review = req.query.review;
        if(review == true){
            Review.find({}, function(err, reviews){
                if(err)
                    res.send(err);
                res.json({Review: reviews});
                })
        }

    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


