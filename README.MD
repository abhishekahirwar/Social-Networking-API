# Social Networking API

## Overview

This project is a RESTful API for a basic social networking application developed using Node.js, Express.js and MongoDB. The API supports user profiles, posts, authentication, following mechanism, efficient data retrieval, security practices, and testing.

## Features

**User Profiles**: Users can create profiles with details like name, email, password, bio, and profile picture.

**Authentication**: JWT-based authentication ensures secure access to the API. Users can sign up, log in, and perform actions on their profiles.

**Posts**: Users can create, view, update, and delete their posts. Each post includes text content, a timestamp, and the user who created it.

**Following Mechanism**: Users can follow and unfollow other users. They can view the list of users they follow and who is following them.

**Efficient Data Retrieval**: Implement efficient queries for the social feed, displaying posts from followed users sorted by the most recent.

**Data Modeling**: MongoDB schemas are designed for users, posts, and follows. References and embedded documents are used for optimal performance and query efficiency.

## Endpoints

## Authentication

* POST /api/v1/user/register: Register a new user.
* POST /api/v1/user/otp: Send OTP to user's email.
* POST /api/v1/user/login: Log in an existing user.
* POST /api/v1/user/logout: Log out the current user.
* POST /api/v1/user/password/forgot: Send a password reset email.
* POST /api/v1/user/password/reset/:token: Reset user password.

### Users

* GET /api/v1/user/me: Get user profile details.
* GET /api/v1/user/users: Get all users list registered in the social networking api.
* PUT /api/v1/user/me/update: Update user profile details.
* PUT /api/v1/user/password/update: Update user password.
* DELETE /api/v1/user/me/delete/profile: Delete user profile.

### Posts

* POST /api/v1/posts/post: Create a new post.
* GET /api/v1/posts/getSinglePost/postIndex: Get details of a single post.
* GET /api/v1/posts/latest: Get latest posts from followed users.
* GET /api/v1/posts/post: Get all posts of the current user.
* PUT /api/v1/posts/post: Update a post.
* DELETE /api/v1/posts/post: Delete a post.

### Follows

* POST /api/v1/follows/follow/userId: Follow a user.
* POST /api/v1/follows/follow/userId: Unfollow a user.
* GET /api/v1/follows/follow/userId: Get followers of a user.
* GET /api/v1/follows/following/userId: Get users followed by a user.

## Installation

* Clone the repository: `git clone https://github.com/abhishekahirwar/social-networking-app.git`
* Install dependencies: `npm install`
* Set up environment variables.
* Start the server: `node index.js`

## Env Variables
Make sure to create a .env file in the directory and add the following essential variables to use the api.

## Essential Variables

* PORT = Any Port
* MONGO_URL = Your MongoDB connection URL

* JWT_SECRET = Secret key for JWT
* JWT_EXPIRE = JWT expiration time

* COOKIE_EXPIRE = Cookie expiration time

* SMTP_SERVICE = Your SMTP service
* SMTP_MAIL = Your SMTP email
* SMTP_PASSWORD = Your SMTP password
* SMTP_HOST = SMTP host
* SMTP_PORT = SMTP port

* CLOUDINARY_NAME = Your Cloudinary name
* CLOUDINARY_API_KEY = Your Cloudinary API key
* CLOUDINARY_API_SECRET = Your Cloudinary API secret

## Technologies Used

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)
* bcrypt.js
* Validator
* nodemailer
* cloudinary
* cookie-parser
* dotenv
* express-fileupload
* otp-generator

# Author
[LinkedIn](https://www.linkedin.com/in/abhishek-ahirwar-85951b217) **Abhishek Ahirwar**

[GitHub](https://github.com/abhishekahirwar) **Abhishek Ahirwar**

[Social Networking API Live Deployment](https://socialnetworkingapi-myhl.onrender.com) **Social Networking API**

[Postman Documentation](https://documenter.getpostman.com/view/24521993/2sA2xnxph5) **Postman API Documentation**
