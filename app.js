//Core Packages
const path = require('path');

//Third-party packages
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer'); //File Upload & download package

//Routes
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

//Where to store the images on the disk
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  },
});

//Fileter files based on types
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Middleware
app.use(express.json()); // parse incoming json data
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
); // Register Multer, extract single file image in a field name image
app.use(morgan('tiny')); //Logging package
app.use('/images', express.static(path.join(__dirname, 'images')));
// Allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//Forward Routes
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

//Error Middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://atef-ataya:Lily1986@cluster0.ka3pb.mongodb.net/messages?retryWrites=true&w=majority'
  )
  .then(
    app.listen(1000, () => {
      console.log('Server is running http://localhost:1000');
      console.log('Database server is ready.');
    })
  )
  .catch((err) => console.log(err));
