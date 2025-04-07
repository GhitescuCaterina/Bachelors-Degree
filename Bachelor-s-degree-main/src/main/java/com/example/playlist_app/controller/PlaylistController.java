package com.example.playlist_app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/playlists")
@CrossOrigin(origins = "http://localhost:3000")
public class PlaylistController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPlaylists(@RequestParam("userId") String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "timestamp", new Date(),
                "status", 400,
                "error", "Bad Request",
                "path", "/api/playlists"
            ));
        }
        
        List<Map<String, Object>> playlists = new ArrayList<>();
        Map<String, Object> playlist = new HashMap<>();
        playlist.put("playlistId", "dummyPlaylistId");
        playlist.put("title", "Dummy Playlist");
        playlist.put("thumbnails", List.of(Map.of("url", "https://via.placeholder.com/150")));
        playlist.put("created", "2025-02-01T00:00:00Z");
        playlists.add(playlist);
        
        Map<String, Object> response = new HashMap<>();
        response.put("playlists", playlists);
        return ResponseEntity.ok(response);
    }
}
