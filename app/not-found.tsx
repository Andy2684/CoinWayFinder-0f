'use client'

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl">Страница не найдена</p>
      <a href="/" className="mt-4 text-blue-400 underline">На главную</a>
    </div>
  )
}
