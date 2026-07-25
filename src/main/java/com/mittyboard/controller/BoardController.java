package com.mittyboard.controller;

import com.mittyboard.dto.BoardRequest;
import com.mittyboard.dto.BoardResponse;
import com.mittyboard.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(@RequestBody BoardRequest request) {
        BoardResponse response = boardService.createBoard(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    public ResponseEntity<List<BoardResponse>> getBoards(@RequestParam Long workspaceId) {
        List<BoardResponse> responses = boardService.getBoardsByWorkspace(workspaceId);
        return ResponseEntity.ok(responses);
    }
}
