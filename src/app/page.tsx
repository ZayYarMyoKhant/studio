
"use client"

import { useState, useMemo } from "react"
import { Calculator, ArrowLeft, BrickWall, Droplets, Mountain, ClipboardList, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function EngineeringCalcPage() {
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

  const calculate = () => {
    let res = { bricks: 0, cementLbs: 0, cementBags: 0, sandCuft: 0, sandKyin: 0 }
    const inputVal = activeTab === "area" ? parseFloat(area) : parseFloat(volume)

    if (activeTab === "area" && area) {
      res.bricks = (inputVal / 100) * 550
      res.cementLbs = (inputVal / 100) * 197
      res.sandCuft = (inputVal / 100) * 10
    } else if (activeTab === "volume" && volume) {
      res.bricks = (inputVal / 100) * 1350
      res.cementLbs = (inputVal / 100) * 780
      res.sandCuft = (inputVal / 100) * 26
    }

    res.cementBags = res.cementLbs / 112
    res.sandKyin = res.sandCuft / 100
    
    setResults(res)
    setStep(2)

    // Save to Firestore if user is logged in
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

  const reset = () => {
    setStep(1)
    setArea("")
    setVolume("")
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10">
      <header className="bg-primary text-white py-6 shadow-md">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <h1 className="text-xl font-bold tracking-tight">အင်ဂျင်နီယာ တွက်ချက်မှု</h1>
          </div>
          {step === 2 && (
            <Button variant="ghost" size="sm" onClick={reset} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-1" /> ပြန်ပြင်မည်
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  တွက်ချက်ရန် အချက်အလက်
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <Tabs defaultValue="area" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="area">နံရံအကျယ် (Sqft)</TabsTrigger>
                    <TabsTrigger value="volume">နံရံထုထည် (Cuft)</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="area" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-600">အုတ်စီမည့် နံရံ၏အကျယ် (စတုရန်းပေ)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="ဥပမာ - ၁၀၀"
                          value={area}
                          onChange={(e) => { setArea(e.target.value); setVolume(""); }}
                          className="h-12 rounded-xl text-lg border-slate-200 focus:ring-primary pr-12"
                        />
                        <span className="absolute right-4 top-3 text-slate-400 font-medium">Sqft</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="volume" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-600">အုတ်စီမည့် နံရံ၏ ထုထည် (ကုဗပေ)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="ဥပမာ - ၁၀၀"
                          value={volume}
                          onChange={(e) => { setVolume(e.target.value); setArea(""); }}
                          className="h-12 rounded-xl text-lg border-slate-200 focus:ring-primary pr-12"
                        />
                        <span className="absolute right-4 top-3 text-slate-400 font-medium">Cuft</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={calculate} 
                  disabled={!area && !volume}
                  className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  တွက်ချက်မည်
                </Button>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 leading-relaxed">
                <p className="font-bold mb-1">အခြေခံစံနှုန်းများ -</p>
                <p>၁၀၀ စတုရန်းပေ (နံရံအကျယ်) - အုတ် ၅၅၀ ချပ်၊ ဘိလပ်မြေ ၁၉၇ ပေါင်၊ သဲ ၁၀ ကုဗပေ</p>
                <p>၁၀၀ ကုဗပေ (နံရံထုထည်) - အုတ် ၁၃၅၀ ချပ်၊ ဘိလပ်မြေ ၇၈၀ ပေါင်၊ သဲ ၂၆ ကုဗပေ</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-lg font-bold text-slate-700 px-2 flex items-center justify-between">
              တွက်ချက်ထားသော ရလဒ်များ
              <span className="text-xs font-normal text-slate-400">
                {activeTab === 'area' ? `နံရံဧရိယာ: ${area} Sqft` : `နံရံထုထည်: ${volume} Cuft`}
              </span>
            </h2>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <BrickWall className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">အုတ်လိုအပ်ချက်</p>
                  <p className="text-2xl font-bold text-slate-800">{Math.ceil(results?.bricks || 0).toLocaleString()} <span className="text-base font-medium text-slate-500">ချပ်</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Droplets className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">ဘိလပ်မြေလိုအပ်ချက်</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-800">{results?.cementLbs.toFixed(1)} <span className="text-base font-medium text-slate-500">ပေါင်</span></p>
                    <div className="h-px bg-slate-100 w-full" />
                    <p className="text-lg font-bold text-blue-600">{results?.cementBags.toFixed(2)} <span className="text-sm font-medium">အိတ်</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                  <Mountain className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">သဲလိုအပ်ချက်</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-800">{results?.sandCuft.toFixed(1)} <span className="text-base font-medium text-slate-500">ကုဗပေ</span></p>
                    <div className="h-px bg-slate-100 w-full" />
                    <p className="text-lg font-bold text-amber-600">{results?.sandKyin.toFixed(2)} <span className="text-sm font-medium">ကျင်း</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="outline"
              onClick={reset}
              className="w-full h-12 border-slate-200 text-slate-600 font-bold rounded-xl mt-4"
            >
              အသစ်ပြန်တွက်မည်
            </Button>
          </div>
        )}
      </main>

      <footer className="max-w-md mx-auto px-4 mt-12 text-center text-slate-400 text-xs">
        <p>© ဆောက်လုပ်ရေးဆိုင်ရာ ပစ္စည်းခန့်မှန်းတွက်ချက်စနစ်</p>
        <p className="mt-1">Engineer's Standard Estimates (Myanmar)</p>
      </footer>
    </div>
  )
}
