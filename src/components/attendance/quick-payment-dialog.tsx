"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudio } from "@/lib/hooks/use-studio";
import { useUser } from "@/lib/hooks/use-user";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pass, PaymentMethod } from "@/lib/types/database";

interface QuickPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export function QuickPaymentDialog({ open, onClose, studentId, studentName, onSuccess }: QuickPaymentDialogProps) {
  const [passes, setPasses] = useState<(Pass & { template?: { id: string; name: string } | null })[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [selectedPassId, setSelectedPassId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { activeStudio } = useStudio();
  const { profile } = useUser();
  const supabase = createClient();

  useEffect(() => {
    if (!open || !studentId) return;

    // Reset state when dialog opens
    setSelectedPassId("");
    setAmount("");
    setMethod("cash");
    setError("");
    setSuccess(false);
    setSaving(false);

    async function loadPasses() {
      setLoadingPasses(true);
      const { data } = await supabase
        .from("passes")
        .select("*, template:pass_templates!template_id(id, name)")
        .eq("student_id", studentId)
        .eq("is_active", true)
        .order("valid_until", { ascending: false });

      const passData = (data ?? []) as (Pass & { template?: { id: string; name: string } | null })[];
      setPasses(passData);
      setLoadingPasses(false);

      // Auto-select if only one pass
      if (passData.length === 1) {
        setSelectedPassId(passData[0].id);
        setAmount(String(passData[0].price_amount));
      }
    }

    loadPasses();
  }, [open, studentId]);

  const PASS_TYPE_LABELS: Record<string, string> = {
    single_entry: "Jednorazowy",
    monthly_1x: "1x/tydzien",
    monthly_2x: "2x/tydzien",
    custom: "Indywidualny",
  };

  const getPassLabel = (p: Pass & { template?: { id: string; name: string } | null }) => {
    const label = p.template?.name ?? PASS_TYPE_LABELS[p.pass_type] ?? p.pass_type;
    return `${label} (${p.price_amount} zl)`;
  };

  const handlePassChange = (passId: string) => {
    setSelectedPassId(passId);
    const pass = passes.find((p) => p.id === passId);
    if (pass) setAmount(String(pass.price_amount));
  };

  const handleSave = async () => {
    if (!activeStudio || !selectedPassId || !amount) return;

    setError("");
    setSaving(true);

    const { error: err } = await supabase.from("payments").insert({
      studio_id: activeStudio.id,
      student_id: studentId,
      pass_id: selectedPassId,
      amount: parseInt(amount),
      method,
      recorded_by: profile?.id,
    });

    if (err) {
      setError("Wystapil blad podczas zapisywania");
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    onSuccess();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Platnosc - {studentName}</DialogTitle>
          <DialogDescription>Szybkie zapisanie platnosci</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-green-600">&#10003;</span>
            </div>
            <p className="font-medium">Platnosc zapisana</p>
            <p className="text-sm text-muted-foreground mt-1">{amount} zl - {method === "cash" ? "gotowka" : "przelew"}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Pass selection */}
              <div className="space-y-2">
                <Label>Karnet</Label>
                {loadingPasses ? (
                  <div className="h-10 flex items-center text-sm text-muted-foreground">Ladowanie...</div>
                ) : passes.length > 0 ? (
                  <Select value={selectedPassId} onValueChange={handlePassChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz karnet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {passes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {getPassLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak aktywnego karnetu</p>
                )}
              </div>

              {/* Amount and method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="qp-amount">Kwota (zl)</Label>
                  <Input
                    id="qp-amount"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metoda</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={method === "cash" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setMethod("cash")}
                    >
                      Gotowka
                    </Button>
                    <Button
                      type="button"
                      variant={method === "transfer" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setMethod("transfer")}
                    >
                      Przelew
                    </Button>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Anuluj
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !selectedPassId || !amount}
              >
                {saving ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
