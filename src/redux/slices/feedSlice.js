import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";
import { likeAndUnlikePost } from "./postsSlice";

export const getFeedData = createAsyncThunk("user/getFeedData", async () => {
  try {
    const response = await axiosClient.get("/user/getFeedData");
    console.log("userProfile", response);
    return response.result;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const followAndUnfollowUser = createAsyncThunk(
  "user/followAndUnfollow",
  async (body) => {
    try {
      const response = await axiosClient.post("/user/follow", body);
      return response.result.user;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

const feedSlice = createSlice({
  name: "feedSlice",
  initialState: {
    feedData: {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeedData.fulfilled, (state, action) => {
        state.feedData = action.payload;
      })
      .addCase(likeAndUnlikePost.fulfilled, (state, action) => {
        const post = action.payload;

        const index = state?.feedData?.posts?.findIndex(
          (item) => item._id === post._id
        );
        console.log("feed like", post, index);
        if (index != undefined && index != -1) {
          state.feedData.posts[index] = post;
        }
      })
      //follow or unfollow krnme pe data bhi update hona chaiye
      .addCase(followAndUnfollowUser.fulfilled, (state, action) => {
        //pehle jisko follow ya unfollow kia h uska data chaiye
        const user = action.payload;

        //agr uss bande ko already follow kia hua tha i.e usko unfollow lr chuka hu
        const index = state?.feedData?.followings.findIndex(
          (item) => item._id == user._id
        );

        //if id is already present, toh remove userid from following list
        if (index != -1) {
          state?.feedData.followings.splice(index, 1);
        } else {
          //add the user
          state?.feedData.followings.push(user);
        }
      });
  },
});

export default feedSlice.reducer;
