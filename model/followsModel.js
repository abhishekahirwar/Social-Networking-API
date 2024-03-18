const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        follower: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            }
        ],
        following: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Follow", followSchema);
