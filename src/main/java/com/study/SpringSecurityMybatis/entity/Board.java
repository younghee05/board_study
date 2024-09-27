package com.study.SpringSecurityMybatis.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Builder
@Data
@AllArgsConstructor
public class Board {
    private Long id;
    private String title;
    private String content;
    private Long userId;
    private int viewCount;

    private User user;
}
