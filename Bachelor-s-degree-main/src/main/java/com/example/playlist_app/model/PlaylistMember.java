package com.example.playlist_app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "playlist_members")
public class PlaylistMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String playlistId;

    @Column(nullable = false)
    private String username;

    public PlaylistMember() {}

    public PlaylistMember(String playlistId, String username) {
        this.playlistId = playlistId;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public String getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(String playlistId) {
        this.playlistId = playlistId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}

