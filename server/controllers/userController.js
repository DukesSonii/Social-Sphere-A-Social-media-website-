const { json } = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;
const { mapPostOutput } = require("../utils/Utils");

const followOrUnfollowUserController = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;

    //user jisko follow kr rhe ho woh exist krta h ya nhi
    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    //khud ko follow nhi krna if both id's are equal toh user cant folllow themselves
    if (curUserId === userIdToFollow) {
      return res.send(error(409, "Users cannot follow themselves"));
    }

    //agar user nhi mila toh send user not found
    if (!userToFollow) {
      return res.send(error(404, "User to follow not found"));
    }

    //agar curruser ne api call ki h or userid ko follow kr rakha h toh usko unfollow kra denge
    if (curUser.followings.includes(userIdToFollow)) {
      // already followed, toh unfollow kra denge
      //pehle index nikalo user ka jisko follow krna h
      const followingIndex = curUser.followings.indexOf(userIdToFollow);
      //curr user ke following mai se uss bande ko uda dia
      curUser.followings.splice(followingIndex, 1);
      //agr uss bandha ko follow kia hua tha toh delete klr do or uss agle user ke followers mai se bhi remove hona chaiye

      const followerIndex = userToFollow.followers.indexOf(curUser);
      userToFollow.followers.splice(followerIndex, 1);
    } else {
      //agar follow nhi kr rhe ho toh uske follower list mai khud ko dal do
      userToFollow.followers.push(curUserId);
      //or apne mtlb curr following list mai usse dal do
      curUser.followings.push(userIdToFollow);
    }

    await userToFollow.save();
    await curUser.save();

    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

//post ke andar jao or get posts call krdo or vo saare ki saari posts leke aajau jinki id unke equal h jinko aapan ne follow kr rkha h
//for that use findbyId
const getPostsOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate("followings");
    //following ka data thik se deekha

    //jin jin posts ke owner mere curr following list mai aa rha h unko lake dedo
    const fullPosts = await Post.find({
      owner: {
        $in: curUser.followings,
      },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();

    const followingsIds = curUser.followings.map((item) => item._id);
    //following ka saara data mil jayaga
    followingsIds.push(req._id);

    //in suggestions, saare user leke aao jinko mai follow nhi kr rha hu
    //in instagram, they have used ML in api calling

    //pehle follow kr rkha h unki list nikal lo

    //saare log jinko follow nhi kr rha hu
    const suggestions = await User.find({
      //id not in following id's, basically is id ke andar jitni bhi user id milegi
      //unke alawa jo userId hogi unn sab ko lake dedega
      _id: {
        $nin: followingsIds, //posts jinko mene follow kr rkha h
      },
    });

    //object ke andar destructuring kr rha hu or destructuring ke baad mene
    //suggestiuons ko add kia or  prev post mil rhi thi, meno inn posts (upar dekh full posts) se update kr rha hu
    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (error) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getMyPosts = async (req, res) => {
  try {
    const curUserId = req._id;
    const allUserPosts = await Post.find({
      owner: curUserId,
    }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (error) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.send(error(400, "userId is required"));
    }

    const allUserPosts = await Post.find({
      owner: userId,
    }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (error) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    // delete all posts
    await Post.deleteMany({
      owner: curUserId,
    });

    // removed myself from followers' followings
    curUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(curUserId);
      follower.followings.splice(index, 1);
      await follower.save();
    });

    // remove myself from my followings' followers
    curUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(curUserId);
      following.followers.splice(index, 1);
      await following.save();
    });

    // remove myself from all likes
    const allPosts = await Post.find();
    allPosts.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
      await post.save();
    });

    // delete user
    await curUser.remove();

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, "user deleted"));
  } catch (error) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

//sirf apni information la rha h
const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;

    const user = await User.findById(req._id);

    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    //user imag is base64 encoding image and can't be stored directly in mongoDb
    //cludimaginary is a service where we can upload our images, can modify images
    //at runtime, adding text, merging images on the client but we'll use just for storage
    if (userImg) {
      //pass data which is profile image
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "profile_images", //yaha images upload ho jayagi or kuch values lake degi jo ham user.avatar mai store kr lenge
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    //save the user and retuirn the user
    await user.save();
    return res.send(success(200, { user }));
  } catch (e) {
    console.log("put e", e);
    return res.send(error(500, e.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    //jo bhi user ka profile chaiye uski id nikal lenge
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      //saare posts ko populate krna chahta h
      //har posts ke andar owner ko populate krna chahta
      path: "posts", //saare posts mil jayabgi
      populate: {
        path: "owner", //we'll get details of owner
      },
    });

    //saare posts mil jayagi
    const fullPosts = user.posts;
    const posts = fullPosts
      //return the map jo utils ke nadar banaya h
      .map((item) => mapPostOutput(item, req._id))
      //the post will be in sorted order but we want latest
      //post to show first so write .reverse()
      .reverse();

    //how to send data? we want just doc info or vo jayaga frontend ke pass
    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {
    console.log("error put", e);
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollowUserController,
  getPostsOfFollowing,
  getMyPosts,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateUserProfile,
  getUserProfile,
};
