const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    owner: {
      //type of owner is user id
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      //har posts ka owner hona jaruri h isliye true
      required: true,
    },
    image: {
      publicId: String,
      url: String,
    },
    caption: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", postSchema);
