package com.example.playlist_app.repository;

import com.example.playlist_app.model.PlaylistMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistMemberRepository extends JpaRepository<PlaylistMember, Long> {
    List<PlaylistMember> findByPlaylistId(String playlistId);
}
