/**
 * WebSocket-based Notification Service for Healthcare Platform
 * 
 * This service handles real-time notifications for reminders and health insights
 * delivered via WebSocket connection.
 */

class NotificationService {
  private socket: WebSocket | null = null;
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  
  /**
   * Initialize WebSocket connection for the current user
   * @param userId User ID to register for notifications
   */
  connect(userId: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    this.userId = userId;
    this.reconnectAttempts = 0;
    this.initializeWebSocket();
  }
  
  /**
   * Disconnect WebSocket connection
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  /**
   * Register a listener for a specific notification type
   * @param type Notification type ('reminders', 'insights', 'new_reminder', 'new_insight')
   * @param callback Function to call when notification is received
   */
  addListener(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }
  
  /**
   * Remove a listener for a specific notification type
   * @param type Notification type
   * @param callback Function to remove
   */
  removeListener(type: string, callback: (data: any) => void) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }
  
  /**
   * Initialize WebSocket connection and register handlers
   */
  private initializeWebSocket() {
    try {
      // Determine the correct WebSocket protocol (ws or wss) based on the current page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Create WebSocket URL with the proper path
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);
      
      // Handle WebSocket events
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.attemptReconnect();
    }
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen() {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0;
    
    // Register this connection with the user's ID
    if (this.userId && this.socket) {
      this.socket.send(JSON.stringify({
        type: 'register',
        userId: this.userId
      }));
    }
  }
  
  /**
   * Handle incoming WebSocket messages
   * @param event MessageEvent containing notification data
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      console.log('Received notification:', message);
      
      // Call appropriate listeners based on message type
      if (message.type && this.listeners.has(message.type)) {
        const callbacks = this.listeners.get(message.type);
        if (callbacks) {
          callbacks.forEach(callback => {
            try {
              callback(message.data);
            } catch (error) {
              console.error('Error in notification listener:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose() {
    console.log('WebSocket connection closed');
    this.socket = null;
    this.attemptReconnect();
  }
  
  /**
   * Handle WebSocket error event
   * @param error WebSocket error
   */
  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    // We'll let the close handler attempt reconnection
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.reconnectDelay);
    } else {
      console.error('Maximum reconnection attempts reached. Please refresh the page.');
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;