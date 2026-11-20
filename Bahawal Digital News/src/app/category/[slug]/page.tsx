import { notFound } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";
export const revalidate = 60;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const label=labels[slug];return {title:label?label.en+" News | Bahawal Digital News":"News Category | Bahawal Digital News",description:label?"Verified "+label.en+" news and updates from Bahawal Digital News.":"Verified news and updates."};}
const labels: Record<string,{ur:string;en:string}> = {
 pakistan:{ur:"پاکستان",en:"Pakistan"}, world:{ur:"دنیا",en:"World"}, business:{ur:"کاروبار",en:"Business"}, sports:{ur:"کھیل",en:"Sports"}, technology:{ur:"ٹیکنالوجی",en:"Technology"}, education:{ur:"تعلیم",en:"Education"}
};
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params; const label=labels[slug]; if(!label) notFound();
 let articles:any[]=[];
 if(process.env.DATABASE_URL){const sql=neon(process.env.DATABASE_URL);articles=await sql`SELECT a.id,a.title_ur,a.title_en,a.slug,a.excerpt_ur,a.excerpt_en,a.location,a.published_at,c.name_ur AS category_name_ur,c.name_en AS category_name_en FROM public.articles a JOIN public.categories c ON c.id=a.category_id WHERE a.status='published' AND a.published_at<=now() AND lower(regexp_replace(c.name_en,'[^a-z0-9]+','-','g'))=${slug} ORDER BY a.featured DESC,a.published_at DESC LIMIT 50`;}
 return <main className="detailShell"><div className="detailTop"><Link href="/">← Bahawal Digital News</Link><span>NEWS / {label.en.toUpperCase()}</span></div><h1 className="districtTitle">{label.ur} — {label.en}</h1><p className="detailExcerpt">تصدیق شدہ خبریں اور تازہ ترین اپ ڈیٹس</p>{articles.length?articles.map(a=><article className="districtStory" key={a.id}><small>{a.location||label.en} · {a.category_name_en||label.en}</small><h2><Link href={"/news/"+a.slug}>{a.title_ur||a.title_en}</Link></h2><p>{a.excerpt_ur||a.excerpt_en}</p></article>):<div className="emptyState"><h3>اس زمرے میں ابھی کوئی خبر شائع نہیں ہوئی</h3><p>تصدیق شدہ خبریں شائع ہوتے ہی یہاں دکھائی دیں گی۔</p></div>}</main>;
}