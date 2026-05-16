import Image from "next/image";
import Link from "next/link";
import SiteNav from "../../../components/SiteNav";

export default function SiteLogPage() {
  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <article className="article-shell glass-panel mx-auto max-w-4xl p-8 sm:p-10 lg:p-12">
        <Image src="/hero-bg.webp" alt="article cover" width={1100} height={520} className="article-cover" priority />
        <p className="sub-kicker mt-8">WEBSITE LOG</p>
        <h1>建站记录 & 蓝色主题实验</h1>
        <p className="article-meta">2026 / 05 / 16 · Website</p>

        <div className="article-body">
          <p>这个小站从一个个人 Wiki 想法开始，慢慢变成浅蓝渐变、玻璃拟态和 Dashboard 风格的个人空间。</p>
          <p>这里会记录生活碎片、学习笔记、作品项目和灵感，也会放一些喜欢的音乐、链接和小实验。</p>
          <h2>接下来想做什么</h2>
          <ul>
            <li>继续完善文章系统，把 Markdown 草稿整理成正式页面。</li>
            <li>维护天气网页项目，记录气象数据和可视化灵感。</li>
            <li>把公开留言和点赞做成轻量互动区，让访客也能参与。</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/posts" className="friend-pill">返回文章列表</Link>
          <Link href="/write" className="friend-pill">写新文章</Link>
        </div>
      </article>
    </main>
  );
}
