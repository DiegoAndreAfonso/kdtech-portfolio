export interface Project {
  id: "gestao-juridica" | "pela-ordem" | "lousa" | "jusexplica" | "gestorize-mobile";
  name: string;
  number: string;
  category?: string;
  summary?: string;
  shortProblem?: string;
  problem?: string;
  solution?: string;
  benefits?: string[];
  features?: {
    title: string;
    description: string;
    status?: "demonstrated" | "planned";
  }[];
  flow?: string[];
  authors: string[];
  credit: string;
  origin?: string;
  stage?: string;
  technologies?: string[];
  limitations?: string[];
  images?: { src: string; alt: string; caption?: string }[];
  links?: { label: string; url: string }[];
  accent: string;
  visual?: "legal" | "schedule" | "education" | "mobile";
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  projectIds: Project["id"][];
  bio?: string;
  photo?: string;
  links?: { label: string; url: string }[];
}

export interface ContactConfig {
  whatsapp?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  siteUrl?: string;
}

export const projects: Project[] = [
  {
    id: "gestao-juridica",
    name: "Gestão Jurídica",
    number: "01",
    category: "Gestão de escritórios de advocacia",
    shortProblem: "Informações espalhadas na rotina dos escritórios.",
    summary:
      "Clientes, casos, agenda e finanças reunidos para organizar a rotina de um escritório de advocacia.",
    problem:
      "Na rotina de um escritório de advocacia, informações sobre clientes, casos, compromissos e finanças podem ficar espalhadas. Essa fragmentação dificulta a organização e o acompanhamento do trabalho.",
    solution:
      "A proposta é centralizar as informações do escritório em uma solução digital, reunindo gestão de clientes e casos, agenda, organização financeira, publicações e preferências de uso.",
    benefits: [
      "Facilitar a consulta de informações sobre clientes e casos.",
      "Apoiar a organização de compromissos e o acompanhamento do trabalho.",
      "Reunir informações financeiras e institucionais na rotina do escritório.",
    ],
    features: [
      {
        title: "Clientes e casos",
        description:
          "Organização das informações de clientes e dos casos acompanhados pelo escritório.",
      },
      {
        title: "Agenda de compromissos",
        description:
          "Uma visão dos compromissos para apoiar o planejamento da rotina.",
      },
      {
        title: "Organização financeira",
        description:
          "Reunião das informações financeiras para facilitar seu acompanhamento.",
      },
      {
        title: "Publicações e presença institucional",
        description:
          "Organização de conteúdos relacionados à presença institucional do escritório.",
      },
      {
        title: "Perfil e preferências",
        description:
          "Informações de perfil e preferências para organizar a experiência de uso.",
      },
    ],
    authors: ["Diego André Afonso", "Kennedy Pinheiro"],
    credit: "Desenvolvido por Diego André Afonso e Kennedy Pinheiro.",
    accent: "#38bdf8",
    visual: "legal",
  },
  {
    id: "pela-ordem",
    name: "Pela Ordem",
    number: "02",
    category: "Organização de pautas de audiências",
    shortProblem: "Planilhas, horários e possíveis conflitos na pauta.",
    summary:
      "Uma proposta para cruzar dados de planilhas, identificar possíveis conflitos de horários e organizar pautas de audiências.",
    problem:
      "Preparar uma pauta de audiências exige cruzar informações de planilhas, lidar com dados extraídos do Eproc e conferir possíveis conflitos de horários envolvendo advogados. Esse trabalho demanda tarefas repetitivas e atenção à conferência.",
    solution:
      "Processar os dados fornecidos em planilhas, apoiar a identificação de possíveis conflitos e organizar a marcação das audiências em intervalos de 15 minutos.",
    benefits: [
      "Reduzir tarefas repetitivas no cruzamento das informações.",
      "Apoiar a conferência de possíveis conflitos de horários.",
      "Facilitar a organização da pauta em intervalos de 15 minutos.",
    ],
    features: [
      {
        title: "Importação das planilhas",
        description:
          "Recebimento das planilhas com as informações necessárias à preparação da pauta.",
      },
      {
        title: "Cruzamento das informações",
        description:
          "Processamento dos dados fornecidos para auxiliar a organização das audiências.",
      },
      {
        title: "Conferência de possíveis conflitos",
        description:
          "Apoio à identificação de horários que podem gerar conflitos envolvendo advogados.",
      },
      {
        title: "Organização da pauta",
        description:
          "Proposta de marcação de audiências em intervalos de 15 minutos.",
      },
    ],
    flow: [
      "Importação das planilhas",
      "Cruzamento das informações",
      "Identificação de possíveis conflitos",
      "Organização da pauta",
    ],
    authors: ["Diego André Afonso"],
    credit:
      "Desenvolvido por Diego André Afonso em colaboração com outros integrantes da equipe do hackathon.",
    origin: "Desenvolvido no contexto de um hackathon.",
    limitations: [
      "O fluxo utiliza planilhas e dados extraídos do Eproc; não representa uma integração direta com a API do sistema.",
      "A identificação de possíveis conflitos apoia a conferência e não garante a ausência total de conflitos.",
    ],
    accent: "#a3e635",
    visual: "schedule",
  },
  {
    id: "lousa",
    name: "Lousa",
    number: "03",
    category: "Educação",
    shortProblem: "Conectar criação, participação e correção de atividades.",
    summary:
      "Uma plataforma centrada no professor para criar atividades e avaliações, acompanhar respostas e organizar a correção.",
    problem:
      "A criação de atividades e avaliações envolve questões, materiais de apoio, participação dos alunos, respostas e resultados. A proposta do Lousa é reunir essas etapas em um fluxo organizado para o professor.",
    solution:
      "Uma plataforma educacional que apresenta o percurso da criação de questões à correção e liberação dos resultados. O protótipo de frontend demonstra esse fluxo com persistência local no navegador.",
    benefits: [
      "Apoiar a organização de atividades, avaliações e materiais de apoio.",
      "Facilitar o acompanhamento das respostas e da correção.",
      "Dar ao professor um fluxo organizado para liberar os resultados.",
    ],
    features: [
      {
        title: "Painel do professor",
        description:
          "Demonstra a organização do trabalho do professor dentro do protótipo.",
        status: "demonstrated",
      },
      {
        title: "Criação e edição de questões",
        description:
          "Apresenta o fluxo de preparação de questões para atividades e avaliações.",
        status: "demonstrated",
      },
      {
        title: "Materiais de apoio",
        description:
          "Demonstra a organização de materiais associados às atividades.",
        status: "demonstrated",
      },
      {
        title: "Participação do aluno",
        description:
          "Apresenta o percurso do aluno no protótipo local. Acesso por link ou código faz parte da proposta; avaliações compartilhadas entre computadores dependem de desenvolvimento futuro.",
        status: "demonstrated",
      },
      {
        title: "Correção e resultados",
        description:
          "Demonstra o acompanhamento das respostas, a correção e a liberação dos resultados no protótipo.",
        status: "demonstrated",
      },
      {
        title: "Backend e compartilhamento de dados",
        description:
          "Desenvolvimento futuro necessário para compartilhar dados e avaliações de forma real entre dispositivos.",
        status: "planned",
      },
      {
        title: "Autenticação, e-mail, assinatura e aplicativo",
        description:
          "Esses recursos são simulados no estágio atual e dependem de implementação para funcionar como serviços reais.",
        status: "planned",
      },
    ],
    flow: [
      "Criação das questões",
      "Organização da atividade",
      "Participação do aluno",
      "Correção das respostas",
      "Liberação dos resultados",
    ],
    authors: ["Diego André Afonso", "Kennedy Pinheiro", "Alice Figueira"],
    credit:
      "Desenvolvido por Diego André Afonso, Kennedy Pinheiro e Alice Figueira.",
    stage: "Protótipo de frontend com persistência local no navegador.",
    technologies: ["React", "TypeScript", "Vite"],
    limitations: [
      "Autenticação, e-mail, assinatura e aplicativo ainda são simulados.",
      "Backend e compartilhamento real dos dados entre dispositivos são etapas futuras.",
      "O protótipo local não permite aplicar avaliações compartilhadas entre computadores.",
      "Controle nativo do computador durante avaliações não está implementado.",
    ],
    accent: "#c4b5fd",
    visual: "education",
  },
  {
    id: "gestorize-mobile",
    name: "GestorizeMobile",
    number: "04",
    category: "Gestão empresarial no celular",
    shortProblem: "Organizar clientes e produtos na rotina de pequenas empresas.",
    summary:
      "Um aplicativo de gestão para pequenas e médias empresas, com cadastros de clientes e produtos em uma interface mobile integrada a uma API Laravel.",
    problem:
      "Pequenas e médias empresas precisam manter informações de clientes, produtos e endereços organizadas, inclusive durante o trabalho fora do escritório. Consultar e atualizar esses registros pelo celular ajuda a reunir as informações da rotina.",
    solution:
      "O GestorizeMobile reúne cadastros de clientes e produtos em um aplicativo desenvolvido com React Native e Expo, conectado a uma API Laravel. A proposta também contempla fornecedores, funcionários, orçamentos e relatórios, cujos fluxos mobile ainda estão em desenvolvimento.",
    benefits: [
      "Consultar e atualizar cadastros durante o trabalho pelo celular.",
      "Organizar produtos por categoria e unidade de medida.",
      "Facilitar o preenchimento de endereços com consulta de CEP.",
    ],
    features: [
      {
        title: "Clientes PF e PJ",
        description:
          "Cadastro, consulta, edição e exclusão de clientes, com avatar e informações de endereço.",
        status: "demonstrated",
      },
      {
        title: "Catálogo de produtos",
        description:
          "Cadastro, consulta, edição e exclusão de produtos, com categoria, unidade de medida e imagem.",
        status: "demonstrated",
      },
      {
        title: "Endereços por CEP",
        description:
          "Consulta ao ViaCEP para apoiar o preenchimento dos dados de endereço.",
        status: "demonstrated",
      },
      {
        title: "Acesso e permissões",
        description:
          "Autenticação por token com Laravel Sanctum, encerramento e renovação de sessão, papéis e permissões de acesso.",
        status: "demonstrated",
      },
      {
        title: "Preferências de interface",
        description:
          "Tema claro ou escuro e opção de listas compactas para organizar a visualização no celular.",
        status: "demonstrated",
      },
      {
        title: "Expansão da gestão",
        description:
          "Os fluxos mobile de fornecedores, funcionários, orçamentos e relatórios ainda incluem telas ou dados demonstrativos e seguem em desenvolvimento.",
        status: "planned",
      },
    ],
    flow: [
      "Entrar no aplicativo",
      "Organizar o cadastro de clientes",
      "Cadastrar produtos e suas categorias",
      "Consultar e atualizar os registros pelo celular",
    ],
    authors: ["Diego André Afonso", "Kennedy Pinheiro"],
    credit:
      "Desenvolvido em coautoria por Diego André Afonso e Kennedy Pinheiro.",
    stage: "Aplicativo e API em desenvolvimento.",
    technologies: [
      "React Native", "Expo", "TypeScript", "React Native Paper",
      "Laravel", "PHP", "Laravel Sanctum", "Spatie Permission",
    ],
    limitations: [
      "Fornecedores, funcionários, orçamentos e relatórios ainda usam listagens demonstrativas no aplicativo.",
      "Os formulários de novo fornecedor, funcionário e orçamento e a exportação de relatórios ainda não estão implementados no mobile.",
      "O repositório não apresenta uma demonstração pública do aplicativo; a prévia neste portfólio é uma ilustração de interface.",
    ],
    links: [
      { label: "Ver repositório", url: "https://github.com/KennedyPinheiro/GestorizeMobile" },
    ],
    accent: "#fbbf24",
    visual: "mobile",
  },
  {
    id: "jusexplica",
    name: "JusExplica",
    number: "05",
    authors: ["Kennedy Pinheiro"],
    credit: "Desenvolvido por Kennedy Pinheiro.",
    origin: "Desenvolvido no mesmo contexto de hackathon do Pela Ordem.",
    accent: "#94a3b8",
  },
];

export const people: Person[] = [
  {
    id: "diego",
    name: "Diego André Afonso",
    initials: "DA",
    role: "Desenvolvimento de software",
    projectIds: ["gestao-juridica", "pela-ordem", "lousa", "gestorize-mobile"],
  },
  {
    id: "kennedy",
    name: "Kennedy Pinheiro",
    initials: "KP",
    role: "Desenvolvimento de software",
    projectIds: ["gestao-juridica", "jusexplica", "lousa", "gestorize-mobile"],
  },
  {
    id: "alice",
    name: "Alice Figueira",
    initials: "AF",
    role: "Colaboração no Lousa",
    projectIds: ["lousa"],
  },
];

export const contactConfig: ContactConfig = {};
