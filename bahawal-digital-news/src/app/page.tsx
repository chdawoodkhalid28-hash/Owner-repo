"use client";
import {useEffect,useMemo,useState} from "react";
type Article={id:number;title_ur:string;title_en:string;slug:string;excerpt_ur?:string;excerpt_en?:string;language?:string;category_id?:number;location?:string;featured?:boolean;breaking?:boolean;image_url?:string;published_at?:string;views?:number;category_name_ur?:string;category_name_en?:string};
const districts=["بہاولپور","بہاولنگر","رحیم یار خان"];
const cats=[["top","اہم خبریں","Top Stories"],["local","بہاولنگر","Bahawalnagar"],["pakistan","پاکستان","Pakistan"],["world","دنیا","World"],["business","کاروبار","Business"],["sports","کھیل","Sports"],["technology","ٹیکنالوجی","Technology"],["education","تعلیم","Education"]];
const copy={ur:{latest:"تازہ ترین",viewAll:"تمام خبریں",read:"مکمل خبر پڑھیں",empty:"ابھی کوئی خبر شائع نہیں ہوئی",emptySub:"تصدیق شدہ خبریں شائع ہوتے ہی یہاں نظر آئیں گی۔",local:"بہاولپور ڈویژن کی خبریں",district:"اپنے شہر کی خبریں",newsletter:"اہم خبریں اپنے اِن باکس میں پائیں",newsletterSub:"ہفتہ وار نیوز بلیٹن کے لیے اپنا ای میل درج کریں۔",email:"آپ کا ای میل",join:"سبسکرائب کریں",joined:"آپ کی سبسکرپشن موصول ہوگئی۔",search:"خبر تلاش کریں",noResults:"آپ کی تلاش سے متعلق کوئی خبر نہیں ملی",menu:"نیویگیشن",edition:"آپ کا ضلع، آپ کی آواز",breaking:"بریکنگ",editorial:"ذمہ دار صحافت • تصدیق شدہ معلومات",footer:"بہاولپور ڈویژن سے دنیا تک، باخبر رہیں۔"},en:{latest:"Latest News",viewAll:"View all",read:"Read full story",empty:"No stories published yet",emptySub:"Verified stories will appear here as soon as our newsroom publishes them.",local:"Bahawalpur Division",district:"News from your city",newsletter:"The briefing, in your inbox",newsletterSub:"Get the most important stories in our weekly newsletter.",email:"Your email address",join:"Subscribe",joined:"Your subscription has been received.",search:"Search stories",noResults:"No stories match your search",menu:"Navigation",edition:"Your district. Your voice.",breaking:"BREAKING",editorial:"Responsible journalism • Verified information",footer:"Stay informed, from Bahawalpur Division to the world."}};
export default function Home(){
 const [lang,setLang]=useState<"ur"|"en">("ur"),[articles,setArticles]=useState<Article[]>([]),[query,setQuery]=useState(""),[email,setEmail]=useState(""),[subscribed,setSubscribed]=useState(false),[loading,setLoading]=useState(false),[status,setStatus]=useState("");
 const t=copy[lang];
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==="ur"?"rtl":"ltr";fetch("/api/news").then(r=>r.ok?r.json():{articles:[]}).then(d=>setArticles(d.articles||[])).catch(()=>setArticles([]));},[lang]);
 const filtered=useMemo(()=>articles.filter(a=>`${a.title_ur||""} ${a.title_en||""} ${a.excerpt_ur||""} ${a.excerpt_en||""} ${a.location||""}`.toLowerCase().includes(query.toLowerCase())),[articles,query]);
 const featured=filtered.find(a=>a.featured)||filtered[0]; const rest=filtered.filter(a=>a.id!==featured?.id);
 async function subscribe(e:React.FormEvent){e.preventDefault();const formElement=e.currentTarget as HTMLFormElement;const website=(formElement.elements.namedItem("website") as HTMLInputElement|null)?.value||"";setLoading(true);setStatus("");try{const r=await fetch("/api/newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,website})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Subscription unavailable");setSubscribed(true);setEmail("");}catch(err:any){setStatus(err.message||"Please try again later.");}finally{setLoading(false);}}
 const title=(a:Article)=>lang==="ur"?(a.title_ur||a.title_en):(a.title_en||a.title_ur);
 const excerpt=(a:Article)=>lang==="ur"?(a.excerpt_ur||a.excerpt_en):(a.excerpt_en||a.excerpt_ur);
 return <main>
  <div className="utility"><div className="wrap utilityInner"><span>{new Intl.DateTimeFormat(lang==="ur"?"ur-PK":"en-PK",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).format(new Date())}</span><span className="utilityRight">{t.editorial}<i/> <button onClick={()=>setLang(lang==="ur"?"en":"ur")} className="lang">{lang==="ur"?"ENGLISH":"اردو"}</button></span></div></div>
  <header className="masthead"><div className="wrap mastInner"><a href="/" className="brand"><span className="brandText"><strong>BDN <em>NEWS</em></strong><small>بہاول ڈیجیٹل نیوز</small></span><span className="brandMark"><img src="https://asset.imagine.art/processed/4a98e827-f72f-4d63-b107-7fcf24fb2d27" alt="Nawab Sahib portrait"/><i/></span></a><div className="mastTag">{t.edition}<span>BAHAWALPUR DIVISION · PAKISTAN</span></div><div className="mastActions"><a href="#newsletter" className="outlineBtn">NEWSLETTER <span>↗</span></a></div></div></header>
  <nav className="nav"><div className="wrap navInner"><div className="navLinks">{cats.map(c=><a key={c[0]} href={c[0]==="top"?"#top":c[0]==="local"?"#districts":`/category/${c[0]}`}>{lang==="ur"?c[1]:c[2]}</a>)}</div><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/></label></div></nav>
  <div className="wrap">
   <div className="ticker"><b>{t.breaking}</b><span>{lang==="ur"?"بہاولنگر اور دنیا بھر کی مصدقہ خبروں کے لیے ہمارے ساتھ رہیے۔":"Stay with us for verified updates from Bahawalnagar and around the world."}</span><span className="liveDot"/></div>
   <section className="hero" id="top">
    <div className="heroMain">
     <div className="heroVisual" role="img" aria-label="Nawab Sahib portrait — the heritage and identity of Bahawal Digital News">
      <div className="heroPortraitAura"/>
      <img className="heroPortraitImage" src="https://asset.imagine.art/processed/4a98e827-f72f-4d63-b107-7fcf24fb2d27" alt="Portrait of Nawab Sahib"/>
      <div className="heroPortraitFrame"/>
      <div className="heroVisualBrand">
       <span className="heroBrandEyebrow">THE LEGACY · THE REGION · THE PEOPLE</span>
       <strong>BDN <em>NEWS</em></strong>
       <span className="heroBrandUrdu">بہاول ڈیجیٹل نیوز</span>
       <span className="heroBrandRule"/>
       <span className="heroBrandTagline">{lang==="ur"?"بہاولپور ڈویژن کی آواز":"THE VOICE OF BAHAWALPUR DIVISION"}</span>
      </div>
      <div className="heroSeal"><span>BDN</span><i>EST.</i></div>
      <div className="heroImageCaption">{lang==="ur"?"تاریخ سے جڑی شناخت":"A REGION. A LEGACY. A VOICE."}</div>
     </div>
     <div className="heroCopy">
      <div className="heroIssue"><span className="issueLine"/> {lang==="ur"?"خصوصی ڈیجیٹل ایڈیشن":"THE DIGITAL EDITION"} <span className="issueDate">{new Date().getFullYear()}</span></div>
      <div className="kicker"><span/> {t.edition}</div>
      <h1>{lang==="ur"?"خبر، تاریخ اور عوام کی آواز":"A legacy of pride. Journalism with purpose."}</h1>
      <p>{lang==="ur"?"بہاولپور ڈویژن کی تاریخ، تہذیب اور عوامی زندگی سے جڑی مستند خبریں۔ نواب صاحب کے تاریخی ورثے کو خراجِ عقیدت اور نئی نسل کے لیے ذمہ دار ڈیجیٹل صحافت۔":"Rooted in the history and spirit of Bahawalpur Division. Independent, verified journalism that honours our heritage and serves the people of today."}</p>
      <div className="heroActions"><a href="#latest" className="heroPrimary">{lang==="ur"?"تازہ خبریں پڑھیں":"EXPLORE THE LATEST"} <span>↗</span></a><a href="/about" className="heroSecondary">{lang==="ur"?"ہمارا مشن":"OUR MISSION"}</a></div>
      <div className="heroValues"><div><b>01</b><span>{lang==="ur"?"تصدیق شدہ صحافت":"VERIFIED REPORTING"}</span></div><div><b>02</b><span>{lang==="ur"?"علاقائی شناخت":"REGIONAL IDENTITY"}</span></div><div><b>03</b><span>{lang==="ur"?"عوامی آواز":"PEOPLE FIRST"}</span></div></div>
     </div>
    </div>
    <aside className="heroAside">
     <div className="asideTop"><span>THE NEWSROOM</span><span className="pulse">● LIVE DESK</span></div>
     <div className="asideHeadline">{lang==="ur"?"مقامی آواز، وسیع نظر":"Local insight. Wider perspective."}</div>
     <p>{lang==="ur"?"بہاولپور، بہاولنگر اور رحیم یار خان — تین اضلاع، ایک مضبوط علاقائی آواز۔":"Three districts. One connected newsroom. Stories that matter to our communities."}</p>
     <div className="asideRule"/>
     <div className="asideStat"><b>03</b><span>{lang==="ur"?"ڈویژن کے اضلاع":"DIVISION DISTRICTS"}</span></div>
     <div className="asideStat"><b>24/7</b><span>{lang==="ur"?"ڈیجیٹل نیوز روم":"DIGITAL NEWSROOM"}</span></div>
     <div className="asideFootnote">{lang==="ur"?"تاریخی ورثہ • ذمہ دار صحافت":"HERITAGE • INTEGRITY • JOURNALISM"}</div>
    </aside>
   </section>
   <section className="heritageNote">
    <div className="heritageNoteMark"><span>BDN</span><i>THE REGION'S VOICE</i></div>
    <div className="heritageNoteCopy"><span className="sectionEyebrow">OUR ROOTS · OUR RESPONSIBILITY</span><h2>{lang==="ur"?"ورثہ ہمارا، آواز سب کی":"A heritage to honour. A community to serve."}</h2><p>{lang==="ur"?"بہاول ڈیجیٹل نیوز بہاولپور ڈویژن کی تاریخی، تہذیبی اور عوامی شناخت کو اجاگر کرنے والا ڈیجیٹل نیوز پلیٹ فارم ہے۔ ہمارا مقصد بہاولپور، بہاولنگر اور رحیم یار خان سمیت پورے ڈویژن کی مستند، بروقت اور ذمہ دارانہ خبریں عوام تک پہنچانا، مقامی مسائل کی آواز بننا اور نواب سر صادق محمد خان عباسی پنجم کے تاریخی ورثے کو خراجِ عقیدت کے ساتھ یاد رکھنا ہے۔":"Bahawal Digital News is a digital newsroom shaped by the history, culture and people of Bahawalpur Division. We bring verified, timely and responsible reporting to the region, amplify local voices and honour the legacy of Nawab Sir Sadiq Muhammad Khan Abbasi V."}</p><a href="/about">{lang==="ur"?"ہمارا مکمل تعارف، مشن اور وژن ←":"DISCOVER OUR MISSION & VISION ↗"}</a></div>
   </section>
   <section className="sectionHead" id="latest"><div><span className="sectionEyebrow">01 / NEWSROOM</span><h2>{t.latest}</h2></div><span className="sectionNote">{t.editorial}</span></section>
   {query&&<div className="searchResult">{filtered.length} {lang==="ur"?"نتائج":"results"}</div>}
   {featured?<section className="newsGrid"><article className="leadCard"><div className="leadImage" style={featured.image_url?{backgroundImage:`linear-gradient(0deg,#06101fe0,transparent 80%),url("${featured.image_url}")`}:{}}><span className="imageBadge">{featured.breaking?t.breaking:"FEATURED"}</span><span className="imageMonogram">BDN<span>.</span></span></div><div className="leadBody"><div className="articleMeta">{featured.location||"Bahawalnagar"} <i/> {featured.category_name_ur||featured.category_name_en||"News"}</div><h3>{title(featured)}</h3><p>{excerpt(featured)}</p><a className="readLink" href={`/news/${featured.slug}`}>{t.read} <span>↗</span></a></div></article><div className="sideStories">{rest.slice(0,3).map((a,i)=><article className="miniStory" key={a.id}><div className="miniNum">0{i+1}</div><div><div className="articleMeta">{a.location||"Pakistan"} <i/> {a.category_name_en||"News"}</div><h3>{title(a)}</h3><p>{excerpt(a)}</p></div></article>)}</div></section>:<div className="emptyState"><div className="emptyIcon">BDN<span>.</span></div><h3>{query?t.noResults:t.empty}</h3><p>{t.emptySub}</p></div>}
   <section className="districtSection" id="districts"><div className="sectionHead"><div><span className="sectionEyebrow">02 / LOCAL COVERAGE</span><h2>{t.local}</h2></div><span className="sectionNote">{t.district}</span></div><div className="districtGrid">{districts.map((d,i)=><a className="districtCard" href={`/district/${["bahawalpur","bahawalnagar","rahim-yar-khan"][i]}`} key={d}><span className="districtNo">0{i+1}</span><strong>{lang==="ur"?d:["Bahawalpur","Bahawalnagar","Rahim Yar Khan"][i]}</strong><span className="districtArrow">↗</span></a>)}</div></section>
   <section className="newsletter" id="newsletter"><div className="newsLetterMark">BDN<span>.</span></div><div className="newsletterCopy"><span className="sectionEyebrow">THE BDN BRIEFING</span><h2>{t.newsletter}</h2><p>{t.newsletterSub}</p></div><form onSubmit={subscribe} className="newsletterForm"><input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap",border:0}}/><div className="emailRow"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email}/><button disabled={loading}>{loading?"…":t.join}</button></div>{subscribed&&<small className="success">{t.joined}</small>}{status&&<small className="error">{status}</small>}</form></section>
  </div>
  <footer><div className="wrap footerTop"><a href="/" className="footerBrand">BDN<span>.</span></a><p>{t.footer}</p><div className="footerLinks"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div></div><div className="wrap footerBottom"><span>© {new Date().getFullYear()} Bahawal Digital News. All rights reserved.</span><span>INDEPENDENT · RESPONSIBLE · LOCAL</span></div></footer>
 </main>
}