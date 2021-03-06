/**
 * Created by D on 11.2.2016 �..
 */
var mongoose = require('mongoose'),
    crypto = require('crypto'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Profile = require('./UserProfile');

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: 'Username is required!'
    },
    hashedPassword: {
        type: String,
        required: 'Password is required!'
    },
    salt: {
        type: String
    },
    profile: {type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile'}
});

userSchema.methods = {
    authenticate: function (passwordToMatch) {
        return hashPassword(this.salt, passwordToMatch) === this.hashedPassword;
    }
};

var User = mongoose.model('User', userSchema);


User.find({}, function (err, users) {
    if (users.length == 0) {
        var salt = createSalt();
        var pwd = hashPassword(salt, 'admin');
        var user = {
            username: 'admin',
            hashedPassword: pwd,
            salt: salt
        };
        var newUser = new User(user);
        newUser.save();
    }
});

User.find({username: 'ddamyanov'}, function (err, users) {
    if (users.length == 0) {
        var salt = createSalt();
        var pwd = hashPassword(salt, 'asd123');
        var profile = new Profile({
            name: 'Dimitar Damyanov',
            email: 'ddamqnov@gmail.com',
            avatar: "570013dd03a3b7a82192ba70"
        });
        profile.save();

        var user = {
            username: 'ddamyanov',
            hashedPassword: pwd,
            salt: salt,
            profile: profile
        };
        var newUser = new User(user);
        newUser.save();
    }
});



passport.use(new LocalStrategy(
    function(username, password, done){
        User.findOne({username: username},function(err, user){
            if(user && user.authenticate(password)){
                return done(null, user);
            } else {
                return done(null, false)
            }
        }).populate('profile');
    }
));


passport.serializeUser(function(user, done){
    if(user){
        done(null, user._id);
    }
});

passport.deserializeUser(function(id , done){
    User.findOne({_id: id}, function(err, user){
        if(user){
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
});

function createSalt() {
    return crypto.randomBytes(124).toString('base64');
}

function hashPassword(salt, pwd) {
    return crypto.createHmac('sha1', salt).update(pwd).digest('hex');
}

module.exports = User;
