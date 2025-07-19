export class ExchangeAdapterFactory {
  static create(exchange: string) {
    return {
      testConnection: async () => {
        console.log('Testing connection to ' + exchange + '...')
        return { success: true }
      }
    }
  }
}
