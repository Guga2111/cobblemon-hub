export type Difficulty = "Easy" | "Medium" | "Hard";

export type GuideCategory =
  | "Apricorns"
  | "Tumblestones"
  | "Berry Farming"
  | "EV Training Spots"
  | "Shiny Hunting"
  | "Instalação";

export interface GuideSection {
  heading?: string;
  body: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

export interface GuideFaq {
  id: string;
  question: string;
  answer: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: GuideCategory[];
  thumbnail: string;
  estimatedTime: string;
  sections: GuideSection[];
  faq?: GuideFaq[];
}

export const GUIDES: Guide[] = [
  {
    slug: "instalacao-cobblemon",
    title: "Instalação do Cobblemon",
    description:
      "Guia completo para instalar o mod Cobblemon no Minecraft, cobrindo Fabric e todas as dependências necessárias para o Cobbleverse 1.7.3+1.21.1.",
    difficulty: "Easy",
    tags: ["Instalação"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/137.png",
    estimatedTime: "15 min",
    sections: [
      {
        heading: "Pré-requisitos",
        body: "O Cobbleverse roda em Minecraft Java Edition 1.21.1 com Fabric. Certifique-se de ter os seguintes itens antes de começar:",
        list: [
          "Minecraft Java Edition 1.21.1",
          "Fabric Loader 0.16.x (cobbleverse usa Fabric — não Forge)",
          "Pelo menos 4 GB de RAM alocados para o Minecraft",
          "Java 21 ou superior instalado",
        ],
      },
      {
        heading: "Instalando via Fabric",
        body: "O Cobbleverse usa exclusivamente Fabric. Baixe o Fabric Installer no site oficial (fabricmc.net), execute-o e instale para o Minecraft 1.21.1. Você também precisará do Fabric API como dependência adicional.",
        tip: "Use sempre a versão de Fabric Loader 0.16.x para garantir compatibilidade com os mods do Cobbleverse.",
      },
      {
        heading: "Colocando o Cobblemon",
        body: "Baixe o arquivo cobblemon-fabric-1.7.3+1.21.1.jar no site oficial ou no Modrinth. Coloque o arquivo na pasta 'mods' dentro do diretório do Minecraft (.minecraft/mods). Certifique-se que todas as dependências também estejam na pasta mods.",
      },
      {
        heading: "Dependências Obrigatórias",
        body: "Além do Fabric API, o Cobbleverse requer outros mods integrados para funcionar corretamente. Os principais são:",
        list: [
          "Fabric API — base para todos os mods Fabric",
          "Kotlin for Fabric — obrigatório para o Cobblemon",
          "BotanyPots — cultivo automatizado de Apricorns e Berries",
          "Adorn — móveis e decoração com madeira de Apricorn",
          "CarryOn — carregar blocos e entidades",
        ],
      },
      {
        heading: "Configurações Iniciais",
        body: "Na primeira execução, o Cobblemon criará arquivos de configuração na pasta config/cobblemon/. Você pode ajustar spawn rates, dificuldade de captura, e outras opções nestes arquivos.",
        warning:
          "Não edite os arquivos de configuração enquanto o servidor/jogo estiver rodando — as mudanças podem não ser salvas corretamente.",
      },
    ],
    faq: [
      {
        id: "fabric-deps",
        question: "Quais dependências preciso para o Fabric?",
        answer:
          "Para o Cobbleverse você precisará: Fabric Loader 0.16.x (o instalador em si), Fabric API para 1.21.1 (obrigatório para maioria dos mods), e Kotlin for Fabric (obrigatório para o Cobblemon). Todos estão disponíveis no Modrinth ou CurseForge.",
      },
      {
        id: "ram-config",
        question: "Como alocar mais RAM para o Minecraft?",
        answer:
          "No Launcher oficial, vá em Instalações → clique nos três pontos da sua instalação → Editar → Mais Opções. No campo de Argumentos JVM, altere o valor de '-Xmx2G' para '-Xmx4G' (ou mais). Para o ATLauncher/MultiMC, acesse as configurações da instância.",
      },
      {
        id: "configs",
        question: "Como personalizar as configurações do Cobblemon?",
        answer:
          "Os arquivos de configuração ficam em .minecraft/config/cobblemon/. O principal é main.json (configurações gerais, spawn rates globais, dificuldade de captura). Edite com qualquer editor de texto e reinicie o jogo para aplicar.",
      },
      {
        id: "server-install",
        question: "Como instalar em um servidor?",
        answer:
          "Para servidores, baixe o Fabric Server Installer e execute com 'java -jar fabric-installer.jar server -mcversion 1.21.1 -loader 0.16.x'. Coloque os mods na pasta mods/ do servidor. Recomendamos pelo menos 6 GB de RAM para servidores com múltiplos jogadores capturando Pokémon simultaneamente.",
      },
    ],
  },
  {
    slug: "guia-apricorns",
    title: "Onde Encontrar Apricorns",
    description:
      "Aprenda onde cada tipo de Apricorn nasce no mundo, como cultivá-los e quais Poké Balls eles criam.",
    difficulty: "Easy",
    tags: ["Apricorns"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/840.png",
    estimatedTime: "10 min",
    sections: [
      {
        heading: "O que são Apricorns?",
        body: "Apricorns são frutos especiais que crescem em árvores no mundo do Cobblemon. Eles são a matéria-prima para criar Poké Balls artesanais, cada cor produzindo um tipo diferente de ball com propriedades únicas.",
      },
      {
        heading: "Tipos e Biomas",
        body: "Cada cor de Apricorn tem preferências de bioma no mundo. As associações abaixo são baseadas no comportamento padrão do Cobblemon — verificação manual no servidor pode revelar variações: TODO: confirmar biomas exatos no servidor.",
        list: [
          "Red Apricorn → Savanna, Plains",
          "Yellow Apricorn → Desert, Badlands",
          "Blue Apricorn → Ocean, Beach",
          "Green Apricorn → Forest, Jungle",
          "Pink Apricorn → Meadow, Flower Forest",
          "Black Apricorn → Dark Forest, Taiga",
          "White Apricorn → Snowy Tundra, Frozen Peaks",
        ],
      },
      {
        heading: "Cultivando Apricorns",
        body: "As árvores de Apricorn podem ser cultivadas plantando sementes obtidas ao processar o fruto. Plante em Terra ou Terra com Grama e aguarde alguns dias de jogo para o crescimento. Com o mod BotanyPots (integrado ao Cobbleverse), você também pode cultivar Apricorns em vasos especializados para produção automatizada.",
        tip: "Crie uma fazenda com TODAS as 7 cores de Apricorn — cada tipo de ball requer combinações diferentes de cores.",
      },
      {
        heading: "Processando em Poké Balls",
        body: "No Cobbleverse 1.7.3, as Poké Balls são crafteadas diretamente na Workbench (bancada de trabalho) sem sistema de discos. A receita usa 4 Apricorns (posições top, left, right, bottom) + 1 Lingote de metal (posição central). Cada tipo de ball exige cores específicas de Apricorn combinadas:",
        list: [
          "Poke Ball: 4× Red Apricorn + Lingote de Cobre",
          "Great Ball: Blue+Red+Red+Blue + Lingote de Ferro",
          "Fast Ball: Red+Yellow+Yellow+White + Lingote de Ferro",
          "Level Ball: Black+Pink+Pink+Red + Lingote de Ferro",
          "Lure Ball: Red+Blue+Blue+Green + Lingote de Ferro",
          "Friend Ball: Yellow+Green+Green+Red + Lingote de Ferro",
          "Heavy Ball: Black+Blue+Blue+Black + Lingote de Ferro",
          "Moon Ball: Yellow+Blue+Black+Yellow + Lingote de Ferro",
          "Love Ball: White+Pink+Pink+Pink + Lingote de Ouro",
        ],
        tip: "Colete todas as 7 cores de Apricorn antes de começar a craftar — a maioria das balls melhores requer pelo menos 3 cores diferentes.",
      },
    ],
  },
  {
    slug: "guia-tumblestones",
    title: "Tumblestones: Tipos e Localização",
    description:
      "Descubra onde encontrar os diferentes tipos de Tumblestone e como usá-los na criação de Poké Balls.",
    difficulty: "Easy",
    tags: ["Tumblestones"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/524.png",
    estimatedTime: "8 min",
    sections: [
      {
        heading: "O que são Tumblestones?",
        body: "Tumblestones são minérios especiais do Cobblemon usados em conjunto com Apricorns para fabricar Poké Balls. Existem três tipos, cada um com localização e propriedades distintas.",
      },
      {
        heading: "Tipos de Tumblestone",
        body: "Cada tipo de Tumblestone tem um ambiente preferido de spawn e é usado na criação de Ancient Balls (versões ancestrais das Poké Balls):",
        list: [
          "Red Tumblestone (Tumblestone) — o mais comum, encontrado em qualquer caverna. Usado em Ancient Poke Ball, Ancient Great Ball, Ancient Azure Ball e outras.",
          "Sky Tumblestone — gerado em altitudes elevadas, Mountain biomes. Usado em Ancient Feather Ball, Ancient Wing Ball e Ancient Jet Ball.",
          "Black Tumblestone — encontrado em cavernas profundas e próximo a lava. Usado em Ancient Heavy Ball, Ancient Leaden Ball e Ancient Gigaton Ball.",
        ],
      },
      {
        heading: "Minerando Eficientemente",
        body: "Tumblestones têm aparência similar a minérios comuns mas com textura levemente translúcida. Use um Pickaxe de Ferro ou superior para minerá-los. Cada bloco dropa de 1 a 3 unidades.",
        tip: "Encante seu Pickaxe com Fortune III para aumentar o yield de Tumblestone por bloco.",
      },
      {
        heading: "Criando Ancient Balls",
        body: "Tumblestones são usados exclusivamente para criar Ancient Balls (não as balls padrão). A receita usa 2 Apricorns (top/bottom) + 2 Tumblestones do tipo correto (left/right) + 1 Lingote de metal (centro). Exemplos:",
        list: [
          "Ancient Poke Ball: Red Apricorn (×2) + Red Tumblestone (×2) + Cobre",
          "Ancient Heavy Ball: Black Apricorn (×2) + Black Tumblestone (×2) + Cobre",
          "Ancient Feather Ball: Blue+White Apricorn + Sky Tumblestone (×2) + Cobre",
          "Ancient Gigaton Ball: Black Apricorn (×2) + Black Tumblestone (×2) + Ouro",
        ],
        tip: "Para Poké Balls padrão (Fast, Lure, Friend etc.) NÃO use Tumblestones — use 4 Apricorns de cores específicas + Lingote de metal.",
      },
    ],
  },
  {
    slug: "fazenda-berries",
    title: "Fazenda de Berries para Competitivo",
    description:
      "Monte uma fazenda eficiente de Berries para treinar EVs, curar status e preparar seus Pokémon para batalhas.",
    difficulty: "Medium",
    tags: ["Berry Farming"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/420.png",
    estimatedTime: "20 min",
    sections: [
      {
        heading: "Por que farmar Berries?",
        body: "No Cobblemon, Berries têm múltiplos usos competitivos: reduzir EVs indesejados (Pomeg, Kelpsy, etc.), curar status durante batalha (Sitrus, Oran), e aumentar felicidade para evoluções. Ter um estoque constante é essencial para jogadores sérios.",
      },
      {
        heading: "Layout da Fazenda",
        body: "A configuração ideal usa Farmland (terra arada) hidratada por um bloco de água a cada 4 tiles. Uma fazenda 8×8 com 4 poços d'água suporta 48 plantas simultaneamente — suficiente para produção constante de 12+ tipos de Berry. O Cobbleverse também integra o mod BotanyPots: você pode cultivar Berries em vasos especializados sem precisar de Farmland ou irrigação.",
        tip: "BotanyPots (integrado ao Cobbleverse) permite crescimento automático de Berries e Apricorns em espaço compacto — ideal para bases pequenas.",
      },
      {
        heading: "Berries de Redução de EV",
        body: "Estas Berries são as mais valiosas para treinamento competitivo:",
        list: [
          "Pomeg Berry — reduz HP EVs em 10 por uso",
          "Kelpsy Berry — reduz Attack EVs em 10",
          "Qualot Berry — reduz Defense EVs em 10",
          "Hondew Berry — reduz Sp. Atk EVs em 10",
          "Grepa Berry — reduz Sp. Def EVs em 10",
          "Tamato Berry — reduz Speed EVs em 10",
        ],
      },
      {
        heading: "Ciclo de Crescimento",
        body: "A maioria das Berries leva de 2 a 4 dias de jogo para crescer. Plante em Farmland úmida e colha quando o ícone indicar maturidade. Cada colheita rende de 2 a 5 Berries dependendo da planta e condições.",
        warning:
          "Berries plantadas em Farmland seca crescem mais lento e podem morrer — mantenha sempre a terra hidratada.",
      },
    ],
  },
  {
    slug: "treino-ev",
    title: "Guia de EV Training no Cobblemon",
    description:
      "Onde e como treinar EVs de forma eficiente para cada stat, com os melhores locais de farming por bioma.",
    difficulty: "Medium",
    tags: ["EV Training Spots"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png",
    estimatedTime: "25 min",
    sections: [
      {
        heading: "O que são EVs?",
        body: "Effort Values (EVs) são pontos de esforço ganhos ao derrotar Pokémon. Cada Pokémon derrotado dá EVs específicos. Um Pokémon pode ter no máximo 510 EVs totais, com máximo de 252 por stat. 4 EVs = +1 point no stat ao nível 100.",
      },
      {
        heading: "Melhores Locais por Stat",
        body: "Cada stat tem Pokémon ideais para farming em biomas específicos:",
        list: [
          "HP: Chansey (+2 HP EV) em Plains e Meadows; Blissey (+3 HP EV) como evolução",
          "Attack: Machoke em Mountain biomes (+2 Atk EV)",
          "Defense: Onix (+1 Def EV) e Graveler (+2 Def EV) em Stone Shore e Caves",
          "Sp. Atk: Gastly (+1 SpA EV) e Haunter (+2 SpA EV) em Dark Forest e Caves",
          "Sp. Def: Tentacool em Ocean e Beach (+1 SpD EV)",
          "Speed: Zubat em qualquer Cave (+1 Spe EV), Jolteon na Savanna (+2 Spe EV)",
        ],
      },
      {
        heading: "Itens para Acelerar",
        body: "Certos Held Items multiplicam os EVs ganhos durante batalha:",
        list: [
          "Power Bracer (+8 Atk EV por batalha)",
          "Power Belt (+8 Def EV por batalha)",
          "Power Lens (+8 SpA EV por batalha)",
          "Power Band (+8 SpD EV por batalha)",
          "Power Anklet (+8 Spe EV por batalha)",
          "Power Weight (+8 HP EV por batalha)",
        ],
        tip: "TODO: Macho Brace não foi encontrado no datapack do Cobbleverse 1.7.3 — verificar se está disponível como drop ou recompensa customizada no servidor.",
      },
      {
        heading: "Calculando o Spread Ideal",
        body: "Antes de treinar, decida o spread de EVs ideal para o seu Pokémon e seu papel no time. Sweepers ofensivos geralmente usam 252 Atk (ou SpA) + 252 Spe + 4 HP. Tanques físicos preferem 252 HP + 252 Def + 4 SpD. Use o Team Builder desta plataforma para calcular os stats finais!",
        tip: "Treine os EVs ANTES de subir muito de nível — é mais fácil calcular e os ganhos são lineares independente do nível.",
      },
    ],
  },
  {
    slug: "caca-shinies",
    title: "Caçando Pokémon Shiny no Cobblemon",
    description:
      "Técnicas avançadas para aumentar suas chances de encontrar Pokémon Shiny, incluindo métodos de chaining e itens especiais.",
    difficulty: "Hard",
    tags: ["Shiny Hunting"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png",
    estimatedTime: "45 min",
    sections: [
      {
        heading: "Taxa Base de Shiny",
        body: "No Cobblemon, a taxa base de Shiny é 1/4096 (como nos jogos oficiais modernos). Com os métodos certos, é possível aumentar esta taxa significativamente, tornando a caça mais viável.",
      },
      {
        heading: "Shiny Charm",
        body: "TODO: O Shiny Charm como item equipável não foi confirmado no datapack do Cobbleverse 1.7.3+1.21.1. Nos jogos oficiais, ele triplica a taxa de Shiny após completar a Pokédex. Verifique com a administração do servidor se este mecanismo está implementado.",
        tip: "Mesmo sem Shiny Charm, as taxas de Shiny no Cobblemon podem ser ajustadas pelo servidor via config/cobblemon/main.json.",
      },
      {
        heading: "Método de Chaining",
        body: "O chaining consiste em derrotar ou capturar consecutivamente o mesmo Pokémon sem fugir ou capturar outro. Cada 50 batalhas consecutivas aumenta a chance de Shiny em +1/4096 (stackable até +5/4096 adicional).",
        list: [
          "Mantenha sempre pokéballs suficientes para não ser forçado a matar um shiny",
          "Use um Pokémon com False Swipe para facilitar capturas",
          "Evite mudar de bioma durante o chain — o contador pode resetar",
          "Use Arena Trap ou Mean Look para evitar que o Pokémon alvo fuja",
        ],
      },
      {
        heading: "Identificando um Shiny",
        body: "Shinies no Cobblemon aparecem com partículas douradas/brilhantes ao redor deles no mundo. A coloração alternativa é visível no modelo 3D. Um som especial também toca quando um Shiny aparece próximo ao jogador.",
        warning:
          "NUNCA use mods de speed ou fast travel durante um chain ativo — mover-se rapidamente entre chunks pode despawnar o shiny antes de você vê-lo.",
      },
      {
        heading: "Spots de Hunting por Espécie",
        body: "Alguns biomas oferecem melhor visibilidade e controle para hunting:",
        list: [
          "Plains largas e abertas: bom para Pokémon comuns (Eevee, Ralts, Dratini em Rivers)",
          "Savanna: excelente visibilidade para ground-level Pokémon",
          "Caves controladas: crie um spawn room para Pokémon de caverna",
          "Ocean: use Dive Balls e procure em aguas abertas sem obstáculos",
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export const ALL_CATEGORIES: GuideCategory[] = [
  "Apricorns",
  "Tumblestones",
  "Berry Farming",
  "EV Training Spots",
  "Shiny Hunting",
  "Instalação",
];
