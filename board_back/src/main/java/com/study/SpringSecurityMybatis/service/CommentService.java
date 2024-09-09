package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqWriteCommentDto;
import com.study.SpringSecurityMybatis.dto.response.RespCommentDto;
import com.study.SpringSecurityMybatis.repository.CommentMapper;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
}
