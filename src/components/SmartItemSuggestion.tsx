"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { suggestListItemDetails } from "@/ai/flows/suggest-list-item-details"
import { useToast } from "@/hooks/use-toast"

interface SmartItemSuggestionProps {
  itemName: string;
  listContext: string;
  onSuggest: (quantity: string, description: string) => void;
}

export function SmartItemSuggestion({ itemName, listContext, onSuggest }: SmartItemSuggestionProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSuggest = async () => {
    if (!itemName || !listContext) {
      toast({
        variant: "destructive",
        title: "Input missing",
        description: "Please enter an item name and context to get suggestions.",
      })
      return
    }

    setLoading(true)
    try {
      const result = await suggestListItemDetails({ itemName, listContext })
      onSuggest(result.suggestedQuantity, result.description)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "AI error",
        description: "Failed to get suggestions. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSuggest}
      disabled={loading || !itemName}
      className="gap-2 text-secondary hover:text-secondary-foreground"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      Smart Suggest
    </Button>
  )
}