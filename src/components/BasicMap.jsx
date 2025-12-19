import React, { useEffect, useState } from "react";
import Snowfall from "react-snowfall";
import snow1 from "../assets/snow1.png";
import snow2 from "../assets/snow2.png";
import snow3 from "../assets/snow3.png";
import { useMemo } from "react";
import {
    MapContainer,
    Marker,
    TileLayer,
    Popup,
    useMap,
    useMapEvents,
} from "react-leaflet";
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



function FlyToLocation({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 13, {
                animate: true,
                duration: 2,
            });
        }
    }, [position, map]);

    return null;
}

function MapClickHandler({ setPosition, addToHistory }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            addToHistory(lat, lng, "Map click");
        },
    });

    return null;
}



function BasicMap() {
    const [position, setPosition] = useState(null);
    const [satellite, setSatellite] = useState(true);
    const [search, setSearch] = useState("");
    const [weather, setWeather] = useState(null);
    const [description, setDescription] = useState("");
    const [history, setHistory] = useState([]);



    function addToHistory(lat, lon, label = "Selected place") {
        const entry = {
            id: Date.now(),
            lat,
            lon,
            label,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setHistory((prev) => {
            const updated = [entry, ...prev];
            return updated.slice(0, 3);
        });
    }



    function getUserLocation() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                setPosition([lat, lon]);
                addToHistory(lat, lon, "My location");
            },
            () => { },
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
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                search
            )}&format=json`
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    setPosition([lat, lon]);
                    addToHistory(lat, lon, data[0].display_name.split(",")[0]);
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



    const snowflake1 = useMemo(() => {
        const image = new Image();
        image.src = snow1;
        return image;
    }, []);
    const snowflake2 = useMemo(() => {
        const image = new Image();
        image.src = snow2;
        return image;
    }, []);
    const snowflake3 = useMemo(() => {
        const image = new Image();
        image.src = snow3;
        return image;
    }, []);

    const images = [snowflake1, snowflake2, snowflake3];

    return (
        <>
            <div className="pointer-events-none fixed inset-0 z-[9999]">
                <Snowfall
                    images={images}
                    snowflakeCount={80}
                    radius={[7, 15]}
                    speed={[2, 3]}
                    wind={[1, 3]}
                />
            </div>
            <div className="flex h-screen w-full flex-col md:flex-row">

                <aside className="order-2 flex h-[45vh] w-full flex-col overflow-y-auto bg-gray-100 border-r md:order-1 md:h-full md:w-[360px]">
                    <div className="sticky top-0 z-10 border-b bg-white px-6 py-4 flex flex-col gap-2">
                        <button
                            onClick={getUserLocation}
                            className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-green-700 hover:to-emerald-700"
                        >
                            📍 Use My Current Location
                        </button>
                        <button
                            onClick={() => setSatellite(!satellite)}
                            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-900"
                        >
                            {satellite ? "🗺️ Show Map View" : "🛰️ Show Satellite View"}
                        </button>
                    </div>

                    <div className="space-y-2 px-6 py-4">
                        <label className="text-xs font-semibold uppercase text-gray-500">
                            Search Location
                        </label>

                        <div className="flex">
                            <input
                                type="text"
                                placeholder="City, place, landmark..."
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 rounded-l-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSearch}
                                className="rounded-r-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <div className="border-t px-6 py-4">
                            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
                                Recent Locations
                            </h3>

                            <ul className="space-y-2">
                                {history.map((item) => (
                                    <li
                                        key={item.id}
                                        onClick={() => setPosition([item.lat, item.lon])}
                                        className="cursor-pointer rounded-lg border px-3 py-2 transition hover:bg-gray-100"
                                    >
                                        <div className="truncate font-medium text-gray-800">
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-gray-500">{item.time}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {weather?.main && (
                        <div className="px-6 py-4">
                            <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                                Weather Overview
                            </h3>

                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
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

                    {description && (
                        <div className="px-6 py-4">
                            <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                                About This Place
                            </h3>
                            <p className="text-sm leading-relaxed text-gray-700">
                                {description}
                            </p>
                        </div>
                    )}
                </aside>

                <main className="order-1 relative h-[55vh] flex-1 md:order-2 md:h-full">

                    <MapContainer center={[20, 0]} zoom={2} className="h-full w-full">
                        {satellite ? (
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                            />
                        ) : (
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        )}

                        <MapClickHandler
                            setPosition={setPosition}
                            addToHistory={addToHistory}
                        />

                        <FlyToLocation position={position} />

                        {position && (
                            <Marker position={position}>
                                <Popup>Selected location</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </main>
            </div>
        </>
    );
}

export default BasicMap;
