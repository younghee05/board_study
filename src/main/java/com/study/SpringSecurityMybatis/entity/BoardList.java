package com.study.SpringSecurityMybatis.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BoardList {
    private Long id;
    private String title;
    private String content;
    private String writerName;
    private Integer likeCount;
    private Integer viewCount;
}
