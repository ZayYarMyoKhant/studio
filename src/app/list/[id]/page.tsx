
"use client"

import { useState, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, CheckCircle2, Circle, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser, useFirestore, useDoc } from "@/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { List, ListItem } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { SmartItemSuggestion } from "@/components/SmartItemSuggestion"
import { cn } from "@/lib/utils"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  const userId = user?.uid || "anonymous"

  const listRef = useMemo(() => doc(db, "users", userId, "lists", id), [db, userId, id])
  const { data: list, loading } = useDoc<List>(listRef)

  const [newItemName, setNewItemName] = useState("")
  const [newItemQty, setNewItemQty] = useState("")
  const [newItemDesc, setNewItemDesc] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (!list) return <div className="p-8 text-center">List not found.</div>

  const handleAddItem = () => {
    if (!newItemName.trim()) return

    const newItem: ListItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      quantity: newItemQty,
      description: newItemDesc,
      completed: false,
      createdAt: Date.now(),
    }

    const updatedItems = [newItem, ...(list.items || [])]
    updateDoc(listRef, { items: updatedItems }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: listRef.path,
        operation: 'update',
        requestResourceData: { items: updatedItems }
      }))
    })
    
    setNewItemName("")
    setNewItemQty("")
    setNewItemDesc("")
    setIsAdding(false)
    
    toast({
      title: "Item added",
      description: `${newItemName} has been added to your list.`,
    })
  }

  const toggleItem = (itemId: string) => {
    const updatedItems = list.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
    updateDoc(listRef, { items: updatedItems }).catch(async () => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: listRef.path,
        operation: 'update'
      }))
    })
  }

  const deleteItem = (itemId: string) => {
    const updatedItems = list.items.filter(i => i.id !== itemId)
    updateDoc(listRef, { items: updatedItems }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: listRef.path,
        operation: 'update'
      }))
    })
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">{list.title}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white inline-block" style={{ backgroundColor: list.color }}>
                {list.category}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-full h-10 w-10 p-0 shadow-lg"
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus className={cn("h-6 w-6 transition-transform", isAdding && "rotate-45")} />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Add Item Form */}
        {isAdding && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm space-y-4 item-slide-in border">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input
                placeholder="What are you adding?"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted-foreground">Smart Assistance</label>
                <SmartItemSuggestion
                  itemName={newItemName}
                  listContext={list.category + " list " + list.title}
                  onSuggest={(qty, desc) => {
                    setNewItemQty(qty)
                    setNewItemDesc(desc)
                  }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Qty/Unit</label>
                  <Input
                    placeholder="e.g. 5"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Description/Note</label>
                  <Input
                    placeholder="Short note..."
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleAddItem} disabled={!newItemName}>
                Add to List
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* List Items */}
        <div className="space-y-3">
          {list.items && list.items.length > 0 ? (
            list.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-accent transition-all item-slide-in",
                  item.completed && "opacity-60"
                )}
              >
                <div className="flex items-start gap-4 flex-1">
                  <button onClick={() => toggleItem(item.id)} className="mt-1">
                    {item.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-secondary fill-secondary/10" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-foreground", item.completed && "line-through text-muted-foreground")}>
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs px-2 py-0.5 bg-accent/50 text-accent-foreground rounded-md font-bold">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Your list is empty.</p>
              {!isAdding && (
                <Button variant="link" onClick={() => setIsAdding(true)}>
                  Tap + to add items
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
