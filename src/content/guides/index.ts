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
      "Guia completo para instalar o mod Cobblemon no Minecraft, cobrindo Forge, Fabric e todas as dependências necessárias.",
    difficulty: "Easy",
    tags: ["Instalação"],
    thumbnail: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/137.png",
    estimatedTime: "15 min",
    sections: [
      {
        heading: "Pré-requisitos",
        body: "Antes de instalar o Cobblemon, você precisa de uma versão compatível do Minecraft Java Edition e um mod loader (Forge ou Fabric).",
        list: [
          "Minecraft Java Edition 1.20.1 ou superior",
          "Forge 47.x ou Fabric 0.15.x",
          "Pelo menos 4 GB de RAM alocados para o Minecraft",
          "Java 17 ou superior instalado",
        ],
      },
      {
        heading: "Instalando via Forge",
        body: "O Forge é o loader mais tradicional e amplamente suportado. Acesse o site oficial do Forge e baixe a versão recomendada para o Minecraft 1.20.1. Execute o instalador e selecione 'Install Client'.",
        tip: "Use sempre a versão 'Recommended' do Forge para maior estabilidade.",
      },
      {
        heading: "Instalando via Fabric",
        body: "O Fabric é mais leve e moderno. Baixe o Fabric Installer no site oficial, execute-o e instale para a versão correta do Minecraft. Você também precisará do Fabric API como dependência adicional.",
        tip: "Fabric geralmente tem melhor performance que Forge para servidores com muitos jogadores.",
      },
      {
        heading: "Colocando o Cobblemon",
        body: "Baixe o arquivo .jar do Cobblemon no site oficial ou no Modrinth. Coloque o arquivo na pasta 'mods' dentro do diretório do Minecraft (.minecraft/mods). Certifique-se que todas as dependências também estejam na pasta mods.",
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
        id: "forge-version",
        question: "Qual versão do Forge devo usar?",
        answer:
          "Use sempre a versão 'Recommended' mais recente para o Minecraft 1.20.1. Você encontra esta informação no site oficial do Forge (files.minecraftforge.net). Evite versões 'Latest' em produção pois podem ter bugs.",
      },
      {
        id: "fabric-deps",
        question: "Quais dependências preciso para o Fabric?",
        answer:
          "Para o Fabric você precisará: Fabric Loader (o instalador em si), Fabric API (obrigatório para maioria dos mods), e Kotlin for Fabric (obrigatório para o Cobblemon). Todos estão disponíveis no Modrinth ou CurseForge.",
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
          "Os arquivos de configuração ficam em .minecraft/config/cobblemon/. Os principais são: main.json (configurações gerais, spawn rates globais), pokemon-spawn.json (chances de spawn por espécie), e starter-pokemon.json (Pokémon iniciais disponíveis). Edite com qualquer editor de texto e reinicie o jogo para aplicar.",
      },
      {
        id: "server-install",
        question: "Como instalar em um servidor?",
        answer:
          "Para servidores, baixe o Forge/Fabric Server Installer e execute com 'java -jar installer.jar --installServer'. Coloque os mods na pasta mods/ do servidor. Recomendamos pelo menos 6 GB de RAM para servidores com múltiplos jogadores capturando Pokémon simultaneamente.",
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
        body: "Cada cor de Apricorn aparece em biomas específicos, tornando a coleta uma aventura de exploração.",
        list: [
          "Red Apricorn → Savanna, Plains — faz Fast Ball",
          "Yellow Apricorn → Desert, Badlands — faz Level Ball",
          "Blue Apricorn → Ocean, Beach — faz Lure Ball",
          "Green Apricorn → Forest, Jungle — faz Friend Ball",
          "Pink Apricorn → Meadow, Flower Forest — faz Love Ball",
          "Black Apricorn → Dark Forest, Taiga — faz Heavy Ball",
          "White Apricorn → Snowy Tundra, Frozen Peaks — faz Moon Ball",
        ],
      },
      {
        heading: "Cultivando Apricorns",
        body: "As árvores de Apricorn podem ser cultivadas plantando sementes obtidas ao processar o fruto. Plante em Terra ou Terra com Grama, regue com água (não é obrigatório) e aguarde alguns dias de jogo para o crescimento.",
        tip: "Crie uma fazenda compacta de Apricorns para garantir produção constante de todas as cores. Um espaço 3×7 com um de cada cor é suficiente para a maioria dos jogadores.",
      },
      {
        heading: "Processando em Poké Balls",
        body: "Use uma Workbench (bancada de trabalho) para combinar Apricorns com outros materiais e criar discos. Depois, use o Tumblestone para finalizar as Poké Balls. O processo requer alguns passos intermediários mas é muito recompensador.",
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
        body: "Cada tipo de Tumblestone tem um ambiente preferido de spawn:",
        list: [
          "Black Tumblestone — encontrado em cavernas profundas, biomas de Nether próximos a lava. Componente para Heavy Ball e outras balls de captura forçada.",
          "Sky Tumblestone — gerado em altitudes elevadas, Mountain biomes, Flying Pokémon habitats. Usado em Fast Ball e Dive Ball.",
          "Red Tumblestone — o mais comum, encontrado em qualquer caverna abaixo de Y=32. Base para Poké Ball e Great Ball padrão.",
        ],
      },
      {
        heading: "Minerando Eficientemente",
        body: "Tumblestones têm aparência similar a minérios comuns mas com textura levemente translúcida. Use um Pickaxe de Ferro ou superior para minerá-los. Cada bloco dropa de 1 a 3 unidades.",
        tip: "Encante seu Pickaxe com Fortune III para triplicar o yield de Tumblestone por bloco.",
      },
      {
        heading: "Processamento na Workbench",
        body: "Combine Tumblestones com Apricorns na Workbench para criar Apricorn Discs. Um disco requer 4 Apricorns da mesma cor + 1 Tumblestone. Os discos são depois refinados com calor para criar as Poké Balls finais.",
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
        body: "A configuração ideal usa Farmland (terra arada) hidratada por um bloco de água a cada 4 tiles. Uma fazenda 8×8 com 4 poços d'água suporta 48 plantas simultaneamente — suficiente para produção constante de 12+ tipos de Berry.",
        tip: "Use um sistema de irrigação automática com dispensers e tripwire hooks para regar automaticamente ao plantar.",
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
          "HP: Chansey/Blissey em Plains e Meadows (+2 HP EV cada)",
          "Attack: Machoke em Mountain biomes (+2 Atk EV)",
          "Defense: Onix e Graveler em Stone Shore e Caves (+1/+2 Def EV)",
          "Sp. Atk: Gastly/Haunter em Dark Forest e Caves (+1/+2 SpA EV)",
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
          "Macho Brace (dobra todos os EVs, reduz Speed em batalha)",
        ],
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
        body: "O Shiny Charm é o item mais importante para caça de shinies. Você o obtém completando a Pokédex do Cobblemon (registrando todos os Pokémon disponíveis). Com o Shiny Charm equipado, a taxa triplica para 3/4096.",
        tip: "Foque em completar a dex de um bioma por vez — é mais eficiente do que tentar capturar aleatoriamente.",
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
