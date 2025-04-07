import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/PlaylistPage.css";
import logo from "../assets/logo.png";
import avatarCaterina from "../assets/avatar1.jfif";
import avatarJoxta from "../assets/avatar2.jfif";


const PlaylistPage = () => {
  const { playlistId } = useParams();
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isViewNotesOpen, setIsViewNotesOpen] = useState(false);
  const [members, setMembers] = useState([]);

  const [showWelcome, setShowWelcome] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(123);
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 1,
      userName: "Caterina (cat)",
      userAvatar: avatarCaterina,
      content: "Hey guys, let's add more rock music to this playlist!",
      time: "2 hours ago",
    },
    {
      id: 2,
      userName: "Joxta",
      userAvatar: avatarJoxta,
      content: "Loving the vibe so far. Any jazz fans here?",
      time: "30 minutes ago",
    },
  ]);
  const [newFeedPost, setNewFeedPost] = useState("");
  const [showChat, setShowChat] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/playlist-members?playlistId=${playlistId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch playlist members.");
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching playlist members:", error);
      }
    };
    fetchMembers();
  }, [playlistId]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
      return;
    }

    const fetchPlaylistData = async () => {
      try {
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch playlist details");
        }
        const detailsData = await detailsResponse.json();
        if (!detailsData.items || detailsData.items.length === 0) {
          throw new Error("No playlist details found");
        }

        const itemsResponse = await fetch(
          `http://localhost:8080/api/playlist-items?playlistId=${playlistId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!itemsResponse.ok) {
          throw new Error("Failed to fetch playlist items");
        }
        const itemsData = await itemsResponse.json();

        setPlaylistInfo({
          ...detailsData.items[0].snippet,
          items: itemsData.items,
        });
      } catch (error) {
        console.error("Failed to fetch playlist data:", error);
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("accessToken");
        navigate("/");
      }
    };

    fetchPlaylistData();

    const fetchAllNotes = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/playlist-notes/all?playlistId=${playlistId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        const notesData = await response.json();
        setNotes(notesData);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      }
    };
    fetchAllNotes();
  }, [playlistId, navigate]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const userId = localStorage.getItem("userId") || "Anonymous";

    try {
      const response = await fetch("http://localhost:8080/api/playlist-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId,
          trackId: selectedTrackId,
          userId: userId,
          content: newNote,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const updatedNotes = [
        ...notes,
        { trackId: selectedTrackId, userId: userId, content: newNote },
      ];
      setNotes(updatedNotes);
      setNewNote("");
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/playlist-notes/${noteId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleOpenPopup = (trackId) => {
    setSelectedTrackId(trackId);
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleOpenNotesView = (trackId) => {
    setSelectedTrackId(trackId);
    setIsViewNotesOpen(true);
  };
  const handleCloseNotesView = () => {
    setIsViewNotesOpen(false);
  };

  const getNotesForTrack = (trackId) =>
    notes.filter((note) => note.trackId === trackId);

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const toggleLike = () => {
    setLikeCount((prev) => prev + 1);
  };

  const handlePostToFeed = () => {
    if (!newFeedPost.trim()) return;
    const newId = feedPosts.length + 1;
    const userName = localStorage.getItem("userId") || "AnonymousUser";
    setFeedPosts([
      ...feedPosts,
      {
        id: newId,
        userName: userName,
        userAvatar: "https://via.placeholder.com/50",
        content: newFeedPost,
        time: "Just now",
      },
    ]);
    setNewFeedPost("");
  };

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  if (!playlistInfo) return <p>Loading...</p>;

  return (
    <>
      {showWelcome && (
        <div className="welcome-banner">
          <h2>Welcome to {playlistInfo.title}!</h2>
          <p>Say hello or add a track. Enjoy the vibe!</p>
          <button onClick={handleWelcomeDismiss}>Dismiss</button>
        </div>
      )}

      <header className="playlist-header">
        <div className="header-left">
          <h1>Your Playlist</h1>
        </div>
        <div className="center">
          <img src={logo} alt="Logo" className="header-logo" />
        </div>
      </header>

      <section className="playlist-hero">
        <img
          src={
            playlistInfo.thumbnails?.default?.url ||
            "https://via.placeholder.com/200"
          }
          alt={playlistInfo.title || "Playlist Cover"}
          className="playlist-cover"
        />
        <div className="hero-info">
          <h2 className="hero-title">
            {playlistInfo.title || "Untitled Playlist"}
          </h2>
          <p className="hero-meta">
            {playlistInfo.channelTitle || "Unknown Owner"} |{" "}
            {playlistInfo.items.length} tracks
          </p>
          <div className="hero-members">
            <strong>Members: </strong>
            {members.map((m) => m.displayName || m.userId).join(", ")}
          </div>

          <div className="hero-actions">
            <button className="follow-btn" onClick={toggleFollow}>
              {isFollowing ? "Following ✔" : "Follow"}
            </button>
            <button className="like-btn" onClick={toggleLike}>
              ♥ {likeCount}
            </button>
          </div>
        </div>
      </section>

      <section className="main-content">
        <ul className="tracklist">
          {playlistInfo.items.length > 0 ? (
            playlistInfo.items.map((video, index) => {
              const existingNotes = getNotesForTrack(video.id);
              return (
                <li className="track-item" key={video.id}>
                  <div className="track-thumbnail">
                    <img
                      src={
                        video.snippet.thumbnails?.default?.url ||
                        "https://via.placeholder.com/100"
                      }
                      alt={video.snippet.title}
                    />
                  </div>
                  <div className="track-info">
                    <span className="track-title">
                      {index + 1}. {video.snippet.title}
                    </span>
                    <span className="track-artist">
                      {video.snippet.channelTitle || "Unknown Artist"}
                    </span>
                  </div>

                  <button
                    className="note-button"
                    onClick={() => handleOpenPopup(video.id)}
                  >
                    +
                  </button>

                  {existingNotes.length > 0 && (
                    <button
                      className="note-button chat-btn"
                      onClick={() => handleOpenNotesView(video.id)}
                    >
                      💬
                    </button>
                  )}
                </li>
              );
            })
          ) : (
            <p>Loading Tracks...</p>
          )}
        </ul>

        <section className="playlist-feed">
          <h2>Playlist Feed</h2>
          {feedPosts.map((post) => (
            <div key={post.id} className="feed-post">
              <img
                src={post.userAvatar}
                alt="User Avatar"
                className="feed-avatar"
              />
              <div className="feed-content">
                <div className="feed-userinfo">
                  <strong>{post.userName}</strong>
                  <span className="feed-time">{post.time}</span>
                </div>
                <p>{post.content}</p>
              </div>
            </div>
          ))}

          <div className="feed-new-post">
            <img
              src={avatarCaterina}
              alt="User Avatar"
              className="feed-avatar"
            />
            <textarea
              placeholder="Write something about this playlist..."
              value={newFeedPost}
              onChange={(e) => setNewFeedPost(e.target.value)}
            ></textarea>
            <button onClick={handlePostToFeed}>Post</button>
          </div>
        </section>
      </section>

      <button className="chat-toggle" onClick={toggleChat}>
        {showChat ? "Close Chat" : "Open Chat"}
      </button>

      {showChat && (
        <div className="chat-widget">
          <h4>Live Chat</h4>
          <div className="chat-messages">
            <div className="chat-message">
              <strong>Joxta:</strong> Hello everyone!
            </div>
            <div className="chat-message">
              <strong>Caterina (cat):</strong> Let’s add new songs :)
            </div>
          </div>
          <input type="text" placeholder="Type a message..." />
        </div>
      )}

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note here..."
            />
            <div className="popup-buttons">
              <button onClick={handleAddNote}>Save</button>
              <button onClick={handleClosePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isViewNotesOpen && (
        <div className="view-notes-popup">
          {(() => {
            const notesForTrack = getNotesForTrack(selectedTrackId);
            const groupedNotes = notesForTrack.reduce((acc, note) => {
              const user = note.userId;
              if (!acc[user]) {
                acc[user] = [];
              }
              acc[user].push(note);
              return acc;
            }, {});
            const users = Object.keys(groupedNotes);
            return (
              <div className="notes-columns">
                {users.map((user) => (
                  <div key={user} className="notes-column">
                    <ul className="notes-list">
                      {groupedNotes[user].map((note) => (
                        <li key={note.id} className="note-item">
                          <p>{note.content}</p>
                          <button
                            className="delete-note-btn"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            🗑️
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
          <button className="close-btn" onClick={handleCloseNotesView}>
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default PlaylistPage;
