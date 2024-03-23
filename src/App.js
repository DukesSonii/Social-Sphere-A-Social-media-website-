import Login from "./pages/login/Login";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/signup/Signup";
import Home from "./pages/home/Home";
import RequireUser from "./components/RequireUser";
import Feed from "./components/feed/Feed";
import Profile from "./components/profile/Profile";
import UpdateProfile from "./components/updateProfile/UpdateProfile";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import OnlyIfNotLoggedIn from "./components/OnlyIfNotLoggedIn";
import toast, { Toaster } from "react-hot-toast";

export const TOAST_SUCCESS = "toast_success";
export const TOAST_FAILURE = "toast_failure";

function App() {
  const isLoading = useSelector((state) => state.appConfigReducer.isLoading);
  const toastData = useSelector((state) => state.appConfigReducer.toastData);
  const loadingRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      //loading ho rhi h
      //? means agar loadingres.curr agar null h toh dont call this function
      //agar ? nhi h iska matlab h ki null ho ya nhi isko call krna h
      loadingRef.current?.continuousStart();
    } else {
      //loading pause kr deta h koi toh complete kr denge
      loadingRef.current?.complete();
    }
  }, [isLoading]);

  useEffect(() => {
    //toast data ka 2 type h success ya failure
    switch (toastData.type) {
      case TOAST_SUCCESS:
        //if success, handle in thi way
        toast.success(toastData.message);
        break;
      case TOAST_FAILURE:
        //if failure, handle this way
        toast.error(toastData.message);
        break;
    }
  }, [toastData]); //toast data jese updat eho rha h toh show toast

  return (
    <div className="App">
      <LoadingBar color="#000" ref={loadingRef} />
      <div>
        <Toaster />
      </div>
      <Routes>
        <Route element={<RequireUser />}>
          <Route element={<Home />}>
            <Route path="/" element={<Feed />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/updateProfile" element={<UpdateProfile />} />
          </Route>
        </Route>
        <Route element={<OnlyIfNotLoggedIn />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
