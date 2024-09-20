package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.Board;
import lombok.Data;

@Data
public class ReqModifyBoardDto {
    private Long boardId;
    private String title;
    private String content;

//    public Board toEntity() {
//        return
//    }
}
