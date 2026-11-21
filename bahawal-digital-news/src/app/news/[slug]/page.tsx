import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {neon} from "@neondatabase/serverless";
import Link from "next/link";
export const revalidate=60;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 if(!process.env.DATABASE_URL)return {title:"Bahawal Digital News"};
 try{const sql=neon(process.env.DATABASE_URL);const rows=await sql`SELECT title_ur,title_en,excerpt_ur,excerpt_en,image_url FROM public.articles WHERE slug=${slug} AND status='published' AND deleted_at IS NULL AND published_at<=now() LIMIT 1`;if(!rows.length)return {title:"News not found | Bahawal Digital News"};const a:any=rows[0];const title=a.title_en||a.title_ur;const description=a.excerpt_en||a.excerpt_ur||"Verified reporting from Bahawal Digital News.";return {title:title+" | Bahawal Digital News",description,openGraph:{title,description,images:a.image_url?[a.image_url]:[]},twitter:{card:a.image_url?"summary_large_image":"summary",title,description,images:a.image_url?[a.image_url]:[]}};}catch{return {title:"Bahawal Digital News"};}
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!process.env.DATABASE_URL) return <main className="detailShell"><Link href="/">← BDN Home</Link><h1>Newsroom connection pending</h1><p>Article publishing will be available after the database connection is configured.</p></main>;
 const sql=neon(process.env.DATABASE_URL);
 const rows=await sql`SELECT a.*,c.name_ur AS category_name_ur,c.name_en AS category_name_en FROM public.articles a LEFT JOIN public.categories c ON c.id=a.category_id WHERE a.slug=${slug} AND a.status='published' AND a.published_at<=now() LIMIT 1`;
 if(!rows.length) notFound();
 const a:any=rows[0];
 return <main className="detailShell"><div className="detailTop"><Link href="/">← Bahawal Digital News</Link><span>{a.location||"Bahawalnagar"} · {a.category_name_en||"News"}</span></div><article className="detailArticle"><div className="detailKicker">BAHAWAL DIGITAL NEWS / VERIFIED REPORT</div><h1>{a.title_ur||a.title_en}</h1>{a.title_en&&a.title_ur&&<h2>{a.title_en}</h2>}{a.image_url&&<img src={a.image_url} alt={a.image_caption||a.title_en||a.title_ur} />}{a.excerpt_ur&&<p className="detailExcerpt">{a.excerpt_ur}</p>}<div className="detailBody">{String(a.body_ur||a.body_en||"").split("\n").map((line:string,i:number)=><p key={i}>{line}</p>)}</div><div className="detailSource">{a.source_attribution&&<>Source: {a.source_attribution}</>} {a.image_credit&&<> · Image: {a.image_credit}</>}</div></article></main>
}