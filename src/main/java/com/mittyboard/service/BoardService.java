package com.mittyboard.service;

import com.mittyboard.dto.BoardRequest;
import com.mittyboard.dto.BoardResponse;
import com.mittyboard.entity.Board;
import com.mittyboard.entity.User;
import com.mittyboard.entity.Workspace;
import com.mittyboard.repository.BoardRepository;
import com.mittyboard.repository.WorkspaceRepository;
import com.mittyboard.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final WorkspaceRepository workspaceRepository;
    private final CurrentUserService currentUserService;

    public BoardResponse createBoard(BoardRequest request) {

        User currentUser = currentUserService.getAuthenticatedUser();

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("There is no workspace!"));

        if(!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to work in this workspace");
        }

        Board board = Board.builder()
                .title(request.getTitle())
                .workspace(workspace)
                .build();

        Board savedBoard = boardRepository.save(board);

        return mapToResponse(savedBoard);
    }

    public List<BoardResponse> getBoardsByWorkspace(Long workspaceId) {
        User currentUser = currentUserService.getAuthenticatedUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("There isn't any workspace!"));

        if(!workspace.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have access to see boards in this workspace");
        }

        List<Board> boards = boardRepository.findByWorkspaceId(workspaceId);

        return boards.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BoardResponse mapToResponse(Board board) {
        return BoardResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .workspaceId(board.getWorkspace().getId())
                .createdAt(board.getCreatedAt())
                .build();
    }

}
