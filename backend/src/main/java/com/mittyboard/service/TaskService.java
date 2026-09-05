package com.mittyboard.service;

import com.mittyboard.dto.TaskRequest;
import com.mittyboard.dto.TaskResponse;
import com.mittyboard.entity.Task;
import com.mittyboard.entity.TaskColumn;
import com.mittyboard.entity.User;
import com.mittyboard.exception.ResourceNotFoundException;
import com.mittyboard.exception.UnauthorizedAccessException;
import com.mittyboard.repository.TaskColumnRepository;
import com.mittyboard.repository.TaskRepository;
import com.mittyboard.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final SimpMessagingTemplate messagingTemplate;
    private final TaskRepository taskRepository;
    private final TaskColumnRepository taskColumnRepository;
    private final CurrentUserService currentUserService;

    public TaskResponse createTask(Long columnId, TaskRequest request) {
        User currentUser = currentUserService.getAuthenticatedUser();

        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column cannot be found!"));

        if (!column.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to add Tasks to this Column");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .column(column)
                .priority(request.getPriority())
                .status(request.getStatus())
                .position(request.getPosition())
                .build();

        Task savedTask = taskRepository.save(task);
        TaskResponse response = mapToResponse(savedTask);

        // Broadcast the DTO, not the JPA entity: the entity's lazy associations form a
        // cycle (Task -> column -> board -> taskColumns -> column -> ...) that blows up
        // Jackson serialization for the WebSocket message.
        messagingTemplate.convertAndSend("/topic/boards/" + savedTask.getColumn().getBoard().getId(), response);

        return response;
    }

    public List<TaskResponse> getTasksByColumn(Long columnId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Column cannot be found!"));

        if (!column.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You don't have access to see this column");
        }

        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);

        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTask(Long taskId, TaskRequest request) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task cannot be found!"));

        if (!task.getColumn().getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this task!");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        if (request.getPosition() != null) {
            task.setPosition(request.getPosition());
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        if (request.getColumnId() != null && !request.getColumnId().equals(task.getColumn().getId())) {
            TaskColumn targetColumn = taskColumnRepository.findById(request.getColumnId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target column cannot be found!"));

            if (!targetColumn.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("You are not authorized to move this task to that column!");
            }

            task.setColumn(targetColumn);
        }

        Task updatedTask = taskRepository.save(task);
        TaskResponse response = mapToResponse(updatedTask);

        messagingTemplate.convertAndSend("/topic/boards/" + updatedTask.getColumn().getBoard().getId(), response);

        return response;
    }

    public void deleteTask(Long taskId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task cannot be found!"));

        if (!task.getColumn().getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this Task!");
        }


        Long boardId = task.getColumn().getBoard().getId();

        taskRepository.delete(task);

        messagingTemplate.convertAndSend("/topic/boards/" + boardId, taskId);
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .columnId(task.getColumn().getId())
                .priority(task.getPriority())
                .position(task.getPosition())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .build();
    }
}