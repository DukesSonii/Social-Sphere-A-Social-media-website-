const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../utils/Utils");

const createPostController = async (req, res) => {
  try {
    const { caption, postImg } = req.body;

    if (!caption || !postImg) {
      return res.send(error(400, ""));
    }
    //jo posts add krenge vo bhi cloudinary pe jayaga
    const cloudImg = await cloudinary.uploader.upload(postImg, {
      folder: "postImg",
    });

    const owner = req._id;

    //user ke posts ke andhar bh iss posts ko add krna hoga
    const user = await User.findById(req._id);

    //user has posts array
    const post = await Post.create({
      owner,
      caption,
      image: {
        publicId: cloudImg.public_id,
        url: cloudImg.url, //cloudImg ka url
      },
    });

    //user ke posts mai bhi apni photo push honi chaiye
    user.posts.push(post._id);
    await user.save();

    console.log("user", user);
    console.log("post", post);

    return res.json(success(200, { post }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      //jis post ko like krna chahta ho woh nhi mili
      return res.send(error(404, "Post not found"));
    }
    //pehle case mai post nhi mili, next case mai post mili to check
    //agr like kia hua h toh usko unlike kr doga
    //or nhi like kia hoga toh like kr denge

    if (post.likes.includes(curUserId)) {
      //agr curr id present h toh usko bahar nikalo
      //agr like h toh usko unlike krdo or phir post ko unlike kr dia h
      const index = post.likes.indexOf(curUserId); //post ka index nikalo using indexof(user_id)
      post.likes.splice(index, 1); //phir delete krdo splice => arr ke beech mai se chunk delte kr skta h
      //index mtlb iss index se delete krna start krna h or 1 means 1 ko remove krna h
    }
    //agr like nhi kia h toh post ko like kr do
    else {
      post.likes.push(curUserId);
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
  //go to /posts/like to see how to like or unlike the post
};

//update your own post
const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    //abh khudke post update krne ke liye pata hona chaiye ki vo user khud h koi dusra nhi h
    //so if post owner != curruser give the following
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only owners can update their posts"));
    }
    //agr equal h and user wants to update its own posts
    //if caption is present
    if (caption) {
      //update the caption
      post.caption = caption;
    }

    await post.save();
    return res.send(success(200, { post }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;

    const post = await Post.findById(postId);
    const curUser = await User.findById(curUserId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    //jo post delete kr rha h wo owner hi h na
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "Only owners can delete their posts"));
    }

    //if owner can delete the post
    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);
    await curUser.save();
    await post.remove();

    return res.send(success(200, "post deleted successfully"));
    //Note in case of delete account, we also have to delete the account from database from mongodb
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePost,
};
