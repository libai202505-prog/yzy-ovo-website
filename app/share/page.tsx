import SiteNav from "../../components/SiteNav";

const shares = [
  ["音乐", "梦幻诛仙 · 张碧晨", "https://music.163.com/#/song?id=438456232"],
  ["天气项目", "yzy weather websites", "https://libai202505-prog.github.io/weather-websites-of-y/"],
  ["GitHub", "libai202505-prog", "https://github.com/libai202505-prog"],
  ["Bilibili", "我的 B 站空间", "https://space.bilibili.com/382447104"],
  ["小红书", "我的小红书主页", "https://xhslink.com/m/9j81uT8b2VH"]
];

export default function SharePage() {
  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <section className="mx-auto max-w-5xl">
        <div className="sub-heading">
          <p className="sub-kicker">RECOMMENDATIONS</p>
          <h1>推荐分享</h1>
          <p>这里放我正在听、正在做、正在收藏的内容。</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {shares.map(([type, title, url]) => (
            <a key={title} href={url} target="_blank" rel="noreferrer" className="sub-card share-card glass-panel">
              <span>{type}</span>
              <h2>{title}</h2>
              <p>点击打开链接 →</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
