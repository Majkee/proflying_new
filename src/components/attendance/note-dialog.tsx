"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  currentNote?: string;
  onSave: (note: string, status: "excused" | null) => void;
}

const QUICK_NOTES = ["Kontuzja", "Urlop", "Choroba", "Spózniona"];

export function NoteDialog({ open, onClose, studentName, currentNote, onSave }: NoteDialogProps) {
  const [note, setNote] = useState(currentNote ?? "");

  const handleSave = () => {
    onSave(note, note ? "excused" : null);
    onClose();
  };

  const handleQuickNote = (quickNote: string) => {
    setNote(quickNote);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notatka - {studentName}</DialogTitle>
          <DialogDescription>Dodaj notatke do obecnosci</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {QUICK_NOTES.map((qn) => (
              <Button
                key={qn}
                variant={note === qn ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickNote(qn)}
              >
                {qn}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Notatka</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Wpisz notatke..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
