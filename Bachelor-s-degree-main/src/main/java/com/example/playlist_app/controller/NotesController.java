package com.example.playlist_app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import com.example.playlist_app.model.Note;
import com.example.playlist_app.model.PlaylistMember;
import com.example.playlist_app.repository.NoteRepository;
import com.example.playlist_app.repository.PlaylistMemberRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class NotesController {

    @Autowired
    private NoteRepository noteRepository;
    private PlaylistMemberRepository playlistMemberRepository;

    @PostMapping("/api/playlist-members")
    public ResponseEntity<String> addMemberToPlaylist(@RequestBody PlaylistMember member) {
        playlistMemberRepository.save(member);
        return ResponseEntity.ok("Member added successfully.");
    }

    @GetMapping("/api/playlist-members")
    public ResponseEntity<List<PlaylistMember>> getMembers(@RequestParam String playlistId) {
        List<PlaylistMember> members = playlistMemberRepository.findByPlaylistId(playlistId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/api/shared-notes")
    public ResponseEntity<List<Note>> getSharedNotes(@RequestParam String playlistId) {
        List<Note> notes = noteRepository.findByPlaylistId(playlistId);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/api/playlist-notes")
    public ResponseEntity<String> addNoteToDatabase(@RequestBody Note note) {
        if (note.getPlaylistId() == null || note.getTrackId() == null ||
            note.getUserId() == null || note.getContent() == null) {
            return ResponseEntity.badRequest().body("Invalid note data");
        }
        noteRepository.save(note);
        return ResponseEntity.ok("Note added successfully");
    }

    @GetMapping("/api/playlist-notes")
    public ResponseEntity<List<Note>> getNotesFromDatabase(
            @RequestParam("playlistId") String playlistId,
            @RequestParam("userId") String userId) {
        List<Note> notes = noteRepository.findByPlaylistIdAndUserId(playlistId, userId);
        return ResponseEntity.ok(notes);
    }


    @DeleteMapping("/api/playlist-notes/{noteId}")
    public ResponseEntity<String> deleteNoteById(@PathVariable Long noteId) {
        Optional<Note> noteToDelete = noteRepository.findById(noteId);
        if (noteToDelete.isPresent()) {
            noteRepository.delete(noteToDelete.get());
            return ResponseEntity.ok("Note deleted successfully");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found");
    }


    @GetMapping("/api/playlist-notes/all")
    public ResponseEntity<List<Note>> getAllNotesFromPlaylist(@RequestParam("playlistId") String playlistId) {
        List<Note> notes = noteRepository.findByPlaylistId(playlistId);
        return ResponseEntity.ok(notes);
    }
}