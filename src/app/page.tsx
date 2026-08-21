
"use client"

import { useState, useMemo } from "react"
import { Plus, Trash2, UserPlus, Check, X, Loader2 } from "lucide-react"
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

  // Data fetching
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
    if (!newStudentName || !newRollNumber) return
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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Roll Call</h1>
            <p className="text-sm text-muted-foreground">ကျောင်းသား တက်ရောက်မှုစာရင်း</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20">
                <UserPlus className="h-4 w-4 mr-2" /> ကျောင်းသားအသစ်ထည့်
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>ကျောင်းသား အချက်အလက်</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">နာမည်</label>
                  <Input
                    placeholder="ကျောင်းသားအမည်"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ခုံနံပါတ်</label>
                  <Input
                    placeholder="Roll No."
                    value={newRollNumber}
                    onChange={(e) => setNewRollNumber(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">မလုပ်တော့ပါ</Button>
                <Button onClick={handleAddStudent} className="bg-primary rounded-xl px-8">သိမ်းမည်</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Table Section */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[200px] font-bold">ကျောင်းသားနာမည်</TableHead>
                <TableHead className="w-[100px] font-bold text-center">ခုံနံပါတ်</TableHead>
                {DAYS.map(day => (
                  <TableHead key={day.key} className="text-center font-bold">{day.label}</TableHead>
                ))}
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-center">{student.rollNumber}</TableCell>
                    {DAYS.map(day => {
                      const recordId = `${currentWeekStart}_${student.id}_${day.key}`
                      const isPresent = attendanceData?.find(a => a.id === recordId)?.present
                      return (
                        <TableCell key={day.key} className="text-center">
                          <button
                            onClick={() => toggleAttendance(student.id, day.key)}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2",
                              isPresent 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200" 
                                : "bg-white border-slate-200 text-slate-300 hover:border-slate-300"
                            )}
                          >
                            {isPresent ? <Check className="h-6 w-6" /> : <X className="h-4 w-4 opacity-50" />}
                          </button>
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteStudent(student.id)}
                        className="text-slate-300 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
                    ကျောင်းသားစာရင်း မရှိသေးပါ။ "ကျောင်းသားအသစ်ထည့်" ကိုနှိပ်ပါ။
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-xs text-slate-400">
        <p>ယနေ့ရက်စွဲ: {format(new Date(), 'dd MMMM yyyy')}</p>
      </footer>
    </div>
  )
}
