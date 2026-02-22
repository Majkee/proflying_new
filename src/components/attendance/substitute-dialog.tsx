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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SubstituteDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function SubstituteDialog({ open, onClose, onAdd }: SubstituteDialogProps) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj goscia</DialogTitle>
          <DialogDescription>
            Dodaj osobe spoza grupy do dzisiejszych zajec
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="guestName">Imie i nazwisko</Label>
          <Input
            id="guestName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Imie i nazwisko goscia"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Dodaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
