const bcrypt = require("bcrypt-nodejs");
const SALT_WORK_FACTOR = 4;

const encryptPassword = password => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) { reject(err); }
            bcrypt.hash(password, salt, null, (err, hash) => {
                if (err) { reject(err); }
                return resolve(hash);
            });
        });
    });
};

const validatePassword = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, isMatch) => {
            if(err) return reject(err);
            return resolve(isMatch);
        });
    });
};

module.exports = mongoose => {
    const schema = new mongoose.Schema({
        fullName: { 
            type: String, 
            required: true 
        },
        emailAddress: { 
            type: String,
            required: true,
            unique: true,
            match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        },
        password: {
            type: String, 
            required: true 
        }
    });
    schema.pre("save", function(next) {
        encryptPassword(this.password)
            .then(hash => {
                this.password = hash;
                next();
            })
            .catch(err => next(err));
    });
    schema.static("authenticate", function(email, password) {
        return this.findOne({ emailAddress: email })
            .exec()
            .then(user => {
                if(!user) {
                    return Promise.resolve([ false ]);
                }
                return Promise.all([
                    validatePassword(password, user.password),
                    Promise.resolve(user)
                ]);
            })
            .then(([ isMatch, user ]) => {
                return isMatch
                    ? Promise.resolve(user)
                    : Promise.reject(new Error("Invalid email or password"));
            })
    });
    return mongoose.model("User", schema);
};