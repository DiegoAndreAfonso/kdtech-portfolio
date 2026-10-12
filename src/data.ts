export interface Project {
  id: "gestao-juridica" | "pela-ordem" | "lousa" | "jusexplica" | "gestorize-mobile";
  name: string;
  number: string;
  category?: string;
  summary?: string;
  shortProblem?: string;
  problem?: string;
  solution?: string;
  headings?: { context?: string; solution?: string; features?: string };
  audience?: string;
  businessModel?: string;
  benefits?: string[];
  features?: {
    title: string;
    description: string;
    status?: "demonstrated" | "planned";
  }[];
  flow?: string[];
  authors: string[];
  participants?: { name: string; role: string }[];
  credit: string;
  origin?: string;
  stage?: string;
  technologies?: string[];
  technologiesLabel?: string;
  architecture?: string;
  limitations?: string[];
  images?: { src: string; alt: string; caption?: string }[];
  links?: { label: string; url: string }[];
  accent: string;
  visual?: "legal" | "schedule" | "education" | "justice" | "mobile";
}

export interface Person {
  id: string;
  name: string;
  displayName?: string;
  initials: string;
  role: string;
  projectIds: Project["id"][];
  bio: string;
  education: string;
  location?: string;
  activities: string;
  focus: string[];
  skills: { label: string; items: string[] }[];
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
      "Gestão de clientes, casos e agenda para organizar a rotina de um escritório de advocacia.",
    problem:
      "Na rotina de um escritório de advocacia, informações sobre clientes, casos, compromissos e finanças podem ficar espalhadas. Essa fragmentação dificulta a organização e o acompanhamento do trabalho.",
    solution:
      "A aplicação reúne gestão de clientes e casos, agenda, publicações e preferências de uso. A interface inclui também um gráfico financeiro demonstrativo, com dados exemplificativos.",
    benefits: [
      "Facilitar a consulta de informações sobre clientes e casos.",
      "Apoiar a organização de compromissos e o acompanhamento do trabalho.",
      "Centralizar informações para acompanhar a rotina do escritório.",
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
        title: "Visualização financeira demonstrativa",
        description:
          "Gráfico com dados exemplificativos de receitas e despesas; não representa um módulo financeiro operacional.",
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
    technologies: ["Next.js", "React", "TypeScript", "Material UI", "Laravel", "MySQL"],
    links: [{ label: "Acessar o sistema (com login)", url: "https://advogadosmca.com.br/" }],
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
      "Organização de pautas de audiências a partir de planilhas, considerando impedimentos e possíveis conflitos de horários.",
    problem:
      "Preparar uma pauta de audiências exige cruzar informações de planilhas, lidar com dados extraídos do Eproc e conferir possíveis conflitos de horários envolvendo advogados. Esse trabalho demanda tarefas repetitivas e atenção à conferência.",
    solution:
      "Processa as planilhas e organiza as audiências em intervalos de 15 minutos, agrupando as de cada advogado em horários consecutivos no mesmo dia e período. Considera impedimentos e sinaliza conflito quando não há espaço para agendar o bloco inteiro.",
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
          "Audiências em blocos consecutivos por advogado, com exportação da pauta em XLSX.",
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
      "Sem login: planilhas e processos ficam na memória da aba e são descartados ao recarregar ou fechar a página.",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "SheetJS", "ExcelJS"],
    links: [{ label: "Experimentar o Pela Ordem", url: "https://pelaordem.advogadosmca.com.br/" }],
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
    category: "Comunicação jurídica acessível",
    shortProblem: "Entender o que acontece em um processo judicial.",
    summary:
      "Uma proposta para ajudar as pessoas a entender e acompanhar seus processos, com notificações pelo WhatsApp e consultas em linguagem simples, por texto e áudio.",
    problem:
      "Termos técnicos e informações difíceis de compreender podem deixar as pessoas com dúvidas e insegurança sobre seus processos. Diferenças de escolaridade e necessidades de acessibilidade também dificultam a comunicação durante o atendimento jurídico.",
    solution:
      "O JusExplica propõe um assistente virtual jurídico com duas frentes: um notificador pelo WhatsApp para avisar sobre atualizações do processo e um chat complementar para consultar informações e esclarecer dúvidas. A ideia é explicar o que mudou, a situação atual e o próximo passo em linguagem simples, com respostas em texto e áudio.",
    headings: {
      context: "Entender o processo também faz parte do acesso à Justiça.",
      solution: "A Justiça fala a sua língua.",
      features: "Informação que chega e faz sentido.",
    },
    audience:
      "Pessoas que recebem atendimento jurídico e precisam acompanhar seus processos, especialmente quem encontra dificuldade com a linguagem técnica. A proposta busca facilitar a comunicação entre cidadãos e os serviços de Justiça.",
    businessModel:
      "O modelo apresentado é B2G, voltado à contratação por instituições públicas, com perspectiva de expansão para B2B, atendendo organizações privadas. A proposta busca investimento para avançar no desenvolvimento.",
    benefits: [
      "Facilitar a compreensão das informações e dos termos jurídicos.",
      "Manter o cidadão informado sobre as novidades do seu processo.",
      "Oferecer explicações por texto e áudio em um canal familiar.",
      "Reduzir dúvidas e insegurança durante o acompanhamento do caso.",
    ],
    features: [
      {
        title: "Notificações pelo WhatsApp",
        description:
          "A proposta prevê o envio automático de avisos quando houver novidades no andamento do processo.",
      },
      {
        title: "Explicações em linguagem simples",
        description:
          "Apresentação das informações do caso de forma compreensível, explicando os termos técnicos e a situação atual.",
      },
      {
        title: "Texto e áudio",
        description:
          "Respostas nos dois formatos para que a pessoa possa ler ou ouvir a explicação. O fluxo apresentado também considera perguntas por áudio.",
      },
      {
        title: "Chat de consulta",
        description:
          "Um canal complementar ao notificador para perguntar sobre o processo e entender seus próximos passos.",
      },
      {
        title: "Consulta às informações processuais",
        description:
          "O fluxo proposto utiliza um identificador do processo para localizar os dados e prevê integração com o Eproc.",
      },
    ],
    flow: [
      "A pessoa entra em contato pelo WhatsApp",
      "Informa um dado para identificar o processo",
      "O sistema consulta as informações do caso",
      "As novidades são explicadas em texto e áudio",
      "A pessoa usa o chat complementar para tirar dúvidas sobre o processo",
    ],
    authors: ["Kennedy Pinheiro"],
    participants: [
      { name: "Arthur Ramalho dos Anjos", role: "Estratégia" },
      { name: "Vitória Gonçalvez", role: "Marketing e vendas" },
      { name: "Kennedy Pinheiro Xavier", role: "Tecnologia" },
      { name: "Guilherme Silva Amaral", role: "Tecnologia" },
      { name: "Rhenam Mattos", role: "Operacional" },
      { name: "Nilmar Aguilar Gonçalves", role: "Finanças" },
    ],
    credit:
      "Criado pela equipe do JusExplica, com participação de Kennedy Pinheiro na tecnologia.",
    origin: "Desenvolvido no mesmo contexto de hackathon do Pela Ordem.",
    stage:
      "Proposta desenvolvida no hackathon, apresentada com fluxos e interfaces ilustrativas.",
    technologiesLabel: "ARQUITETURA PROPOSTA",
    technologies: [
      "WhatsApp",
      "Eproc",
      "Faster-Whisper",
      "Modelo de linguagem",
      "Piper",
    ],
    architecture:
      "O desenho técnico considera entrada por texto ou áudio, transcrição de fala com Faster-Whisper, processamento por um modelo de linguagem e geração de voz com Piper. A consulta ao Eproc e as notificações pelo WhatsApp fazem parte da integração prevista.",
    limitations: [
      "Os materiais apresentam a proposta de funcionamento; não permitem confirmar a operação das integrações em produção.",
    ],
    accent: "#6ee7b7",
    visual: "justice",
  },
];

export const people: Person[] = [
  {
    id: "diego",
    name: "Diego André Afonso",
    initials: "DA",
    role: "Desenvolvedor Full Stack | Gestão de Projetos de Software",
    bio:
      "Atua no desenvolvimento de soluções pela KDTech, em parceria com Kennedy Pinheiro, participando do levantamento de requisitos, planejamento de funcionalidades e implementação de aplicações web. Seu trabalho conecta as necessidades do cliente ao desenvolvimento de interfaces, APIs e bancos de dados.",
    education: "Estudante de Análise e Desenvolvimento de Sistemas no IFNMG — Campus Almenara.",
    activities: "Também desenvolve aplicações mobile. Sua atuação em gestão de projetos envolve organização de requisitos, planejamento e colaboração.",
    focus: ["Desenvolvimento full stack", "Requisitos e planejamento"],
    skills: [
      { label: "Frontend", items: ["JavaScript", "TypeScript", "React", "Next.js", "HTML", "CSS"] },
      { label: "Backend", items: ["PHP", "Laravel", "APIs REST"] },
      { label: "Banco de dados", items: ["MySQL"] },
      { label: "Mobile", items: ["React Native"] },
      { label: "Ferramentas", items: ["Git", "GitHub", "Linux", "Figma"] },
    ],
    photo: "/images/team/diego-andre-afonso.jpg",
    projectIds: ["gestao-juridica", "pela-ordem", "lousa", "gestorize-mobile"],
    links: [{ label: "Ver GitHub", url: "https://github.com/DiegoAndreAfonso" }],
  },
  {
    id: "kennedy",
    name: "Kennedy Pinheiro Xavier",
    displayName: "Kennedy Pinheiro",
    initials: "KP",
    role: "Desenvolvedor Full Stack e Designer UX/UI",
    bio:
      "Combina desenvolvimento web e mobile com criação de interfaces e identidades visuais, integrando frontend, backend e aplicações por meio de APIs.",
    education: "Estudante de Análise e Desenvolvimento de Sistemas no IFNMG.",
    location: "Almenara — MG",
    activities: "Estagiário em desenvolvimento web no IFNMG e freelancer em design gráfico.",
    focus: ["React", "TypeScript", "Laravel", "Design de interfaces"],
    skills: [
      { label: "Frontend", items: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind CSS"] },
      { label: "Backend e dados", items: ["Node.js", "PHP", "Laravel", "MySQL", "PostgreSQL", "MongoDB"] },
      { label: "Mobile", items: ["React Native"] },
      { label: "Design", items: ["Figma", "Photoshop", "Illustrator", "Canva"] },
      { label: "Ferramentas", items: ["Git", "GitHub", "VS Code", "Docker", "Postman", "Linux"] },
    ],
    photo: "/images/team/kennedy-pinheiro.jpg",
    projectIds: ["gestao-juridica", "jusexplica", "lousa", "gestorize-mobile"],
    links: [{ label: "Ver GitHub", url: "https://github.com/KennedyPinheiro" }],
  },
];

export const contactConfig: ContactConfig = {};
