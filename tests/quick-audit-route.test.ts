import { beforeEach, expect, it, vi } from "vitest";
const { run, save } = vi.hoisted(() => ({run:vi.fn(),save:vi.fn()}));
vi.mock("@/lib/quick-audit", () => ({runQuickAudit:run}));
vi.mock("@/lib/quick-audit-lead", async importOriginal => ({...await importOriginal<object>(),saveQuickAuditLead:save}));
vi.mock("@/lib/supabase", () => ({supabase:{}}));
vi.mock("@/lib/rate-limit", () => ({getClientId:async()=>"test",rateLimit:()=>({ok:true})}));
import { POST } from "../src/app/api/quick-audit/route";
beforeEach(()=> {run.mockReset();save.mockReset();run.mockResolvedValue({sources:[],limitations:[],checkedAt:"now"});save.mockResolvedValue(undefined);});
const request=(body:object)=>new Request("https://www.dousocial.com/api/quick-audit",{method:"POST",body:JSON.stringify(body)});
it.each([{website:"https://example.com"},{instagram:"@example"}])("accepts either source with phone and consent",async source=>{
 const response=await POST(request({...source,phone:"05321234567",consent:true}));
 expect(response.status).toBe(200);expect(save).toHaveBeenCalledWith("+905321234567",expect.any(Object));
});
it.each([{website:"https://example.com",consent:true},{website:"https://example.com",phone:"05321234567"}])("rejects missing contact requirements before analysis",async body=>{
 expect((await POST(request(body))).status).toBe(400);expect(run).not.toHaveBeenCalled();expect(save).not.toHaveBeenCalled();
});
it("returns 503 when the CRM-transfer source cannot be saved",async()=>{
 save.mockRejectedValue(new Error("private database error"));
 const response=await POST(request({instagram:"example",phone:"05321234567",consent:true}));
 expect(response.status).toBe(503);expect(JSON.stringify(await response.json())).not.toContain("private database");
});
