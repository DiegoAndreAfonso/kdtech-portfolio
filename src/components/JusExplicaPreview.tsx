import { AudioLines, Check, Clock3, MessageCircle, Scale } from "lucide-react";
import "./jusexplica-preview.css";

export default function JusExplicaPreview() {
  return (
    <div className="jus-preview">
      <div className="jus-preview-heading">
        <div className="jus-preview-brand">
          <span className="jus-preview-mark">
            <Scale size={21} />
          </span>
          <span>
            <b>JusExplica</b>
            <small>Seu processo, em palavras simples.</small>
          </span>
        </div>
        <span className="jus-preview-badge">Acompanhamento</span>
      </div>

      <div className="jus-preview-columns">
        <section className="jus-preview-notification">
          <div className="jus-preview-section-label">
            <MessageCircle size={16} />
            <span>Atualização pelo WhatsApp</span>
          </div>
          <div className="jus-preview-message">
            <span className="jus-preview-message-title">Uma novidade no seu processo</span>
            <p>
              Você ganhou a primeira etapa. A empresa recorreu da decisão e pediu
              uma nova análise.
            </p>
            <p>Agora, é preciso aguardar a análise desse recurso.</p>
            <div className="jus-preview-message-meta">
              <span>Resumo em texto</span>
              <Check size={13} aria-hidden="true" />
            </div>
          </div>
          <div className="jus-preview-audio">
            <AudioLines size={21} aria-hidden="true" />
            <div>
              <b>Resumo também em áudio</b>
              <span>A mesma explicação, para ouvir.</span>
            </div>
            <div className="jus-preview-wave" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className="jus-preview-consultation">
          <div className="jus-preview-section-label">
            <Scale size={16} />
            <span>Consulta em linguagem simples</span>
          </div>
          <div className="jus-preview-facts">
            <div>
              <span>O que mudou</span>
              <p>A empresa apresentou um recurso.</p>
            </div>
            <div>
              <span>Situação atual</span>
              <p>A decisão da primeira etapa será reavaliada.</p>
            </div>
            <div>
              <span>Próximo passo</span>
              <p>Aguardar a análise do recurso.</p>
            </div>
          </div>
          <div className="jus-preview-question">O que acontece agora?</div>
          <div className="jus-preview-answer">
            <Clock3 size={16} aria-hidden="true" />
            <p>
              O processo continua. O resultado final ainda depende da análise do
              recurso.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
