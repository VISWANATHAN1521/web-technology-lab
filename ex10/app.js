const http = require("http");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const PORT = 3000;
const client = new MongoClient("mongodb://127.0.0.1:27017");

const server = http.createServer(function (req, res) {
  if (req.url === "/" && req.method === "GET") {
    // Send the registration form
    fs.readFile(__dirname + "/home.html", function (err, data) {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Unable to load the form");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.url === "/server" && req.method === "POST") {
    // Read the submitted form data
    let body = "";
    req.on("data", function (chunk) {
      body += chunk.toString();
    });
    req.on("end", async function () {
      const params = new URLSearchParams(body);
      const user = {
        name: params.get("name"),
        password: params.get("password"),
        age: Number(params.get("age")),
        mobile: params.get("mobile"),
        email: params.get("email"),
        gender: params.get("gender"),
        state: params.get("state"),
        skills: params.getAll("skills")
      };
      try {
        await client.connect();
        const users = client.db("registrationDB").collection("users");
        const result = await users.insertOne(user);
        const saved = await users.findOne({ _id: result.insertedId });
        const allUsers = await users.find().toArray();
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(showDetails(saved, allUsers));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Database error: " + error.message);
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Page not found");
  }
});

// Build the HTML page that shows the stored details in tables
function showDetails(user, allUsers) {
  let rows = "";
  allUsers.forEach(function (u, i) {
    rows += "<tr><td>" + (i + 1) + "</td><td>" + u.name + "</td><td>" + u.age +
            "</td><td>" + u.email + "</td><td>" + u.state + "</td></tr>";
  });
  return `<!DOCTYPE html>
<html>
<head>
  <title>Registration Details</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f0fdf4; text-align: center; }
    table { margin: 15px auto; border-collapse: collapse; min-width: 450px; }
    th, td { border: 1px solid #15803d; padding: 8px 14px; }
    th { background-color: #16a34a; color: #ffffff; }
    h2 { color: #15803d; }
  </style>
</head>
<body>
  <h2>Registration Successful - Details Stored in MongoDB</h2>
  <table>
    <tr><th>Field</th><th>Value</th></tr>
    <tr><td>Document ID</td><td>${user._id}</td></tr>
    <tr><td>Name</td><td>${user.name}</td></tr>
    <tr><td>Age</td><td>${user.age}</td></tr>
    <tr><td>Mobile Number</td><td>${user.mobile}</td></tr>
    <tr><td>Email</td><td>${user.email}</td></tr>
    <tr><td>Gender</td><td>${user.gender}</td></tr>
    <tr><td>State</td><td>${user.state}</td></tr>
    <tr><td>Skills</td><td>${user.skills.join(", ")}</td></tr>
  </table>
  <h2>All Registered Users</h2>
  <table>
    <tr><th>S.No</th><th>Name</th><th>Age</th><th>Email</th><th>State</th></tr>
    ${rows}
  </table>
  <p><a href="/">Register another user</a></p>
</body>
</html>`;
}

server.listen(PORT, function () {
  console.log("Server running at http://localhost:" + PORT);
});
