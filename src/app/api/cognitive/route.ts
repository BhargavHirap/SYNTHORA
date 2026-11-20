import { NextRequest, NextResponse } from "next/server";
import { runCognitiveSimulation, type CognitiveInput } from "@/lib/cognitive-engine";
const supported=["IN","US","GB","DE","JP","BR"];
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(request:NextRequest){
 try{
  const body=await request.json() as Partial<CognitiveInput>;
  if(typeof body.product!=="string"||!body.product.trim()||typeof body.proposition!=="string"||!Array.isArray(body.countries)||!body.countries.length||!body.countries.every(c=>supported.includes(String(c))))return NextResponse.json({error:"Provide a product, proposition and at least one supported country."},{status:400});
  const input:CognitiveInput={product:body.product.slice(0,120),proposition:body.proposition.slice(0,600),price:Math.max(0,Math.min(100000,Number(body.price)||0)),countries:body.countries as CognitiveInput["countries"],agentsPerCountry:Math.max(30,Math.min(300,Number(body.agentsPerCountry)||100)),rounds:Math.max(2,Math.min(8,Number(body.rounds)||4)),monteCarloRuns:Math.max(30,Math.min(500,Number(body.monteCarloRuns)||100)),seed:String(body.seed||"synthora-v03").slice(0,80)};
  return NextResponse.json(runCognitiveSimulation(input),{headers:{"Cache-Control":"no-store"}});
 }catch(error){console.error("Cognitive simulation failed",error);return NextResponse.json({error:"Cognitive simulation failed. Try fewer agents or Monte Carlo trials."},{status:500});}
}
