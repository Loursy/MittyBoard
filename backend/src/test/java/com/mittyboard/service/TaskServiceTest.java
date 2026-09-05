package com.mittyboard.service;

import com.mittyboard.dto.TaskRequest;
import com.mittyboard.dto.TaskResponse;
import com.mittyboard.entity.Board;
import com.mittyboard.entity.Task;
import com.mittyboard.entity.TaskColumn;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.enums.Priority;
import com.mittyboard.enums.TaskStatus;
import com.mittyboard.exception.ResourceNotFoundException;
import com.mittyboard.exception.UnauthorizedAccessException;
import com.mittyboard.repository.TaskColumnRepository;
import com.mittyboard.repository.TaskRepository;
import com.mittyboard.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskColumnRepository taskColumnRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private TaskService taskService;

    // ==========================================
    // CREATE TASK TESTS
    // ==========================================

    @Test
    void shouldCreateTask_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setDescription("Task Description");
        request.setPosition(1);

        request.setPriority(Priority.HIGH);
        request.setStatus(TaskStatus.TODO);

        Task savedTask = Task.builder()
                .id(100L)
                .title("New Task")
                .description("Task Description")
                .position(1)

                .priority(Priority.HIGH)
                .status(TaskStatus.TODO)

                .column(mockColumn)
                .build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskColumnRepository.findById(10L)).thenReturn(Optional.of(mockColumn));
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // WHEN
        TaskResponse response = taskService.createTask(10L, request);

        // THEN
        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("New Task", response.getTitle());
        assertEquals(Priority.HIGH, response.getPriority());
        assertEquals(TaskStatus.TODO, response.getStatus());
        assertEquals(10L, response.getColumnId());

        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void shouldThrowException_whenCreatingTask_andColumnNotFound() {
        // GIVEN
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");

        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(taskColumnRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            taskService.createTask(99L, request);
        });

        assertEquals("Column cannot be found!", exception.getMessage());
        verify(taskRepository, never()).save(any());
    }

    @Test
    void shouldThrowException_whenCreatingTask_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        TaskRequest request = new TaskRequest();
        request.setTitle("Hacker Task");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(taskColumnRepository.findById(10L)).thenReturn(Optional.of(mockColumn));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskService.createTask(10L, request);
        });

        assertEquals("You are not authorized to add Tasks to this Column", exception.getMessage());
        verify(taskRepository, never()).save(any());
    }

    // ==========================================
    // GET TASKS BY COLUMN TESTS
    // ==========================================

    @Test
    void shouldReturnTasks_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        Task task1 = Task.builder().id(100L).title("Task 1").position(1).column(mockColumn).build();
        Task task2 = Task.builder().id(101L).title("Task 2").position(2).column(mockColumn).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskColumnRepository.findById(10L)).thenReturn(Optional.of(mockColumn));
        when(taskRepository.findByColumnIdOrderByPositionAsc(10L)).thenReturn(List.of(task1, task2));

        // WHEN
        List<TaskResponse> responses = taskService.getTasksByColumn(10L);

        // THEN
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("Task 1", responses.get(0).getTitle());
        assertEquals("Task 2", responses.get(1).getTitle());

        verify(taskRepository, times(1)).findByColumnIdOrderByPositionAsc(10L);
    }

    @Test
    void shouldReturnEmptyList_whenColumnHasNoTasks() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskColumnRepository.findById(10L)).thenReturn(Optional.of(mockColumn));
        when(taskRepository.findByColumnIdOrderByPositionAsc(10L)).thenReturn(Collections.emptyList());

        // WHEN
        List<TaskResponse> responses = taskService.getTasksByColumn(10L);

        // THEN
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    @Test
    void shouldThrowException_whenGettingTasks_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(taskColumnRepository.findById(10L)).thenReturn(Optional.of(mockColumn));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskService.getTasksByColumn(10L);
        });

        assertEquals("You don't have access to see this column", exception.getMessage());
        verify(taskRepository, never()).findByColumnIdOrderByPositionAsc(any());
    }

    // ==========================================
    // UPDATE TASK TESTS
    // ==========================================

    @Test
    void shouldUpdateTask_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        Task existingTask = Task.builder()
                .id(100L).title("Old Task").description("Old Desc").column(mockColumn).build();

        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitle("Updated Task");
        updateRequest.setDescription("Updated Desc");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenReturn(existingTask);

        // WHEN
        TaskResponse response = taskService.updateTask(100L, updateRequest);

        // THEN
        assertNotNull(response);
        assertEquals("Updated Task", response.getTitle());
        assertEquals("Updated Desc", response.getDescription());
        verify(taskRepository, times(1)).save(existingTask);
    }

    @Test
    void shouldNotUpdateTitle_whenTitleIsBlank() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        Task existingTask = Task.builder()
                .id(100L).title("Original Task").description("Old Desc").column(mockColumn).build();

        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitle("   "); // Blank title
        updateRequest.setDescription("New Desc");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenReturn(existingTask);

        // WHEN
        TaskResponse response = taskService.updateTask(100L, updateRequest);

        // THEN
        assertEquals("Original Task", response.getTitle()); // Title must remain unchanged
        assertEquals("New Desc", response.getDescription()); // Description should update normally
    }

    @Test
    void shouldThrowException_whenUpdatingTask_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        Task existingTask = Task.builder()
                .id(100L).title("To Do").column(mockColumn).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);
        TaskRequest updateRequest = new TaskRequest();
        updateRequest.setTitle("Hacked Task");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(existingTask));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskService.updateTask(100L, updateRequest);
        });

        assertEquals("You are not authorized to update this task!", exception.getMessage());
        verify(taskRepository, never()).save(any());
    }

    // ==========================================
    // DELETE TASK TESTS
    // ==========================================

    @Test
    void shouldDeleteTask_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        Task existingTask = Task.builder()
                .id(100L).title("To Do").column(mockColumn).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(existingTask));

        // WHEN
        taskService.deleteTask(100L);

        // THEN
        verify(taskRepository, times(1)).delete(existingTask);
    }

    @Test
    void shouldThrowException_whenDeletingTask_andTaskNotFound() {
        // GIVEN
        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            taskService.deleteTask(99L);
        });

        assertEquals("Task cannot be found!", exception.getMessage());
        verify(taskRepository, never()).delete(any());
    }

    @Test
    void shouldThrowException_whenDeletingTask_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setWorkspace(mockWorkspace);
        TaskColumn mockColumn = TaskColumn.builder().id(10L).board(mockBoard).build();

        Task existingTask = Task.builder()
                .id(100L).title("To Do").column(mockColumn).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(existingTask));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskService.deleteTask(100L);
        });

        assertEquals("You are not authorized to delete this Task!", exception.getMessage());
        verify(taskRepository, never()).delete(any());
    }
}