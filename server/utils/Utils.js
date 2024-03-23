var ta = require("time-ago");
//isse jab likhenge jaha post add kri h toh yeh bata dega ki kab yeh post dali thi

//ye posts mongodb wali posts jiske andar id, caption, img hogi
//and owner jka pura mongoDB ka object hoga
//we want that we have to modify as per our needs
const mapPostOutput = (post, userId) => {
  return {
    _id: post._id,
    caption: post.caption,
    image: post.image,
    owner: {
      _id: post.owner._id,
      name: post.owner.name,
      avatar: post.owner.avatar,
    },
    //har posts ke andar like array uske length pata kr lenge
    //likes handled in frontend
    likesCount: post.likes.length,
    //if this userid is present then it is liked else not
    isLiked: post.likes.includes(userId),
    timeAgo: ta.ago(post.createdAt),
  };
};

module.exports = {
  mapPostOutput,
};
