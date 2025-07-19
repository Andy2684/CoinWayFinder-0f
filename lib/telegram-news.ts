export function formatTelegramNews(message: string): string {
  return message.replace(/\n/g, ' ').slice(0, 200)
}
