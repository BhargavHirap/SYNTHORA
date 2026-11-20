"use client";
import { createBrowserClient } from "@supabase/ssr";
let client:ReturnType<typeof createBrowserClient>|undefined;
export function createSupabaseBrowserClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error("Cloud services are not configured yet.");client ||= createBrowserClient(url,key);return client;}
