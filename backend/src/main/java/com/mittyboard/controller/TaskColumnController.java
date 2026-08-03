package com.mittyboard.controller;

import com.mittyboard.dto.TaskColumnRequest;
import com.mittyboard.dto.TaskColumnResponse;
import com.mittyboard.service.TaskColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/columns")
@RequiredArgsConstructor
public class TaskColumnController {

    private final TaskColumnService taskColumnService;


    @PostMapping("/boards/{boardId}")
    public ResponseEntity<TaskColumnResponse> createColumn(
            @PathVariable Long boardId,
            @RequestBody TaskColumnRequest request) {

        TaskColumnResponse response = taskColumnService.createColumn(boardId, request);

        URI location = URI.create("/api/v1/columns/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/boards/{boardId}")
    public ResponseEntity<List<TaskColumnResponse>> getColumns(@PathVariable Long boardId) {

        List<TaskColumnResponse> responses = taskColumnService.getColumnsByBoard(boardId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskColumnResponse> updateColumn(
            @PathVariable Long id,
            @RequestBody TaskColumnRequest request
    ) {
        TaskColumnResponse response = taskColumnService.updateTaskColumn(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long id) {

        taskColumnService.deleteTaskColumn(id);
        return ResponseEntity.noContent().build();
    }
}