package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqModifyCommentDto;
import com.study.SpringSecurityMybatis.dto.request.ReqWriteCommentDto;
import com.study.SpringSecurityMybatis.dto.response.RespCommentDto;
import com.study.SpringSecurityMybatis.entity.Comment;
import com.study.SpringSecurityMybatis.exception.AccessDeniedException;
import com.study.SpringSecurityMybatis.repository.CommentMapper;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentMapper commentMapper;

    public void write(ReqWriteCommentDto dto) {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        commentMapper.save(dto.toEntity(principalUser.getId()));
    }

    public RespCommentDto getComment(Long boardId) {
        return RespCommentDto.builder()
                .comments(commentMapper.findAllByBoardId(boardId))
                .commentCount(commentMapper.getCommentCountByBoardId(boardId))
                .build();
    }

    public void modifyComment(ReqModifyCommentDto dto) {
        accessCheck(dto.getCommentId());
        commentMapper.updateById(dto.toEntity());
    }

    public void deleteComment(Long commentId) {
        accessCheck(commentId);
        commentMapper.deleteById(commentId);

    }

    private void accessCheck(Long commentId) {
        // 사용자 정보를 가지고 오는 / 다른 사용자의 댓글이 수정또는 삭제가 되면 안되기에
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        Comment comment = commentMapper.findById(commentId);
        if(principalUser.getId() != comment.getWriterId()) {
            throw new AccessDeniedException();
        }
    }
}
