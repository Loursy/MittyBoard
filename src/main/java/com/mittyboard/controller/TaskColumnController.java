package com.mittyboard.controller;

import com.mittyboard.dto.TaskColumnRequest;
import com.mittyboard.dto.TaskColumnResponse;
import com.mittyboard.service.TaskColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/columns")
@RequiredArgsConstructor
public class TaskColumnController {

    private final TaskColumnService taskColumnService;

    @PostMapping
    public ResponseEntity<TaskColumnResponse> createColumn(@RequestBody TaskColumnRequest request) {
        TaskColumnResponse response = taskColumnService.createColumn(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskColumnResponse>> getColumns(@RequestParam Long boardId) {
        List<TaskColumnResponse> responses = taskColumnService.getColumnsByBoard(boardId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping
    public ResponseEntity<TaskColumnResponse> updateColumn(
            @PathVariable Long id,
            @RequestBody TaskColumnRequest request
    ) {
        TaskColumnResponse response = taskColumnService.updateTaskColumn(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteColumn(@PathVariable Long id) {
        taskColumnService.deleteTaskColumn(id);
        return ResponseEntity.noContent().build();
    }
}