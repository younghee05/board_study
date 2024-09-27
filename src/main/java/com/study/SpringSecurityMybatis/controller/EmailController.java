package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.dto.request.ReqSendMailDto;
import com.study.SpringSecurityMybatis.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/email")
    public ResponseEntity<?> sendEmail(@RequestBody ReqSendMailDto dto) {
        System.out.println(dto);
        return ResponseEntity.ok().body(emailService.sendTestMail(dto));
    }

    @PostMapping("/auth/mail")
    public ResponseEntity<?> sendAuthEmail(@RequestBody Map<String, Object> dto) {
        System.out.println(dto);
        return ResponseEntity.ok().body(emailService.sendAuthMail(
                dto.get("toEmail").toString(),
                dto.get("username").toString()
        ));
    }

    @GetMapping("/auth/mail")
    public void emailValid(@RequestParam String token, HttpServletResponse response) throws IOException {
        response.setContentType("text/html;charset=utf-8");
        switch (emailService.validToken(token)) {
            case "validTokenFail":
            case "notFoundToken":
                response.getWriter().println(errorView("유호하지 않은 인증 요청입니다."));
                break;
            case "verified":
                response.getWriter().println(errorView("이미 인증 완료된 계정입니다."));
                break;
            case "success":
                response.getWriter().println(successView());
        }
    }

    private String successView() {
        StringBuilder sb = new StringBuilder();
        sb.append("<html>");
        sb.append("<body>");
        sb.append("<script>");
        sb.append("window.location.replace('http://localhost:3000/user/login');");
        sb.append("</script>");
        sb.append("</h2>");
        sb.append("</div>");
        sb.append("</body>");
        sb.append("</html>");

        return sb.toString();
    }

    private String errorView(String message) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html>");
        sb.append("<body>");
        sb.append("<div style=\"text-align:center;\">");
        sb.append("<h2>");
        sb.append(message);
        sb.append("</h2>");
        sb.append("<button onClick='window.close()'>닫기</button>");
        sb.append("</div>");
        sb.append("</body>");
        sb.append("</html>");

        return sb.toString();
    }

}
