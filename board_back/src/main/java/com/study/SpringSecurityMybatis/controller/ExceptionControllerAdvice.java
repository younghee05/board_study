package com.study.SpringSecurityMybatis.controller;

import com.study.SpringSecurityMybatis.exception.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.naming.AuthenticationException;

@RestControllerAdvice
public class ExceptionControllerAdvice {

    @ExceptionHandler(ValidException.class)
    public ResponseEntity<?> validException(ValidException e) {
        return ResponseEntity.badRequest().body(e.getFieldErrors());
    }

    @ExceptionHandler(SingupException.class)
    public ResponseEntity<?> signupException(SingupException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> authenticationException(AuthenticationException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(AccessTokenValidException.class)
    public ResponseEntity<?> accessTokenValidException(AccessTokenValidException e) {
        return ResponseEntity.status(403).body(false);
    }

    @ExceptionHandler(NotFoundBoardException.class)
    public ResponseEntity<?> notFoundBoardException(NotFoundBoardException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accessDeniedException(AccessDeniedException e) {
        return ResponseEntity.status(403).body(e.getMessage());
    }
}
