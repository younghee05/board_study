package com.study.SpringSecurityMybatis.security.handler;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class AuthenticationHandler implements AuthenticationEntryPoint { // 인증 객체

    // security에 오류가 발생시 AuthenticationException 으로 온다
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(403);
        response.getWriter().println("인증 토큰이 유효하지 않습니다.");
        authException.printStackTrace(); // 서버에서도 오류 메시지를 볼 수 있음 / 응답으론 가진 않음 / 필수 사항 x
    }
}
