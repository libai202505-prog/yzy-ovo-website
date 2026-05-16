import Image from "next/image";
import Link from "next/link";
import SiteNav from "../../components/SiteNav";

const posts = [
  {
    title: "建站记录 & 蓝色主题实验",
    date: "2026 / 05 / 16",
    tag: "Website",
    summary: "记录 yzy-ovo 从个人 Wiki 到浅蓝渐变 Dashboard 的搭建过程。",
    href: "/posts/site-log",
    cover: "/avatar.webp"
  },
  {
    title: "生活碎片收藏夹",
    date: "Coming soon",
    tag: "Life",
    summary: "未来会放一些日常观察、照片、灵感和喜欢的小东西。",
    href: "/write",
    cover: "/hero-bg.webp"
  }
];

export default function PostsPage() {
  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <section className="mx-auto max-w-6xl">
        <div className="sub-heading">
          <p className="sub-kicker">RECENT POSTS</p>
          <h1>近期文章</h1>
          <p>把生活碎片、学习笔记和网站更新慢慢收进这里。</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.title} href={post.href} className="sub-card post-card glass-panel">
              <Image src={post.cover} alt="" width={96} height={96} className="post-cover object-cover" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2>{post.title}</h2>
                  <span>{post.date}</span>
                </div>
                <em>{post.tag}</em>
                <p>{post.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
