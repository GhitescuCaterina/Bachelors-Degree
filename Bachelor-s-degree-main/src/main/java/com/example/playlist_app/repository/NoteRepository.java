package com.example.playlist_app.repository;

import com.example.playlist_app.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByPlaylistIdAndUserId(String playlistId, String userId);
    List<Note> findByPlaylistId(String playlistId);
    Optional<Note> findByPlaylistIdAndTrackIdAndUserId(String playlistId, String trackId, String userId);
}
