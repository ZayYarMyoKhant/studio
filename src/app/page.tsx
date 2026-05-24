
"use client"

import { useState } from "react"
import { Plus, ListTodo, Tag, MoreVertical, HandCoins, ArrowDownRight, ArrowUpRight, Trash2, LayoutDashboard } from "lucide-react"
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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { List, CATEGORIES, Debt } from "@/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function AppMainPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "debts">("summary")
  
  // Lists State
  const [lists, setLists, listsHydrated] = useLocalStorage<List[]>("sarinease_lists", [])
  const [newListTitle, setNewListTitle] = useState("")
  const [newListCategory, setNewListCategory] = useState(CATEGORIES[0].name)
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)

  // Debts State
  const [debts, setDebts, debtsHydrated] = useLocalStorage<Debt[]>("sarinease_debts", [])
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false)
  const [debtName, setDebtName] = useState("")
  const [debtAmount, setDebtAmount] = useState("")
  const [debtType, setDebtType] = useState<"owe" | "lent">("lent")
  const [debtNote, setDebtNote] = useState("")

  // List Handlers
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
    setIsListDialogOpen(false)
  }

  // Debt Handlers
  const handleAddDebt = () => {
    if (!debtName || !debtAmount) return
    const newDebt: Debt = {
      id: Math.random().toString(36).substr(2, 9),
      personName: debtName,
      amount: parseFloat(debtAmount),
      type: debtType,
      note: debtNote,
      date: Date.now(),
      completed: false,
    }
    setDebts([newDebt, ...debts])
    setDebtName("")
    setDebtAmount("")
    setDebtNote("")
    setIsDebtDialogOpen(false)
  }

  const deleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id))
  }

  const totalToReceive = debts
    .filter(d => d.type === 'lent' && !d.completed)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalToPay = debts
    .filter(d => d.type === 'owe' && !d.completed)
    .reduce((acc, curr) => acc + curr.amount, 0)

  if (!listsHydrated || !debtsHydrated) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {activeTab === "summary" ? "စာရင်းချုပ်" : "အကြွေးစာရင်း"}
          </h1>
          
          {activeTab === "summary" ? (
            <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
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
                  <Button variant="outline" onClick={() => setIsListDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateList} className="bg-primary">သိမ်းမည်</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isDebtDialogOpen} onOpenChange={setIsDebtDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full">
                  <Plus className="h-5 w-5 mr-1" /> အသစ်ထည့်
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>အကြွေးမှတ်တမ်းအသစ်</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">နာမည်</label>
                    <Input
                      placeholder="လူအမည်"
                      value={debtName}
                      onChange={(e) => setDebtName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ပမာဏ</label>
                    <Input
                      type="number"
                      placeholder="ငွေပမာဏ"
                      value={debtAmount}
                      onChange={(e) => setDebtAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">အမျိုးအစား</label>
                    <Select value={debtType} onValueChange={(val: any) => setDebtType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lent">ရရန်ရှိ (Lent)</SelectItem>
                        <SelectItem value="owe">ပေးရန်ရှိ (Owe)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">မှတ်ချက်</label>
                    <Input
                      placeholder="အပိုဆောင်းမှတ်ချက်"
                      value={debtNote}
                      onChange={(e) => setDebtNote(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDebtDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddDebt} className="bg-primary">သိမ်းမည်</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 mb-20">
        {activeTab === "summary" ? (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-green-50 border-green-100 shadow-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-green-700 uppercase tracking-wider">ရရန်ရှိ</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold text-green-700">{totalToReceive.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-100 shadow-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold text-red-700 uppercase tracking-wider">ပေးရန်ရှိ</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold text-red-700">{totalToPay.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Debt List */}
            <div className="space-y-3">
              {debts.length > 0 ? (
                debts.map((debt) => (
                  <div
                    key={debt.id}
                    className={cn(
                      "flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border transition-all",
                      debt.completed && "opacity-50 grayscale"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        debt.type === 'lent' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {debt.type === 'lent' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold">{debt.personName}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(debt.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn("font-bold text-lg", debt.type === 'lent' ? "text-green-700" : "text-red-700")}>
                          {debt.amount.toLocaleString()}
                        </p>
                        {debt.note && <p className="text-xs text-muted-foreground">{debt.note}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteDebt(debt.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                    <HandCoins className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium">အကြွေးစာရင်းမရှိသေးပါ</h3>
                  <p className="text-sm text-muted-foreground">မှတ်တမ်းတင်ရန် "အသစ်ထည့်" ကိုနှိပ်ပါ။</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around items-center h-16 px-4 max-w-2xl mx-auto shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab("summary")}
          className={cn(
            "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            activeTab === "summary" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutDashboard className={cn("h-6 w-6", activeTab === "summary" && "fill-primary/10")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">စာရင်းချုပ်</span>
          {activeTab === "summary" && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("debts")}
          className={cn(
            "relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
            activeTab === "debts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <HandCoins className={cn("h-6 w-6", activeTab === "debts" && "fill-primary/10")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">အကြွေးစာရင်း</span>
          {activeTab === "debts" && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
        </button>
      </nav>
    </div>
  )
}
