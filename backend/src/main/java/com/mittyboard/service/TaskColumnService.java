package com.mittyboard.service;

import com.mittyboard.dto.TaskColumnRequest;
import com.mittyboard.dto.TaskColumnResponse;
import com.mittyboard.entity.Board;
import com.mittyboard.entity.TaskColumn;
import com.mittyboard.entity.User;
import com.mittyboard.repository.BoardRepository;
import com.mittyboard.repository.TaskColumnRepository;
import com.mittyboard.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskColumnService {

    private final TaskColumnRepository taskColumnRepository;
    private final BoardRepository boardRepository;
    private final CurrentUserService currentUserService;

    public TaskColumnResponse createColumn(TaskColumnRequest request) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException("Board is not found."));

        if (!board.getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to add column to this board");
        }

        TaskColumn column = TaskColumn.builder()
                .title(request.getTitle())
                .position(request.getPosition())
                .board(board)
                .build();

        TaskColumn savedColumn = taskColumnRepository.save(column);

        return mapToResponse(savedColumn);
    }

    public List<TaskColumnResponse> getColumnsByBoard(Long boardId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board is not found."));

        if (!board.getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have the access to see the columns in this board.");
        }

        List<TaskColumn> columns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);

        return columns.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskColumnResponse updateTaskColumn(Long taskcolumnId, TaskColumnRequest request) {
        User currentUser = currentUserService.getAuthenticatedUser();

        TaskColumn taskColumn = taskColumnRepository.findById(taskcolumnId)
                .orElseThrow(() -> new RuntimeException("Task Column cannot be found."));

        if(!taskColumn.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have access to update the column in this Task Column");
        }

        taskColumn.setTitle(request.getTitle());
        taskColumn.setPosition(request.getPosition());

        TaskColumn updatedColumn = taskColumnRepository.save(taskColumn);

        return mapToResponse(updatedColumn);
    }

    public void deleteTaskColumn(Long taskcolumnId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        TaskColumn taskColumn = taskColumnRepository.findById(taskcolumnId)
                .orElseThrow(() -> new RuntimeException("Task Column cannot be found!"));

        if(!taskColumn.getBoard().getWorkspace().getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this Task Column!");
        }

        taskColumnRepository.delete(taskColumn);
    }

    private TaskColumnResponse mapToResponse(TaskColumn column) {
        return TaskColumnResponse.builder()
                .id(column.getId())
                .title(column.getTitle())
                .position(column.getPosition())
                .boardId(column.getBoard().getId())
                .createdAt(column.getCreatedAt())
                .build();
    }
}
