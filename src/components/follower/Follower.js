import React, { useEffect, useState } from "react";
import Avatar from "../avatar/Avatar";
import "./Follower.scss";
import { useSelector, useDispatch } from "react-redux";
import { followAndUnfollowUser } from "../../redux/slices/feedSlice";
import { useNavigate } from "react-router";

function Follower({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const feedData = useSelector((state) => state.feedDataReducer.feedData);
  const [isFollowing, setIsFollowing] = useState();

  useEffect(() => {
    //agar ek bhi user mil jata h mere following list mai jiski id == user.id,
    //that means mai isko follow kr rha hu
    //isFollowing ko true set krdo jab list mai mil gye or false when not found in list
    setIsFollowing(feedData.followings.find((item) => item._id === user._id));
  }, [feedData]);

  function handleUserFollow() {
    dispatch(
      followAndUnfollowUser({
        userIdToFollow: user._id,
      })
    );
  }

  return (
    <div className="Follower">
      <div
        className="user-info"
        onClick={() => navigate(`/profile/${user._id}`)}
      >
        <Avatar src={user?.avatar?.url} />
        <h4 className="name">{user?.name}</h4>
      </div>

      {/*user ko follow kr rhe ho toh dikhao unfollow or nhi kr rhe ho toh dikhao follow  */}
      <h5
        onClick={handleUserFollow}
        className={isFollowing ? "hover-link follow-link" : "btn-primary"}
      >
        {isFollowing ? "Unfollow" : "Follow"}
        {/* agr follow kr rhe ho toh unfollow or nhi kr rha ho toh show follow*/}
      </h5>
    </div>
  );
}

export default Follower;
