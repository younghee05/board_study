package com.study.SpringSecurityMybatis.dto.request;

import com.study.SpringSecurityMybatis.entity.Board;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.security.principal.PrincipalUser;
import lombok.Data;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.validation.constraints.NotBlank;

@Data
public class ReqWriteBoardDto {
    @NotBlank(message = "제목을 입력하세요.")
    private String title;
    @NotBlank(message = "게시글 내용을 입력하세요.")
    private String content;

    public Board toEntity() {
        PrincipalUser principalUser = (PrincipalUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Board.builder()
                .title(title)
                .content(content)
                .userId(principalUser.getId())
                .build();
    }

}
