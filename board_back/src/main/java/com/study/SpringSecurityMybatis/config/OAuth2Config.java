package com.study.SpringSecurityMybatis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;

@Configuration
public class OAuth2Config {

    // IoC에 등록
    // 동일 객체에 계속 루프가 돌지 않게 방지하기 위함
    @Bean
    public DefaultOAuth2UserService defaultOAuth2UserService() {
        return new DefaultOAuth2UserService();
    }
}
