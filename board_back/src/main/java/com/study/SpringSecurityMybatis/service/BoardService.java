package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqBoardListDto;
import com.study.SpringSecurityMybatis.dto.request.ReqModifyBoardDto;
import com.study.SpringSecurityMybatis.dto.request.ReqSearchBoardDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteBoardDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardDetailDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardLikeInfoDto;
import com.study.SpringSecurityMybatis.dto.response.RespBoardListDto;
import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.entity.BoardLike;
import com.study.SpringSecurityMybatis.entity.BoardList;
import com.study.SpringSecurityMybatis.exception.AccessDeniedException;
import com.study.SpringSecurityMybatis.exception.NotFoundBoardException;
import com.study.SpringSecurityMybatis.repository.BoardLikeMapper;
import com.study.SpringSecurityMybatis.repository.BoardMapper;
import com.study.SpringSecurityMybatis.repository.CommentMapper;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class BoardService {

    @Autowired
    private BoardMapper boardMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private BoardLikeMapper boardLikeMapper;

    public Long writeBoard(ReqWriteBoardDto dto) {
        Board board = dto.toEntity();
        boardMapper.save(board);
        return board.getId();

    }

//    public void modifyBoard(ReqModifyBoardDto dto) {
//        accessCheck(dto.getBoardId());
//        boardMapper.modifyBoard(dto)
//
//    }

    public void deleteBoard(Long boardId) {
        accessCheck(boardId);
        boardMapper.deleteBoardById(boardId);
        commentMapper.deleteByBoardId(boardId);
    }

    private void accessCheck(Long boardId) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        Board board = boardMapper.findById(boardId);
        if(principalUser.getId() != board.getUserId()) {
            throw new AccessDeniedException();
        }

    }

    public RespBoardListDto getSearchBoard(ReqSearchBoardDto dto) {
        Long startIndex = (dto.getPage() - 1) * dto.getLimit();
        Map<String, Object> params = Map.of(
                "startIndex", startIndex,
                "limit", dto.getLimit(),
                "searchValue", dto.getSearch() == null ? "" : dto.getSearch(), // 문자열 null로 받아오지 않게 방지
                "option", dto.getOption() == null ? "all" : dto.getOption()
        );

        List<BoardList> boardLists = boardMapper.findAllBySearch(params);
        Integer boardTotalCount = boardMapper.getCountAllBySearch(params); // 검색했을 때 페이지 수를 제한으로 두는 것

        return RespBoardListDto.builder()
                .boards(boardLists)
                .totalCount(boardTotalCount)
                .build();
    }

    public RespBoardListDto getBoardList(ReqBoardListDto dto) {
        // 페이수 - 1 * limit=10 이므로 페이지 수마다 몇까지 보이는 기능
        Long startIndex = (dto.getPage() - 1) * dto.getLimit();
        List<BoardList> boardLists = boardMapper.findAllByStartIndexAndLimit(startIndex, dto.getLimit());
        Integer boardTotalCount = boardMapper.getCountAll();

        return RespBoardListDto.builder()
                .boards(boardLists)
                .totalCount(boardTotalCount)
                .build();
    }

    public RespBoardDetailDto getBoardDetail(Long boardId) {
        Board board = boardMapper.findById(boardId);
        if(board == null) {
            throw new NotFoundBoardException("해당 게시글을 찾을 수 없습니다.");
        }
        boardMapper.modifyViewCountById(boardId);

        return RespBoardDetailDto.builder()
                .boardId(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .writerId(board.getUserId())
                .writerUsername(board.getUser().getUsername())
                .viewCount(board.getViewCount() + 1)
                .build();
    }

    public RespBoardLikeInfoDto getBoardLike(Long boardId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if(!authentication.getName().equals("anonymousUser")) {
            PrincipalUser principalUser = (PrincipalUser) authentication.getPrincipal();
            userId = principalUser.getId();
        }
        BoardLike boardLike = boardLikeMapper.findByBoardIdAndUserId(boardId, userId);
        int likeCount = boardLikeMapper.getLikeCountByBoardId(boardId);
        return RespBoardLikeInfoDto.builder()
                .boardLikeId(boardLike == null ? 0 : boardLike.getId())
                .likeCount(likeCount)
                .build();
    }

    public void like(Long boardId) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        BoardLike boardLike = BoardLike.builder()
                .boardId(boardId)
                .userId(principalUser.getId())
                .build();
        boardLikeMapper.save(boardLike);
    }

    public void dislike(Long boardLikeId) {
        boardLikeMapper.deleteById(boardLikeId);
    }
}
