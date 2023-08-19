require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { verifyToken } = require("./middleware/auth.js");
const User = require("./models/User.js");
const ContactUs = require("./models/ContactUs.js");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true, // Enable sending cookies in cross-origin requests
  })
);
app.use(express.static(path.join(__dirname, '..', 'src')));

const database = async () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  try {
    await mongoose.connect(
      process.env.DB_CONNECTION,
      connectionParams
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Connection to MongoDB failed:", error);
  }
};

database();

app.get('/',async (req, res) => {

})

//LOGIN ROUTE
app.post('/loggedin', async (req, res) => {
  let token;
  const { usn, password } = req.body;

  try {
    const user = await User.findOne({ usn: usn });
    if (!user) {
      // User with the provided USN not found   
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(bcrypt.compare(password, user.password))) {
      // Incorrect password
      return res.status(401).json({ message: 'Incorrect password' });
    }

    token = await user.generateAuthToken();
    // const expirationDate = new Date(Date.now() + 86400000);
    res.cookie("auth_token", token, {
      httpOnly: true
    }); 
    // User found and password matched
    return res.status(200).json({ message: 'Login successful', token: token });

  } catch (error) {
    console.log('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

//REGISTER ROUTE
app.post('/registered', async (req, res) => {
  let newUser = new User(req.body);
  console.log((newUser));
  const email = newUser.email;

  try {

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Hello haaid");
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPassword;

    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  }
  catch (err) {
    console.log(`Err ${err}`);
    res.status(500).send(err);
  }
});

 //TODO
 const Todo = require('./models/Todo');
const Post = require('./models/Storyspace.js');

app.get('/todos', async (req, res) => {
	const todos = await Todo.find();
  console.log(todos);
	res.json(todos);
});

// app.post('/todo/new', (req, res) => {
// 	const todo = new Todo({
// 		text: req.body.text
// 	})

// 	todo.save();

// 	res.json(todo);
// });

app.post('/todo/new', async (req, res) => {
  try {
    // Retrieve the text from the request body
    const { text } = req.body;
    const userId = req.cookies.user_id;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in cookies' });
    }

    const todo = new Todo({
      text: text,
      user: userId // Assigning the user ID from req.rootUser to the user attribute
    });

    // Save the new Todo to the database
    await todo.save();

    // Return the newly created Todo as a JSON response
    res.json(todo);
  } catch (err) {
    console.error('Error while creating a new todo:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/todo/delete/:id', async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Todo item not found' });
    }

    console.log('Todo deleted:', result);
    res.json({ result });
  } catch (error) {
    console.error('Error while deleting todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/todo/complete/:id', async (req, res) => {
  try {  
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      // Todo item not found
      return res.status(404).json({ message: "Todo item not found" });
    }

    todo.complete = !todo.complete;
    console.log("Haaid dumb fuck");
    todo.save();

    res.json(todo);
  } catch (error) {
    // Handle any errors that occurred during the database operation
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.put('/todo/update/:id', async (req, res) => {
	const todo = await Todo.findById(req.params.id);

	todo.text = req.body.text;

	todo.save();
});

app.get('/dash', verifyToken, (req, res) => {
  res.send(req.rootUser);
})

//contact us
app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message, sendCopy } = req.body;

    // Create a new Contact document with the received data
    const newContact = new ContactUs({
      name,
      email,
      subject,
      message,
      sendCopy,
    });

    // Save the new Contact document to the database
    await newContact.save();

    // Send a response back to the client
    return res.status(200).json({ message: 'Contact information saved successfully' });
  } catch (error) {
    console.error('Error while saving contact information:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(3002, () =>  {
    console.log("server is listening")
});

app.post('/storyspace', async (req, res) => {
  try {
    // Extract data from the request body
    const { displayName, username, verified, text, avatar, image } = req.body;

    // Create a new Post object based on the Post model
    const newPost = new Post({
      displayName,
      username,
      verified,
      text,
      avatar,
      image,
    });

    // Save the new post to the database
    const savedPost = await newPost.save();

    // Send the saved post as a JSON response
    res.status(200).json(savedPost);
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// // Assuming you have the Post model defined
// const Post = require('./models/Storyspace.js');

app.get('/storyspace', async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find();

    // Send the posts as a JSON response
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
