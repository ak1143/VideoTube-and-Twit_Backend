in models -> user , video.model.js

user ke andar id nahi bnata , automatically bnata hai  and wo bson mein hota hai , research kro(bson)

video and image -> string storrf in 3rd party service like cloudinary or AWS

learn about indexes in Db , what is index:true?

Install -
`npm i mongoose-aggregate-paginate-v2`
use it in video.model.js

Install - 
`npm i bcrypt jsonwebtoken`

bcrypt - lets you hash your passwords
jsonwebtoken - create tokens , encods payloads(userData) with header(crypto algo), payload , verify signature

use it in user.model.js
 But
How to encrypt?
we make use of mongoose hooks[middleware function], in which one is pre hook , which performs operation just before some operation is going to be performed.

In our context, encrypt userData just before saving it
Dont use arrow in pre as they dont have this context
```js
userSchema.pre("save",async function (next){
    this.password = bcrypt.hash(this.password,10);
    next();
})
```
problem -> whenever user is making changes in userSchema , the password field is being encrypted for each save

we want password field to be encrypted only when password in userSchema is being changed
So we write if statement, 

we can also create custome method to check is Password correct
```js
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// custom method
userSchema.methods.isPasswordCorrect = async function (password) {
  // returns result , which is boolean
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshTokens = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
```

jwt is bearer token -> who has this token only they can access info

what is access token and refresh token, what is need?
**Access Tokens and Refresh Tokens:**

1. **Access Token:**
   - **What is it?** An access token is like a key card that grants permission to access specific resources or perform certain actions on a server.
   - **Use Case:** When you log in to a website, the server provides you with an access token. You include this token in subsequent requests to prove that you are authenticated and authorized to access certain parts of the website.

2. **Refresh Token:**
   - **What is it?** A refresh token is like a special key that allows you to get a new access token without going through the full login process again.
   - **Use Case:** Access tokens have a limited lifespan. When they expire, you can use a refresh token to request a new access token without requiring the user to log in again. It enhances security by reducing the need to store long-lived access tokens.

**Difference Between Them:**

- **Lifespan:**
  - *Access Token:* Short-lived, usually valid for a short period (e.g., 15 minutes).
  - *Refresh Token:* Longer-lived, valid for a longer duration (e.g., several days).

- **Usage:**
  - *Access Token:* Used to access protected resources on the server.
  - *Refresh Token:* Used to obtain a new access token when the current one expires.

- **Storage:**
  - *Access Token:* Stored on the client side (e.g., in a browser's memory or a mobile app).
  - *Refresh Token:* Ideally stored securely on the server side (not exposed to the client).

**Example in Web Development:**

Let's say you log in to a social media website:

1. **Login (Authentication):**
   - After entering your username and password, the server provides you with an access token (the key card).

2. **Accessing Resources:**
   - With the access token, you can now request your profile information, posts, or other resources from the server.

3. **Token Expiry:**
   - The access token has a limited lifespan (e.g., 15 minutes).

4. **Using Refresh Token:**
   - When the access token expires, instead of logging in again, you use the refresh token to request a new access token without re-entering credentials.

In summary, access tokens grant access to specific resources, while refresh tokens help in obtaining new access tokens without requiring the user to log in again. This mechanism improves security and user experience in web applications.


what is jwt.sign()?
The provided code is part of a user authentication system, and it is associated with a user schema in a backend application, possibly built using a framework like Express.js and a database like MongoDB. Let's break it down:

1. **Purpose of the Code:**
   - The code is defining methods (`generateAccessTokens` and `generateRefreshTokens`) for a user schema. These methods are intended to generate JWTs (JSON Web Tokens) for access and refresh purposes.

2. **`jwt.sign()` Method:**
   - `jwt.sign()` is a function provided by the `jsonwebtoken` library, commonly used in Node.js applications for creating JWTs.
   - It takes three main parameters:
     - **Payload:** The information you want to include in the token (e.g., user ID, username, email).
     - **Secret Key:** A secret key known only to the server for signing the token. It ensures that the token has not been tampered with.
     - **Options:** Additional options, such as the token's expiration time (`expiresIn`).

3. **`generateAccessTokens` Method:**
   - **Purpose:**
     - Generates an access token containing user information.
   - **Payload:**
     - The payload includes user-related information such as user ID (`_id`), username, email, and full name.
   - **Secret Key:**
     - It uses the secret key specified in `process.env.ACCESS_TOKEN_SECRET`. This key should be kept secret to maintain the security of the tokens.
   - **Options:**
     - The access token is set to expire after a specified duration (`process.env.ACCESS_TOKEN_EXPIRY`).

4. **`generateRefreshTokens` Method:**
   - **Purpose:**
     - Generates a refresh token containing minimal information, typically just the user ID.
   - **Payload:**
     - The payload includes only the user ID (`_id`).
   - **Secret Key:**
     - It uses the secret key specified in `process.env.REFRESH_TOKEN_SECRET`.
   - **Options:**
     - The refresh token is set to expire after a specified duration (`process.env.REFRESH_TOKEN_EXPIRY`).

**Use Case in Web Development:**
- **Access Token:**
  - The access token is used for authenticating and authorizing requests. It is sent by the client (e.g., a web browser or a mobile app) in the `Authorization` header of HTTP requests to access protected resources on the server.

- **Refresh Token:**
  - The refresh token is typically stored securely on the client side. When the access token expires, the refresh token is used to obtain a new access token without requiring the user to log in again.

In summary, these methods play a crucial role in user authentication by providing secure access and refresh tokens for a given user, allowing them to interact with protected resources on the server.

what Jwt and bcrypt?
**JWT (JSON Web Token):**

1. **What is it?** JWT is a compact, URL-safe means of representing claims to be transferred between two parties. These claims are often used to encode user authentication information or to convey information between a server and a client.

2. **Use Case in Web Development:**
   - **Authentication:** When a user logs in, the server generates a JWT containing information like user ID and roles. This token is then sent to the client, and the client includes it in subsequent requests. The server can verify the JWT to ensure the user is authenticated and determine their permissions.

   - **Stateless Sessions:** JWTs allow for stateless authentication. Since the token contains necessary information, the server doesn't need to store session data, making it scalable and easy to implement in distributed systems.

**bcrypt:**

1. **What is it?** bcrypt is a password-hashing function designed to be slow and computationally intensive. This makes it resilient against brute-force attacks and rainbow table attacks.

2. **Use Case in Web Development:**
   - **Password Hashing:** When a user creates an account or updates their password, bcrypt is used to hash and store the password securely. The hashed password is stored in the database instead of the actual password.

   - **Verification:** When a user attempts to log in, bcrypt is used to hash the entered password, and the hash is compared with the stored hash in the database. If they match, the password is correct. This protects user passwords even if the database is compromised.

**Example in Web Development:**

Let's consider a user authentication scenario:

1. **JWT Example:**
   - **User Login:**
     - When a user logs in, the server generates a JWT containing user information.
     - Example JWT Payload: `{ "userId": 123, "username": "john_doe", "role": "user" }`.

   - **Token Verification:**
     - The server signs this token and sends it to the client.
     - The client includes this JWT in the Authorization header of subsequent requests.
     - The server verifies the JWT's signature to ensure its authenticity and extracts user information.

2. **bcrypt Example:**
   - **Password Storage:**
     - When a user sets or updates their password, bcrypt hashes the password before storing it in the database.
     - Instead of storing the password directly, the hash is stored.
     - Example Hash: `$2a$12$rJp2rU.aFq9cQJc9XakTaeuhLKqUgq8Sy5exv6ZpQCC.Wg2aunopC`

   - **Password Verification:**
     - During login, bcrypt hashes the entered password and compares it with the stored hash in the database.
     - If the hashes match, the entered password is correct.

In summary, JWTs are used for secure information exchange, especially in authentication, while bcrypt is used for secure password hashing and verification. They contribute to a robust and secure web development environment.