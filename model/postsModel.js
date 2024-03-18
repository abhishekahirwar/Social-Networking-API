const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },
        posts: [
            {
                content: {
                    type: String,
                    required: [true, "Please Enter Your Post Content"],
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
