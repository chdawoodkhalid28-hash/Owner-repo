"use client";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";

type Category = { id: number; name_ur: string; name_en: string };
type Article = { id: number; title_ur: string; title_en: string; slug: string; status: string; location?: string; author_id?: number };
type Staff = { id: number; name: string; email: string; role: "admin" | "editor" | "reporter"; active: boolean };
const empty = { title_ur:"", title_en:"", slug:"", excerpt_ur:"", excerpt_en:"", body_ur:"", body_en:"", location:"", image_url:"", category_id:"", language:"both", status:"draft" };

export default function AdminPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState("");
  const [mode,setMode]=useState<"signin"|"signup">("signin"); const [signedIn,setSignedIn]=useState(false);
  const [ready,setReady]=useState(false); const [bootstrapNeeded,setBootstrapNeeded]=useState(false);
  const [identity,setIdentity]=useState<Staff|null>(null); const [articles,setArticles]=useState<Article[]>([]);
  const [categories,setCategories]=useState<Category[]>([]); const [staff,setStaff]=useState<Staff[]>([]);
  const [form,setForm]=useState(empty); const [staffEmail,setStaffEmail]=useState(""); const [staffRole,setStaffRole]=useState("reporter");
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);

  async function refresh() {
    const session=await authClient.getSession();
    setSignedIn(Boolean(session.data?.user));
    if (!session.data?.user) { setReady(false); setBootstrapNeeded(false); return; }
    const me=await fetch("/api/admin/me",{cache:"no-store"});
    const md=await me.json();
    if (me.status===403) { setReady(false); setBootstrapNeeded(true); return; }
    if (!me.ok) throw new Error(md.error||"Newsroom access denied");
    setIdentity(md.user); setBootstrapNeeded(false);
    const r=await fetch("/api/admin/articles",{cache:"no-store"}); const d=await r.json();
    if (!r.ok) throw new Error(d.error||"Unable to load CMS");
    setArticles(d.articles||[]); setCategories(d.categories||[]); setReady(true);
    if (md.user.role==="admin") {
      const sr=await fetch("/api/admin/staff",{cache:"no-store"}); const sd=await sr.json();
      if (sr.ok) setStaff(sd.staff||[]);
    }
  }

  useEffect(()=>{ refresh().catch((e)=>setMessage(e.message||"Unable to restore session")); },[]);

  async function authenticate(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode==="signup") {
        const result=await authClient.signUp.email({name,email,password});
        if (result.error) throw new Error(result.error.message||"Account registration failed");
        const current=await authClient.getSession();
        if (!current.data?.user) {
          const login=await authClient.signIn.email({email,password});
          if (login.error) throw new Error(login.error.message||"Sign in failed");
        }
      } else {
        const result=await authClient.signIn.email({email,password});
        if (result.error) throw new Error(result.error.message||"Sign in failed");
      }
      await refresh();
      setMessage("Authentication successful.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Authentication failed"); }
    finally { setBusy(false); }
  }

  async function bootstrap() {
    setBusy(true); setMessage("");
    try {
      const r=await fetch("/api/admin/bootstrap",{method:"POST"}); const d=await r.json();
      if (!r.ok) throw new Error(d.error||"Initial admin setup failed");
      await refresh(); setMessage("Initial administrator account activated.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Setup failed"); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try { await authClient.signOut(); setReady(false); setSignedIn(false); setIdentity(null); setArticles([]); setStaff([]); }
    catch(e) { setMessage(e instanceof Error?e.message:"Sign out failed"); }
    finally { setBusy(false); }
  }

  async function save(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r=await fetch("/api/admin/articles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,category_id:form.category_id||null})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Save failed");
      setMessage(d.notice||("Article saved: "+d.article.slug)); setForm(empty); await refresh();
    } catch(e) { setMessage(e instanceof Error?e.message:"Unable to save"); }
    finally { setBusy(false); }
  }

  async function addStaff(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r=await fetch("/api/admin/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:staffEmail,role:staffRole})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Role assignment failed");
      setStaffEmail(""); await refresh(); setMessage("Staff role assigned.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Unable to assign role"); }
    finally { setBusy(false); }
  }

  async function updateStaff(member:Staff, patch:Partial<Staff>) {
    setBusy(true);
    try {
      const r=await fetch("/api/admin/staff",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:member.id,...patch})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Staff update failed");
      await refresh(); setMessage("Staff access updated.");
    } catch(e) { setMessage(e instanceof Error?e.message:"Unable to update staff"); }
    finally { setBusy(false); }
  }

  const field=(key:keyof typeof empty,label:string,multi=false)=><label className="field"><span>{label}</span>{multi?<textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>;

  return <main className="admin">
    <header><div><small>BAHAWAL DIGITAL NEWS / SECURE CMS</small><h1>Newsroom Control</h1><p>Neon Auth protected · role-based editorial access</p></div><div className="head-actions"><a href="/">View website ↗</a>{ready&&<button className="secondary" onClick={signOut} disabled={busy}>Sign out</button>}</div></header>
    {!ready&&!bootstrapNeeded&&<section className="panel login"><h2>{mode==="signin"?"Staff sign in":"Create account"}</h2><p>Sign in with your newsroom identity. New accounts receive no newsroom permissions until an administrator assigns a role.</p>
      {mode==="signup"&&<label className="field"><span>Full name</span><input value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}
      <form onSubmit={authenticate}><label className="field"><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label className="field"><span>Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="signin"?"current-password":"new-password"} minLength={8} required/></label><button disabled={busy}>{busy?"Please wait…":mode==="signin"?"Sign in securely":"Create Neon Auth account"}</button></form>
      <button className="link-button" onClick={()=>setMode(mode==="signin"?"signup":"signin")}>{mode==="signin"?"Need an account? Register":"Already registered? Sign in"}</button>
    </section>}
    {bootstrapNeeded&&<section className="panel login"><h2>Initial administrator setup</h2><p>You are signed in, but this identity is not yet assigned to the newsroom. The first administrator can be initialized only for the email configured by the site owner, and only while the staff table is empty.</p><button onClick={bootstrap} disabled={busy}>{busy?"Checking…":"Initialize first administrator"}</button><button className="link-button" onClick={signOut}>Sign out</button></section>}
    {ready&&identity&&<>
      <section className="welcome"><div><b>{identity.name}</b><span>{identity.email}</span></div><span className="role">{identity.role.toUpperCase()}</span></section>
      <section className="stats"><div><b>{articles.length}</b><span>{identity.role==="reporter"?"My articles":"Total articles"}</span></div><div><b>{articles.filter(a=>a.status==="published").length}</b><span>Published</span></div><div><b>{articles.filter(a=>a.status==="draft").length}</b><span>Drafts</span></div></section>
      <div className="columns"><section className="panel"><h2>Create article</h2><form onSubmit={save}>{field("title_ur","Urdu headline")}{field("title_en","English headline")}{field("slug","URL slug")}{field("excerpt_ur","Urdu summary",true)}{field("excerpt_en","English summary",true)}{field("body_ur","Urdu article body",true)}{field("body_en","English article body",true)}{field("location","District / location")}{field("image_url","Featured image URL")}<label className="field"><span>Category</span><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Select category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name_ur} / {c.name_en}</option>)}</select></label><div className="split"><label className="field"><span>Language</span><select value={form.language} onChange={e=>setForm({...form,language:e.target.value})}><option value="both">Urdu + English</option><option value="ur">Urdu</option><option value="en">English</option></select></label><label className="field"><span>Action</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">Save draft</option>{identity.role!=="reporter"&&<option value="published">Publish now</option>}</select></label></div><button disabled={busy}>{busy?"Saving…":"Save article"}</button></form></section>
      <section className="panel"><h2>{identity.role==="reporter"?"My submissions":"Latest articles"}</h2>{articles.length===0?<p>No articles yet. No sample news has been added.</p>:articles.map(a=><article className="item" key={a.id}><b>{a.title_ur||a.title_en||a.slug}</b><small>{a.slug} · {a.location||"District not set"}</small><span className={a.status==="published"?"published":"draft"}>{a.status}</span></article>)}</section></div>
      {identity.role==="admin"&&<section className="panel staff-panel"><h2>Staff & permissions</h2><p>Only registered Neon Auth accounts can be assigned newsroom roles.</p><form className="staff-form" onSubmit={addStaff}><label className="field"><span>Staff email</span><input type="email" value={staffEmail} onChange={e=>setStaffEmail(e.target.value)} required/></label><label className="field"><span>Role</span><select value={staffRole} onChange={e=>setStaffRole(e.target.value)}><option value="reporter">Reporter</option><option value="editor">Editor</option><option value="admin">Admin</option></select></label><button disabled={busy}>Assign role</button></form>{staff.map(member=><div className="staff-row" key={member.id}><div><b>{member.name}</b><small>{member.email} · {member.active?"Active":"Inactive"}</small></div><select value={member.role} disabled={member.id===identity.id||busy} onChange={e=>updateStaff(member,{role:e.target.value as Staff["role"]})}><option value="admin">Admin</option><option value="editor">Editor</option><option value="reporter">Reporter</option></select><button className="secondary" disabled={member.id===identity.id||busy} onClick={()=>updateStaff(member,{active:!member.active})}>{member.active?"Deactivate":"Activate"}</button></div>)}</section>}
    </>}
    {message&&<p className="notice">{message}</p>}
    <style jsx>{`*{box-sizing:border-box}.admin{max-width:1200px;margin:0 auto;padding:32px 20px;color:#edf3ff;min-height:100vh;background:#071326;font-family:Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #263752;padding-bottom:24px;gap:16px}small{color:#e34b5d}h1{font-size:32px;margin:8px 0}header p,.panel p{color:#9eacc2}.head-actions{display:flex;align-items:center;gap:16px}a{color:#f1b7bd}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:22px 0}.stats div,.panel{background:#101f36;border:1px solid #293b58;border-radius:14px;padding:18px}.stats b{display:block;font-size:28px}.stats span,.field span{display:block;color:#aab8cc;font-size:13px;margin-top:5px}.columns{display:grid;grid-template-columns:1.2fr .8fr;gap:18px}.panel h2{margin-top:0}.field{display:block;margin:12px 0}.field input,.field textarea,.field select,.staff-row select{width:100%;margin-top:6px;background:#09172b;border:1px solid #354966;color:#fff;border-radius:8px;padding:11px;font:inherit}.field textarea{min-height:90px;resize:vertical}.split,.staff-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.staff-form{grid-template-columns:1.5fr 1fr auto;align-items:end}button{background:#c92f46;color:white;border:0;border-radius:8px;padding:12px 18px;font-weight:bold;cursor:pointer}button:disabled{opacity:.5}.secondary{background:#263852}.link-button{display:block;background:transparent;color:#f1b7bd;margin-top:12px;padding-left:0}.item{padding:14px 0;border-bottom:1px solid #293b58;display:grid;gap:6px}.item small,.staff-row small{color:#98a8c0;display:block}.published,.draft,.role{font-size:12px;width:max-content;padding:4px 8px;border-radius:5px;background:#183d34;color:#a6f1ce}.draft{background:#40331e;color:#f4d18b}.role{background:#293d60;color:#d6e5ff}.notice{background:#172b45;padding:12px;border-radius:8px;margin-top:18px}.login{max-width:460px;margin:50px auto}.login input{margin:10px 0}.welcome,.staff-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px;background:#101f36;border:1px solid #293b58;border-radius:12px;margin-top:18px}.welcome span{display:block;color:#9eacc2}.staff-panel{margin-top:18px}.staff-row{margin-top:10px}.staff-row>div{flex:1}@media(max-width:760px){.columns{grid-template-columns:1fr}.stats{grid-template-columns:1fr}header{align-items:flex-start;flex-direction:column}.staff-form{grid-template-columns:1fr}.staff-row{align-items:flex-start;flex-direction:column}.head-actions{width:100%;justify-content:space-between}}`}</style>
  </main>;
}
