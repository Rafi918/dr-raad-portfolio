import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpLeft,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  Copy,
  ExternalLink,
  Eye,
  FileDown,
  FileText,
  GraduationCap,
  Landmark,
  Languages,
  Mail,
  Menu,
  Moon,
  Phone,
  Quote,
  ScrollText,
  Search,
  Sparkles,
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

function SectionHeading({ eyebrow, title, copy, number }: { eyebrow: string; title: string; copy?: string; number?: string }) {
  return <div className="section-heading">{number && <span className="section-number">{number}</span>}<span className="section-heading-line" aria-hidden="true" /><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{copy && <p className="section-copy">{copy}</p>}</div></div>;
}

function ChapterLabel({ number, label }: { number: string; label: string }) {
  return <div className="chapter-label"><span>{number}</span><i aria-hidden="true" /><small>{label}</small></div>;
}

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
    const sectionItems = Array.from(document.querySelectorAll<HTMLElement>("main > section:not(.hero-section)"));
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

  return (
    <div className={`site-shell ${isEnglish ? "is-english" : ""} ${darkMode ? "is-dark" : ""} ${transitionKind ? `is-transitioning-${transitionKind}` : ""}`} dir={isEnglish ? "ltr" : "rtl"}>
      <div className="reading-progress" role="progressbar" aria-label={isEnglish ? "Reading progress" : "تقدم قراءة السيرة"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(readingProgress)}><span style={{ width: `${readingProgress}%` }} /></div>
      <aside className="identity-rail" aria-label={isEnglish ? "Academic identity" : "هوية الملف الأكاديمي"}><img src={ASSETS.mark} alt={copy.meta.name} /><span>RN · 2026</span><i aria-hidden="true" /><small>{isEnglish ? "Academic\nDossier" : "ملف\nأكاديمي"}</small></aside>
      <header className="topbar">
        <div className="topbar-inner container">
          <button className="brand" onClick={() => scrollTo("overview")} aria-label={isEnglish ? "Back to overview" : "العودة إلى بداية السيرة"}><img src={ASSETS.mark} alt="" className="brand-mark" /><span className="brand-copy"><strong>{isEnglish ? "Raad Naser" : "رعد ناصر"}</strong><small>{isEnglish ? "Academic dossier" : "الملف الأكاديمي"}</small></span></button>
          <nav className="desktop-nav" aria-label={isEnglish ? "Main navigation" : "التنقل الرئيسي"}>{navItems.map((item) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "active" : ""}>{item.label}</a>)}</nav>
          <div className="topbar-actions"><button className="utility-button search-button" onClick={() => setSearchOpen((open) => !open)} aria-label={isEnglish ? "Search the dossier" : "البحث داخل السيرة"} aria-expanded={searchOpen}><Search size={15} /><span>{isEnglish ? "Search" : "بحث"}</span></button><button className="utility-button language-button" onClick={changeLanguage} aria-label={isEnglish ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}><Languages size={15} /><span>{isEnglish ? "العربية" : "EN"}</span></button><button className="utility-button theme-button" onClick={changeTheme} aria-label={darkMode ? copy.nav.lightMode : copy.nav.darkMode}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}<span>{darkMode ? (isEnglish ? "Light" : "نهاري") : (isEnglish ? "Dark" : "ليلي")}</span></button><a className="pdf-button" href={ASSETS.pdf[language]} download aria-label={copy.nav.pdfDownload}><FileDown size={16} /><span>{copy.nav.pdfDownload}</span></a><button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        </div>
        {menuOpen && <div className="mobile-nav" aria-label={isEnglish ? "Mobile navigation" : "تنقل الهاتف"}>{navItems.map((item, index) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "active" : ""} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item.label}</a>)}</div>}
      </header>
      {searchOpen && <section className="search-panel" aria-label={isEnglish ? "Search the academic dossier" : "البحث داخل الملف الأكاديمي"}><div className="search-panel-inner container"><div className="search-field-wrap"><Search size={18} aria-hidden="true" /><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={isEnglish ? "Search sections, roles, books..." : "ابحث في الأقسام والمناصب والكتب..."} aria-label={isEnglish ? "Search" : "بحث"} /><button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} aria-label={isEnglish ? "Close search" : "إغلاق البحث"}><X size={17} /></button></div><div className="search-results" role="list">{searchResults.length ? searchResults.map((entry) => <button key={entry.id} className="search-result" onClick={() => scrollTo(entry.id)} role="listitem"><span className="search-result-index">{String(navIds.indexOf(entry.id as typeof navIds[number]) + 1).padStart(2, "0")}</span><span><strong>{entry.label}</strong><small>{entry.preview}</small></span><ArrowDownLeft size={15} /></button>) : <p className="search-empty">{isEnglish ? "No matching section was found." : "لم نعثر على قسم مطابق."}</p>}</div></div></section>}

      <main>
        <section id="overview" className="hero-section"><div className="hero-media" style={{ backgroundImage: `url(${ASSETS.hero})` }} aria-hidden="true" /><div className="hero-overlay" aria-hidden="true" /><div className="hero-grid container"><div className="hero-copy"><p className="hero-kicker"><span className="kicker-dot" /> {copy.hero.kicker}</p><h1>{copy.hero.titleLine1}<br /><em>{copy.hero.titleLine2}</em></h1><p className="hero-lede">{copy.hero.lede}</p><div className="hero-cta-row"><a className="button button-primary" href="#education">{copy.hero.exploreBtn} <ArrowDownLeft size={16} /></a><button className="text-button" onClick={() => scrollTo("contact")}>{copy.hero.contactBtn} <ArrowUpLeft size={16} /></button></div><div className="hero-signature"><span className="signature-line" /><span>{copy.meta.location}</span></div><img className="hero-seal" src={ASSETS.mark} alt="" aria-hidden="true" /></div><aside className="hero-panel"><div className="hero-panel-top"><span>{copy.hero.noteTitle}</span><Sparkles size={14} /></div><p className="hero-panel-note">{copy.hero.noteQuote}</p><div className="hero-panel-rule" /><div className="mini-facts"><div><strong>{copy.hero.fact1Value}</strong><span>{copy.hero.fact1Title}</span></div><div><strong>{copy.hero.fact2Value}</strong><span>{copy.hero.fact2Title}</span></div></div></aside></div></section>
        <section className="intro-strip"><div className="container intro-strip-grid"><div className="intro-marker"><span>01</span><span className="marker-line" /></div><p className="intro-statement">{copy.meta.subtitle}</p><div className="intro-location"><Landmark size={18} /><span>{copy.meta.location}<br /><small>{isEnglish ? "Faculty of Education" : "كلية التربية"}</small></span></div></div></section>
        <section className="section-shell about-section"><div className="container about-grid"><div className="about-aside"><ChapterLabel number="02" label={isEnglish ? "BIOGRAPHY" : "نبذة"} /><div className="about-stamp"><img src={ASSETS.mark} alt="" /><span>RN<br />2026</span></div></div><div className="about-content"><SectionHeading eyebrow={copy.about.eyebrow} title={copy.about.title} copy={copy.about.copy} number="02" /><p className="about-lead">{copy.about.lead}</p><div className="about-columns"><p>{copy.about.p1}</p><p>{copy.about.p2}</p></div><div className="about-tags">{copy.about.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div></section>
        <section className="metrics-section"><div className="container metrics-grid"><div className="metrics-intro"><p className="eyebrow">{isEnglish ? "Cumulative impact" : "أثر متراكم"}</p><h2>{isEnglish ? <>Numbers tell<br /><em>the work's story</em></> : <>أرقام تروي<br /><em>حكاية العمل</em></>}</h2></div>{copy.stats.map((stat) => <div className="metric" key={stat.number}><strong>{stat.number}</strong><span>{stat.label}<small>{stat.sub}</small></span></div>)}</div></section>
        <section id="education" className="section-shell education-section"><div className="container"><SectionHeading eyebrow={copy.education.eyebrow} title={copy.education.title} copy={copy.education.copy} number="03" /><div className="education-layout"><div className="education-list">{copy.education.items.map((item, index) => <article className="education-card" key={`${item.year}-${item.title}`}><span className="education-index">0{index + 1}</span><span className="education-year">{item.year}</span><div><h3>{item.title}</h3><p>{item.detail}</p><small>{item.institution}</small></div><GraduationCap size={21} className="education-icon" /></article>)}</div><div className="education-note" style={{ backgroundImage: `url(${ASSETS.paper})` }}><div className="education-note-inner"><ScrollText size={20} /><p>{isEnglish ? "Language is not merely a tool for expression; it is a way to see the world and order its questions." : "اللغة ليست أداةً للتعبير فحسب؛ إنها طريقة لرؤية العالم وترتيب أسئلته."}</p><span>{isEnglish ? "A method of continuous learning" : "منهج في التعلم المستمر"}</span></div></div></div></div></section>
        <section id="experience" className="section-shell experience-section"><div className="container"><div className="experience-head"><SectionHeading eyebrow={copy.experience.eyebrow} title={copy.experience.title} copy={copy.experience.copy} number="04" /><div className="head-aside"><BriefcaseBusiness size={20} /><span>1992<br /><small>{isEnglish ? "to present" : "حتى الآن"}</small></span></div></div><div className="timeline-toolbar"><p>{isEnglish ? "Choose a reading lens" : "اختر طريقة قراءة المسيرة"}</p><div className="timeline-filters" role="tablist" aria-label={isEnglish ? "Timeline filters" : "مرشحات الخط الزمني"}><button className={timelineMode === "all" ? "is-selected" : ""} onClick={() => setTimelineMode("all")} role="tab" aria-selected={timelineMode === "all"}>{isEnglish ? "All chapters" : "كل الفصول"}</button><button className={timelineMode === "academic" ? "is-selected" : ""} onClick={() => setTimelineMode("academic")} role="tab" aria-selected={timelineMode === "academic"}>{isEnglish ? "Academic" : "أكاديمي"}</button><button className={timelineMode === "professional" ? "is-selected" : ""} onClick={() => setTimelineMode("professional")} role="tab" aria-selected={timelineMode === "professional"}>{isEnglish ? "Professional" : "مهني"}</button></div></div><div className="timeline-meta"><span>{timelineItems.length} {isEnglish ? "chapters" : "محطات"}</span><span>{isEnglish ? "Select a chapter to read its annotation" : "اضغط على أي محطة لقراءة تعليقها"}</span></div><div className="timeline">{timelineItems.map((item, index) => { const isExpanded = expandedTimeline === index; return <article className={`timeline-item ${isExpanded ? "is-expanded" : ""}`} key={`${item.years}-${item.role}`}><button className="timeline-trigger" onClick={() => setExpandedTimeline(toggleTimelineIndex(expandedTimeline, index))} aria-expanded={isExpanded}><span className="timeline-rail"><span>{String(index + 1).padStart(2, "0")}</span><i /></span><span className="timeline-content"><span className="timeline-years">{item.years}</span><strong>{item.role}</strong><span className="timeline-place">{item.place}</span></span><span className="timeline-toggle" aria-hidden="true">{isExpanded ? "−" : "+"}</span></button>{isExpanded && <div className="timeline-detail"><span>{isEnglish ? "Archive note" : "ملاحظة من الأرشيف"}</span><p>{item.note}</p></div>}</article>; })}</div></div></section>
        <section id="teaching" className="teaching-section"><div className="container teaching-grid"><div className="teaching-title"><p className="eyebrow">{copy.teaching.eyebrow}</p><h2>{copy.teaching.title}</h2></div><div className="teaching-copy"><p>{copy.teaching.copy}</p><div className="teaching-pills">{copy.teaching.courses.slice(0, 5).map((course) => <span key={course}>{course}</span>)}</div></div><div className="teaching-symbol"><BookOpen size={31} /><span>{isEnglish ? "Teaching\n& scholarship" : "تعليم\nوتحقيق"}</span></div></div><div className="container course-list">{copy.teaching.courses.slice(5).map((course, index) => <div key={course}><span>0{index + 6}</span><p>{course}</p></div>)}</div></section>
        <section id="research" className="research-section"><div className="container research-grid"><div className="research-image-wrap"><img src={ASSETS.research} alt={isEnglish ? "Archival research desk" : "تفاصيل أرشيفية على مكتب باحث"} onError={(event) => { event.currentTarget.src = ASSETS.paper; }} /><span className="image-caption">{isEnglish ? "Research notebook · Reading, editing, comparison" : "من دفتر الباحث · قراءة، تحقيق، ومقارنة"}</span></div><div className="research-copy"><SectionHeading eyebrow={copy.research.eyebrow} title={copy.research.title} copy={copy.research.copy} number="06" /><div className="book-shelf" role="group" aria-label={isEnglish ? "Bookshelf — pick a spine to open its record" : "رف المؤلفات — اختر كعب كتاب لفتح سجله"}>{copy.research.books.map((book, index) => <button key={book} type="button" className={`book-spine tone-${index % 4} ${selectedBook === index ? "is-selected" : ""}`} onClick={() => setSelectedBook(selectedBook === index ? null : index)} aria-pressed={selectedBook === index} title={book}><span>{book}</span></button>)}</div><div className="publication-list">{copy.research.books.map((book, index) => { const isBookOpen = selectedBook === index; const subject = encodeURIComponent(isEnglish ? "Request a digital copy" : "طلب نسخة إلكترونية من المؤلف"); const body = encodeURIComponent(book); const source = publicationSources[index]; return <article className={`publication-item ${isBookOpen ? "is-open" : ""}`} key={book}><button className="publication-main" onClick={() => setSelectedBook(isBookOpen ? null : index)} aria-expanded={isBookOpen}><span>{String(index + 1).padStart(2, "0")}</span><p>{book}</p><ChevronLeft size={15} className={isBookOpen ? "is-rotated" : ""} /></button><div className="publication-details" hidden={!isBookOpen}><span>{isEnglish ? "Publication record" : "سجل المؤلف"}</span><p>{isEnglish ? "The title is listed in the academic dossier. Use the request button for an electronic copy or publication details." : "العنوان مثبت ضمن الملف الأكاديمي. استخدم زر الطلب للحصول على نسخة إلكترونية أو تفاصيل النشر."}</p><div className="publication-actions">{source ? <a className="publication-request" href={source} target="_blank" rel="noreferrer"><Eye size={14} />{isEnglish ? "Open public catalogue" : "فتح الفهرس العام"}</a> : <span className="publication-unavailable"><FileText size={14} />{isEnglish ? "No public file attached" : "لا يوجد ملف عام مرفق"}</span>}<a className="publication-request" href={`mailto:${copy.meta.email}?subject=${subject}&body=${body}`}><Mail size={14} />{isEnglish ? "Request a copy by email" : "اطلب نسخة عبر البريد"}</a></div></div></article>; })}</div><div className="publication-footer-links"><a className="inline-link" href={`mailto:${copy.meta.email}`}>{isEnglish ? "Request the full publication list" : "اطلب قائمة الأعمال كاملة"} <ExternalLink size={14} /></a><a className="inline-link" href="https://afiqa.net/authors/details/25960" target="_blank" rel="noreferrer">{isEnglish ? "Open the public author record" : "افتح ملف المؤلف العام"} <Eye size={14} /></a></div></div></div></section>
        <section className="gallery-section taste-gallery"><div className="container"><SectionHeading eyebrow={isEnglish ? "Visual archive" : "الأرشيف البصري"} title={isEnglish ? "Plates from a researcher's world" : "لوحات من عالم الباحث"} copy={isEnglish ? "Manuscripts, a research desk, a lecture hall and the shelves where years of reading settle." : "مخطوطات ومكتب باحث وقاعة درس ورفوف تستقر عليها سنوات من القراءة."} /><div className="gallery-grid">{galleryData[language].map((item, index) => <figure className={`gallery-tile tone-${index % 4}`} key={item.title}><img src={item.image} alt={item.title} loading="lazy" /><figcaption><span>{item.tag}</span><strong>{item.title}</strong><p>{item.description}</p></figcaption></figure>)}</div><p className="gallery-disclaimer">{isEnglish ? "Atmospheric plates of the scholar's world, shown as tipped-in illustrations of the dossier." : "لوحات بصرية من عالم الباحث، معروضة كصور مُلصقة بين أوراق الملف."}</p></div></section>
        <section id="service" className="section-shell service-section"><div className="container"><SectionHeading eyebrow={copy.service.eyebrow} title={copy.service.title} copy={copy.service.copy} number="07" /><div className="service-layout"><div className="service-list">{copy.service.items.map((item, index) => <article className="service-item" key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p><Check size={15} /></article>)}</div><div className="skills-card"><h3>{copy.service.skillsTitle}</h3><div>{copy.service.skills.map((skill) => <p key={skill}><Sparkles size={14} />{skill}</p>)}</div></div></div></div></section>
        <section id="honors" className="section-shell honors-section"><div className="container"><div className="honors-card"><div className="honors-grid"><div><SectionHeading eyebrow={copy.honors.eyebrow} title={copy.honors.title} copy={copy.honors.copy} number="08" /><div className="honors-quote"><Quote size={22} /><p>{isEnglish ? "What we leave in others is what gives achievement its complete meaning." : "وحده ما نتركه في الآخرين يمنح الإنجاز معناه الكامل."}</p></div></div><div className="awards-list">{copy.honors.items.map((award, index) => <article className="award-item" key={award}><div className="award-number">{String(index + 1).padStart(2, "0")}</div><div><p>{award}</p><span><Award size={14} /> {isEnglish ? "Documented in the academic dossier" : "تكريم موثق في السيرة الذاتية"}</span></div></article>)}</div></div></div></div></section>
        <section id="contact" className="contact-section"><div className="contact-photo" style={{ backgroundImage: `url(${ASSETS.paper})` }} aria-hidden="true" /><div className="container contact-grid"><div className="contact-copy"><p className="eyebrow light">{copy.contact.eyebrow}</p><h2>{copy.contact.title}</h2><p>{copy.contact.copy}</p><div className="contact-actions"><a className="contact-main-link" href={`mailto:${copy.meta.email}`}><Mail size={17} />{copy.meta.email}</a><a className="contact-main-link" href={ASSETS.pdf[language]} download><FileDown size={17} />{copy.nav.pdfDownload}</a></div></div><div className="contact-card"><div className="contact-card-top"><img src={ASSETS.mark} alt="" /><span>{isEnglish ? "Contact details" : "معلومات التواصل"}</span></div><a href={`mailto:${copy.meta.email}`} className="contact-row"><Mail size={18} /><span><small>{copy.contact.emailLabel}</small>{copy.meta.email}</span><ExternalLink size={14} /></a><button className="contact-row copy-row" onClick={copyEmail}><Copy size={18} /><span><small>{copy.contact.copyBtn}</small>{copy.meta.email}</span><span className="copy-hint">{isEnglish ? "Copy" : "نسخ"}</span></button><a href={`tel:${copy.meta.phone.replace(/\s/g, "")}`} className="contact-row"><Phone size={18} /><span><small>{copy.contact.phoneLabel}</small><b dir="ltr">{copy.meta.phone}</b></span><ExternalLink size={14} /></a><div className="contact-card-footer"><span>{copy.meta.location}</span><Sparkles size={15} /></div></div></div></section>
      </main>
      <footer className="footer"><div className="container footer-inner"><div className="footer-brand"><img src={ASSETS.mark} alt="" /><span>© 2026 {copy.meta.name}</span></div><span>{isEnglish ? "An academic dossier designed to be read slowly" : "ملف أكاديمي صُمم ليُقرأ على مهل"}</span><button onClick={() => scrollTo("overview")} aria-label={isEnglish ? "Back to top" : "العودة إلى الأعلى"}><ArrowUpLeft size={17} /></button></div></footer>
    </div>
  );
}
