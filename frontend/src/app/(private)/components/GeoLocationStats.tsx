"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/app/lib/api";

interface TrafficLocation {
  lat: number;
  lon: number;
  city: string;
  country: string;
  count: number;
}

interface Props {
  urlId: number;
}

export const TrafficStats: React.FC<Props> = ({ urlId }) => {
  const [locations, setLocations] = useState<TrafficLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await api.get<TrafficLocation[]>(`/urls/${urlId}/traffic/locations`);
        setLocations(res.data);
      } catch (err) {
        console.error("Erro ao buscar localizações", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [urlId]);

  if (loading) return <p className="text-gray-300">Carregando localizações...</p>;
  if (!locations.length) return <p className="text-gray-300">Nenhum acesso registrado ainda.</p>;

  return (
    <MapContainer center={[20, 0]} zoom={2} className="w-full h-64 rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc, idx) => (
        <CircleMarker
          key={idx}
          center={[loc.lat, loc.lon]}
          radius={Math.max(5, Math.log(loc.count + 1) * 3)}
          fillColor="blue"
          color="white"
          weight={1}
          fillOpacity={0.6}
        >
          <Tooltip>
            {loc.city}, {loc.country} ({loc.count} visita{loc.count > 1 ? "s" : ""})
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
