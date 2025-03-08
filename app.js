import express from "express";
import https from "https";
import bodyParser from "body-parser"; 
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index", { weatherData: null, error: null });
});

app.post("/weather", (req, res) => {
    const city = req.body.city;

    if (!city) {
        return res.render("index", { weatherData: null, error: "City is required" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.ApiId}`;

    https.get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
            data += chunk;
        });

        response.on("end", () => {
            try {
                const weatherData = JSON.parse(data);
                if (weatherData.cod !== 200) {
                    return res.render("index", { weatherData: null, error: "Invalid city name" });
                }

                const temperature = (weatherData.main.temp - 273.15).toFixed(2);
                const weatherMain = weatherData.weather[0].main;
                const icon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

                res.render("index", {
                    weatherData: { temperature, weatherMain, icon, city },
                    error: null
                });
            } catch (error) {
                res.render("index", { weatherData: null, error: "Error processing weather data" });
            }
        });
    });
});


app.listen(process.env.PORT, () => {
    console.log("Server started on port 3000");
});
