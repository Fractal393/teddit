const express  = require('express');
const bodyParser  = require("body-parser");
const cookieParser  = require('cookie-parser');
const mongoose  = require("mongoose");
const cors  = require('cors');
const bcrypt  = require('bcrypt');
const jwt  = require('jsonwebtoken');
const User  = require("./models/User.js");
const Comment  = require("./models/Comment.js");
const VotingRoutes  = require("./VotingRoutes.js");
const path = require("path");

const secret = 'secret123';
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(VotingRoutes);

function getUserFromToken(token) {
  const userInfo = jwt.verify(token, secret);
  return User.findById(userInfo.id);
}

mongoose.connect("mongodb://fractal:test@cluster0-shard-00-00.g9jwl.mongodb.net:27017,cluster0-shard-00-01.g9jwl.mongodb.net:27017,cluster0-shard-00-02.g9jwl.mongodb.net:27017/verite?ssl=true&replicaSet=atlas-6fx3zk-shard-0&authSource=admin&retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to database."))
  .catch((err) => console.error(err));

app.use(express.static(path.resolve(__dirname, "client", "build")));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

app.post('/register', (req, res) => {
  const {email,username} = req.body;
  const password = bcrypt.hashSync(req.body.password, 10);
  const user = new User({email,username,password});
  user.save().then(user => {
    jwt.sign({id:user._id}, secret, (err, token) => {
      var code = localStorage.getItem("codelocal");  
        console.log(code);
        if (data.flag != "vertite{"+code+"}")
        console.log("WRONG FLAG");
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(201).cookie('token', token).send();
      }
    });
  }).catch(e => {
    console.log(e);
    res.sendStatus(500);
  });
});

app.get('/user', (req, res) => {
  const token = req.cookies.token;

  getUserFromToken(token)
    .then(user => {
      res.json({username:user.username});
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });

});

app.post('/login', (req, res) => {
  const {username, password} = req.body;
  User.findOne({username}).then(user => {
    if (user && user.username) {
      const passOk = bcrypt.compareSync(password, user.password);
      if (passOk) {
        jwt.sign({id:user._id}, secret, (err, token) => {
          res.cookie('token', token).send();
        });
      } else {
        res.status(422).json('Invalid username or password');
      }
    } else {
      res.status(422).json('Invalid username or password');
    }
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

app.get('/comments', (req, res) => {
  const search = req.query.search;
  const filters = search
    ? {body: {$regex: '.*'+search+'.*'}}
    : {rootId:null};
  Comment.find(filters).sort({postedAt: -1}).then(comments => {
    res.json(comments);
  });
});

app.get('/comments/root/:rootId', (req, res) => {
  Comment.find({rootId:req.params.rootId}).sort({postedAt: -1}).then(comments => {
    res.json(comments);
  });
});

app.get('/comments/:id', (req, res) => {
  Comment.findById(req.params.id).then(comment => {
    res.json(comment);
  });
});

app.post('/comments', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.sendStatus(401);
    return;
  }
  getUserFromToken(token)
    .then(userInfo => {
      const {title,body,parentId,rootId} = req.body;
      const comment = new Comment({
        title,
        body,
        author:userInfo.username,
        postedAt:new Date(),
        parentId,
        rootId,
      });
      comment.save().then(savedComment => {
        res.json(savedComment);
      }).catch(console.log);
    })
    .catch(() => {
      res.sendStatus(401);
    });
});

app.listen(process.env.PORT || 4000);