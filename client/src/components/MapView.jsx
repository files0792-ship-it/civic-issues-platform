import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ issues }) {
  const customIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {issues.map((issue) =>
        issue.coordinates ? (
          <Marker
            key={issue.id}
            position={issue.coordinates}
            icon={customIcon}
          >
            <Popup>
              <strong>{issue.title}</strong>
              <br />
              {issue.location}
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}