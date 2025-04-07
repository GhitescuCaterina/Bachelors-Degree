import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

const Dashboard = () => {
  const [playlists, setPlaylists] = useState([]);
  const [sortedPlaylists, setSortedPlaylists] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("name-asc");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8080/api/ytmusic-playlists`)
      .then((response) => response.json())
      .then((data) => {
        if (data.playlists) {
          setPlaylists(data.playlists);
        } else if (data.error) {
          console.error("Error fetching YTMusic playlists:", data.error);
        } else {
          console.error("No playlists found:", data);
        }
      })
      .catch((error) => console.error("Error fetching playlists:", error));
  }, []);

  useEffect(() => {
    setSortedPlaylists(sortPlaylists([...playlists], sortCriteria));
  }, [playlists, sortCriteria]);

  const sortPlaylists = (list, criteria) => {
    return list.sort((a, b) => {
      switch (criteria) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "date-asc":
          return new Date(a.created) - new Date(b.created);
        case "date-desc":
          return new Date(b.created) - new Date(a.created);
        default:
          return 0;
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Your Playlists</h1>
        </div>
        <div className="header-center">
          <img src="logo.png" alt="Logo" className="dashboard-logo" />
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="sort-container">
        <label htmlFor="sort">Sort by: </label>
        <select
          id="sort"
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
        >
          <option value="name-asc">Alphabetical (A-Z)</option>
          <option value="name-desc">Alphabetical (Z-A)</option>
          <option value="date-asc">Creation Date (Oldest First)</option>
        </select>
      </div>

      <div className="playlist-grid">
        {sortedPlaylists.length > 0 ? (
          sortedPlaylists.map((playlist) => (
            <div
              key={playlist.playlistId}
              className="playlist-card"
              onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
            >
              <img
                src={playlist.thumbnails?.[0]?.url || "https://via.placeholder.com/150"}
                alt={playlist.title}
                className="playlist-thumbnail"
              />
              <h3 className="playlist-title">{playlist.title}</h3>
            </div>
          ))
        ) : (
          <p>No playlists available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
