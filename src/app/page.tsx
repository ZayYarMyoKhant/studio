
"use client"

import { useState, useMemo } from "react"
import { Plus, ListTodo, Tag, MoreVertical, HandCoins, ArrowDownRight, ArrowUpRight, Trash2, LayoutDashboard, Loader2, Calendar as CalendarIcon } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useCollection, useUser, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore"
import { List, CATEGORIES, Debt } from "@/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { format } from "date-fns"

export default function AppMainPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "debts">("summary")
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const userId = user?.uid || "anonymous"

  // Firestore Lists
  const listsRef = useMemo(() => collection(db, "users", userId, "lists"), [db, userId])
  const listsQuery = useMemo(() => query(listsRef, orderBy("createdAt", "desc")), [listsRef])
  const { data: lists, loading: listsLoading } = useCollection<List>(listsQuery)

  // Firestore Debts
  const debtsRef = useMemo(() => collection(db, "users", userId, "debts"), [db, userId])
  const debtsQuery = useMemo(() => query(debtsRef, orderBy("date", "desc")), [debtsRef])
  const { data: debts, loading: debtsLoading } = useCollection<Debt>(debtsQuery)

  const [newListTitle, setNewListTitle] = useState("")
  const [newListCategory, setNewListCategory] = useState(CATEGORIES[0].name)
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)

  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false)
  const [debtName, setDebtName] = useState("")
  const [debtAmount, setDebtAmount] = useState("")
  const [debtType, setDebtType] = useState<"owe" | "lent">("lent")
  const [debtNote, setDebtNote] = useState("")
  const [debtDate, setDebtDate] = useState<Date>(new Date())

  // List Handlers
  const handleCreateList = () => {
    if (!newListTitle.trim()) return
    const selectedCategory = CATEGORIES.find(c => c.name === newListCategory) || CATEGORIES[0]
    const newListId = Math.random().toString(36).substr(2, 9)
    const newList: List = {
      id: newListId,
      title: newListTitle,
      category: newListCategory,
      color: selectedCategory.color,
      items: [],
      createdAt: Date.now(),
    }

    const docRef = doc(db, "users", userId, "lists", newListId)
    setDoc(docRef, newList).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: newList
      }))
    })

    setNewListTitle("")
    setIsListDialogOpen(false)
  }

  // Debt Handlers
  const handleAddDebt = () => {
    if (!debtName || !debtAmount) return
    const newDebtId = Math.random().toString(36).substr(2, 9)
    const newDebt: Debt = {
      id: newDebtId,
      personName: debtName,
      amount: parseFloat(debtAmount),
      type: debtType,
      note: debtNote,
      date: debtDate.getTime(),
      completed: false,
    }

    const docRef = doc(db, "users", userId, "debts", newDebtId)
    setDoc(docRef, newDebt).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: newDebt
      }))
    })

    setDebtName("")
    setDebtAmount("")
    setDebtNote("")
    setDebtDate(new Date())
    setIsDebtDialogOpen(false)
  }

  const deleteDebt = (id: string) => {
    const docRef = doc(db, "users", userId, "debts", id)
    deleteDoc(docRef).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }))
    })
  }

  const toggleDebtCompletion = (id: string, currentStatus: boolean) => {
    const docRef = doc(db, "users", userId, "debts", id)
    updateDoc(docRef, { completed: !currentStatus }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'update'
      }))
    })
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

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
                    <label className="text-sm font-medium text-muted-foreground">ခေါင်းစဉ်</label>
                    <Input
                      placeholder="ဥပမာ - ဈေးဝယ်စာရင်း"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">အမျိုးအစား</label>
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
                    <label className="text-sm font-medium text-muted-foreground">နာမည်</label>
                    <Input
                      placeholder="လူအမည်"
                      value={debtName}
                      onChange={(e) => setDebtName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">အမျိုးအစား</label>
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
                      <label className="text-sm font-medium text-muted-foreground">ပမာဏ</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          value={debtAmount}
                          onChange={(e) => setDebtAmount(e.target.value)}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">ကျပ်</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">ရက်စွဲ</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !debtDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {debtDate ? format(debtDate, "PPP") : <span>ရက်စွဲရွေးပါ</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={debtDate}
                          onSelect={(date) => date && setDebtDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">မှတ်ချက် (မဖြစ်မနေမဟုတ်ပါ)</label>
                    <Input
                      placeholder="မှတ်ချက်..."
                      value={debtNote}
                      onChange={(e) => setDebtNote(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <Button onClick={handleAddDebt} className="w-full bg-primary hover:bg-primary/90 font-bold py-6 text-lg rounded-xl">
                    မှတ်သားမည်
                  </Button>
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
            {listsLoading ? (
               <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
            ) : lists && lists.length > 0 ? (
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
                            {list.items?.length || 0} ခု
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
            {/* Debt List */}
            <div className="grid grid-cols-1 gap-3">
              {debtsLoading ? (
                 <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>
              ) : debts && debts.length > 0 ? (
                debts.map((debt) => (
                  <div
                    key={debt.id}
                    onClick={() => toggleDebtCompletion(debt.id, debt.completed)}
                    className={cn(
                      "group relative flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border transition-all cursor-pointer hover:ring-2 hover:ring-primary/20",
                      debt.completed && "opacity-50 grayscale"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        debt.type === 'lent' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {debt.type === 'lent' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold truncate text-foreground">{debt.personName}</h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(debt.date), "dd MMM yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-2">
                        <p className={cn("font-bold text-lg leading-tight", debt.type === 'lent' ? "text-emerald-700" : "text-rose-700")}>
                          {debt.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">ကျပ်</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDebt(debt.id);
                        }} 
                        className="text-muted-foreground hover:text-destructive transition-colors h-9 w-9"
                      >
                        <Trash2 className="h-5 w-5" />
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
