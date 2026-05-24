"use client"

import { useState, useMemo } from "react"
import { Plus, Search, MoreVertical, ListTodo, Tag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { List, CATEGORIES } from "@/types"
import Link from "next/link"

export default function Dashboard() {
  const [lists, setLists] = useLocalStorage<List[]>("sarinease_lists", [])
  const [isHydrated] = useState(true) // Handled by useLocalStorage internal hook
  const [searchQuery, setSearchQuery] = useState("")
  const [newListTitle, setNewListTitle] = useState("")
  const [newListCategory, setNewListCategory] = useState(CATEGORIES[0].name)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredLists = useMemo(() => {
    return lists.filter((list) =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [lists, searchQuery])

  const handleCreateList = () => {
    if (!newListTitle.trim()) return

    const selectedCategory = CATEGORIES.find(c => c.name === newListCategory) || CATEGORIES[0]

    const newList: List = {
      id: Math.random().toString(36).substr(2, 9),
      title: newListTitle,
      category: newListCategory,
      color: selectedCategory.color,
      items: [],
      createdAt: Date.now(),
    }

    setLists([newList, ...lists])
    setNewListTitle("")
    setIsDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-primary">စာရင်း</h1>
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full h-10 w-10 p-0 shadow-lg">
                    <Plus className="h-6 w-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">List Title</label>
                      <Input
                        placeholder="e.g. Weekly Groceries"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newListCategory} onValueChange={setNewListCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateList} className="bg-primary">Create List</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all lists and items..."
              className="pl-10 h-12 bg-white border-none shadow-sm rounded-xl focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid gap-4">
          {filteredLists.length > 0 ? (
            filteredLists.map((list) => (
              <Link key={list.id} href={`/list/${list.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: list.color }}
                      >
                        <ListTodo className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {list.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Tag className="h-3 w-3" />
                          {list.category}
                          <span className="mx-1">•</span>
                          {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No lists found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Get started by creating your first list"}
              </p>
              {!searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Create New List
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
