package com.unmute.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GDWebSocketHandler gdHandler;

    public WebSocketConfig(GDWebSocketHandler gdHandler) {
        this.gdHandler = gdHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(gdHandler, "/ws/gd/{roomId}")
                .setAllowedOriginPatterns("*");
    }
}
