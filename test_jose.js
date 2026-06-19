const { SignJWT } = require('jose');
const jwt = new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("3d");
console.log("Works!");
