"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, Search, Trash2, Share2, Download, Clock, Tag, Folder, Star, ExternalLink } from "lucide-react"

export function NewsBookmarks() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [filterBy, setFilterBy] = useState("all")

  const bookmarkedArticles = [
    {
      id: 1,
      title: "Bitcoin ETF Approval: What It Means for Crypto Markets",
      summary: "Comprehensive analysis of the Bitcoin ETF approval and its market implications...",
      source: "CoinDesk",
      category: "bitcoin",
      bookmarkedAt: "2024-01-07T10:30:00Z",
      tags: ["ETF", "Bitcoin", "Regulation"],
      readTime: "5 min",
      url: "#",
      notes: "Important for portfolio strategy",
    },
    {
      id: 2,
      title: "Ethereum Staking Rewards Hit All-Time High",
      summary: "Ethereum staking rewards reach record levels as more validators join the network...",
      source: "Decrypt",
      category: "ethereum",
      bookmarkedAt: "2024-01-06T15:45:00Z",
      tags: ["Ethereum", "Staking", "DeFi"],
      readTime: "3 min",
      url: "#",
      notes: "Check staking opportunities",
    },
    {
      id: 3,
      title: "DeFi Protocol Security Best Practices",
      summary: "Essential security measures for DeFi protocols and smart contract auditing...",
      source: "CryptoNews",
      category: "defi",
      bookmarkedAt: "2024-01-05T09:20:00Z",
      tags: ["DeFi", "Security", "Smart Contracts"],
      readTime: "7 min",
      url: "#",
      notes: "Reference for security audit",
    },
    {
      id: 4,
      title: "NFT Market Recovery: Signs of Life",
      summary: "Analysis of recent NFT market trends showing potential recovery signals...",
      source: "NFT News",
      category: "nft",
      bookmarkedAt: "2024-01-04T14:15:00Z",
      tags: ["NFT", "Market Analysis", "Recovery"],
      readTime: "4 min",
      url: "#",
      notes: "Monitor for investment opportunities",
    },
    {
      id: 5,
      title: "Layer 2 Scaling Solutions Comparison",
      summary: "Detailed comparison of Ethereum Layer 2 solutions and their performance metrics...",
      source: "Layer2News",
      category: "technology",
      bookmarkedAt: "2024-01-03T11:30:00Z",
      tags: ["Layer2", "Scaling", "Ethereum"],
      readTime: "6 min",
      url: "#",
      notes: "Technical reference",
    },
  ]

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "bitcoin", label: "Bitcoin" },
    { value: "ethereum", label: "Ethereum" },
    { value: "defi", label: "DeFi" },
    { value: "nft", label: "NFTs" },
    { value: "technology", label: "Technology" },
  ]

  const filteredArticles = bookmarkedArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterBy === "all" || article.category === filterBy
    return matchesSearch && matchesFilter
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      case "source":
        return a.source.localeCompare(b.source)
      default:
        return 0
    }
  })

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bitcoin":
        return "bg-orange-400/20 text-orange-400"
      case "ethereum":
        return "bg-blue-400/20 text-blue-400"
      case "defi":
        return "bg-green-400/20 text-green-400"
      case "nft":
        return "bg-purple-400/20 text-purple-400"
      case "technology":
        return "bg-cyan-400/20 text-cyan-400"
      default:
        return "bg-gray-400/20 text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">💾 Saved Articles</h2>
          <p className="text-gray-400">Your bookmarked crypto news and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Collection
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4 text-[#30D5C8]" />
              <div>
                <div className="text-2xl font-bold text-white">{bookmarkedArticles.length}</div>
                <div className="text-xs text-gray-400">Total Saved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {bookmarkedArticles.reduce((acc, article) => acc + Number.parseInt(article.readTime), 0)}
                </div>
                <div className="text-xs text-gray-400">Total Read Time (min)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(bookmarkedArticles.flatMap((article) => article.tags)).size}
                </div>
                <div className="text-xs text-gray-400">Unique Tags</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-4 w-4 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(bookmarkedArticles.map((article) => article.category)).size}
                </div>
                <div className="text-xs text-gray-400">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="date">Date Saved</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="source">Source</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookmarked Articles */}
      <div className="space-y-4">
        {sortedArticles.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-8 text-center">
              <Bookmark className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No bookmarks found</h3>
              <p className="text-gray-500">
                {searchTerm || filterBy !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start bookmarking articles to build your collection"}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedArticles.map((article) => (
            <Card
              key={article.id}
              className="bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={`text-xs ${getCategoryColor(article.category)}`}>
                        {article.category.toUpperCase()}
                      </Badge>
                      <span className="text-gray-400 text-sm">{article.source}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-400 text-sm">{article.readTime}</span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2 hover:text-[#30D5C8] transition-colors cursor-pointer">
                      {article.title}
                    </h3>

                    <p className="text-gray-300 mb-3">{article.summary}</p>

                    {article.notes && (
                      <div className="bg-[#30D5C8]/5 border border-[#30D5C8]/20 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Star className="h-3 w-3 text-[#30D5C8]" />
                          <span className="text-[#30D5C8] text-xs font-medium">Your Note</span>
                        </div>
                        <p className="text-gray-300 text-sm">{article.notes}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Saved {getTimeAgo(article.bookmarkedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#30D5C8]">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
