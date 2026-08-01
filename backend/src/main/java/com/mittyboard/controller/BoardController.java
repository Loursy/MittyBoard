package com.mittyboard.controller;

import com.mittyboard.dto.BoardRequest;
import com.mittyboard.dto.BoardResponse;
import com.mittyboard.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping("/workspaces/{workspaceId}")
    public ResponseEntity<BoardResponse> createBoard(
            @PathVariable Long workspaceId,
            @RequestBody BoardRequest request) {

        BoardResponse response = boardService.createBoard(workspaceId, request);
        URI location = URI.create("/api/v1/boards/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/workspaces/{workspaceId}")
    public ResponseEntity<List<BoardResponse>> getBoards(@PathVariable Long workspaceId) {

        List<BoardResponse> responses = boardService.getBoardsByWorkspace(workspaceId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable Long id,
            @RequestBody BoardRequest request) {

        BoardResponse response = boardService.updateBoard(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {

        boardService.deleteBoard(id);
        return ResponseEntity.noContent().build();
    }
}