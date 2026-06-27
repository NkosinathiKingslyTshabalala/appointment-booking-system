import express from "express";

const app = express();

const PORT = 5000;

app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        message: "Appointment API running"
    });
});


app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});