import { simpleHash, generateRandomString } from "./security"

class SubscriptionManager {
  private subscriptions: Map<string, Function[]> = new Map()

  subscribe(event: string, callback: Function): string {
    const id = generateRandomString(16) // Generate a unique ID for the subscription
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, [])
    }
    const callbacks = this.subscriptions.get(event)!
    callbacks.push(callback)
    return id
  }

  unsubscribe(event: string, id: string): void {
    if (this.subscriptions.has(event)) {
      let callbacks = this.subscriptions.get(event)!
      callbacks = callbacks.filter((_, index) => index.toString() !== id)
      this.subscriptions.set(event, callbacks)
    }
  }

  publish(event: string, data: any): void {
    if (this.subscriptions.has(event)) {
      const callbacks = this.subscriptions.get(event)!
      callbacks.forEach((callback) => {
        callback(data)
      })
    }
  }

  hashEvent(event: string): string {
    return simpleHash(event)
  }
}

export default SubscriptionManager
