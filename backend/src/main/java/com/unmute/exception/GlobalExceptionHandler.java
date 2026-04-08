package com.unmute.exception;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Global Exception Handler
 * Handles all backend errors in a consistent format
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /* ── Validation Errors ───────────────── */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex
    ) {

        List<String> errors = new ArrayList<>();

        ex.getBindingResult().getFieldErrors()
                .forEach(error ->
                        errors.add(error.getField() + ": " + error.getDefaultMessage())
                );

        return buildError(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                errors
        );
    }

    /* ── Illegal Argument ───────────────── */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex
    ) {
        return buildError(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                null
        );
    }

    /* ── Authentication Errors ─────────── */
    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<Map<String, Object>> handleAuthErrors(
            Exception ex
    ) {
        return buildError(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password",
                null
        );
    }

    /* ── Generic Errors ────────────────── */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(
            Exception ex
    ) {

        log.error("Unhandled exception", ex);

        return buildError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong. Please try again.",
                null
        );
    }

    /* ── Helper ───────────────────────── */
    private ResponseEntity<Map<String, Object>> buildError(
            HttpStatus status,
            String message,
            Object detail   // <-- changed to Object (important)
    ) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);

        if (detail != null) {
            body.put("details", detail); // renamed for consistency
        }

        return ResponseEntity.status(status).body(body);
    }
}