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
    res.render("index", { weatherData: null, forecastData: null, error: null });
});

app.post("/weather", (req, res) => {
    const city = req.body.city;
    if (!city) {
        return res.render("index", { weatherData: null, forecastData: null, error: "City is required" });
    }

    const apiKey = process.env.ApiId;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    https.get(weatherUrl, (response) => {
        let weatherData = "";
        response.on("data", (chunk) => {
            weatherData += chunk;
        });

        response.on("end", () => {
            const parsedWeatherData = JSON.parse(weatherData);
            if (parsedWeatherData.cod !== 200) {
                return res.render("index", { weatherData: null, forecastData: null, error: "Invalid city name" });
            }

            https.get(forecastUrl, (forecastResponse) => {
                let forecastData = "";
                forecastResponse.on("data", (chunk) => {
                    forecastData += chunk;
                });
                
                forecastResponse.on("end", () => {
                    const parsedForecastData = JSON.parse(forecastData);
                    res.render("index", {
                        weatherData: parsedWeatherData,
                        forecastData: parsedForecastData.list.slice(0, 5), // 5-day forecast
                        error: null
                    });
                });
            });
        });
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});