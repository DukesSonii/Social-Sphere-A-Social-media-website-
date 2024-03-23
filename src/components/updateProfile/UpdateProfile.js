import React, { useEffect, useState } from "react";
import "./UpdateProfile.scss";
import "./UpdateProfile.scss";
import dummyUserImg from "../../assets/user.png";
import { useSelector, useDispatch } from "react-redux";
import { setLoading, updateMyProfile } from "../../redux/slices/appConfigSlice";

function UpdateProfile() {
  const myProfile = useSelector((state) => state.appConfigReducer.myProfile);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [userImg, setUserImg] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    //initially value is null or null hone ke baad name or bio mai chang hoti h
    //toh kisi ki bhi value null krte ho kisi input ki toh woh uncontrolled way mai chale jata h
    //or phir uncontroll. way se update hoti h profile jab usko actual value milti h tab usko set kr dete ho
    //actual name ke sath. so we are going from uncontrolled to controlled way so we write
    //agr null mila toh return empty
    setName(myProfile?.name || "");
    setBio(myProfile?.bio || "");
    setUserImg(myProfile?.avatar?.url); //dummy image leke aaye avatar se
  }, [myProfile]); //my profile isliye likha h kuu ki jab data aaaye
  //tab usweeffect wapis update ho jaye
  //myprofile ka data jab bhi update hota h, toh name or bio ko update kr skte h

  //--

  //--

  //koi image change ki toh handlechange mai pata chal jayag ki change hui h ya nh
  //phir file nikalo bahar so we can send it to backend and that thing file rerader will do it for you
  function handleImageChange(e) {
    const file = e.target.files[0]; //file choose kro
    const fileReader = new FileReader(); //dom ke sath milta h yeh filereader h
    fileReader.readAsDataURL(file); //data read kr lia
    fileReader.onload = () => {
      if (fileReader.readyState === fileReader.DONE) {
        //iske andar pata chal jayag ki redy h ya nhi iss data ko load krna ke baad toh check
        setUserImg(fileReader.result);
        console.log("img data", fileReader.result);
      }
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    dispatch(
      updateMyProfile({
        name,
        bio,
        userImg,
      })
    );
  }

  return (
    <div className="UpdateProfile">
      <div className="container">
        <div className="left-part">
          <div className="input-user-img">
            <label htmlFor="inputImg" className="labelImg">
              <img src={userImg ? userImg : dummyUserImg} alt={name} />
            </label>
            <input
              className="inputImg"
              id="inputImg"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="right-part">
          <form onSubmit={handleSubmit}>
            <input
              value={name}
              type="text"
              placeholder="Your ✨Delightful Name here"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              value={bio}
              type="text"
              placeholder="🌟Express yourself"
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="submit"
              className="btn-primary"
              onClick={handleSubmit}
            />
          </form>

          <button className="delete-account btn-primary">Delete Account</button>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;
