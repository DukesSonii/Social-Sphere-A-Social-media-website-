const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/responseWrapper");

module.exports = async (req, res, next) => {
  if (
    //kya request ke andar header aaya ya nhi aaya
    !req.headers ||
    //agar h toh usme quthorization token h ya nhu
    !req.headers.authorization ||
    //agar aayi toh kya woh bearere se start ho rhi h ya nhi
    !req.headers.authorization.startsWith("Bearer")
  ) {
    // return res.status(401).send("Authorization header is required");
    return res.send(error(401, "Authorization header is required"));
  }

  //token is written in form of bearer t_nm
  //space ke sath split kr lia toh 2 part ban jayanga
  //array ke 2 part ban gaye unme se token part ko access kr lia h
  const accessToken = req.headers.authorization.split(" ")[1];

  try {
    //we have to verify that access token we have got is valid or not, if valid call next()
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    req._id = decoded._id;

    const user = await User.findById(req._id);
    if (!user) {
      return res.send(error(404, "User not found"));
    }

    next();
  } catch (e) {
    console.log(e);
    // return res.status(401).send("Invalid access key");
    return res.send(error(401, "Invalid access key"));
  }
};
