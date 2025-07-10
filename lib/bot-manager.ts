import { simpleHash, generateRandomString } from "./security"

class BotManager {
  private bots: Map<string, any> // Replace 'any' with your Bot type

  constructor() {
    this.bots = new Map()
  }

  createBot(botData: any): string {
    // Replace 'any' with your Bot data type
    const botId = generateRandomString(16) // Generate a random ID
    this.bots.set(botId, botData) // Store the bot data
    return botId
  }

  getBot(botId: string): any | undefined {
    // Replace 'any' with your Bot type
    return this.bots.get(botId)
  }

  updateBot(botId: string, botData: any): boolean {
    // Replace 'any' with your Bot data type
    if (!this.bots.has(botId)) {
      return false
    }
    this.bots.set(botId, botData)
    return true
  }

  deleteBot(botId: string): boolean {
    return this.bots.delete(botId)
  }

  getAllBotIds(): string[] {
    return Array.from(this.bots.keys())
  }

  // Example of using simpleHash
  hashBotData(botData: any): string {
    // Replace 'any' with your Bot data type
    const botDataString = JSON.stringify(botData)
    return simpleHash(botDataString)
  }
}

export default BotManager
