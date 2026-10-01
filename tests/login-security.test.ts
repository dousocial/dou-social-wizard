import { beforeEach, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({from:vi.fn(),single:vi.fn(),cookieSet:vi.fn()}));
vi.mock("@/lib/supabase",()=>({supabase:{from:mocks.from}}));
vi.mock("next/headers",()=>({headers:async()=>new Headers({"x-forwarded-for":"192.0.2.45"}),cookies:async()=>({set:mocks.cookieSet})}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
vi.mock("next/navigation",()=>({redirect:vi.fn()}));
import { loginAction, setupAction } from "../src/lib/actions/auth";
beforeEach(()=>{mocks.from.mockClear();mocks.single.mockReset();mocks.cookieSet.mockClear();mocks.from.mockReturnValue({select:()=>({eq:()=>({single:mocks.single})})});});
it("blocks the sixth login attempt before querying the database or setting a cookie",async()=>{
 mocks.single.mockResolvedValue({data:null,error:null});
 const form=new FormData();form.set("username","missing-user");form.set("password","invalid-password");
 for(let i=0;i<5;i++) expect((await loginAction(null,form))?.error).toBe("Kullanıcı adı veya şifre hatalı");
 expect((await loginAction(null,form))?.error).toContain("Çok fazla giriş denemesi");
 expect(mocks.single).toHaveBeenCalledTimes(5); expect(mocks.cookieSet).not.toHaveBeenCalled();
});
it("public bootstrap is disabled by default without accessing the database",async()=>{
 vi.stubEnv("ENABLE_ADMIN_BOOTSTRAP","false");
 expect((await setupAction(null,new FormData()))?.error).toContain("kapalı");
 expect(mocks.from).not.toHaveBeenCalled();
});
