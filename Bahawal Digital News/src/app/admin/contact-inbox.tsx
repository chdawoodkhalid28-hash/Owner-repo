"use client";
import {useEffect,useState} from "react";
type Message={id:number;name:string;email:string;subject:string;message:string;status:"new"|"reviewed"|"closed";created_at:string};
export default function ContactInbox(){
 const [items,setItems]=useState<Message[]>([]),[error,setError]=useState("");
 async function load(){const r=await fetch("/api/admin/contact",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error);setItems(d.submissions||[]);}
 useEffect(()=>{load().catch(e=>setError(e.message));},[]);
 async function update(id:number,status:Message["status"]){setError("");const r=await fetch("/api/admin/contact",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});const d=await r.json();if(!r.ok){setError(d.error);return;}setItems(old=>old.map(m=>m.id===id?{...m,status}:m));}
 return <section className="panel" id="contact-inbox"><div className="sectionTitle"><h2>Public newsroom inbox</h2><span>{items.filter(m=>m.status==="new").length} new</span></div>{error&&<p role="alert">{error}</p>}{items.length?items.map(m=><article key={m.id} className="item"><b>{m.subject}</b><small>{m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}</small><p style={{whiteSpace:"pre-wrap"}}>{m.message}</p><div className="itemActions"><button type="button" onClick={()=>update(m.id,"reviewed")} disabled={m.status==="reviewed"}>Mark reviewed</button><button type="button" onClick={()=>update(m.id,"closed")} disabled={m.status==="closed"}>Close</button><a href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent("Re: "+m.subject)}`}>Reply by email</a></div><small>Status: {m.status}</small></article>):<p>No public messages yet.</p>}</section>
}
