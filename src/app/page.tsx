
"use client"

import { useState, useMemo } from "react"
import { Calculator, ArrowLeft, BrickWall, Droplets, Mountain, ClipboardList, Info, History as HistoryIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { cn } from "@/lib/utils"

export default function BrightNetEstimator() {
  const { user } = useUser()
  const db = useFirestore()
  const [step, setStep] = useState<1 | 2>(1)
  const [area, setArea] = useState<string>("")
  const [volume, setVolume] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("area")
  
  const [results, setResults] = useState<{
    bricks: number;
    cementLbs: number;
    cementBags: number;
    sandCuft: number;
    sandKyin: number;
  } | null>(null)

  const historyQuery = useMemo(() => {
    if (!user) return null
    return query(
      collection(db, "users", user.uid, "history"),
      orderBy("createdAt", "desc"),
      limit(5)
    )
  }, [db, user])

  const { data: recentHistory } = useCollection(historyQuery)

  const calculate = () => {
    const inputVal = activeTab === "area" ? parseFloat(area) : parseFloat(volume)
    if (isNaN(inputVal) || inputVal <= 0) return

    let res = { bricks: 0, cementLbs: 0, cementBags: 0, sandCuft: 0, sandKyin: 0 }
    const ratio = inputVal / 100

    if (activeTab === "area") {
      res.bricks = ratio * 550
      res.cementLbs = ratio * 197
      res.sandCuft = ratio * 10
    } else {
      res.bricks = ratio * 1350
      res.cementLbs = ratio * 780
      res.sandCuft = ratio * 26
    }

    res.cementBags = res.cementLbs / 112
    res.sandKyin = res.sandCuft / 100
    
    setResults(res)
    setStep(2)

    if (user) {
      const historyRef = collection(db, "users", user.uid, "history")
      addDoc(historyRef, {
        inputType: activeTab,
        inputValue: inputVal,
        results: res,
        createdAt: Date.now()
      }).catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: historyRef.path,
          operation: 'create',
          requestResourceData: { inputType: activeTab, inputValue: inputVal, results: res }
        }))
      })
    }
  }

  const deleteHistory = (id: string) => {
    if (!user) return
    const docRef = doc(db, "users", user.uid, "history", id)
    deleteDoc(docRef).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }))
    })
  }

  const reset = () => {
    setStep(1)
    setArea("")
    setVolume("")
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      <header className="bg-black border-b border-blue-500/30 py-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-black tracking-tighter text-blue-500 italic">BRIGHT-NET</h1>
          </div>
          {step === 2 && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-blue-500 hover:bg-blue-500/10">
              <ArrowLeft className="h-4 w-4 mr-1" /> ပြန်ပြင်မည်
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-zinc-950 border-blue-500/20 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-400">
                  <ClipboardList className="h-5 w-5" />
                  တွက်ချက်ရန် အချက်အလက်
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Tabs defaultValue="area" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-zinc-900 rounded-xl p-1">
                    <TabsTrigger value="area" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">ဧရိယာ (Sqft)</TabsTrigger>
                    <TabsTrigger value="volume" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">ထုထည် (Cuft)</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="area" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-400">အုတ်စီမည့် နံရံ၏အကျယ် (စတုရန်းပေ)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="နံရံအကျယ်ထည့်ပါ"
                          value={area}
                          onChange={(e) => { setArea(e.target.value); setVolume(""); }}
                          className="h-12 bg-zinc-900 border-zinc-800 rounded-xl text-lg text-white focus:ring-blue-500 pr-14"
                        />
                        <span className="absolute right-4 top-3 text-blue-500/50 font-medium">Sqft</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="volume" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-400">အုတ်စီမည့် နံရံ၏ ထုထည် (ကုဗပေ)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="နံရံထုထည်ထည့်ပါ"
                          value={volume}
                          onChange={(e) => { setVolume(e.target.value); setArea(""); }}
                          className="h-12 bg-zinc-900 border-zinc-800 rounded-xl text-lg text-white focus:ring-blue-500 pr-14"
                        />
                        <span className="absolute right-4 top-3 text-blue-500/50 font-medium">Cuft</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={calculate} 
                  disabled={!area && !volume}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95"
                >
                  တွက်ချက်မည်
                </Button>
              </CardContent>
            </Card>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-400/80 leading-relaxed">
                <p className="font-bold mb-1 text-blue-400">Standard Estimates (မြန်မာစံနှုန်း) -</p>
                <p>• ၁၀၀ စတုရန်းပေ - အုတ် ၅၅၀ ချပ်၊ ဘိလပ်မြေ ၁၉၇ ပေါင်၊ သဲ ၁၀ ကုဗပေ</p>
                <p>• ၁၀၀ ကုဗပေ - အုတ် ၁၃၅၀ ချပ်၊ ဘိလပ်မြေ ၇၈၀ ပေါင်၊ သဲ ၂၆ ကုဗပေ</p>
              </div>
            </div>

            {recentHistory && recentHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-500 flex items-center gap-2 px-2 uppercase tracking-tighter">
                  <HistoryIcon className="h-4 w-4" /> RECENT CALCULATIONS
                </h3>
                {recentHistory.map((item: any) => (
                  <Card key={item.id} className="bg-zinc-950 border-zinc-900 shadow-sm rounded-xl overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-zinc-300">
                          {item.inputValue} {item.inputType === 'area' ? 'Sqft' : 'Cuft'}
                        </p>
                        <p className="text-[10px] text-zinc-600">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-bold text-blue-500">{Math.ceil(item.results.bricks)} ချပ်</p>
                          <p className="text-[10px] text-zinc-500">{item.results.cementBags.toFixed(1)} အိတ်</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteHistory(item.id)}
                          className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold text-blue-400 px-2 flex items-center justify-between">
              BRIGHT-NET RESULTS
              <span className="text-xs font-normal text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                {activeTab === 'area' ? `${area} Sqft` : `${volume} Cuft`}
              </span>
            </h2>

            <Card className="bg-zinc-950 border-blue-500/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                  <BrickWall className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">အုတ် (Bricks)</p>
                  <p className="text-3xl font-black text-white tabular-nums">
                    {Math.ceil(results?.bricks || 0).toLocaleString()} 
                    <span className="text-base font-medium text-blue-500 ml-2">ချပ်</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-blue-500/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                  <Droplets className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">ဘိလပ်မြေ (Cement)</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white tabular-nums">
                      {results?.cementLbs.toFixed(1)} 
                      <span className="text-base font-medium text-blue-500 ml-2">ပေါင်</span>
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                      {results?.cementBags.toFixed(2)} အိတ် (Bags)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-blue-500/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                  <Mountain className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">သဲ (Sand)</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white tabular-nums">
                      {results?.sandCuft.toFixed(1)} 
                      <span className="text-base font-medium text-blue-500 ml-2">ကုဗပေ</span>
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full">
                      {results?.sandKyin.toFixed(2)} ကျင်း (Kyin)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="outline"
              onClick={reset}
              className="w-full h-12 border-blue-500/30 text-blue-500 bg-black font-bold rounded-xl mt-4 hover:bg-blue-500/10 transition-all"
            >
              အသစ်ပြန်တွက်မည်
            </Button>
          </div>
        )}
      </main>

      <footer className="max-w-md mx-auto px-4 mt-12 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-bold">
        <p>© BRIGHT-NET CONSTRUCTION ESTIMATOR</p>
        <div className="w-10 h-0.5 bg-blue-500 mx-auto mt-2 rounded-full opacity-30"></div>
      </footer>
    </div>
  )
}
