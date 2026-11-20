import { NextRequest, NextResponse } from "next/server";
import { runPopulationSimulation, type PopulationInput, type SyntheticAgent, type CountryCode } from "@/lib/population";
export const runtime="nodejs";
export const maxDuration=60;
const countries=["IN","US","GB","DE","JP","BR"];
function valid(value:unknown):value is PopulationInput {
 if(!value||typeof value!=="object")return false;const v=value as Record<string,unknown>;
 return typeof v.product==="string"&&v.product.trim().length>0&&countries.includes(String(v.country))&&typeof v.sampleSize==="number"&&Number.isInteger(v.sampleSize)&&v.sampleSize>=50&&v.sampleSize<=2500&&typeof v.seed==="string"&&Array.isArray(v.scenarios)&&v.scenarios.length>=1&&v.scenarios.length<=6;
}
export async function POST(request:NextRequest){
 try{
  const body:unknown=await request.json();if(!valid(body))return NextResponse.json({error:"Provide a product, supported country, seed, 50–2,500 agents and 1–6 scenarios."},{status:400});
  const v=body as PopulationInput;
  const input:PopulationInput={product:v.product.trim().slice(0,120),description:String(v.description||"").slice(0,700),country:v.country as CountryCode,language:String(v.language||"English").slice(0,40),audience:String(v.audience||"General adult population").slice(0,180),sampleSize:v.sampleSize,seed:v.seed.slice(0,80),scenarios:v.scenarios.map((s,i)=>({id:String(s.id||i).slice(0,60),label:String(s.label||`Scenario ${i+1}`).slice(0,60),price:Math.max(0,Math.min(100000,Number(s.price)||0)),message:String(s.message||"").slice(0,500)})),previousAgents:Array.isArray(v.previousAgents)?(v.previousAgents as SyntheticAgent[]).slice(0,2500):[]};
  // Every scenario uses the same generated cohort, enabling paired comparisons.
  const result=runPopulationSimulation(input);
  return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
 }catch(error){console.error("Population engine error",error);return NextResponse.json({error:"Population simulation failed. Please retry with a smaller cohort."},{status:500});}
}
