"use client"

import { useState } from "react"
import { Plus, ListTodo, Tag, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { List, CATEGORIES } from "@/types"
import Link from "next/link"

export default function SummaryPage() {
  const [lists, setLists] = useLocalStorage<List[]>("sarinease_lists", [])
  const [newListTitle, setNewListTitle] = useState("")
  const [newListCategory, setNewListCategory] = useState(CATEGORIES[0].name)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">စာရင်းချုပ်</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full">
                <Plus className="h-5 w-5 mr-1" /> အသစ်ထည့်
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>စာရင်းအသစ်ပြုလုပ်ရန်</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ခေါင်းစဉ်</label>
                  <Input
                    placeholder="ဥပမာ - ဈေးဝယ်စာရင်း"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">အမျိုးအစား</label>
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
                <Button onClick={handleCreateList} className="bg-primary">သိမ်းမည်</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid gap-4">
          {lists.length > 0 ? (
            lists.map((list) => (
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
                          {list.items.length} ခု
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
              <h3 className="text-lg font-medium text-foreground">စာရင်းမရှိသေးပါ</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ညာဘက်အပေါ်က "အသစ်ထည့်" ကိုနှိပ်ပြီး စတင်ပါ။
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
