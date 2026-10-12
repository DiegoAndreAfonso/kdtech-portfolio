import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  Github,
  Layers3,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  Sparkles,
  X,
} from "lucide-react";
import { contactConfig, people, projects } from "./data";
import type { Project } from "./data";
import ProductPreview from "./components/ProductPreview";

const navItems = [
  ["Projetos", "projetos"],
  ["Sobre", "sobre"],
  ["Pessoas", "pessoas"],
  ["Contato", "contato"],
];

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="KDTech, página inicial">
      <span className="brand-symbol" aria-hidden="true">
        <Code2 size={23} />
      </span>
      <span>
        KD<span className="brand-light">Tech</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [location]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <header className="site-header" ref={header}>
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map(([label, id]) => (
            <Link key={id} to={`/#${id}`}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="header-cta" to="/#contato">
          Vamos conversar <ArrowUpRight size={15} />
        </Link>
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          className="mobile-nav"
          id="mobile-nav"
          aria-label="Navegação no celular"
        >
          {navItems.map(([label, id]) => (
            <Link key={id} to={`/#${id}`} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function RouteBehavior() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (hash) {
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      } else window.scrollTo({ top: 0, behavior: "instant" });
    }, 30);
    return () => clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

function useMetadata(title: string, description: string, image?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = title;
    const setMeta = (
      selector: string,
      attr: string,
      key: string,
      value: string,
    ) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    );
    const siteOrigin =
      contactConfig.siteUrl ||
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelector('meta[property="og:url"]')?.remove();
    document.querySelector('meta[property="og:image"]')?.remove();
    if (siteOrigin) {
      const url = new URL(pathname, siteOrigin).href;
      setMeta('meta[property="og:url"]', "property", "og:url", url);
      const canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = url;
      document.head.appendChild(canonical);
      if (image)
        setMeta(
          'meta[property="og:image"]',
          "property",
          "og:image",
          new URL(image, siteOrigin).href,
        );
    }
  }, [title, description, pathname, image]);
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <i />
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />
            TECNOLOGIA COM PROPÓSITO
          </div>
          <h1>
            Desafios reais.
            <br />
            Soluções digitais.
            <br />
            <span>Faz sentido.</span>
          </h1>
          <p>
            Transformamos processos trabalhosos em experiências mais simples,
            organizadas e úteis.
          </p>
          <p className="hero-support">
            Conheça os projetos da KDTech e das pessoas que constroem conosco.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/#projetos">
              Conhecer projetos <ArrowUpRight size={19} />
            </Link>
            <Link className="text-link" to="/#contato">
              Conversar sobre uma ideia <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-fields">
            <span>Gestão</span>
            <i />
            <span>Educação</span>
            <i />
            <span>Processos</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline">
            <span>
              <Layers3 size={13} />
              DA IDEIA À INTERFACE
            </span>
            <span className="cross-mark">+</span>
          </div>
          <div className="visual-grid" aria-hidden="true" />
          <div className="hero-window hero-legal">
            <ProductPreview variant="legal" />
          </div>
          <div className="hero-window hero-education">
            <ProductPreview variant="education" />
          </div>
          <div className="hero-float">
            <span>
              <Check size={15} />
            </span>
            <div>
              Menos complexidade.<b>Mais possibilidades.</b>
            </div>
          </div>
          <div className="visual-caption">
            <span className="caption-line" />
            Prévias ilustrativas dos projetos
            <span className="visual-count">01 — {String(projects.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
      <div className="container hero-bottom">
        <span>
          Software começa com um problema.
          <br />
          <b>Nosso trabalho começa por entendê-lo.</b>
        </span>
        <Link to="/#projetos" aria-label="Explorar projetos">
          <ArrowDown size={21} />
        </Link>
      </div>
    </section>
  );
}

function ProjectImage({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  if (project.images?.length)
    return (
      <figure className="real-project-image">
        <img
          src={project.images[0].src}
          alt={project.images[0].alt}
          loading="lazy"
        />
        {project.images[0].caption && (
          <figcaption>{project.images[0].caption}</figcaption>
        )}
      </figure>
    );
  if (!project.visual) return null;
  return (
    <figure className={`project-preview-wrap ${project.visual}`}>
      <ProductPreview variant={project.visual} compact={compact} />
      <figcaption>
        <span className="tiny-dot" />
        Ilustração de interface
      </figcaption>
    </figure>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="project-card"
      style={{ "--project-accent": project.accent } as CSSProperties}
    >
      <Link
        to={`/projetos/${project.id}`}
        className="project-image-link"
        aria-label={`Conhecer ${project.name}`}
      >
        <ProjectImage project={project} compact />
        <span className="image-arrow">
          <ArrowUpRight size={22} />
        </span>
      </Link>
      <div className="project-category">
        <span>{project.number} /</span>
        {project.category}
      </div>
      <h3>
        <Link to={`/projetos/${project.id}`}>{project.name}</Link>
      </h3>
      <p>{project.summary}</p>
      {project.shortProblem && (
        <div className="project-problem">
          <span>O DESAFIO</span>
          <p>{project.shortProblem}</p>
        </div>
      )}
      <p className="project-credit">{project.credit}</p>
      <Link className="project-link" to={`/projetos/${project.id}`}>
        Conhecer projeto <ArrowUpRight size={18} />
      </Link>
      {project.links?.length ? (
        <div className="detail-external-links">
          {project.links.map((link) => (
            <a
              className="project-link"
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Projects() {
  const jus = projects.find((project) => project.id === "jusexplica")!;
  return (
    <section className="projects-section section" id="projetos">
      <div className="container">
        <SectionLabel number="01">PROJETOS SELECIONADOS</SectionLabel>
        <div className="section-heading">
          <h2>
            Ideias que viram
            <br />
            <span>soluções.</span>
          </h2>
          <p>
            Cada projeto começa com um contexto real.
            <br />
            Conheça o problema, a proposta e quem fez.
          </p>
        </div>
        <div className="projects-grid projects-grid-expanded">
          {projects.filter((project) => project.id !== "jusexplica").map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {Boolean(jus.images?.length) && (
          <div className="jus-additional-preview">
            <ProjectImage project={jus} />
          </div>
        )}
        <article className="jus-row">
          <span className="jus-number">{jus.number} /</span>
          <div className="jus-title">
            <span>{jus.category || "DO HACKATHON"}</span>
            <h3>{jus.name}</h3>
          </div>
          <div className="jus-description">
            {jus.summary && <p>{jus.summary}</p>}
            {jus.origin && <p>{jus.origin}</p>}
            <span>{jus.credit}</span>
          </div>
          <Link className="project-link" to="/projetos/jusexplica">
            Conhecer projeto <ArrowUpRight size={18} />
          </Link>
        </article>
        {jus.links?.length ? (
          <div className="detail-external-links">
            {jus.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                {link.label}
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section section" id="sobre">
      <div className="container">
        <SectionLabel number="02">SOBRE A KDTECH</SectionLabel>
        <div className="about-top">
          <h2>
            Antes do código,
            <br />
            <span>o contexto.</span>
          </h2>
          <div className="about-description">
            <p className="large-copy">
              Somos a KDTech. Desenvolvimento de software para transformar
              desafios do dia a dia em soluções que fazem sentido.
            </p>
            <p>
              Nosso trabalho nasce da construção conjunta de Diego André Afonso
              e Kennedy Pinheiro, com a colaboração de outras pessoas em
              projetos específicos.
            </p>
            <p>
              Da gestão de um escritório à rotina de um professor, olhamos para
              os processos e para as pessoas que precisam deles.
            </p>
          </div>
        </div>
        <div className="approach">
          <div>
            <span className="approach-number">01</span>
            <h3>Entender o processo.</h3>
            <p>
              O problema, as pessoas envolvidas e o que precisa funcionar
              melhor.
            </p>
          </div>
          <div>
            <span className="approach-number">02</span>
            <h3>Organizar a solução.</h3>
            <p>Transformar necessidades em fluxos claros e interfaces úteis.</p>
          </div>
          <div>
            <span className="approach-number">03</span>
            <h3>Construir e aprender.</h3>
            <p>
              Dar forma à ideia e reconhecer o que cada etapa ainda precisa
              evoluir.
            </p>
          </div>
        </div>
        <div className="hackathon">
          <div className="hackathon-art" aria-hidden="true">
            <span>IDEIA</span>
            <ArrowRight />
            <span className="hack-code">
              <Code2 size={32} />
            </span>
            <ArrowRight />
            <span>PROJETO</span>
          </div>
          <div className="hackathon-copy">
            <div className="eyebrow">UM CONTEXTO. DOIS PROJETOS.</div>
            <h3>Construir também é colaborar.</h3>
            <p>
              Um hackathon deu origem a dois trabalhos distintos:{" "}
              <Link to="/projetos/pela-ordem">Pela Ordem</Link>, desenvolvido
              por Diego com outros integrantes da equipe, e{" "}
              <Link to="/projetos/jusexplica">JusExplica</Link>, desenvolvido
              pela equipe do projeto, com Kennedy na tecnologia. Cada projeto
              tem sua própria proposta e autoria.
            </p>
          </div>
          <ArrowUpRight className="hackathon-arrow" size={28} />
        </div>
      </div>
    </section>
  );
}

function People() {
  return (
    <section className="people-section section" id="pessoas">
      <div className="container">
        <SectionLabel number="03">QUEM CONSTRÓI</SectionLabel>
        <div className="section-heading">
          <h2>
            Tecnologia tem
            <br />
            <span>pessoas por trás.</span>
          </h2>
          <p>
            Trabalho conjunto, contribuições diferentes.
            <br />
            Os créditos fazem parte de cada projeto.
          </p>
        </div>
        <div className="people-grid">
          {people.map((person) => (
            <article className={`person ${person.id}`} key={person.id}>
              <div className="person-top">
                {person.photo ? (
                  <img
                    className="person-photo"
                    src={person.photo}
                    alt={person.name}
                    loading="lazy"
                  />
                ) : (
                  <span className="person-initials" aria-hidden="true">
                    {person.initials}
                    <i>.</i>
                  </span>
                )}
                <span className="person-role">{person.role}</span>
              </div>
              <h3>{person.name}</h3>
              {person.bio && <p>{person.bio}</p>}
              <span className="person-project-label">PARTICIPAÇÃO EM</span>
              <div className="person-projects">
                {person.projectIds.map((id) => (
                  <Link key={id} to={`/projetos/${id}`}>
                    {projects.find((p) => p.id === id)?.name}
                    <ArrowUpRight size={12} />
                  </Link>
                ))}
              </div>
              {person.links?.length ? (
                <div className="person-links">
                  {person.links.map((link) => (
                    <a
                      href={link.url}
                      key={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const channels = [
    contactConfig.whatsapp && {
      label: "WhatsApp",
      href: contactConfig.whatsapp,
      icon: MessageCircle,
    },
    contactConfig.email && {
      label: contactConfig.email,
      href: `mailto:${contactConfig.email}`,
      icon: Mail,
    },
    contactConfig.github && {
      label: "GitHub",
      href: contactConfig.github,
      icon: Github,
    },
    contactConfig.linkedin && {
      label: "LinkedIn",
      href: contactConfig.linkedin,
      icon: Linkedin,
    },
  ].filter((item): item is { label: string; href: string; icon: typeof Mail } =>
    Boolean(item),
  );
  return (
    <section className="contact-section" id="contato">
      <div className="container contact-inner">
        <div className="contact-top">
          <span className="eyebrow">
            <span className="status-dot" />
            VAMOS CONVERSAR
          </span>
          <ArrowUpRight size={52} strokeWidth={1.25} />
        </div>
        <h2>
          Tem um processo que
          <br />
          pode funcionar <span>melhor?</span>
        </h2>
        <div className="contact-bottom">
          <p>
            Desenvolvimento de sistemas, colaboração ou oportunidades
            profissionais. Uma boa conversa pode ser o começo.
          </p>
          {channels.length ? (
            <div className="contact-channels">
              {channels.map((channel) => (
                <a
                  className="contact-channel"
                  key={channel.href}
                  href={channel.href}
                  target={
                    channel.href.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel="noopener noreferrer"
                >
                  <channel.icon size={18} />
                  {channel.label}
                  <ArrowUpRight size={17} />
                </a>
              ))}
            </div>
          ) : (
            <div className="contact-unavailable">
              <Minus size={18} />
              <p>
                A KDTech ainda não dispõe de
                <br />
                canais públicos de contato.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Brand />
        <span>Ideias que viram soluções.</span>
        <Link to="/#projetos">
          Explore os projetos <ArrowUpRight size={14} />
        </Link>
        <span className="copyright">© {new Date().getFullYear()} KDTech</span>
      </div>
    </footer>
  );
}

function Home() {
  useMetadata(
    "KDTech — Ideias que viram soluções",
    "Conheça a KDTech: desenvolvimento de software aplicado à gestão, à educação e à organização de processos.",
  );
  return (
    <>
      <Hero />
      <Projects />
      <About />
      <People />
      <Contact />
    </>
  );
}

function Detail({ project }: { project: Project }) {
  useMetadata(
    `${project.name} — KDTech`,
    project.summary ||
      [project.name + ".", project.origin, project.credit]
        .filter(Boolean)
        .join(" "),
    project.images?.[0]?.src,
  );
  const [galleryIndex, setGalleryIndex] = useState(0);
  const hasAudience = Boolean(project.audience || project.businessModel);
  const participants: { name: string; role?: string }[] =
    project.participants || project.authors.map((name) => ({ name }));
  useEffect(() => setGalleryIndex(0), [project.id]);
  return (
    <>
      <section
        className={`detail-hero ${project.visual || "unpictured"}`}
        style={{ "--project-accent": project.accent } as CSSProperties}
      >
        <div className="container">
          <Link className="back-link" to="/#projetos">
            <ArrowLeft size={16} />
            Todos os projetos
          </Link>
          <div className="detail-heading">
            <div>
              <div className="eyebrow">
                <span>{project.number} /</span>
                {project.category || "PROJETO DO HACKATHON"}
              </div>
              <h1>
                {project.id === "gestorize-mobile" ? <>Gestorize<wbr />Mobile</> : project.name}
                <span>.</span>
              </h1>
              {project.summary && <p>{project.summary}</p>}
              {!project.summary && project.origin && <p>{project.origin}</p>}
            </div>
            <div className="detail-intro-credit">
              <span>
                {project.participants ? "EQUIPE DO PROJETO" : "QUEM DESENVOLVEU"}
              </span>
              <p>{project.credit}</p>
              {project.stage && (
                <span className="detail-stage">
                  <span className="tiny-dot" />
                  {project.stage}
                </span>
              )}
            </div>
          </div>
          {(project.visual || project.images?.length) && (
            <div className="detail-main-preview">
              <ProjectImage project={project} />
            </div>
          )}
        </div>
      </section>
      <section className="detail-content">
        <div className="container detail-layout">
          {(project.problem || project.features?.length) && (
            <aside className="detail-nav" aria-label="Nesta página">
              <span>NESTE PROJETO</span>
              {project.problem && (
                <a href="#contexto">
                  O contexto <ChevronRight size={14} />
                </a>
              )}
              {project.solution && (
                <a href="#solucao">
                  A solução <ChevronRight size={14} />
                </a>
              )}
              {project.features?.length ? (
                <a href="#recursos">
                  Recursos <ChevronRight size={14} />
                </a>
              ) : null}
              {hasAudience && (
                <a href="#publico">
                  Público e modelo <ChevronRight size={14} />
                </a>
              )}
              {project.stage && (
                <a href="#estagio">
                  Estágio atual <ChevronRight size={14} />
                </a>
              )}
              <a href="#participantes">
                Participantes <ChevronRight size={14} />
              </a>
              {project.links?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ExternalLink size={14} />
                </a>
              ))}
            </aside>
          )}
          <div className="detail-article">
            {project.problem && (
              <section className="detail-block" id="contexto">
                <SectionLabel number="01">CONTEXTO E PROBLEMA</SectionLabel>
                <h2>{project.headings?.context || "Um desafio da rotina."}</h2>
                <p>{project.problem}</p>
                {project.origin && (
                  <p className="origin-note">
                    <Sparkles size={17} />
                    {project.origin}
                  </p>
                )}
              </section>
            )}
            {project.solution && (
              <section className="detail-block" id="solucao">
                <SectionLabel number="02">A SOLUÇÃO PROPOSTA</SectionLabel>
                <h2>
                  {project.headings?.solution || "Organização que faz sentido."}
                </h2>
                <p>{project.solution}</p>
                {project.flow?.length ? (
                  <>
                    <h3 className="detail-subtitle">Como o fluxo funciona</h3>
                    <ol className="flow-list">
                      {project.flow.map((step, index) => (
                        <li key={step}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <b>{step}</b>
                          {index < project.flow!.length - 1 && (
                            <ArrowDown size={16} aria-hidden="true" />
                          )}
                        </li>
                      ))}
                    </ol>
                    {project.id === "lousa" && (
                      <p className="flow-note">
                        Fluxo demonstrado no protótipo local. O uso
                        compartilhado entre dispositivos depende das etapas
                        futuras.
                      </p>
                    )}
                  </>
                ) : null}
                {project.benefits?.length ? (
                  <div className="benefits">
                    <h3>O que a solução busca facilitar</h3>
                    <ul>
                      {project.benefits.map((benefit) => (
                        <li key={benefit}>
                          <Check size={17} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <span>
                      Benefícios pretendidos; resultados de impacto ainda não
                      medidos.
                    </span>
                  </div>
                ) : null}
              </section>
            )}
            {project.features?.length ? (
              <section className="detail-block" id="recursos">
                <SectionLabel number="03">PRINCIPAIS RECURSOS</SectionLabel>
                <h2>
                  {project.headings?.features ||
                    (project.id === "lousa"
                      ? "O protótipo e os próximos passos."
                      : "O trabalho em uma visão mais clara.")}
                </h2>
                <div className="features-list">
                  {project.features.map((feature, index) => (
                    <article key={feature.title}>
                      <span className="feature-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                      {feature.status && (
                        <span className={`feature-status ${feature.status}`}>
                          {feature.status === "demonstrated"
                            ? "No protótipo"
                            : "Etapa futura"}
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
            {hasAudience && (
              <section className="detail-block" id="publico">
                <SectionLabel number="04">
                  PÚBLICO E MODELO DE NEGÓCIO
                </SectionLabel>
                <h2>Para quem a proposta foi pensada.</h2>
                {project.audience && <p>{project.audience}</p>}
                {project.businessModel && (
                  <>
                    <h3 className="detail-subtitle">
                      Como o projeto pretende crescer
                    </h3>
                    <p>{project.businessModel}</p>
                  </>
                )}
              </section>
            )}
            {project.images && project.images.length > 1 && (
              <section className="detail-block" id="galeria">
                <SectionLabel number="04">GALERIA DE TELAS</SectionLabel>
                <h2>Um olhar para a interface.</h2>
                <figure className="gallery-main">
                  <img
                    src={project.images[galleryIndex].src}
                    alt={project.images[galleryIndex].alt}
                    loading="lazy"
                  />
                  {project.images[galleryIndex].caption && (
                    <figcaption>
                      {project.images[galleryIndex].caption}
                    </figcaption>
                  )}
                </figure>
                <div className="gallery-selector">
                  {project.images.map((image, index) => (
                    <button
                      type="button"
                      key={image.src}
                      onClick={() => setGalleryIndex(index)}
                      aria-label={`Exibir tela: ${image.alt}`}
                      aria-pressed={index === galleryIndex}
                    >
                      <img src={image.src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </section>
            )}
            {(project.stage ||
              project.limitations?.length ||
              project.technologies?.length) && (
              <section className="detail-block stage-block" id="estagio">
                <SectionLabel number={hasAudience ? "05" : "04"}>
                  {project.stage ? "ESTÁGIO DO PROJETO" : "SOBRE A PROPOSTA"}
                </SectionLabel>
                {project.stage && (
                  <>
                    <h2>Onde o projeto está hoje.</h2>
                    <p>{project.stage}</p>
                  </>
                )}
                {project.limitations?.length ? (
                  <ul className="limitations-list">
                    {project.limitations.map((limitation) => (
                      <li key={limitation}>
                        <span />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {project.technologies?.length ? (
                  <div className="technologies">
                    <span>
                      {project.technologiesLabel || "TECNOLOGIAS CONFIRMADAS"}
                    </span>
                    {project.architecture && <p>{project.architecture}</p>}
                    <div>
                      {project.technologies.map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            )}
            <section className="detail-block" id="participantes">
              <SectionLabel
                number={hasAudience ? "06" : project.problem ? "05" : "01"}
              >
                PARTICIPANTES
              </SectionLabel>
              <h2>As pessoas deste projeto.</h2>
              <p>{project.credit}</p>
              <div className="detail-authors">
                {participants.map(({ name, role }) => {
                  const person = people.find((p) => p.name === name);
                  return (
                    <div key={name}>
                      <span className="author-avatar" aria-hidden="true">
                        {person?.initials ||
                          name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")}
                      </span>
                      <div className="author-info">
                        <b>{name}</b>
                        {role && <span>{role}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {project.links?.length ? (
                <div className="detail-external-links">
                  {project.links.map((link) => (
                    <a
                      className="button button-outline"
                      href={link.url}
                      key={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <ExternalLink size={17} />
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </section>
      <div className="container next-projects">
        <span>CONTINUE EXPLORANDO</span>
        <div>
          {projects
            .filter((p) => p.id !== project.id)
            .map((p) => (
              <Link key={p.id} to={`/projetos/${p.id}`}>
                {p.name}
                <ArrowUpRight size={18} />
              </Link>
            ))}
        </div>
      </div>
      <Contact />
    </>
  );
}

function NotFound() {
  useMetadata(
    "Página não encontrada — KDTech",
    "Explore os projetos de desenvolvimento de software da KDTech.",
  );
  return (
    <section className="not-found container">
      <span className="eyebrow">404 / PÁGINA NÃO ENCONTRADA</span>
      <h1>
        Vamos voltar
        <br />
        ao começo?
      </h1>
      <p>Esse endereço não corresponde a uma página do portfólio.</p>
      <Link to="/" className="button button-primary">
        Conhecer a KDTech
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <RouteBehavior />
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          {projects.map((project) => (
            <Route
              key={project.id}
              path={`/projetos/${project.id}`}
              element={<Detail key={project.id} project={project} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
