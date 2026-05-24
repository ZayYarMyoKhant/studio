"use client"

import { useState } from "react"
import { Plus, HandCoins, ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import { Debt } from "@/types"
import { cn } from "@/lib/utils"

export default function DebtsPage() {
  const [debts, setDebts] = useLocalStorage<Debt[]>("sarinease_debts", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"owe" | "lent">("lent")
  const [note, setNote] = useState("")

  const handleAddDebt = () => {
    if (!name || !amount) return

    const newDebt: Debt = {
      id: Math.random().toString(36).substr(2, 9),
      personName: name,
      amount: parseFloat(amount),
      type: type,
      note: note,
      date: Date.now(),
      completed: false,
    }

    setDebts([newDebt, ...debts])
    setName("")
    setAmount("")
    setNote("")
    setIsDialogOpen(false)
  }

  const deleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id))
  }

  const toggleComplete = (id: string) => {
    setDebts(debts.map(d => d.id === id ? { ...d, completed: !d.completed } : d))
  }

  const totalToReceive = debts
    .filter(d => d.type === 'lent' && !d.completed)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalToPay = debts
    .filter(d => d.type === 'owe' && !d.completed)
    .reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary">အကြွေးစာရင်း</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ပမာဏ</label>
                  <Input
                    type="number"
                    placeholder="ငွေပမာဏ"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">အမျိုးအစား</label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
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
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDebt} className="bg-primary">သိမ်းမည်</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
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
      </main>
    </div>
  )
}
