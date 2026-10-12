import { ChevronRight, Menu, Package, Smartphone, Users } from "lucide-react";
import "./gestorize-preview.css";

type GestorizePreviewProps = {
  compact?: boolean;
  className?: string;
};

export default function GestorizePreview({
  compact = false,
  className = "",
}: GestorizePreviewProps) {
  return (
    <div
      className={`gm-preview ${compact ? "gm-compact" : ""} ${className}`}
      role="img"
      aria-label="GestorizeMobile: ilustração de interface com clientes e produtos. Conteúdo de exemplo."
    >
      <div className="gm-phone" aria-hidden="true">
        <div className="gm-phone-header">
          <Menu size={15} />
          <span>Gestorize<span className="gm-wordmark-dot">.</span></span>
          <Smartphone size={15} />
        </div>

        <div className="gm-section-label">
          <Users size={13} />
          <span>Clientes</span>
        </div>
        <div className="gm-record">
          <span className="gm-record-icon"><Users size={20} /></span>
          <span className="gm-record-text">
            <b>Cliente de exemplo</b>
            <small>Pessoa jurídica</small>
          </span>
          <ChevronRight className="gm-record-arrow" size={14} />
        </div>

        <div className="gm-section-label">
          <Package size={13} />
          <span>Produtos</span>
        </div>
        <div className="gm-record">
          <span className="gm-record-icon"><Package size={21} /></span>
          <span className="gm-record-text">
            <b>Produto de exemplo</b>
            <small>Categoria ilustrativa</small>
          </span>
          <ChevronRight className="gm-record-arrow" size={14} />
        </div>

        <div className="gm-example-label">Interface ilustrativa · dados fictícios</div>
        <div className="gm-home-indicator" />
      </div>
    </div>
  );
}
