package com.study.SpringSecurityMybatis.exception;

import lombok.Data;
import lombok.Getter;
import org.springframework.validation.FieldError;

import java.util.List;

public class ValidException extends RuntimeException {

    @Getter
    private List<FieldError> fieldErrors;

    public ValidException(String message, List<FieldError> fieldError) {
        super(message);
        this.fieldErrors = fieldError;
    }
}
