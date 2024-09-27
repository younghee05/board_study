package com.study.SpringSecurityMybatis.controller;
import com.study.SpringSecurityMybatis.dto.request.ReqModifyCommentDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteCommentDto;
import com.study.SpringSecurityMybatis.dto.response.RespCommentDto;
import com.study.SpringSecurityMybatis.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/board/comment")
    public ResponseEntity<?> writeComment(@RequestBody ReqWriteCommentDto dto) {
        commentService.write(dto);
        return ResponseEntity.ok().body(true);
    }

    @GetMapping("/board/{boardId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long boardId) {
        return ResponseEntity.ok().body(commentService.getComment(boardId));
    }

    @PutMapping("/board/comment/{commentId}")
    public ResponseEntity<?> modifyComment(@RequestBody ReqModifyCommentDto dto) {
        System.out.println(dto); // 데이터가 잘 들어왔는지 확인
        commentService.modifyComment(dto);
        return ResponseEntity.ok().body(true);
    }

    @DeleteMapping("/board/comment/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok().body(true);
    }
}
