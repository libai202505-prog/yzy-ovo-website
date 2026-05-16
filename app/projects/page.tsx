import Image from "next/image";
import SiteNav from "../../components/SiteNav";

const projects = [
  {
    title: "yzy 天气网页",
    year: "2026",
    tag: "Weather",
    summary: "独立的气象网页项目，用来收藏天气信息、可视化灵感和页面实验。",
    website: "https://libai202505-prog.github.io/weather-websites-of-y/",
    github: "https://github.com/libai202505-prog/weather-websites-of-y"
  },
  {
    title: "yzy-ovo Website",
    year: "2026",
    tag: "Personal Wiki",
    summary: "浅蓝渐变个人 Wiki，包含文章、项目、关于、推荐、友链和互动角落。",
    website: "/",
    github: "https://github.com/libai202505-prog/yzy-ovo-website"
  }
];

export default function ProjectsPage() {
  return (
    <main className="sub-page min-h-screen px-5 pb-16 pt-28 text-slate-700 sm:px-8 lg:px-12">
      <SiteNav />
      <section className="mx-auto max-w-6xl">
        <div className="sub-heading">
          <p className="sub-kicker">PROJECTS</p>
          <h1>我的项目</h1>
          <p>把已经完成和正在慢慢生长的网页作品放在这里。</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <article key={project.title} className="sub-card project-list-card glass-panel">
              <Image src="/avatar.webp" alt="" width={78} height={78} className="post-cover object-cover" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2>{project.title}</h2>
                  <span>{project.year}</span>
                </div>
                <em>{project.tag}</em>
                <p>{project.summary}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={project.website} target={project.website.startsWith("http") ? "_blank" : undefined} rel={project.website.startsWith("http") ? "noreferrer" : undefined} className="project-link primary">Website</a>
                  <a href={project.github} target="_blank" rel="noreferrer" className="project-link">GitHub</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
