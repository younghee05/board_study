package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.dto.request.ReqWriteBoardDto;
import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.repository.BoardMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardService {

    @Autowired
    private BoardMapper boardMapper;

    public Long writeBoard(ReqWriteBoardDto dto) {
        Board board = dto.toEntity();
        boardMapper.save(board);
        return board.getId();

    }

}
