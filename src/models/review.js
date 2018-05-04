module.exports = mongoose => {
    const schema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        postedOn: {
            type: Date,
            default: Date.now
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: String
    });
    return mongoose.model("Review", schema);
}
    