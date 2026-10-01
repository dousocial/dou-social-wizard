import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ permission:vi.fn(), createClient:vi.fn() }));
vi.mock("@/lib/session",()=>({requirePermission:mocks.permission}));
vi.mock("@supabase/supabase-js",()=>({createClient:mocks.createClient}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
import * as actions from "../src/lib/actions/crmInfluencers";
beforeEach(()=>{mocks.permission.mockReset().mockRejectedValue(new Error("Yetki yok"));mocks.createClient.mockReset();});
it.each([
 ["addInfluencer",()=>actions.addInfluencer({ad:"Test"})],
 ["updateInfluencer",()=>actions.updateInfluencer("id",{ad:"Test"})],
 ["deleteInfluencer",()=>actions.deleteInfluencer("id")],
 ["addCollaboration",()=>actions.addCollaboration({influencer_id:"id",kampanya_adi:"Test"})],
 ["updateCollaboration",()=>actions.updateCollaboration("id",{})],
 ["deleteCollaboration",()=>actions.deleteCollaboration("id")],
 ["addProjectLink",()=>actions.addProjectLink({influencer_id:"id",proje_adi:"Test"})],
 ["deleteProjectLink",()=>actions.deleteProjectLink("id")],
] as const)("%s denies mutation before opening database access",async(_name,run)=>{
 expect((await run()).error).toBeTruthy();
 expect(mocks.permission).toHaveBeenCalledWith("crm.write");
 expect(mocks.createClient).not.toHaveBeenCalled();
});
