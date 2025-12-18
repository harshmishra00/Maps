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
        <div className="flex h-screen w-full bg-gray-100">


            <aside className="w-80 bg-white shadow-lg flex flex-col">


                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Location Search
                    </h2>
                    <p className="text-sm text-gray-500">
                        Search places & view weather
                    </p>
                </div>


                <div className="px-6 py-4">
                    <div className="flex">
                        <input
                            type="text"
                            placeholder="Enter city or place"
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="rounded-r-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                        >
                            Search
                        </button>
                    </div>
                </div>


                {weather?.main && (
                    <div className="px-6 py-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Weather Overview :
                        </h3>

                        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-5 text-white shadow">
                            <div className="text-4xl font-bold">
                                {weather.main.temp}°C
                            </div>
                            <p className="mt-1 text-sm capitalize opacity-90">
                                {weather.weather[0].description}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <p>Feels like: {weather.main.feels_like}°</p>
                                <p>Humidity: {weather.main.humidity}%</p>
                                <p>Min: {weather.main.temp_min}°</p>
                                <p>Max: {weather.main.temp_max}°</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>


            <main className="relative flex-1">


                <MapContainer
                    center={[27.57, 80.66]}
                    zoom={13}
                    className="h-full w-full"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <FlyToLocation position={position} />

                    {position && (
                        <Marker position={position}>
                            <Popup>You are here</Popup>
                        </Marker>
                    )}
                </MapContainer>

            </main>
        </div>
    );


}

export default BasicMap
