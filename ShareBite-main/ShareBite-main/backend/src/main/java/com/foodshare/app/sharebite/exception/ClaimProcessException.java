package com.foodshare.app.sharebite.exception;

import java.io.Serial;

public class ClaimProcessException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = 1L;

    public ClaimProcessException(String message) {
        super(message);
    }
}