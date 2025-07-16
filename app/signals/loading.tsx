import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SignalsLoading() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2 bg-gray-800" />
            <Skeleton className="h-4 w-64 bg-gray-800" />
          </div>
          <Skeleton className="h-10 w-32 bg-gray-800" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-[#1A1B23] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2 bg-gray-700" />
                    <Skeleton className="h-6 w-16 bg-gray-700" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-[#1A1B23] p-1 rounded-lg w-fit">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 bg-gray-700" />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Skeleton */}
            <div className="lg:col-span-1">
              <Card className="bg-[#1A1B23] border-gray-800">
                <CardHeader>
                  <Skeleton className="h-5 w-16 bg-gray-700" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-20 mb-2 bg-gray-700" />
                      <Skeleton className="h-8 w-full bg-gray-700" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Signal Cards Skeleton */}
            <div className="lg:col-span-3 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-[#1A1B23] border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-5 w-24 mb-2 bg-gray-700" />
                        <Skeleton className="h-4 w-32 bg-gray-700" />
                      </div>
                      <Skeleton className="h-6 w-16 bg-gray-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j}>
                          <Skeleton className="h-3 w-16 mb-1 bg-gray-700" />
                          <Skeleton className="h-4 w-12 bg-gray-700" />
                        </div>
                      ))}
                    </div>
                    <Skeleton className="h-2 w-full bg-gray-700" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
