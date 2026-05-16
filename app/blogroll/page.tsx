import SiteNav from "../../components/SiteNav";

const links = [
  ["yzy 天气网页", "自己的气象网页项目", "https://libai202505-prog.github.io/weather-websites-of-y/"],
  ["GitHub", "代码和项目仓库", "https://github.com/libai202505-prog"],
  ["Bilibili", "视频与动态空间", "https://space.bilibili.com/382447104"],
  ["小红书", "生活分享入口", "https://xhslink.com/m/9j81uT8b2VH"]
];

export default function BlogrollPage() {
  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <section className="mx-auto max-w-5xl">
        <div className="sub-heading">
          <p className="sub-kicker">BLOGROLL</p>
          <h1>优秀博客 / 友链</h1>
          <p>先放自己的常用入口，以后可以继续添加喜欢的博客和朋友的小站。</p>
        </div>

        <div className="mt-10 space-y-5">
          {links.map(([title, desc, url]) => (
            <a key={title} href={url} target="_blank" rel="noreferrer" className="sub-card link-row glass-panel">
              <div>
                <h2>{title}</h2>
                <p>{desc}</p>
              </div>
              <span>Open</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
