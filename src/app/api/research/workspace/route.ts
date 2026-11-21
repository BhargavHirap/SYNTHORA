import { NextResponse } from "next/server";
import { assertSameOrigin, getBrowserOwnerId, getDatabase } from "@/lib/neon";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Protocol = { id:string; title:string; question:string; hypothesis:string; domain:string; version:number; [key:string]:unknown };
type Evidence = { id:string; title:string; publisher:string; url:string; evidenceClass:string; claim:string; supports:string; quality:string; publishedDate?:string; accessDate?:string; notes?:string };
type WorkspaceRow = { id:string; version?:number; created_at?:string; protocol?:unknown; title?:string; question?:string; hypothesis?:string; domain?:string; publisher?:string; source_url?:string; evidence_class?:string; claim?:string; classification?:string; quality?:string; metadata?:Record<string,string>|null; actor_id?:string; action?:string; detail?:unknown };

async function ownedProject(ownerId:string) {
  const sql=getDatabase();
  const [project]=await sql`INSERT INTO research_projects(name,description,owner_id)
    VALUES ('My SYNTHORA research','Private browser research workspace',${ownerId})
    ON CONFLICT(owner_id) DO UPDATE SET updated_at=now() RETURNING id`;
  return project.id as string;
}

export async function GET() {
  try {
    const ownerId=await getBrowserOwnerId(); const sql=getDatabase(); const projectId=await ownedProject(ownerId);
    const [protocols,evidence,audit]=await Promise.all([
      sql`SELECT id,version,title,question,hypothesis,domain,protocol,created_at FROM research_protocols WHERE project_id=${projectId} ORDER BY version DESC LIMIT 20`,
      sql`SELECT id,title,publisher,source_url,evidence_class,claim,classification,quality,metadata,created_at FROM evidence_items WHERE project_id=${projectId} ORDER BY created_at DESC LIMIT 500`,
      sql`SELECT id,actor_id,action,detail,created_at FROM research_audit_events WHERE project_id=${projectId} ORDER BY created_at DESC LIMIT 100`
    ]);
    const latest=protocols[0] as WorkspaceRow|undefined;
    const protocolData=latest?.protocol && typeof latest.protocol==="object" ? latest.protocol as Record<string,unknown> : {};
    const protocol=latest ? {...protocolData,id:String(latest.id),version:Number(latest.version),title:String(latest.title||""),question:String(latest.question||""),hypothesis:String(latest.hypothesis||""),domain:String(latest.domain||"")} : null;
    return NextResponse.json({
      protocol,
      versions:protocols.map((row:WorkspaceRow)=>({version:row.version,savedAt:row.created_at,protocol:row.protocol})),
      evidence:evidence.map((row:WorkspaceRow)=>({id:row.id,title:row.title,publisher:row.publisher,url:row.source_url,evidenceClass:row.evidence_class,claim:row.claim,supports:row.classification,quality:row.quality,publishedDate:row.metadata?.publishedDate||"",accessDate:row.metadata?.accessDate||"",notes:row.metadata?.notes||""})),
      audit:audit.map((row:WorkspaceRow)=>({id:row.id,actor:row.actor_id,action:row.action,detail:typeof row.detail==="string"?row.detail:JSON.stringify(row.detail),at:row.created_at})),
      persistence:"neon"
    },{headers:{"Cache-Control":"no-store"}});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:"Unable to load research workspace."},{status:503}); }
}

export async function POST(request:Request) {
  try {
    assertSameOrigin(request);
    const body=await request.json() as {protocol?:Protocol;evidence?:Evidence[];action?:string;detail?:string};
    if(!body.protocol || !Array.isArray(body.evidence)) return NextResponse.json({error:"protocol and evidence are required."},{status:400});
    if(JSON.stringify(body).length>1_000_000) return NextResponse.json({error:"Workspace payload exceeds 1 MB."},{status:413});
    const ownerId=await getBrowserOwnerId(); const sql=getDatabase(); const projectId=await ownedProject(ownerId); const p=body.protocol;
    const version=Math.max(1,Number(p.version)||1);
    const [saved]=await sql`INSERT INTO research_protocols(project_id,version,title,question,hypothesis,domain,protocol,assessment,created_by)
      VALUES(${projectId},${version},${String(p.title||"Untitled protocol")},${String(p.question||"")},${String(p.hypothesis||"")},${String(p.domain||"")},${JSON.stringify(p)}::jsonb,'{}'::jsonb,${ownerId})
      ON CONFLICT(project_id,version) DO UPDATE SET title=EXCLUDED.title,question=EXCLUDED.question,hypothesis=EXCLUDED.hypothesis,domain=EXCLUDED.domain,protocol=EXCLUDED.protocol
      RETURNING id`;
    const protocolId=saved.id;
    const ops=body.evidence.slice(0,500).filter(x=>x && typeof x.id==="string" && /^[0-9a-f-]{36}$/i.test(x.id)).map(x=>sql`
      INSERT INTO evidence_items(id,project_id,protocol_id,title,publisher,source_url,evidence_class,claim,classification,quality,metadata,created_by)
      VALUES(${x.id}::uuid,${projectId},${protocolId},${String(x.title||"").slice(0,500)},${String(x.publisher||"").slice(0,300)},${String(x.url||"").slice(0,2000)},${String(x.evidenceClass||"other")},${String(x.claim||"").slice(0,5000)},${String(x.supports||"unknown")},${String(x.quality||"unassessed")},${JSON.stringify({publishedDate:x.publishedDate||"",accessDate:x.accessDate||"",notes:x.notes||""})}::jsonb,${ownerId})
      ON CONFLICT(id) DO UPDATE SET protocol_id=EXCLUDED.protocol_id,title=EXCLUDED.title,publisher=EXCLUDED.publisher,source_url=EXCLUDED.source_url,evidence_class=EXCLUDED.evidence_class,claim=EXCLUDED.claim,classification=EXCLUDED.classification,quality=EXCLUDED.quality,metadata=EXCLUDED.metadata
      WHERE evidence_items.project_id=EXCLUDED.project_id AND evidence_items.created_by=EXCLUDED.created_by
    `);
    await sql.transaction([
      ...ops,
      sql`INSERT INTO research_audit_events(project_id,actor_id,action,detail) VALUES(${projectId},${ownerId},'research.workspace_saved',${JSON.stringify({protocolVersion:version,evidenceCount:ops.length})}::jsonb)`
    ]);
    return NextResponse.json({saved:true,protocolId,evidenceSaved:ops.length,persistence:"neon"},{status:200});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:"Unable to save research workspace."},{status:503}); }
}

export async function DELETE(request:Request) {
  try {
    assertSameOrigin(request);
    const id=new URL(request.url).searchParams.get("evidence_id");
    if(!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({error:"A valid evidence_id is required."},{status:400});
    const ownerId=await getBrowserOwnerId(); const sql=getDatabase();
    const rows=await sql`DELETE FROM evidence_items e USING research_projects p WHERE e.project_id=p.id AND p.owner_id=${ownerId} AND e.id=${id}::uuid RETURNING e.id`;
    return NextResponse.json({deleted:rows.length>0});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:"Unable to delete evidence."},{status:503}); }
}
