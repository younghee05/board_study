package com.study.SpringSecurityMybatis.service;

import com.study.SpringSecurityMybatis.controller.AuthenticationController;
import com.study.SpringSecurityMybatis.dto.request.ReqSendMailDto;
import com.study.SpringSecurityMybatis.entity.Comment;
import com.study.SpringSecurityMybatis.entity.User;
import com.study.SpringSecurityMybatis.repository.UserMapper;
import com.study.SpringSecurityMybatis.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;
    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private AuthenticationController authenticationController;
    @Autowired
    private JwtProvider jwtProvider;
    @Autowired
    private UserMapper userMapper;

    public Boolean send(String toEmail, String fromEmail, String subject, String content) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "utf-8");
            // 전송하는 사람의 메일
            helper.setFrom(fromEmail);
            //받는 사람의 메일
            helper.setTo(toEmail);
            // 메일의 제목
            helper.setSubject(subject);
            // 메일의 내용
            message.setText(content, "utf-8", "html");

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

        javaMailSender.send(message);
        return true;
    }

    public Boolean sendTestMail(ReqSendMailDto dto) {

        StringBuilder htmlContent = new StringBuilder();
        htmlContent.append("<div style='display:flex; justify-content:center; align-items:center; flex-direction:column; width:400px'>");
        htmlContent.append(dto.getContent());
        htmlContent.append("<a href='http://localhost:3000' >메인화면</a>");
        htmlContent.append("</div>");

        return send(dto.getToEmail(), fromEmail, dto.getSubject(), htmlContent.toString());
    }

    public Boolean sendAuthMail(String toEmail, String username) {
        StringBuilder htmlContent = new StringBuilder();
        htmlContent.append("<div style='display:flex; justify-content:center; align-items:center; flex-direction:column; width:400px'>");
        htmlContent.append("<h2>회원가입을 완료하시려면 아래의 인증하기 버튼을 클릭하세요.</h2>");
        htmlContent.append("<a target='_blank' href='http://localhost:8080/auth/mail?token=");
        htmlContent.append(jwtProvider.generateEmailValidToken(username));
        htmlContent.append("'>인증하기</a>");
        htmlContent.append("</div>");

        return send(toEmail, fromEmail, "우리 사이트의 가입을 위한 인증메일입니다.", htmlContent.toString());

    }

    public String validToken(String token) {
        try {
            Claims claims = jwtProvider.getClaims(token); // 5분이 지나면 오류가 뜨는
            String username = claims.get("username").toString();
            User user = userMapper.findByUsername(username);
            if(user == null) {
                return "notFoundToken";
            }
            if(user.getEmailValid() == 1) {
                return "verified";
            }
            userMapper.modifyEmailValidByUsername(username);
        } catch (Exception e) {
            return "validTokenFail";
        }
        return "success";
    }

}
