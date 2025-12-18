import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, TileLayer, Popup, useMap } from 'react-leaflet'
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});


const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;


function BasicMap() {

    const [position, setPosition] = useState([27.57, 80.66])
    const [search, setSearch] = useState("")
    const [weather, setWeather] = useState(null)


    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setPosition([pos.coords.latitude, pos.coords.longitude])
        })
    }, [])

    useEffect(() => {
        if (!position) return;

        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${position[0]}&lon=${position[1]}&units=metric&appid=${WEATHER_API_KEY}`
        )
            .then(res => {
                if (!res.ok) {
                    throw new Error("Weather API error");
                }
                return res.json();
            })
            .then(data => setWeather(data))
            .catch(err => {
                console.error(err);
                setWeather(null);
            });
    }, [position]);



    function FlyToLocation({ position }) {
        const map = useMap();

        useEffect(() => {
            if (position) {
                map.flyTo(position, 13, {
                    animate: true,
                    duration: 2.5,
                });
            }
        }, [position, map]);

        return null;
    }

    function handleSearch() {
        fetch(`https://nominatim.openstreetmap.org/search?q=${search}&format=json`).then((res) => res.json()).then(data => {
            if (data.length > 0) {
                setPosition([data[0].lat, data[0].lon])
            }
        })
    }


    return (
        <>
            <div>
                <input type="text" placeholder='Search location' onChange={(e) => setSearch(e.target.value)} />
                <button onClick={handleSearch} >Search</button>
            </div>
            {weather?.main && (
                <div style={{ padding: 10, background: "white" }}>
                    <h3>Weather</h3>
                    <p>🌡️ {weather.main.temp} °C</p>
                    <p>☁️ {weather.weather[0].description}</p>
                    <p>💨 Wind: {weather.wind.speed} m/s</p>
                </div>
            )}


            <MapContainer
                center={[27.57, 80.66]}
                zoom={13}
                style={{ height: "100vh", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FlyToLocation position={position} />

                {
                    position && (
                        <Marker position={position} >
                            <Popup>You are here</Popup>
                        </Marker>
                    )
                }



            </MapContainer>
        </>
    )
}

export default BasicMap
