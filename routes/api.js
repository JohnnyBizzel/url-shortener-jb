//"use strict";
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types"); // use to check for a url datatype
mongooseTypes.loadTypes(mongoose);
var Url = mongoose.SchemaTypes.Url;

var mongo_url = ''; //'mongodb://test:test@ds127878.mlab.com:27878/urlshorten'
mongo_url = 'mongodb://jbizzel:TheServerNameD1r3ct1v3@ds129018.mlab.com:29018/short-url-microservice';
//Connect to the database
mongoose.Promise = global.Promise;
mongoose.connect(mongo_url);

//Create a schema - this is like a blueprint
var urlshortenSchema = new mongoose.Schema({
  urlLong: Url,
  urlShort: Url,
  id: Number
});

var Urlshorten = mongoose.model('urls', urlshortenSchema);


// ('/*' (catches everything after the '/')
router.get('/*', function(req, res, next) {

  var url = req.url.replace(/^\//, ''); //extracts all text after / in url


    if(Number.isInteger(Number(url))) {
        var giveID = Number(url);
        Urlshorten.findOne({ 'id': giveID }, 'urlLong urlShort id', function (err, doc) {
            // TODO:  Handle when not doc id is not found
            if (err || doc == null) { 
                console.log('Error is ' + err + '\n\n');
                var wrongIdErr = new Error('That ID does not exist in the database');
                return next(wrongIdErr);
                
            }
            console.log('%s %s found.\n', doc.urlLong, doc.urlShort);
            res.statusCode = 302;
            res.setHeader('Location', doc.urlLong);
            res.end();
            console.log('redirecting...');
        });    
            
       /* Urlshorten.findOne({id: url}, function(err,doc){
            if(err) throw err;
            console.log(err);
            console.log(doc);
            res.redirect(doc.url);
        });*/
    } else {
        console.log(url);
         // next url with id
         // get highest ID in the database
        var highestId;
        Urlshorten.find().sort({ "id":-1}).limit(1).exec(function(err, doc) {
            if (err) console.log(err);
            console.log('Document found: ' + doc.length);
            //console.log('Highest ID: ' + doc[0].id);
            // res.status(302).send("High id = " + doc[0].id);
            // res.end();
            if (doc.length < 1) {
                console.log("set high id to zero");
                highestId = 0;
            } else {
                highestId = Number(doc[0].id);
            }
            console.log('HIGHEST ID \n');
            console.log(highestId);
            console.log('\n');
            var i = highestId + 1; 
            var shortUrl = 'https://url-shortener-microservice-ajitsy.c9users.io/api/' + i;
            console.log('Next insert will be ... ' + shortUrl);
            var itemOne = Urlshorten({urlLong: url, 
                                        urlShort: shortUrl, 
                                        id: i}).save(function(err) {
                if (err) {
                    console.log("You typed an invalid URL error:" + err);
                    // update error message...
                    err.message = "You typed an invalid URL: " + url;
                    return next(err);
                }
                
                res.send("Shortened Link " + shortUrl);
                console.log('added a new url');
            });
        });
        
        
    }
});

module.exports = router;