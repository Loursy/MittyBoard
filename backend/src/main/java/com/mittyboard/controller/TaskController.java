package com.mittyboard.controller;

import com.mittyboard.dto.TaskRequest;
import com.mittyboard.dto.TaskResponse;
import com.mittyboard.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;


    @PostMapping("/columns/{columnId}")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long columnId,
            @RequestBody TaskRequest request) {

        TaskResponse response = taskService.createTask(columnId, request);
        URI location = URI.create("/api/v1/tasks/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/columns/{columnId}")
    public ResponseEntity<List<TaskResponse>> getTasks(@PathVariable Long columnId) {

        List<TaskResponse> responses = taskService.getTasksByColumn(columnId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody TaskRequest request
    ) {
        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {

        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}