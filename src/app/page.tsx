"use client"

import { useState, useMemo } from "react"
import { Plus, Trash2, UserPlus, Check, X, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useCollection, useUser, useFirestore } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { Student, Attendance, DAYS } from "@/types"
import { cn } from "@/lib/utils"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { startOfWeek, format } from "date-fns"

export default function RollCallPage() {
  const { user, loading: authLoading } = useUser()
  const db = useFirestore()
  const userId = user?.uid || "anonymous"

  // Data fetching from pre-configured Firebase collections
  const studentsRef = useMemo(() => collection(db, "users", userId, "students"), [db, userId])
  const studentsQuery = useMemo(() => query(studentsRef, orderBy("rollNumber", "asc")), [studentsRef])
  const { data: students, loading: studentsLoading } = useCollection<Student>(studentsQuery)

  const attendanceRef = useMemo(() => collection(db, "users", userId, "attendance"), [db, userId])
  const { data: attendanceData } = useCollection<Attendance>(attendanceRef)

  // Form states
  const [newStudentName, setNewStudentName] = useState("")
  const [newRollNumber, setNewRollNumber] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Current week context
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newRollNumber.trim()) return
    const id = Math.random().toString(36).substr(2, 9)
    const student: Student = {
      id,
      name: newStudentName,
      rollNumber: newRollNumber,
      createdAt: Date.now()
    }

    const docRef = doc(db, "users", userId, "students", id)
    setDoc(docRef, student).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'create',
        requestResourceData: student
      }))
    })

    setNewStudentName("")
    setNewRollNumber("")
    setIsAddDialogOpen(false)
  }

  const deleteStudent = (id: string) => {
    const docRef = doc(db, "users", userId, "students", id)
    deleteDoc(docRef).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete'
      }))
    })
  }

  const toggleAttendance = (studentId: string, day: typeof DAYS[number]['key']) => {
    const attendanceId = `${currentWeekStart}_${studentId}_${day}`
    const docRef = doc(db, "users", userId, "attendance", attendanceId)
    
    const existing = attendanceData?.find(a => a.id === attendanceId)
    const newStatus = !existing?.present

    setDoc(docRef, {
      id: attendanceId,
      studentId,
      day,
      weekStartDate: currentWeekStart,
      present: newStatus
    }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: docRef.path,
        operation: 'write'
      }))
    })
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary">Roll Call Software</h1>
            <p className="text-xs text-muted-foreground mt-0.5">ကျောင်းသား တက်ရောက်မှု ဒစ်ဂျစ်တယ် မှတ်တမ်းစာအုပ်</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/95 text-white font-medium rounded-xl shadow-sm border-0">
                <UserPlus className="h-4 w-4 mr-2" /> ကျောင်းသားအသစ်ထည့်ရန်
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-800">ကျောင်းသားအချက်အလက် ဖြည့်သွင်းရန်</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">ကျောင်းသားနာမည်</label>
                  <Input
                    placeholder="အမည် ထည့်ပါ"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="rounded-xl border-slate-200 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">ခုံနံပါတ် (Roll No.)</label>
                  <Input
                    placeholder="ခုံနံပါတ် ထည့်ပါ"
                    value={newRollNumber}
                    onChange={(e) => setNewRollNumber(e.target.value)}
                    className="rounded-xl border-slate-200 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl flex-1">မလုပ်တော့ပါ</Button>
                <Button onClick={handleAddStudent} className="bg-primary rounded-xl flex-1 text-white">သိမ်းဆည်းမည်</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Table Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-100">
              <TableRow>
                <TableHead className="w-[220px] font-bold text-slate-700 h-13 text-sm">ကျောင်းသားနာမည်</TableHead>
                <TableHead className="w-[120px] font-bold text-slate-700 h-13 text-center text-sm">ခုံနံပါတ်</TableHead>
                {DAYS.map(day => (
                  <TableHead key={day.key} className="text-center font-bold text-slate-700 h-13 text-sm">{day.label}</TableHead>
                ))}
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-24">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground mt-2">ကျောင်းသားစာရင်းကို ရယူနေပါသည်...</p>
                  </TableCell>
                </TableRow>
              ) : students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/40 transition-colors border-b border-slate-100">
                    <TableCell className="font-semibold text-slate-800 text-sm py-4">{student.name}</TableCell>
                    <TableCell className="text-center font-medium text-slate-600 text-sm py-4">{student.rollNumber}</TableCell>
                    {DAYS.map(day => {
                      const recordId = `${currentWeekStart}_${student.id}_${day.key}`
                      const isPresent = attendanceData?.find(a => a.id === recordId)?.present
                      return (
                        <TableCell key={day.key} className="text-center py-3">
                          <button
                            onClick={() => toggleAttendance(student.id, day.key)}
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center transition-all border-2 mx-auto",
                              isPresent 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                                : "bg-white border-slate-200 text-slate-300 hover:border-slate-400"
                            )}
                          >
                            {isPresent ? <Check className="h-5 w-5 stroke-[3]" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                          </button>
                        </TableCell>
                      )
                    })}
                    <TableCell className="py-3 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteStudent(student.id)}
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-24 text-slate-400 bg-white">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-medium">ကျောင်းသားစာရင်း မရှိသေးပါ။</p>
                      <p className="text-xs text-muted-foreground">အပေါ်ရှိ "ကျောင်းသားအသစ်ထည့်ရန်" ခလုတ်ကိုနှိပ်၍ စာရင်းစတင်ထည့်သွင်းနိုင်ပါသည်။</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
          <span>ယနေ့ရက်စွဲ: {format(new Date(), 'dd MMMM yyyy')}</span>
        </div>
        <p>© ဒစ်ဂျစ်တယ် Roll Call စနစ် - စာအုပ်နှင့် ဘောပင် ကုန်ကျစရိတ်များကို သက်သာစေပါသည်။</p>
      </footer>
    </div>
  )
}
