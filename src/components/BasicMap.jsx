import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Leaflet marker fix for Vite */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;


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

function BasicMap() {
    const [position, setPosition] = useState(null);
    const [search, setSearch] = useState("");
    const [weather, setWeather] = useState(null);
    const [description, setDescription] = useState("");

    /* Manual location fetch */
    function getUserLocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            },
            () => {
                
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }


    useEffect(() => {
        if (!position) return;

        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${position[0]}&lon=${position[1]}&units=metric&appid=${WEATHER_API_KEY}`
        )
            .then((res) => res.json())
            .then((data) => setWeather(data))
            .catch(() => setWeather(null));
    }, [position]);


    function handleSearch() {
        if (!search) return;

        fetch(
            `https://nominatim.openstreetmap.org/search?q=${search}&format=json`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setPosition([data[0].lat, data[0].lon]);
                }
            });
    }


    useEffect(() => {
        if (!position) return;

        fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
        )
            .then((res) => res.json())
            .then((data) => {
                const place =
                    data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    data.address.state;

                if (!place) return;

                return fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                        place
                    )}`
                );
            })
            .then((res) => res?.json())
            .then((wikiData) => {
                if (wikiData?.extract) {
                    setDescription(wikiData.extract.slice(0, 350) + "…");
                } else {
                    setDescription("");
                }
            })
            .catch(() => setDescription(""));
    }, [position]);

    return (
        <div className="flex h-screen w-full bg-gray-100">
            {/* SIDEBAR */}
            <aside className="w-[360px] bg-white border-r flex flex-col overflow-y-auto">
                {/* Location Button */}
                <div className="sticky top-0 z-10 bg-white border-b px-6 py-4">
                    <button
                        onClick={getUserLocation}
                        className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 
                       px-4 py-3 text-sm font-semibold text-white 
                       hover:from-green-700 hover:to-emerald-700 
                       transition shadow-md"
                    >
                        📍 Use My Current Location
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                        Search Location
                    </label>

                    <div className="flex">
                        <input
                            type="text"
                            placeholder="City, place, landmark..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="rounded-r-lg bg-blue-600 px-5 py-2 text-sm font-semibold 
                         text-white hover:bg-blue-700 transition"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Weather */}
                {weather?.main && (
                    <div className="px-6 py-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                            Weather Overview
                        </h3>

                        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 
                            p-6 text-white shadow-lg">
                            <div className="text-5xl font-bold">
                                {weather.main.temp}°
                            </div>
                            <p className="mt-1 text-sm capitalize opacity-90">
                                {weather.weather[0].description}
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-3 text-sm opacity-90">
                                <p>Feels: {weather.main.feels_like}°</p>
                                <p>Humidity: {weather.main.humidity}%</p>
                                <p>Min: {weather.main.temp_min}°</p>
                                <p>Max: {weather.main.temp_max}°</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                {description && (
                    <div className="px-6 py-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                            About This Place
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {description}
                        </p>
                    </div>
                )}
            </aside>

            {/* MAP */}
            <main className="flex-1 relative">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
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

export default BasicMap;
