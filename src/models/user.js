module.exports = mongoose => {
    const schema = new mongoose.Schema({
        fullName: { 
            type: String, 
            required: true 
        },
        emailAddress: { 
            type: String,
            required: true,
            index: true,
            unique: true,
            match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        },
        password: {
            type: String, 
            required: true 
        }
    });
    return mongoose.model("User", schema);
};