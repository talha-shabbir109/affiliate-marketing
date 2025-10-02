// 1. Import packages
const express = require("express");

// 2. Create app
const app = express(); //pure server ka control isi k pass hota hy = this line code have all server control
const PORT = 3000;

// 3. Use middleware
app.use(express.json()); // data handle karna JSON data receive karne k liya zaroori hy

// 4. Define routes

app.get("/", (req, res) => {
	//= GET request handle karega  //2// = Client se aaya data  //3//= Client ko bhejna data
	res.json({
		success: true,
		message: "Affiliate Marketing API - Develop Branch",
		branch: "develop",
		timstamp: new DataTransfer().toISOString(),
	});
});
// 5. Start server

//with out this server cannot start
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
