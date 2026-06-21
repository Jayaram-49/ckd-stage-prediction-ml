package com.ckd.ai.common.exception;

import com.ckd.ai.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntimeException(RuntimeException ex) {
        logger.error("RuntimeException: ", ex);
        return new ResponseEntity<>(new ApiResponse(false, ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception ex) {
        logger.error("Internal Server Error: ", ex);
        String message = ex.getMessage();
        if (message == null || message.isEmpty()) {
            message = "An internal server error occurred: " + ex.getClass().getSimpleName();
        }
        return new ResponseEntity<>(new ApiResponse(false, message), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
