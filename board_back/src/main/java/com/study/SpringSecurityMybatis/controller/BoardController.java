package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.aspect.annotation.ValidAop;
import com.study.SpringSecurityMybatis.dto.request.*;
import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
public class BoardController {

    @Autowired
    private BoardService boardService;

    @ValidAop
    @PostMapping("/board")
    public ResponseEntity<?> write(@Valid @RequestBody ReqWriteBoardDto dto, BindingResult bindingResult) {
        return ResponseEntity.ok().body(Map.of("boardId", boardService.writeBoard(dto)));
    }

    @PutMapping("/board/modify/{boardId}")
    public ResponseEntity<?> boardModify(@RequestBody ReqModifyBoardDto dto) {
        boardService.modifyBoard(dto);
        return ResponseEntity.ok().body(true);
    }

    @DeleteMapping("/board/detail/{boardId}")
    public ResponseEntity<?> boardDelete(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.ok().body(true);
    }

    @GetMapping("/board/search")
    public ResponseEntity<?> getSearchBoard(ReqSearchBoardDto dto) {
        return ResponseEntity.ok().body(boardService.getSearchBoard((dto)));
    }

    @GetMapping("/board/list")
    public ResponseEntity<?> getBoard(ReqBoardListDto dto) {
        return ResponseEntity.ok().body(boardService.getBoardList(dto));
    }

    // 로그인을 안해도 게시글 조회, 추천 조회를 가능하겠끔 만들어야한다
    @GetMapping("/board/{boardId}")
    public ResponseEntity<?> getDetail(@PathVariable Long boardId) {
        return ResponseEntity.ok().body(boardService.getBoardDetail(boardId));
    }

    @GetMapping("board/{boardId}/like")
    public ResponseEntity<?> getLikeInfo(@PathVariable Long boardId) {
        return ResponseEntity.ok().body(boardService.getBoardLike(boardId));
    }

    @PostMapping("/board/{boardId}/like")
    public ResponseEntity<?> like(@PathVariable Long boardId) {
        boardService.like(boardId);
        return ResponseEntity.ok().body(true);
    }

    @DeleteMapping("/board/like/{boardLikeId}")
    public ResponseEntity<?> dislike(@PathVariable Long boardLikeId) {
        boardService.dislike(boardLikeId);
        return ResponseEntity.ok().body(true);
    }
}
