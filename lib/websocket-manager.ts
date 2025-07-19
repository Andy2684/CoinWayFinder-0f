export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map()
  private subscribers: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts: Map<string, number> = new Map()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(url: string, channel: string) {
    if (this.connections.has(channel)) {
      return
    }

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log(`WebSocket connected: ${channel}`)
        this.reconnectAttempts.set(channel, 0)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifySubscribers(channel, data)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.onclose = () => {
        console.log(`WebSocket disconnected: ${channel}`)
        this.connections.delete(channel)
        this.attemptReconnect(url, channel)
      }

      ws.onerror = (error) => {
        console.error(`WebSocket error on ${channel}:`, error)
      }

      this.connections.set(channel, ws)
    } catch (error) {
      console.error(`Failed to connect WebSocket for ${channel}:`, error)
    }
  }

  private attemptReconnect(url: string, channel: string) {
    const attempts = this.reconnectAttempts.get(channel) || 0

    if (attempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect ${channel} (${attempts + 1}/${this.maxReconnectAttempts})`)
        this.reconnectAttempts.set(channel, attempts + 1)
        this.connect(url, channel)
      }, this.reconnectDelay * Math.pow(2, attempts))
    }
  }

  subscribe(channel: string, callback: (data: any) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }
    this.subscribers.get(channel)!.add(callback)
  }

  unsubscribe(channel: string, callback: (data: any) => void) {
    const channelSubscribers = this.subscribers.get(channel)
    if (channelSubscribers) {
      channelSubscribers.delete(callback)
    }
  }

  private notifySubscribers(channel: string, data: any) {
    const channelSubscribers = this.subscribers.get(channel)
    if (channelSubscribers) {
      channelSubscribers.forEach((callback) => callback(data))
    }
  }

  disconnect(channel: string) {
    const ws = this.connections.get(channel)
    if (ws) {
      ws.close()
      this.connections.delete(channel)
    }
    this.subscribers.delete(channel)
  }

  disconnectAll() {
    this.connections.forEach((ws, channel) => {
      ws.close()
    })
    this.connections.clear()
    this.subscribers.clear()
  }

  isConnected(channel: string): boolean {
    const ws = this.connections.get(channel)
    return ws ? ws.readyState === WebSocket.OPEN : false
  }
}

export const wsManager = new WebSocketManager()
