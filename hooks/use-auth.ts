```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Определение типа для объекта пользователя
interface User {
  id: string;
  email: string;
  name?: string;
}

// Определение типа для контекста аутентификации
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Создание контекста аутентификации
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Пропсы для провайдера
interface AuthProviderProps {
  children: ReactNode;
}

// Провайдер контекста аутентификации
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверка состояния аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Пример: Проверка токена в localStorage (замените на вашу логику)
        const token = localStorage.getItem('authToken');
        if (token) {
          // Мок-данные пользователя (замените на реальный запрос к API)
          const mockUser: User = {
            id: '1',
            email: 'user@example.com',
            name: 'Test User',
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Ошибка при проверке аутентификации:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Пример: Мок-аутентификация (замените на запрос к вашему API)
      // Например, используйте fetch или библиотеку, такую как axios
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Неверные учетные данные');
      }

      const { user, token } = await response.json();
      setUser(user);
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw new Error('Ошибка входа. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  // Возвращаем провайдер контекста с исправленным синтаксисом
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Кастомный хук для использования контекста аутентификации
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}
```