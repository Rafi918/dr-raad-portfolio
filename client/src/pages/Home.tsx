import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpLeft,
  ChevronLeft,
  Copy,
  Eye,
  FileDown,
  FileText,
  Languages,
  Mail,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { cvData } from "@/data/cvData";
import { galleryData } from "@/data/galleryData";
import { filterTimelineItems, toggleTimelineIndex, type TimelineMode } from "@/data/timeline";

const ASSETS = {
  hero: "/manus-storage/raad-cv-hero-editorial_2313c07d.webp",
  research: "/manus-storage/raad-gallery-research-desk_426f7bc8.jpg",
  paper: "/manus-storage/raad-gallery-manuscript_27b27071.jpg",
  mark: "/monogram.svg",
  pdf: { ar: "/manus-storage/raad-nasser-cv-ar_87a0bbba.pdf", en: "/manus-storage/raad-nasser-cv-en_cb241562.pdf" },
};

type Locale = "ar" | "en";
const navIds = ["overview", "education", "experience", "teaching", "research", "service", "honors", "contact"] as const;
const publicationSources: Record<number, string> = { 0: "https://kiqp.net/search?keyword=%D8%B4%D8%B9%D8%B1%20%D8%A7%D9%84%D8%AC%D9%87%D8%A7%D8%AF%20%D9%88%D8%A7%D9%84%D8%AD%D8%B1%D8%A8%20%D9%81%D9%8A%20%D8%B9%D9%87%D8%AF%20%D8%A8%D9%86%D9%8A%20%D8%A7%D9%84%D8%A7%D8%AD%D9%85%D8%B1" };

export default function Home() {
  const [language, setLanguage] = useState<Locale>(() => (localStorage.getItem("raad-cv-language") as Locale) || "ar");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [timelineMode, setTimelineMode] = useState<TimelineMode>("all");
  const [expandedTimeline, setExpandedTimeline] = useState(0);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [transitionKind, setTransitionKind] = useState<"language" | "theme" | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isEnglish = language === "en";
  const copy = useMemo(() => cvData[language], [language]);
  const darkMode = theme === "dark";
  const timelineItems = useMemo(() => filterTimelineItems(copy.experience.items, timelineMode), [copy.experience.items, timelineMode]);
  const searchEntries = useMemo(() => [
    { id: "overview", label: copy.nav.overview, preview: copy.hero.lede, search: `${copy.meta.name} ${copy.meta.subtitle} ${copy.hero.lede}` },
    { id: "education", label: copy.nav.education, preview: copy.education.copy, search: `${copy.education.title} ${copy.education.copy} ${copy.education.items.map((item) => `${item.title} ${item.detail} ${item.institution}`).join(" ")}` },
    { id: "experience", label: copy.nav.experience, preview: copy.experience.copy, search: `${copy.experience.title} ${copy.experience.copy} ${copy.experience.items.map((item) => `${item.role} ${item.place} ${item.note}`).join(" ")}` },
    { id: "teaching", label: copy.nav.teaching, preview: copy.teaching.copy, search: `${copy.teaching.title} ${copy.teaching.copy} ${copy.teaching.courses.join(" ")}` },
    { id: "research", label: copy.nav.research, preview: copy.research.copy, search: `${copy.research.title} ${copy.research.copy} ${copy.research.books.join(" ")}` },
    { id: "service", label: isEnglish ? "Service" : "اللجان", preview: copy.service.copy, search: `${copy.service.title} ${copy.service.copy} ${copy.service.items.join(" ")}` },
    { id: "honors", label: copy.nav.honors, preview: copy.honors.copy, search: `${copy.honors.title} ${copy.honors.copy} ${copy.honors.items.join(" ")}` },
    { id: "contact", label: copy.nav.contact, preview: copy.contact.copy, search: `${copy.contact.title} ${copy.contact.copy} ${copy.meta.email} ${copy.meta.phone}` },
  ], [copy, isEnglish]);
  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase();
    return normalized ? searchEntries.filter((entry) => entry.search.toLocaleLowerCase().includes(normalized)) : searchEntries.slice(0, 6);
  }, [searchEntries, searchQuery]);
  const galleryFrames = useMemo(() => {
    const seen = new Set<string>();
    const frames: { src: string; alt: string }[] = [];
    const push = (src: string, alt: string) => { if (!seen.has(src)) { seen.add(src); frames.push({ src, alt }); } };
    push(ASSETS.hero, copy.meta.name);
    galleryData[language].forEach((item) => push(item.image, item.title));
    return frames;
  }, [copy.meta.name, language]);

  useEffect(() => {
    setExpandedTimeline(0);
    setSelectedBook(null);
  }, [isEnglish, language, timelineMode]);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      setReadingProgress(Math.min(100, Math.max(0, Math.round(nextProgress * 10) / 10)));
    };
    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("raad-cv-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isEnglish ? "ltr" : "rtl";
  }, [isEnglish, language]);

  useEffect(() => {
    const timelineItems = Array.from(document.querySelectorAll<HTMLElement>(".timeline-item"));
    const sectionItems = Array.from(document.querySelectorAll<HTMLElement>("main > section:not(.hero3)"));
    const revealItems = [...sectionItems, ...timelineItems];
    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.18 });
    timelineItems.forEach((item, index) => {
      item.style.setProperty("--timeline-index", String(index));
      observer.observe(item);
    });
    sectionItems.forEach((section, index) => {
      section.style.setProperty("--section-index", String(index));
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [language, timelineMode]);

  useEffect(() => {
    const sections = navIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: "-20% 0px -64% 0px", threshold: [0.05, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const triggerTransition = (kind: "language" | "theme") => {
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    setTransitionKind(kind);
    transitionTimer.current = window.setTimeout(() => {
      setTransitionKind(null);
      transitionTimer.current = null;
    }, 520);
  };
  useEffect(() => () => { if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current); }, []);
  useEffect(() => {
    if (!searchOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSearchOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [searchOpen]);
  const scrollTo = (id: string) => { const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"; document.getElementById(id)?.scrollIntoView({ behavior, block: "start" }); setMenuOpen(false); setSearchOpen(false); setSearchQuery(""); };
  const changeLanguage = () => { const next: Locale = isEnglish ? "ar" : "en"; triggerTransition("language"); setLanguage(next); setMenuOpen(false); toast.success(next === "en" ? "English version enabled" : "تم تفعيل النسخة العربية"); };
  const changeTheme = () => { triggerTransition("theme"); toggleTheme?.(); };
  const copyEmail = async () => { try { await navigator.clipboard.writeText(copy.meta.email); toast.success(copy.contact.copySuccess); } catch { toast.error(isEnglish ? "Please copy the email manually" : "يرجى نسخ البريد يدوياً"); } };
  const navItems = [
    { id: "overview", label: copy.nav.overview }, { id: "education", label: copy.nav.education }, { id: "experience", label: copy.nav.experience }, { id: "teaching", label: copy.nav.teaching }, { id: "research", label: copy.nav.research }, { id: "service", label: isEnglish ? "Service" : "اللجان" }, { id: "honors", label: copy.nav.honors }, { id: "contact", label: copy.nav.contact },
  ];
  const emailParts = copy.meta.email.split("@");

  return (
    <div className={`site-shell ${isEnglish ? "is-english" : ""} ${darkMode ? "is-dark" : ""} ${transitionKind ? `is-transitioning-${transitionKind}` : ""}`} dir={isEnglish ? "ltr" : "rtl"}>
      <div className="reading-progress" role="progressbar" aria-label={isEnglish ? "Reading progress" : "تقدم قراءة السيرة"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(readingProgress)}><span style={{ width: `${readingProgress}%` }} /></div>
      <header className="topbar">
        <div className="topbar-inner container">
          <button className="brand" onClick={() => scrollTo("overview")} aria-label={isEnglish ? "Back to overview" : "العودة إلى بداية السيرة"}><img src={ASSETS.mark} alt="" className="brand-mark" /><strong>{isEnglish ? "Raad Nasser" : "رعد ناصر"}</strong></button>
          <nav className="desktop-nav" aria-label={isEnglish ? "Main navigation" : "التنقل الرئيسي"}>{navItems.map((item) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "active" : ""}>{item.label}</a>)}</nav>
          <div className="topbar-actions"><button className="utility-button search-button" onClick={() => setSearchOpen((open) => !open)} aria-label={isEnglish ? "Search the dossier" : "البحث داخل السيرة"} aria-expanded={searchOpen}><Search size={16} /></button><button className="utility-button language-button" onClick={changeLanguage} aria-label={isEnglish ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}><Languages size={16} /></button><button className="utility-button theme-button" onClick={changeTheme} aria-label={darkMode ? copy.nav.lightMode : copy.nav.darkMode}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button><a className="pdf-button" href={ASSETS.pdf[language]} download aria-label={copy.nav.pdfDownload}><FileDown size={16} /><span>{copy.nav.pdfDownload}</span></a><button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        </div>
        {menuOpen && <nav className="mobile-nav" aria-label={isEnglish ? "Mobile navigation" : "تنقل الهاتف"}>{navItems.map((item) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "active" : ""} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav>}
      </header>
      {searchOpen && <section className="search-panel" aria-label={isEnglish ? "Search the academic dossier" : "البحث داخل الملف الأكاديمي"}><div className="search-panel-inner container"><div className="search-field-wrap"><Search size={19} aria-hidden="true" /><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={isEnglish ? "Search sections, roles, books..." : "ابحث في الأقسام والمناصب والكتب..."} aria-label={isEnglish ? "Search" : "بحث"} /><button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} aria-label={isEnglish ? "Close search" : "إغلاق البحث"}><X size={17} /></button></div><div className="search-results" role="list">{searchResults.length ? searchResults.map((entry) => <button key={entry.id} className="search-result" onClick={() => scrollTo(entry.id)} role="listitem"><span><strong>{entry.label}</strong><small>{entry.preview}</small></span><ArrowUpLeft size={15} /></button>) : <p className="search-empty">{isEnglish ? "No matching section was found." : "لم نعثر على قسم مطابق."}</p>}</div></div></section>}

      <main>
        <section id="overview" className="hero3">
          <div className="hero3-photo"><img src={ASSETS.hero} alt={copy.meta.name} /></div>
          <div className="hero3-side">
            <p className="hero3-titles">{copy.hero.kicker}</p>
            <p className="hero3-sentence">{copy.hero.lede}</p>
            <button className="hero3-action button-primary" onClick={() => scrollTo("contact")}>{copy.hero.contactBtn}</button>
          </div>
          <h1 className="hero3-name"><span>{copy.hero.titleLine1}</span><span>{copy.hero.titleLine2}</span></h1>
        </section>

        <section className="intro3"><div className="intro3-column"><p className="intro3-first">{copy.meta.subtitle}</p><p>{copy.about.lead}</p><p>{copy.about.copy}</p><p><a className="text-link" href="https://afiqa.net/authors/details/25960" target="_blank" rel="noreferrer">{isEnglish ? "Open the public author record" : "افتح ملف المؤلف العام"}</a></p></div></section>

        <section className="about3"><div className="container about3-grid"><dl className="about3-facts"><div><dt>{isEnglish ? "Place" : "المكان"}</dt><dd>{copy.meta.location}</dd></div><div><dt>{isEnglish ? "Email" : "البريد"}</dt><dd><a href={`mailto:${copy.meta.email}`}>{copy.meta.email}</a></dd></div><div><dt>{isEnglish ? "Phone" : "الهاتف"}</dt><dd><a href={`tel:${copy.meta.phone.replace(/\s/g, "")}`} dir="ltr">{copy.meta.phone}</a></dd></div></dl><div className="about3-statement"><img className="about3-dropcap" src={ASSETS.hero} alt="" aria-hidden="true" /><p className="about3-p1">{copy.about.p1}</p><p className="about3-p2">{copy.about.p2}</p><p className="about3-tags">{copy.about.tags.join(" · ")}</p></div></div></section>

        <section className="stats3"><div className="container stats3-grid"><div className="stats3-rows"><h2 className="stats3-heading">{isEnglish ? "The work in numbers" : "العمل بالأرقام"}</h2>{copy.stats.map((stat) => <div className="stat3-row" key={stat.number}><strong>{stat.number}</strong><p>{stat.label} — {stat.sub}</p></div>)}</div><img className="stats3-photo" src={ASSETS.research} alt={isEnglish ? "The research desk" : "مكتب الباحث"} loading="lazy" /></div></section>

        <section id="education" className="edu3"><div className="container"><h2 className="edu3-heading">{copy.education.title}</h2><p className="edu3-note">{copy.education.copy}</p><div className="edu3-table">{copy.education.items.map((item) => <article className="edu3-row" key={`${item.year}-${item.title}`}><span className="edu3-year">{item.year}</span><div className="edu3-main"><h3>{item.title}</h3><p>{item.detail}</p></div><span className="edu3-inst">{item.institution}</span></article>)}</div></div></section>

        <section id="experience" className="exp3"><div className="container"><h2 className="exp3-heading">{copy.experience.title}</h2><p className="exp3-copy">{copy.experience.copy}</p><div className="exp3-toolbar"><div className="timeline-filters" role="tablist" aria-label={isEnglish ? "Timeline filters" : "مرشحات الخط الزمني"}><button className={timelineMode === "all" ? "is-selected" : ""} onClick={() => setTimelineMode("all")} role="tab" aria-selected={timelineMode === "all"}>{isEnglish ? "All chapters" : "كل الفصول"}</button><button className={timelineMode === "academic" ? "is-selected" : ""} onClick={() => setTimelineMode("academic")} role="tab" aria-selected={timelineMode === "academic"}>{isEnglish ? "Academic" : "أكاديمي"}</button><button className={timelineMode === "professional" ? "is-selected" : ""} onClick={() => setTimelineMode("professional")} role="tab" aria-selected={timelineMode === "professional"}>{isEnglish ? "Professional" : "مهني"}</button></div><span className="exp3-count">{timelineItems.length} {isEnglish ? "chapters — select one to read its note" : "محطات — اختر محطة لقراءة تعليقها"}</span></div><div className="timeline">{timelineItems.map((item, index) => { const isExpanded = expandedTimeline === index; return <article className={`timeline-item ${isExpanded ? "is-expanded" : ""}`} key={`${item.years}-${item.role}`}><button className="timeline-trigger" onClick={() => setExpandedTimeline(toggleTimelineIndex(expandedTimeline, index))} aria-expanded={isExpanded}><span className="timeline-years">{item.years}</span><span className="timeline-content"><strong>{item.role}</strong><span className="timeline-place">{item.place}</span></span><span className="timeline-toggle" aria-hidden="true">{isExpanded ? "−" : "+"}</span></button>{isExpanded && <div className="timeline-detail"><p>{item.note}</p></div>}</article>; })}</div></div></section>

        <section id="teaching" className="teach3"><div className="container teach3-grid"><div className="teach3-head"><h2>{copy.teaching.title}</h2><p>{copy.teaching.copy}</p></div><ul className="teach3-list">{copy.teaching.courses.map((course) => <li key={course}>{course}</li>)}</ul></div></section>

        <section id="research" className="work3"><div className="container"><h2 className="work3-heading">{copy.research.title}</h2><p className="work3-copy">{copy.research.copy}</p><div className="book-shelf" role="group" aria-label={isEnglish ? "Bookshelf — pick a spine to open its record" : "رف المؤلفات — اختر كعب كتاب لفتح سجله"}>{copy.research.books.map((book, index) => <button key={book} type="button" className={`book-spine tone-${index % 4} ${selectedBook === index ? "is-selected" : ""}`} onClick={() => setSelectedBook(selectedBook === index ? null : index)} aria-pressed={selectedBook === index} title={book}><span>{book}</span></button>)}</div><div className="pub3-scatter">{copy.research.books.map((book, index) => { const isBookOpen = selectedBook === index; const subject = encodeURIComponent(isEnglish ? "Request a digital copy" : "طلب نسخة إلكترونية من المؤلف"); const body = encodeURIComponent(book); const source = publicationSources[index]; return <article className={`pub3 place-${index % 3} ${isBookOpen ? "is-open" : ""}`} key={book}><button className="pub3-main" onClick={() => setSelectedBook(isBookOpen ? null : index)} aria-expanded={isBookOpen}><p>{book}</p><ChevronLeft size={16} className={isBookOpen ? "is-rotated" : ""} /></button>{isBookOpen && <div className="pub3-details"><p>{isEnglish ? "The title is listed in the academic dossier. Use the request button for an electronic copy or publication details." : "العنوان مثبت ضمن الملف الأكاديمي. استخدم زر الطلب للحصول على نسخة إلكترونية أو تفاصيل النشر."}</p><div className="pub3-actions">{source ? <a className="text-link" href={source} target="_blank" rel="noreferrer"><Eye size={14} /> {isEnglish ? "Open public catalogue" : "فتح الفهرس العام"}</a> : <span className="pub3-unavailable"><FileText size={14} /> {isEnglish ? "No public file attached" : "لا يوجد ملف عام مرفق"}</span>}<a className="text-link" href={`mailto:${copy.meta.email}?subject=${subject}&body=${body}`}><Mail size={14} /> {isEnglish ? "Request a copy by email" : "اطلب نسخة عبر البريد"}</a></div></div>}</article>; })}</div></div></section>

        <section className="gallery3"><p className="gallery3-title">{isEnglish ? "Plates from a researcher's world" : "لوحات من عالم الباحث"} · {galleryFrames.length}</p><div className="gallery3-strip">{galleryFrames.map((frame) => <figure className="gallery3-frame" key={frame.src}><img src={frame.src} alt={frame.alt} loading="lazy" /></figure>)}</div></section>

        <section id="service" className="service3"><div className="container"><h2 className="service3-heading">{copy.service.title}</h2><p className="service3-copy">{copy.service.copy}</p><div className="service3-grid"><ul className="service3-list">{copy.service.items.map((item) => <li key={item}>{item}</li>)}</ul><div className="service3-skills"><h3>{copy.service.skillsTitle}</h3>{copy.service.skills.map((skill) => <p key={skill}>{skill}</p>)}</div></div></div></section>

        <section id="honors" className="proof3"><div className="container"><h2 className="proof3-heading">{copy.honors.title}</h2><p className="proof3-quote">{isEnglish ? "What we leave in others is what gives achievement its complete meaning." : "وحده ما نتركه في الآخرين يمنح الإنجاز معناه الكامل."}</p><div className="proof3-table">{copy.honors.items.map((award) => <div className="proof3-row" key={award}><p>{award}</p><span>{isEnglish ? "Documented in the academic dossier" : "تكريم موثق في السيرة الذاتية"}</span></div>)}</div></div></section>

        <section id="contact" className="contact3"><div className="container contact3-inner"><p className="contact3-sentence">{copy.contact.copy}</p><a className="contact3-email" href={`mailto:${copy.meta.email}`}><span>{emailParts[0]}</span><span>@{emailParts[1]}</span></a><div className="contact3-corners"><span><b dir="ltr">{copy.meta.phone}</b> · {copy.meta.location}</span><span className="contact3-tools"><button onClick={copyEmail}><Copy size={14} /> {copy.contact.copyBtn}</button><a href={ASSETS.pdf[language]} download><FileDown size={14} /> {copy.nav.pdfDownload}</a></span></div></div></section>
      </main>
      <footer className="footer3"><div className="container"><p className="footer3-name">{copy.hero.titleLine1} {copy.hero.titleLine2}</p><div className="footer3-row"><span>© 2026 {copy.meta.name}</span><span>{isEnglish ? "An academic dossier designed to be read slowly" : "ملف أكاديمي صُمم ليُقرأ على مهل"}</span><button onClick={() => scrollTo("overview")} aria-label={isEnglish ? "Back to top" : "العودة إلى الأعلى"}><ArrowUpLeft size={17} /></button></div></div></footer>
    </div>
  );
}
