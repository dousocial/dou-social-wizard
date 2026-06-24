"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type PaymentInput = {
  client_id: string;
  period: string; // "YYYY-MM"
  amount: number;
  status: "bekliyor" | "odendi" | "gecikti" | "iptal";
  payment_date?: string | null;
  notes?: string;
};

export type ActionResult = { error: string | null };

export async function addPayment(data: PaymentInput): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_payments").insert(data);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${data.client_id}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function updatePaymentStatus(
  id: string,
  clientId: string,
  data: {
    status: "bekliyor" | "odendi" | "gecikti" | "iptal";
    payment_date?: string | null;
    notes?: string;
  }
): Promise<ActionResult> {
  try {
    const { error } = await sb()
      .from("crm_payments")
      .update(data)
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${clientId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function deletePayment(id: string, clientId: string): Promise<ActionResult> {
  try {
    const { error } = await sb().from("crm_payments").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/yonetim/musteriler/${clientId}`);
    return { error: null };
  } catch (e) {
    return { error: String(e) };
  }
}

// Belirtilen dönem (örn: "2026-06") için tüm aktif müşterilere toplu ödeme kaydı oluşturur
export async function generateNextPeriodPayments(period: string): Promise<{ error: string | null; count?: number }> {
  try {
    const supabase = sb();
    
    // 1. Tüm aktif müşterileri çek
    const { data: clients, error: clientErr } = await supabase
      .from("musteriler")
      .select("id, aylik_ucret")
      .eq("durum", "aktif");
      
    if (clientErr) return { error: clientErr.message };
    if (!clients || clients.length === 0) return { error: null, count: 0 };
    
    // 2. Bu dönem için halihazırda ödeme kaydı olanları çek
    const { data: existingPayments, error: payErr } = await supabase
      .from("crm_payments")
      .select("client_id")
      .eq("period", period);
      
    if (payErr) return { error: payErr.message };
    const existingClientIds = new Set(existingPayments?.map(p => p.client_id) || []);
    
    // 3. Kaydı olmayanlar için yeni kayıtlar oluştur
    const toInsert = clients
      .filter(c => !existingClientIds.has(c.id))
      .map(c => ({
        client_id: c.id,
        period: period,
        amount: Number(c.aylik_ucret ?? 0),
        status: "bekliyor" as const,
        notes: "Otomatik aylık tahakkuk kaydı."
      }));
      
    if (toInsert.length === 0) return { error: null, count: 0 };
    
    const { error: insErr } = await supabase.from("crm_payments").insert(toInsert);
    if (insErr) return { error: insErr.message };
    
    revalidatePath("/yonetim");
    return { error: null, count: toInsert.length };
  } catch (e) {
    return { error: String(e) };
  }
}
