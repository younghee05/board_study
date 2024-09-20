package com.study.SpringSecurityMybatis.repository;

import com.study.SpringSecurityMybatis.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {

    int save(Comment comment);

    List<Comment> findAllByBoardId(Long boardId);

    int getCommentCountByBoardId(Long boardId);

    int deleteById(Long id);

    int deleteByBoardId(Long boardId);

    int updateById(Comment comment);

    Comment findById(Long id);

    Comment findByParentId(Long parentId);

}
