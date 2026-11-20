import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createSupabaseServerClient() {
 const jar=await cookies(),url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error("Cloud services are not configured. Add the Supabase URL and publishable key to Vercel.");
 return createServerClient(url,key,{cookies:{getAll(){return jar.getAll();},setAll(values){try{values.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server Components cannot mutate cookies; middleware refreshes sessions. */}}}});
}
