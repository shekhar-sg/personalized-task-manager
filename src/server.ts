import express from "express";

const port = process.env.PORT || 8080;
const app = express();

app.get("/health", (_req, res) => {
	res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
	console.log(`Health check server is running on http://localhost:${port}/health`);
	console.log(`Server is running on http://localhost:${port}`);
});
