const express = require("express");
const app = express();
const port =  process.env.port || 3000;
app.get("/test", (request, response) => {
    response.send("Hello World");
});
app.listen(port, () => console.log(`Listening on port ${port}`));