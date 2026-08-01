package com.mittyboard.service;

import com.mittyboard.dto.BoardRequest;
import com.mittyboard.dto.BoardResponse;
import com.mittyboard.entity.Board;
import com.mittyboard.entity.Task;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.repository.BoardRepository;
import com.mittyboard.repository.WorkspaceRepository;
import com.mittyboard.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.mittyboard.exception.ResourceNotFoundException;
import com.mittyboard.exception.UnauthorizedAccessException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private BoardService boardService;

    // ==========================================
    // UPDATE BOARD TESTS
    // ==========================================

    @Test
    void shouldUpdateBoard_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User();
        mockOwner.setId(1L);

        Workspace mockWorkspace = new Workspace();
        mockWorkspace.setId(5L);
        mockWorkspace.setOwner(mockOwner);

        Board mockBoard = new Board();
        mockBoard.setId(10L);
        mockBoard.setTitle("Old Title");
        mockBoard.setCreatedAt(LocalDateTime.of(2023, 1, 1, 10, 0));
        mockBoard.setWorkspace(mockWorkspace);

        BoardRequest updateRequest = new BoardRequest();
        updateRequest.setTitle("New MittyBoard Title");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));
        when(boardRepository.save(any(Board.class))).thenReturn(mockBoard);

        // WHEN
        BoardResponse response = boardService.updateBoard(10L, updateRequest);

        // THEN
        assertNotNull(response);
        assertEquals("New MittyBoard Title", response.getTitle());
        assertEquals(10L, response.getId());
        assertEquals(LocalDateTime.of(2023, 1, 1, 10, 0), response.getCreatedAt());

        verify(boardRepository, times(1)).save(mockBoard);
    }

    @Test
    void shouldThrowException_whenUpdatingBoard_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);

        Board mockBoard = new Board();
        mockBoard.setId(10L);
        mockBoard.setWorkspace(mockWorkspace);

        User unauthorizedUser = new User();
        unauthorizedUser.setId(2L);

        BoardRequest updateRequest = new BoardRequest();
        updateRequest.setTitle("Hacker Title");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            boardService.updateBoard(10L, updateRequest);
        });

        assertEquals("You are not authorized to update this board", exception.getMessage());
        verify(boardRepository, never()).save(any(Board.class));
    }

    @Test
    void shouldThrowException_whenBoardNotFound_onUpdate() {
        // GIVEN
        BoardRequest updateRequest = new BoardRequest();
        updateRequest.setTitle("Non-existent Board");

        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(boardRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            boardService.updateBoard(99L, updateRequest);
        });

        assertEquals("Board cannot be found!", exception.getMessage());
        verify(boardRepository, never()).save(any());
    }

    @Test
    void shouldNotUpdateTitle_whenTitleIsNull() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);

        Board mockBoard = new Board();
        mockBoard.setId(10L);
        mockBoard.setTitle("Original Title");
        mockBoard.setWorkspace(mockWorkspace);

        BoardRequest updateRequest = new BoardRequest();
        updateRequest.setTitle(null);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));
        when(boardRepository.save(any(Board.class))).thenReturn(mockBoard);

        // WHEN
        BoardResponse response = boardService.updateBoard(10L, updateRequest);

        // THEN
        assertEquals("Original Title", response.getTitle());
    }

    @Test
    void shouldNotUpdateTitle_whenTitleIsBlankString() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);

        Board mockBoard = new Board();
        mockBoard.setId(10L);
        mockBoard.setTitle("Original Title");
        mockBoard.setWorkspace(mockWorkspace);

        BoardRequest updateRequest = new BoardRequest();
        updateRequest.setTitle("    ");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));
        when(boardRepository.save(any(Board.class))).thenReturn(mockBoard);

        // WHEN
        BoardResponse response = boardService.updateBoard(10L, updateRequest);

        // THEN
        assertEquals("Original Title", response.getTitle());
    }

    @Test
    void shouldThrowNullPointerException_whenUpdatingBoardHasNoWorkspace() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Board corruptedBoard = new Board();
        corruptedBoard.setId(10L);
        corruptedBoard.setWorkspace(null);

        BoardRequest updateRequest = new BoardRequest();
        updateRequest.setTitle("Test");

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(corruptedBoard));

        // WHEN & THEN
        assertThrows(NullPointerException.class, () -> {
            boardService.updateBoard(10L, updateRequest);
        });
        verify(boardRepository, never()).save(any());
    }

    // ==========================================
    // DELETE BOARD TESTS
    // ==========================================

    @Test
    void shouldDeleteBoard_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));

        // WHEN
        boardService.deleteBoard(10L);

        // THEN
        verify(boardRepository, times(1)).delete(mockBoard);
    }

    @Test
    void shouldThrowException_whenDeletingBoard_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        Board mockBoard = new Board(); mockBoard.setId(10L); mockBoard.setWorkspace(mockWorkspace);

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            boardService.deleteBoard(10L);
        });

        assertEquals("You are not authorized to delete this board", exception.getMessage());
        verify(boardRepository, never()).delete(any());
    }

    @Test
    void shouldThrowException_whenBoardNotFound_onDelete() {
        // GIVEN
        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(boardRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            boardService.deleteBoard(99L);
        });

        assertEquals("Board cannot be found!", exception.getMessage());
        verify(boardRepository, never()).delete(any());
    }

    @Test
    void shouldThrowNullPointerException_whenDeletingBoardHasNoWorkspace() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Board corruptedBoard = new Board();
        corruptedBoard.setId(10L);
        corruptedBoard.setWorkspace(null);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(corruptedBoard));

        // WHEN & THEN
        assertThrows(NullPointerException.class, () -> {
            boardService.deleteBoard(10L);
        });

        verify(boardRepository, never()).delete(any());
    }

    @Test
    void shouldCallDelete_whenBoardHasTaskColumns() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);

        Board mockBoard = new Board();
        mockBoard.setId(10L);
        mockBoard.setWorkspace(mockWorkspace);

        mockBoard.setTaskColumns(List.of(new com.mittyboard.entity.TaskColumn(), new com.mittyboard.entity.TaskColumn()));

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(boardRepository.findById(10L)).thenReturn(Optional.of(mockBoard));

        // WHEN
        boardService.deleteBoard(10L);

        // THEN
        verify(boardRepository, times(1)).delete(mockBoard);
    }

    // ==========================================
    // CREATE BOARD TESTS
    // ==========================================

    @Test
    void shouldCreateBoard_whenValidRequest_andUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Workspace mockWorkspace = new Workspace();
        mockWorkspace.setId(5L);
        mockWorkspace.setOwner(mockOwner);

        BoardRequest createRequest = new BoardRequest();
        createRequest.setTitle("New Board");

        Board savedBoard = new Board();
        savedBoard.setId(10L);
        savedBoard.setTitle("New Board");
        savedBoard.setWorkspace(mockWorkspace);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findById(5L)).thenReturn(Optional.of(mockWorkspace));
        when(boardRepository.save(any(Board.class))).thenReturn(savedBoard);

        // WHEN
        BoardResponse response = boardService.createBoard(5L, createRequest);

        // THEN
        assertNotNull(response);
        assertEquals("New Board", response.getTitle());

        verify(boardRepository, times(1)).save(any(Board.class));
    }

    @Test
    void shouldThrowException_whenCreatingBoard_andWorkspaceNotFound() {
        // GIVEN
        BoardRequest createRequest = new BoardRequest();
        createRequest.setTitle("New Board");

        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(workspaceRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            boardService.createBoard(99L, createRequest);
        });

        assertEquals("Workspace cannot be found!", exception.getMessage());
        verify(boardRepository, never()).save(any());
    }

    @Test
    void shouldThrowException_whenCreatingBoard_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Workspace mockWorkspace = new Workspace();
        mockWorkspace.setId(5L);
        mockWorkspace.setOwner(mockOwner);

        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        BoardRequest createRequest = new BoardRequest();
        createRequest.setTitle("Hacker Board");

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(workspaceRepository.findById(5L)).thenReturn(Optional.of(mockWorkspace));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            boardService.createBoard(5L, createRequest);
        });

        assertEquals("You are not authorized to create a board in this workspace", exception.getMessage());
        verify(boardRepository, never()).save(any());
    }

    // ==========================================
    // GET BOARDS BY WORKSPACE TESTS
    // ==========================================

    @Test
    void shouldReturnBoards_whenUserIsOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);

        Workspace mockWorkspace = new Workspace();
        mockWorkspace.setId(5L);
        mockWorkspace.setOwner(mockOwner);

        Board board1 = new Board(); board1.setId(10L); board1.setWorkspace(mockWorkspace);
        Board board2 = new Board(); board2.setId(11L); board2.setWorkspace(mockWorkspace);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findById(5L)).thenReturn(Optional.of(mockWorkspace));
        when(boardRepository.findByWorkspaceId(5L)).thenReturn(List.of(board1, board2));

        // WHEN
        List<BoardResponse> responses = boardService.getBoardsByWorkspace(5L);

        // THEN
        assertNotNull(responses);
        assertEquals(2, responses.size());
        verify(boardRepository, times(1)).findByWorkspaceId(5L);
    }

    @Test
    void shouldReturnEmptyList_whenWorkspaceHasNoBoards() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setId(5L); mockWorkspace.setOwner(mockOwner);

        when(currentUserService.getAuthenticatedUser()).thenReturn(mockOwner);
        when(workspaceRepository.findById(5L)).thenReturn(Optional.of(mockWorkspace));
        when(boardRepository.findByWorkspaceId(5L)).thenReturn(Collections.emptyList());

        // WHEN
        List<BoardResponse> responses = boardService.getBoardsByWorkspace(5L);

        // THEN
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    @Test
    void shouldThrowException_whenGettingBoards_andWorkspaceNotFound() {
        // GIVEN
        when(currentUserService.getAuthenticatedUser()).thenReturn(new User());
        when(workspaceRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            boardService.getBoardsByWorkspace(99L);
        });

        verify(boardRepository, never()).findByWorkspaceId(any());
    }

    @Test
    void shouldThrowException_whenGettingBoards_andUserIsNotOwner() {
        // GIVEN
        User mockOwner = new User(); mockOwner.setId(1L);
        Workspace mockWorkspace = new Workspace(); mockWorkspace.setOwner(mockOwner);
        User unauthorizedUser = new User(); unauthorizedUser.setId(2L);

        when(currentUserService.getAuthenticatedUser()).thenReturn(unauthorizedUser);
        when(workspaceRepository.findById(5L)).thenReturn(Optional.of(mockWorkspace));

        // WHEN & THEN
        UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () -> {
            boardService.getBoardsByWorkspace(5L);
        });

        verify(boardRepository, never()).findByWorkspaceId(any());
    }
}