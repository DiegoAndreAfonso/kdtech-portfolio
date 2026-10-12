import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileSpreadsheet,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  PanelLeft,
  Plus,
  Search,
  Settings2,
  Users,
  Wallet,
} from "lucide-react";
import type { Project } from "../data";
import GestorizePreview from "./GestorizePreview";
import JusExplicaPreview from "./JusExplicaPreview";

type PreviewProps = {
  variant: NonNullable<Project["visual"]>;
  compact?: boolean;
  className?: string;
};

export default function ProductPreview({
  variant,
  compact = false,
  className = "",
}: PreviewProps) {
  if (variant === "mobile") return <GestorizePreview compact={compact} className={className} />;
  return (
    <div
      className={`product-preview ${variant} ${compact ? "compact" : ""} ${className}`}
      role="img"
      aria-label={`Ilustração de interface de ${variant === "legal" ? "Gestão Jurídica" : variant === "schedule" ? "Pela Ordem" : variant === "justice" ? "JusExplica" : "Lousa"}. Conteúdo de exemplo.`}
    >
      <div className="preview-chrome">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>
          {variant === "legal"
            ? "gestão jurídica"
            : variant === "schedule"
              ? "pela ordem"
              : variant === "justice"
                ? "jusexplica"
                : "lousa"}{" "}
          / visão do produto
        </span>
        <PanelLeft size={11} />
      </div>
      {variant === "legal" ? (
        <Legal />
      ) : variant === "schedule" ? (
        <Schedule />
      ) : variant === "justice" ? (
        <JusExplicaPreview />
      ) : (
        <Education />
      )}
    </div>
  );
}

function Legal() {
  return (
    <div className="mock-layout">
      <aside className="mock-sidebar">
        <div className="mock-brand">
          <BriefcaseBusiness size={17} />
          <b>
            Gestão
            <br />
            Jurídica
          </b>
        </div>
        <div className="mock-nav selected">
          <LayoutDashboard />
          Visão geral
        </div>
        <div className="mock-nav">
          <Users />
          Clientes
        </div>
        <div className="mock-nav">
          <FolderOpen />
          Casos
        </div>
        <div className="mock-nav">
          <CalendarDays />
          Agenda
        </div>
        <div className="mock-nav">
          <Wallet />
          Financeiro
        </div>
        <div className="mock-settings">
          <Settings2 />
          Preferências
        </div>
      </aside>
      <div className="mock-main">
        <div className="mock-heading">
          <span>
            Visão geral<small>Sua rotina, em um lugar.</small>
          </span>
          <span className="mock-avatar">GJ</span>
        </div>
        <div className="mock-stats">
          <div>
            <Users />
            <span>Clientes</span>
            <b>Organizar</b>
          </div>
          <div>
            <FolderOpen />
            <span>Casos</span>
            <b>Acompanhar</b>
          </div>
          <div>
            <CalendarDays />
            <span>Agenda</span>
            <b>Planejar</b>
          </div>
        </div>
        <div className="mock-section-head">
          <b>Próximos compromissos</b>
          <span>Ver agenda →</span>
        </div>
        <div className="mock-event">
          <span className="mock-time">09:00</span>
          <div>
            <b>Reunião de acompanhamento</b>
            <small>Compromisso de exemplo</small>
          </div>
          <span className="mock-pill">Reunião</span>
        </div>
        <div className="mock-event">
          <span className="mock-time">14:00</span>
          <div>
            <b>Conferência de documentos</b>
            <small>Compromisso de exemplo</small>
          </div>
          <span className="mock-pill neutral">Rotina</span>
        </div>
        <div className="mock-bottom">
          <span>
            <span className="tiny-dot" />
            Informações conectadas à sua rotina
          </span>
        </div>
      </div>
    </div>
  );
}

function Schedule() {
  return (
    <div className="schedule-main">
      <div className="mock-heading">
        <span>
          <span className="schedule-wordmark">
            <ListChecks size={20} />
            pela ordem
          </span>
          <small>Organização de pautas de audiências</small>
        </span>
        <span className="mock-avatar">PO</span>
      </div>
      <div className="schedule-toolbar">
        <span>
          <FileSpreadsheet size={12} />
          Planilha de exemplo
        </span>
        <span className="mock-pill">Conferência da pauta</span>
      </div>
      <div className="schedule-table">
        <div className="schedule-table-head">
          <span>HORÁRIO</span>
          <span>AUDIÊNCIA</span>
          <span>CONFERÊNCIA</span>
        </div>
        <div>
          <b>09:00</b>
          <span>Audiência de exemplo A</span>
          <span className="table-check">
            <Check />A conferir
          </span>
        </div>
        <div>
          <b>09:15</b>
          <span>Audiência de exemplo B</span>
          <span className="table-warning">
            <Clock3 />
            Possível conflito
          </span>
        </div>
        <div>
          <b>09:30</b>
          <span>Audiência de exemplo C</span>
          <span className="table-check">
            <Check />A conferir
          </span>
        </div>
      </div>
      <div className="schedule-note">
        <Clock3 size={12} />
        <span>Intervalos de 15 minutos · dados ilustrativos</span>
      </div>
    </div>
  );
}

function Education() {
  return (
    <div className="mock-layout">
      <aside className="mock-sidebar">
        <div className="mock-brand">
          <GraduationCap size={22} />
          <b>
            lousa<span className="brand-period">.</span>
          </b>
        </div>
        <div className="mock-nav selected">
          <LayoutDashboard />
          Meu painel
        </div>
        <div className="mock-nav">
          <FolderOpen />
          Atividades
        </div>
        <div className="mock-nav">
          <ListChecks />
          Questões
        </div>
        <div className="mock-nav">
          <Users />
          Respostas
        </div>
        <div className="mock-settings">
          <Settings2 />
          Preferências
        </div>
      </aside>
      <div className="mock-main">
        <div className="mock-heading">
          <span>
            Painel do professor<small>Espaço para ensinar e acompanhar.</small>
          </span>
          <span className="mock-avatar">L</span>
        </div>
        <div className="education-action">
          <span>Minhas atividades</span>
          <span>
            <Plus size={11} />
            Nova atividade
          </span>
        </div>
        <div className="mock-search">
          <Search size={11} />
          Buscar atividade
          <span>
            <ChevronDown size={11} />
          </span>
        </div>
        <div className="education-card">
          <div className="education-card-icon">
            <GraduationCap />
          </div>
          <div>
            <small>ATIVIDADE DE EXEMPLO</small>
            <b>Conhecimentos em prática</b>
            <span>Questões e materiais de apoio</span>
          </div>
          <span className="mock-pill">Rascunho</span>
        </div>
        <div className="education-progress">
          <div>
            <b>Da criação à correção</b>
            <span>Um fluxo centrado no professor</span>
          </div>
          <div className="progress-line">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="progress-labels">
            <span>Criar</span>
            <span>Aplicar</span>
            <span>Corrigir</span>
            <span>Liberar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
