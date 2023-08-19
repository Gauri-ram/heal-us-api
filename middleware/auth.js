const jwt = require('jsonwebtoken');
const User = require("../models/User.js");
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

const verifyToken = async (req, res, next) => {
    const token = req.cookies.auth_token;    
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN);
      const rootUser = await User.findOne(
        { _id: decodedToken._id, "tokens.token": token },
        { tokens: 0 } // Exclude the 'tokens' field from the projection
      ).exec();
      if (!rootUser){ throw new Error('User not found')}
      req.token = token;
      req.rootUser = rootUser;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  module.exports.verifyToken = verifyToken;