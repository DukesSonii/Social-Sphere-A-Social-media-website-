const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      // return res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      // return res.status(409).send("User is already registered");
      return res.send(error(409, "User is already registered"));
    }

    //isse password aasa string ban jayaga which once encoded cant be decoded
    const hashedPassword = await bcrypt.hash(password, 10);

    //.create()is there in mongodb
    //iss name, email passwod ko store kr lo
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.send(success(201, "user created successfully"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      // return res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      // return res.status(404).send("User is not registered");
      return res.send(error(404, "User is not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      // return res.status(403).send("Incorrect password");
      return res.send(error(403, "Incorrect password"));
    }

    const accessToken = generateAccessToken({
      _id: user._id,
    });
    const refreshToken = generateRefreshToken({
      _id: user._id,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true, //jis cookie mai ye true kr deta h toh it cant be accessed by frontend
      secure: true,
    });

    return res.send(success(200, { accessToken }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

// this api will check the refreshToken validity and generate a new access token
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    // return res.status(401).send("Refresh token in cookie is required");
    return res.send(error(401, "Refresh token in cookie is required"));
  }

  //refresh token nikal lo
  const refreshToken = cookies.jwt;

  console.log("refressh", refreshToken);

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );
    //if above is decoded, we'll get the ID
    //and if refresh token is verified, then we'll get generate the new access token
    //pehle id bahar nikal lo and generate new AccessToken
    const _id = decoded._id;

    const accessToken = generateAccessToken({ _id });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    // return res.status(401).send("Invalid refresh token");
    return res.send(error(401, "Invalid refresh token"));
  }
};

const logoutController = async (req, res) => {
  try {
    //jab logout kroge toh delete its cookie from backend side
    //backend se delete hojayagi toh wo refresh nhi karpayaga
    //par frontend ki duty h to delete access token from local storage
    res.clearCookie("jwt", {
      //saare option krna padega jo upar login or mai kia the
      httpOnly: true, //cookie cant be excessed by any javascript
      secure: true,
    });
    return res.send(success(200, "user logged out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

//internal functions
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });
    console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    console.log(token);
    return token;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
};
