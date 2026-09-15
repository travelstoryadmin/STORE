import {NextResponse} from 'next/server';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const endpoint=url?`${url.replace(/\/$/,'')}/rest/v1/site_settings`:'';

function headers(){return {'apikey':key||'','Authorization':`Bearer ${key||''}`,'Content-Type':'application/json','Accept':'application/json'}}

export async function GET(){
  if(!endpoint||!key)return NextResponse.json({error:'Cloud settings are not configured'},{status:503});
  try{
    const res=await fetch(`${endpoint}?select=settings&id=eq.1`,{headers:headers(),cache:'no-store'});
    if(!res.ok)return NextResponse.json({error:'Unable to read cloud settings'},{status:res.status});
    const rows=await res.json();
    if(!rows?.length)return NextResponse.json({settings:null},{status:404});
    return NextResponse.json({settings:rows[0].settings});
  }catch{return NextResponse.json({error:'Cloud settings request failed'},{status:500})}
}

export async function PUT(request:Request){
  if(!endpoint||!key)return NextResponse.json({error:'Cloud settings are not configured'},{status:503});
  try{
    const body=await request.json();
    const res=await fetch(`${endpoint}?on_conflict=id`,{method:'POST',headers:{...headers(),'Prefer':'resolution=merge-duplicates,return=representation'},body:JSON.stringify({id:1,settings:body})});
    if(!res.ok)return NextResponse.json({error:'Unable to save cloud settings'},{status:res.status});
    const rows=await res.json();
    return NextResponse.json({settings:rows?.[0]?.settings||body});
  }catch{return NextResponse.json({error:'Cloud settings save failed'},{status:500})}
}
