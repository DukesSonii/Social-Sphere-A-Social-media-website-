import React, { useEffect, useState } from "react";
import Post from "../post/Post";
import "./Profile.scss";
import userImg from "../../assets/user.png";
import { useNavigate, useParams } from "react-router";
import CreatePost from "../createPost/CreatePost";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfile } from "../../redux/slices/postsSlice";
import { followAndUnfollowUser } from "../../redux/slices/feedSlice";

function Profile() {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const userProfile = useSelector((state) => state.postsReducer.userProfile);
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const feedData = useSelector((state) => state.feedDataReducer.feedData);

  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  //how to check if this is my profile or not? myprofile ka andar id == currparams.id, then its my profile else other profile

  useEffect(() => {
    dispatch(getUserProfile({ userId: params.userId }));
  }, [params.userId, dispatch]);

  useEffect(() => {
    setIsMyProfile(myProfile?._id === params.userId);
    setIsFollowing(
      feedData?.followings?.some((item) => item._id === params.userId)
    );
  }, [myProfile, params.userId, feedData]);

  const handleUserFollow = () => {
    dispatch(followAndUnfollowUser({ userIdToFollow: params.userId }));
    setIsFollowing((prev) => !prev); // Toggle following state
  };

  return (
    <div className="Profile">
      <div className="profile-header">
        <img
          className="user-img"
          src={userProfile?.avatar?.url || userImg}
          alt="User"
        />
        <div className="profile-info">
          <div className="user-details">
            <h2 className="user-name">{userProfile?.name}</h2>
            {!isMyProfile && (
              <button
                onClick={handleUserFollow}
                className={isFollowing ? "btn-unfollow" : "btn-follow"}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
            {isMyProfile && (
              <button
                className="update-profile"
                onClick={() => navigate("/updateProfile")}
              >
                Update Profile
              </button>
            )}
          </div>
          <div className="follower-info">
            <span>
              <strong>{userProfile?.posts?.length}</strong> Posts
            </span>
            <span>
              <strong>{userProfile?.followers?.length}</strong> Followers
            </span>
            <span>
              <strong>{userProfile?.followings?.length}</strong> Following
            </span>
          </div>
          <p className="bio">{userProfile?.bio}</p>
        </div>
      </div>

      <div className="profile-posts">
        {isMyProfile && <CreatePost />}
        <div className="posts-grid">
          {userProfile?.posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
