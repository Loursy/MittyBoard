package com.mittyboard.service;

import com.mittyboard.dto.TaskColumnRequest;
import com.mittyboard.dto.TaskColumnResponse;
import com.mittyboard.entity.Board;
import com.mittyboard.entity.TaskColumn;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.exception.ResourceNotFoundException;
import com.mittyboard.exception.UnauthorizedAccessException;
import com.mittyboard.repository.BoardRepository;
import com.mittyboard.repository.TaskColumnRepository;
import com.mittyboard.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskColumnServiceTest {

    @Mock
    private TaskColumnRepository taskColumnRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private TaskColumnService taskColumnService;

    // ==========================================
    // CREATE TASK COLUMN TESTS
    // ==========================================

    @Test
    void shouldCreateColumn_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumnRequest request = new TaskColumnRequest();
        request.setTitle("To Do");
        request.setPosition(1);

        TaskColumn savedColumn = TaskColumn.builder()
                .id(100L)
                .title("To Do")
                .position(1)
                .board(mockBoard)
                .build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));
        when(taskColumnRepository.save(any(TaskColumn.class))).thenReturn(savedColumn);

        // WHEN
        TaskColumnResponse response = taskColumnService.createColumn(10L, request);

        // THEN
        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("To Do", response.getTitle());
        assertEquals(1, response.getPosition());
        assertEquals(10L, response.getBoardId());

        verify(taskColumnRepository, times(1)).save(any(TaskColumn.class));
    }

    @Test
    void shouldThrowException_whenCreatingColumn_andBoardNotFound() {
        // GIVEN
        TaskColumnRequest request = new TaskColumnRequest();
        request.setTitle("To Do");

        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(boardRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            taskColumnService.createColumn(99L, request);
        });

        assertEquals("Board is not found.", exception.getMessage());
        verify(taskColumnRepository, never()).save(any());
    }

    @Test
    void shouldThrowException_whenCreatingColumn_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        TaskColumnRequest request = new TaskColumnRequest();
        request.setTitle("Hacker Column");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskColumnService.createColumn(10L, request);
        });

        assertEquals("You are not authorized to add a column to this board", exception.getMessage());
        verify(taskColumnRepository, never()).save(any());
    }

    // ==========================================
    // GET COLUMNS BY BOARD TESTS
    // ==========================================

    @Test
    void shouldReturnColumns_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumn col1 = TaskColumn.builder().id(100L).title("To Do").position(1).board(mockBoard).build();
        TaskColumn col2 = TaskColumn.builder().id(101L).title("Done").position(2).board(mockBoard).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));
        when(taskColumnRepository.findByBoardIdOrderByPositionAsc(10L)).thenReturn(List.of(col1, col2));

        // WHEN
        List<TaskColumnResponse> responses = taskColumnService.getColumnsByBoard(10L);

        // THEN
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("To Do", responses.get(0).getTitle());
        assertEquals("Done", responses.get(1).getTitle());

        verify(taskColumnRepository, times(1)).findByBoardIdOrderByPositionAsc(10L);
    }

    @Test
    void shouldReturnEmptyList_whenBoardHasNoColumns() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));
        when(taskColumnRepository.findByBoardIdOrderByPositionAsc(10L)).thenReturn(Collections.emptyList());

        // WHEN
        List<TaskColumnResponse> responses = taskColumnService.getColumnsByBoard(10L);

        // THEN
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    @Test
    void shouldThrowException_whenGettingColumns_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);
        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskColumnService.getColumnsByBoard(10L);
        });

        assertEquals("You don't have the access to see the columns in this board.", exception.getMessage());
        verify(taskColumnRepository, never()).findByBoardIdOrderByPositionAsc(any());
    }

    // ==========================================
    // UPDATE TASK COLUMN TESTS
    // ==========================================

    @Test
    void shouldUpdateColumn_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumn existingColumn = TaskColumn.builder()
                .id(100L).title("Old Title").position(1).board(mockBoard).build();

        TaskColumnRequest updateRequest = new TaskColumnRequest();
        updateRequest.setTitle("In Progress");
        updateRequest.setPosition(2);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskColumnRepository.findById(100L)).thenReturn(Optional.of(existingColumn));
        when(taskColumnRepository.save(any(TaskColumn.class))).thenReturn(existingColumn);

        // WHEN
        TaskColumnResponse response = taskColumnService.updateTaskColumn(100L, updateRequest);

        // THEN
        assertNotNull(response);
        assertEquals("In Progress", response.getTitle());
        assertEquals(2, response.getPosition());
        verify(taskColumnRepository, times(1)).save(existingColumn);
    }

    @Test
    void shouldNotUpdateTitle_whenTitleIsBlank() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumn existingColumn = TaskColumn.builder()
                .id(100L).title("Original Title").position(1).board(mockBoard).build();

        TaskColumnRequest updateRequest = new TaskColumnRequest();
        updateRequest.setTitle("   "); // Blank title
        updateRequest.setPosition(3);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskColumnRepository.findById(100L)).thenReturn(Optional.of(existingColumn));
        when(taskColumnRepository.save(any(TaskColumn.class))).thenReturn(existingColumn);

        // WHEN
        TaskColumnResponse response = taskColumnService.updateTaskColumn(100L, updateRequest);

        // THEN
        assertEquals("Original Title", response.getTitle()); // Title must remain unchanged
        assertEquals(3, response.getPosition()); // Position should update
    }

    @Test
    void shouldThrowException_whenUpdatingColumn_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumn existingColumn = TaskColumn.builder()
                .id(100L).title("To Do").position(1).board(mockBoard).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);
        TaskColumnRequest updateRequest = new TaskColumnRequest();
        updateRequest.setTitle("Hacked Title");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(taskColumnRepository.findById(100L)).thenReturn(Optional.of(existingColumn));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskColumnService.updateTaskColumn(100L, updateRequest);
        });

        assertEquals("You are not authorized to update this column", exception.getMessage());
        verify(taskColumnRepository, never()).save(any());
    }

    // ==========================================
    // DELETE TASK COLUMN TESTS
    // ==========================================

    @Test
    void shouldDeleteColumn_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumn existingColumn = TaskColumn.builder()
                .id(100L).title("To Do").board(mockBoard).build();

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(taskColumnRepository.findById(100L)).thenReturn(Optional.of(existingColumn));

        // WHEN
        taskColumnService.deleteTaskColumn(100L);

        // THEN
        verify(taskColumnRepository, times(1)).delete(existingColumn);
    }

    @Test
    void shouldThrowException_whenDeletingColumn_andColumnNotFound() {
        // GIVEN
        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(taskColumnRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            taskColumnService.deleteTaskColumn(99L);
        });

        assertEquals("Task Column cannot be found!", exception.getMessage());
        verify(taskColumnRepository, never()).delete(any());
    }

    @Test
    void shouldThrowException_whenDeletingColumn_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        TaskColumn existingColumn = TaskColumn.builder()
                .id(100L).title("To Do").board(mockBoard).build();

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(taskColumnRepository.findById(100L)).thenReturn(Optional.of(existingColumn));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            taskColumnService.deleteTaskColumn(100L);
        });

        assertEquals("You are not authorized to delete this Task Column!", exception.getMessage());
        verify(taskColumnRepository, never()).delete(any());
    }
}