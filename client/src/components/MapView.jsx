import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ issues }) {
  return (
    <MapContainer
      center={[22.9734, 78.6569]} // India center
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {issues.map((issue) =>
        issue.coordinates ? (
          <Marker key={issue.id} position={issue.coordinates}>
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