import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export default function MapView({ issues }) {
  const [hoveredIssue, setHoveredIssue] = useState(null);

  // Create custom icons for normal and hover states
  const normalIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const hoverIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [35, 57], // Enlarged size
    iconAnchor: [17, 57],
    className: "hover-marker"
  });

  const getPriorityColor = (priority) => {
    if (priority >= 70) return "#ef4444"; // red
    if (priority >= 40) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  const getPriorityLabel = (priority) => {
    if (priority >= 70) return "🔴 High";
    if (priority >= 40) return "🟡 Medium";
    return "🟢 Low";
  };

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
            icon={hoveredIssue === issue.id ? hoverIcon : normalIcon}
            eventHandlers={{
              mouseover: () => setHoveredIssue(issue.id),
              mouseout: () => setHoveredIssue(null),
            }}
          >
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                  {issue.title}
                </strong>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  📍 {issue.location}
                </div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  📊 Status: {issue.status}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  ⚡ Priority: {issue.predictedPriority} {getPriorityLabel(issue.predictedPriority)}
                </div>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}