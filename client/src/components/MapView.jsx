import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import { getIssueGroupKey } from "../utils/indianLocations.js";

export default function MapView({ issues }) {
  const [hoveredLocation, setHoveredLocation] = useState(null);

  // Group issues by city + state (or legacy location string)
  const groupedIssues = issues.reduce((acc, issue) => {
    const groupKey = getIssueGroupKey(issue);
    if (!groupKey) return acc;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        coordinates: null,
        location: issue.location,
        issues: [],
      };
    }

    acc[groupKey].issues.push(issue);

    if (!acc[groupKey].coordinates && issue.coordinates) {
      acc[groupKey].coordinates = issue.coordinates;
    }

    return acc;
  }, {});

  // Only keep groups that have valid coordinates
  const locationGroups = Object.values(groupedIssues).filter(group => group.coordinates !== null);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#22c55e';
      case 'In Progress': return '#3b82f6';
      default: return '#f59e0b';
    }
  };

  return (
    <MapContainer
      center={[22.9734, 78.6569]}
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {locationGroups.map((group, index) => (
        <Marker
          key={JSON.stringify(group.coordinates)}
          position={group.coordinates}
          icon={hoveredLocation === index ? hoverIcon : normalIcon}
          eventHandlers={{
            mouseover: () => setHoveredLocation(index),
            mouseout: () => setHoveredLocation(null),
          }}
        >
          <Popup>
            <div style={{ minWidth: "280px", maxHeight: "400px", overflowY: "auto" }}>
              {group.issues.length === 1 ? (
                // Single issue - preserve current behavior
                <div>
                  <strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                    {group.issues[0].title}
                  </strong>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                    📍 {group.issues[0].location}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                    📊 Status: {group.issues[0].status}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    ⚡ Priority: {group.issues[0].predictedPriority} {getPriorityLabel(group.issues[0].predictedPriority)}
                  </div>
                </div>
              ) : (
                // Multiple issues - show as cards
                <div>
                  <div style={{ 
                    fontSize: "13px", 
                    fontWeight: "bold", 
                    marginBottom: "12px", 
                    paddingBottom: "8px",
                    borderBottom: "1px solid #e5e7eb" 
                  }}>
                    📍 {group.location} ({group.issues.length} issue{group.issues.length > 1 ? 's' : ''})
                  </div>
                  {group.issues.map((issue, idx) => (
                    <div 
                      key={issue.id}
                      style={{ 
                        marginBottom: idx < group.issues.length - 1 ? "12px" : "0",
                        paddingBottom: idx < group.issues.length - 1 ? "12px" : "0",
                        borderBottom: idx < group.issues.length - 1 ? "1px solid #f3f4f6" : "none"
                      }}
                    >
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: "600", 
                        marginBottom: "6px",
                        color: "#1f2937" 
                      }}>
                        {issue.title}
                      </div>
                      <div style={{ 
                        display: "flex", 
                        gap: "8px", 
                        marginBottom: "6px",
                        flexWrap: "wrap" 
                      }}>
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: getStatusColor(issue.status) + "20",
                          color: getStatusColor(issue.status),
                          fontWeight: "500"
                        }}>
                          {issue.status}
                        </span>
                        <span style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: getPriorityColor(issue.predictedPriority) + "20",
                          color: getPriorityColor(issue.predictedPriority),
                          fontWeight: "500"
                        }}>
                          {getPriorityLabel(issue.predictedPriority)}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#6b7280", 
                        marginBottom: "6px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: "1.4"
                      }}>
                        {issue.description}
                      </div>
                      <div style={{ 
                        fontSize: "11px", 
                        color: "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>👍</span>
                        <span>{issue.upvoteCount} upvote{issue.upvoteCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}