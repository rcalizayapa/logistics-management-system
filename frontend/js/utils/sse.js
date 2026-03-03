// frontend/js/utils/sse.js
class SSEConnection {
    constructor(url, onMessage, onError) {
        this.url = url;
        this.onMessage = onMessage;
        this.onError = onError;
        this.eventSource = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        this.eventSource = new EventSource(this.url);

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.onMessage(data);
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts <= this.maxReconnectAttempts) {
                setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
            } else {
                this.onError?.(error);
            }
        };

        this.eventSource.onopen = () => {
            console.log('SSE connection established');
            this.reconnectAttempts = 0;
        };
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

window.SSEConnection = SSEConnection;