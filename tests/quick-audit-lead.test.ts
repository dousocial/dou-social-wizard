import { beforeEach, expect, it, vi } from "vitest";
const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from: vi.fn(() => ({ insert })) } }));
import { normalizeAuditPhone, saveQuickAuditLead } from "../src/lib/quick-audit-lead";
import type { QuickAuditReport } from "../src/lib/quick-audit-types";
beforeEach(() => { insert.mockReset(); });
it.each(["0532 123 45 67", "5321234567", "+90 (532) 123-4567", "00905321234567"])("normalizes phone %s", value => expect(normalizeAuditPhone(value)).toBe("+905321234567"));
it.each([undefined,"","123","abc05321234567","0000000000","+".repeat(41)])("rejects invalid phone %s", value => expect(() => normalizeAuditPhone(value)).toThrow());
const report: QuickAuditReport = { checkedAt:"2026-10-01T10:00:00Z",sources:[{kind:"instagram",url:"https://www.instagram.com/example/",available:false,summary:"Veri erişimi yok.",findings:[]}],limitations:["Özel istatistiklere erişilemedi."] };
it("stores the phone and truthful report in the existing CRM-transfer source", async () => {
 insert.mockResolvedValue({error:null});
 await saveQuickAuditLead("+905321234567", report);
 expect(insert).toHaveBeenCalledWith(expect.objectContaining({business_name:"@example",phone:"+905321234567",email:"",mode:"manual",score_overall:0,active_platforms:["instagram"],report_text:expect.stringContaining("https://www.instagram.com/example/")}));
});
it("propagates storage failure instead of claiming a saved lead", async () => {
 insert.mockResolvedValue({error:{message:"private diagnostic"}});
 await expect(saveQuickAuditLead("+905321234567",report)).rejects.toThrow("Analiz başvurusu kaydedilemedi.");
});
