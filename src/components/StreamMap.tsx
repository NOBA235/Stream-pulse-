"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { COLORS, S } from "@/lib/ui";
export default function StreamMap({ streams, focus }: { streams: S[]; focus?: string }) {
  const f = streams.find(s => s.id === focus) ?? streams[0];
  return <MapContainer center={f ? [f.lat, f.lng] : [40.45, -79.96]} zoom={focus ? 13 : 12} className="h-80 w-full rounded-lg md:h-[28rem]">
    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {streams.map(s => <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={s.id === focus ? 16 : 11}
      pathOptions={{ color: COLORS[s.status ?? "moderate"], fillOpacity: 0.7 }}>
      <Popup><b>{s.name}</b><br />Score {s.latestScore} ({s.status})<br /><Link href={`/stream/${s.id}`} className="text-primary underline">View details</Link></Popup>
    </CircleMarker>)}
  </MapContainer>;
}
