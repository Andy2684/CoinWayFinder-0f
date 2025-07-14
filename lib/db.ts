// lib/db.ts

// Временный stub для взаимодействия с базой данных.
// Позже замените этот файл на реальный клиент (Drizzle, Prisma, @vercel/postgres и т.д.).

// SQL-шаблонная функция stub
export async function sql(_query: TemplateStringsArray): Promise<any[]> {
  return [];
}

// Заглушка объекта db с базовыми методами и цепочками
export const db = {
  select: async (_columns: Record<string, any>) => {
    return [] as any[];
  },
  insert(table: any) {
    return {
      values: (_data: Record<string, any>) => ({
        returning: async () => [] as any[],
      }),
    };
  },
  where() {
    return this;
  },
  orderBy() {
    return this;
  },
  limit() {
    return this;
  },
};
