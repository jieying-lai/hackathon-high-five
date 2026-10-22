/**
 * CareerLens AI — Career Spirit Totem & Global Work-Life Engine
 * Gen-Z MBTI Style Discovery Experience
 */

(function () {
  'use strict';

  // 1. Question Bank: 10 casual, non-judgmental statements (5-point Likert)
  const QUESTIONS = [
    {
      id: 1,
      text: "Working from home gives you noticeably higher real productivity than sitting in an office surrounded by colleagues.",
      dimension: "solo_vs_social", // positive = solo, negative = social
      weight: 1.2
    },
    {
      id: 2,
      text: "You believe coworkers should strictly remain professional teammates, rather than personal best friends.",
      dimension: "boundary_vs_bonding", // positive = boundary, negative = bonding
      weight: 1.0
    },
    {
      id: 3,
      text: "You would rather spend 8 uninterrupted hours alone solving a deep logic puzzle than hosting a 20-person brainstorming session.",
      dimension: "deep_vs_interactive", // positive = deep logic, negative = interactive
      weight: 1.4
    },
    {
      id: 4,
      text: "When assigned an ambiguous project with zero manuals, you feel thrilled by the autonomy rather than anxious.",
      dimension: "autonomous_vs_structured", // positive = autonomous, negative = structured
      weight: 1.1
    },
    {
      id: 5,
      text: "You easily notice when a teammate feels overwhelmed or insecure, and you naturally step in to reassure them.",
      dimension: "empathy_vs_objective", // negative = empathy, positive = objective
      weight: 1.3
    },
    {
      id: 6,
      text: "You value shipping a bold, imperfect prototype today over spending two weeks polishing it behind closed doors.",
      dimension: "action_vs_perfection", // positive = action/agile, negative = perfection
      weight: 1.0
    },
    {
      id: 7,
      text: "Following repetitive, predictable operational manuals every day drains your soul faster than heavy workloads.",
      dimension: "novelty_vs_routine", // positive = novelty, negative = routine
      weight: 1.2
    },
    {
      id: 8,
      text: "In a heated debate, finding the objective, unfiltered truth matters far more to you than protecting fragile egos.",
      dimension: "truth_vs_harmony", // positive = cold truth, negative = harmony
      weight: 1.2
    },
    {
      id: 9,
      text: "You want your daily work to tangibly improve human lives or environmental sustainability, not just generate corporate profit.",
      dimension: "impact_vs_prestige", // positive = impact, negative = prestige
      weight: 1.4
    },
    {
      id: 10,
      text: "After a chaotic week, your favorite recharge is retreating into your private digital or creative sanctuary rather than partying.",
      dimension: "introvert_recharge", // positive = introvert, negative = extrovert
      weight: 1.3
    }
  ];

  // 2. Animal Totems & Psychological Archetypes
  const TOTEMS = {
    owl: {
      key: "owl",
      icon: "🦉",
      badge: "The Obsidian Night Owl",
      zhBadge: "深渊信标 · 夜行鸮",
      tagline: "The Deep-Focus Systems Architect",
      brief: "You operate with quiet laser focus—while the world is caught in surface noise, you effortlessly map out the hidden architecture behind complex problems.",
      composition: {
        logic: 46,
        autonomy: 26,
        aesthetics: 16,
        empathy: 12
      },
      allergies: ["Pointless 2-hour status meetings", "Emotional manipulation", "Micromanagement without clear metrics"],
      strengths: ["Infinite cognitive stamina in deep work", "Zero-bullshit logic clarity", "High-stress problem disentanglement"],
      roleModels: [
        {
          name: "Alan Turing",
          field: "Father of Modern Computing & AI",
          struggle: "Battled social ostracization and unconventional communication quirks in academia.",
          milestone: "Cracked the Enigma naval code and designed the Turing Machine, shaping modern humanity.",
          wisdom: "Sometimes it is the people no one imagines anything of who do the things no one can imagine."
        },
        {
          name: "Marie Curie",
          field: "Pioneering Physicist & Chemist",
          struggle: "Worked in a dilapidated shed without heating, refusing commercial patent exploitation.",
          milestone: "Only person in history to win two Nobel Prizes in two distinct scientific fields.",
          wisdom: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more."
        },
        {
          name: "Jensen Huang",
          field: "Founder & CEO, NVIDIA",
          struggle: "Started from a Denny’s diner booth, faced near-bankruptcy multiple times betting on parallel compute.",
          milestone: "Architected the computational silicon foundation fueling the global Generative AI era.",
          wisdom: "Run, don't walk. Either you are running for food, or you are running from being food."
        }
      ]
    },
    retriever: {
      key: "retriever",
      icon: "🦮",
      badge: "The Solar Golden Retriever",
      zhBadge: "破晓领航 · 太阳金毛",
      tagline: "The High-Empathy Culture Weaver",
      brief: "Your natural warmth dissolves workplace cynicism—you foster genuine psychological safety and bring infectious optimism wherever you land.",
      composition: {
        logic: 18,
        autonomy: 14,
        aesthetics: 24,
        empathy: 44
      },
      allergies: ["Toxic zero-sum political games", "Ice-cold transactional environments", "Working isolated without human contact"],
      strengths: ["Natural cross-discipline alignment", "Unlocking others' dormant potential", "Crisis de-escalation & emotional glue"],
      roleModels: [
        {
          name: "Jane Goodall",
          field: "Primatologist & UN Messenger of Peace",
          struggle: "Rejected formal academic dogmas that denied animals had feelings and unique personalities.",
          milestone: "Redefined primatology through patient empathy and founded the global Roots & Shoots movement.",
          wisdom: "What you do makes a difference, and you have to decide what kind of difference you want to make."
        },
        {
          name: "Satya Nadella",
          field: "Chairman & CEO, Microsoft",
          struggle: "Inherited a fractured, warring corporate empire known for vicious internal dog-eat-dog politics.",
          milestone: "Revitalized the company with 'Empathy & Growth Mindset', orchestrating a $3 Trillion transformation.",
          wisdom: "Empathy makes you a better innovator. You have to listen deeply to what is unsaid."
        },
        {
          name: "Fred Rogers (Mister Rogers)",
          field: "Iconic Public Broadcaster & Child Educator",
          struggle: "Fought commercially aggressive TV networks that exploited young people's attention spans.",
          milestone: "Pioneered transformative compassionate media, awarded the Presidential Medal of Freedom.",
          wisdom: "There are three ways to ultimate success: The first way is to be kind. The second is to be kind. The third is to be kind."
        }
      ]
    },
    leopard: {
      key: "leopard",
      icon: "🐆",
      badge: "The Cyber Snow Leopard",
      zhBadge: "绝顶巡狩 · 雪豹侠客",
      tagline: "The Autonomous Frontier Pioneer",
      brief: "You don't need roadmaps or supervision—drop you into untamed territory and you will single-handedly carve out an empire on your own terms.",
      composition: {
        logic: 34,
        autonomy: 42,
        aesthetics: 14,
        empathy: 10
      },
      allergies: ["Bureaucratic approval chains", "Rigid 9-to-5 desk punching", "People telling you 'that's how we've always done it'"],
      strengths: ["Uncompromising self-reliance", "Lightning-fast prototyping under pressure", "Intuitive technical fearlessness"],
      roleModels: [
        {
          name: "Linus Torvalds",
          field: "Creator of Linux & Git",
          struggle: "Refused corporate buyouts and stayed true to decentralized open-source autonomy.",
          milestone: "Built the operating system kernel that runs 96% of the world's top servers and all Android devices.",
          wisdom: "Talk is cheap. Show me the code."
        },
        {
          name: "Grace Hopper",
          field: "Computer Science Pioneer & Naval Rear Admiral",
          struggle: "Told repeatedly that computers could only do arithmetic, not understand written words.",
          milestone: "Invented the first computer compiler, paving the way for modern software programming.",
          wisdom: "A ship in port is safe, but that is not what ships are built for."
        },
        {
          name: "Steve Wozniak",
          field: "Co-Founder, Apple & Computing Visionary",
          struggle: "Avoided corporate politics and management titles, insisting on staying an individual builder.",
          milestone: "Single-handedly designed and hand-soldered the circuit boards of Apple I and Apple II.",
          wisdom: "Never trust a computer you can't throw out a window."
        }
      ]
    },
    whale: {
      key: "whale",
      icon: "🐋",
      badge: "The Deep-Sea Titan Whale",
      zhBadge: "沉潜巨擘 · 深海巨鲸",
      tagline: "The Purpose-Driven Societal Anchor",
      brief: "You play the infinite game—money is fine, but leaving an enduring, measurable positive legacy for humanity and our planet is what truly fuels your heart.",
      composition: {
        logic: 28,
        autonomy: 22,
        aesthetics: 18,
        empathy: 32
      },
      allergies: ["Greenwashing and performative PR", "Short-term quarterly obsession", "Exploitative business models"],
      strengths: ["Decade-horizon strategic patience", "Moral clarity in ambiguity", "Stewardship of high-stakes missions"],
      roleModels: [
        {
          name: "David Attenborough",
          field: "Naturalist & Global Environmental Advocate",
          struggle: "Spent 70 years documenting nature while witnessing rapid industrial biodiversity loss.",
          milestone: "Educated three generations across the globe on planetary harmony and climate stewardship.",
          wisdom: "Real success is not measured in financial gain, but in how much you helped heal what was broken."
        },
        {
          name: "Rachel Carson",
          field: "Marine Biologist & Author of 'Silent Spring'",
          struggle: "Faced massive smear campaigns from chemical conglomerate lobbies trying to silence her science.",
          milestone: "Sparked the modern global environmental movement and the founding of the EPA.",
          wisdom: "In nature, nothing exists alone. One who contemplates its beauty finds reserves of strength."
        },
        {
          name: "Jimmy Wales",
          field: "Founder of Wikipedia",
          struggle: "Resisted billions of dollars in commercial advertising pressure to keep information neutral and free.",
          milestone: "Created the largest collaborative repository of human knowledge in history, 100% ad-free.",
          wisdom: "Imagine a world in which every single person on the planet is given free access to the sum of all human knowledge."
        }
      ]
    },
    fox: {
      key: "fox",
      icon: "🦊",
      badge: "The Luminary Arctic Fox",
      zhBadge: "灵敏织境 · 极光白狐",
      tagline: "The Aesthetic & Narrative Alchemist",
      brief: "You transform raw ideas into magnetic masterpieces—your aesthetic instincts and storytelling flair breathe soul into numbers and machines.",
      composition: {
        logic: 20,
        autonomy: 26,
        aesthetics: 40,
        empathy: 14
      },
      allergies: ["Ugly, uninspired templates", "Formulaic corporate memos", "Emotional numbness"],
      strengths: ["Cross-sensory vision", "Turning abstract concepts into cult movements", "Spotting cultural shifts ahead of time"],
      roleModels: [
        {
          name: "Hayao Miyazaki",
          field: "Legendary Animator & Director, Studio Ghibli",
          struggle: "Constantly redrawing thousands of hand-drawn frames, refusing soulless automated shortcuts.",
          milestone: "Created cinematic worlds that earned global Academy Awards and generational emotional resonance.",
          wisdom: "Do everything by hand, even when using the computer. The soul lives in the details."
        },
        {
          name: "Steve Jobs",
          field: "Visionary Innovator & Co-Founder, Apple",
          struggle: "Ousted from his own company; criticized for obsessive perfectionism over invisible circuit boards.",
          milestone: "Fused liberal arts with technology, creating products that redefined personal communication.",
          wisdom: "Design is not just what it looks like and feels like. Design is how it works."
        },
        {
          name: "Frida Kahlo",
          field: "Surrealist Painter & Cultural Icon",
          struggle: "Survived lifelong physical trauma and chronic pain following a catastrophic bus accident.",
          milestone: "Turned acute suffering into vibrant, timeless visual art celebrating identity and authenticity.",
          wisdom: "I paint my own reality. The only thing I know is that I paint because I need to."
        }
      ]
    },
    hawk: {
      key: "hawk",
      icon: "🦅",
      badge: "The Stratosphere Hawk",
      zhBadge: "空天破晓 · 云端雄鹰",
      tagline: "The Strategic Decisive Commander",
      brief: "You cut through ambiguity with surgical speed—you see the finish line before others have even finished packing their bags.",
      composition: {
        logic: 38,
        autonomy: 32,
        aesthetics: 10,
        empathy: 20
      },
      allergies: ["Indecisiveness and chronic hesitance", "Endless planning without action", "Playing small"],
      strengths: ["High-agency decision making", "Resource optimization under constraints", "Commanding presence"],
      roleModels: [
        {
          name: "Katherine Johnson",
          field: "NASA Orbital Trajectory Mathematician",
          struggle: "Overcame racial and gender segregation in the 1960s space race to become NASA’s secret weapon.",
          milestone: "Calculated flight trajectories for Project Mercury and Apollo 11 moon landing with zero room for error.",
          wisdom: "Like what you do, and then you will do your best."
        },
        {
          name: "Winston Churchill",
          field: "Statesman & Wartime Strategist",
          struggle: "Suffered political isolation and military defeats early on, diagnosed with 'black dog' depressive bouts.",
          milestone: "Mobilized the free world against fascism with relentless determination and stirring rhetoric.",
          wisdom: "Success is not final, failure is not fatal: it is the courage to continue that counts."
        },
        {
          name: "Sheryl Sandberg",
          field: "Tech Executive & Author",
          struggle: "Navigated intense male-dominated tech boardrooms and tragic personal family bereavement.",
          milestone: "Scaled global monetization at Google and Facebook, championing women's executive agency.",
          wisdom: "Option A is not available. So let's just kick the shit out of Option B."
        }
      ]
    }
  };

  // 3. Elevated, Prestigious Job Recommendations mapped by Domain + Solo/Social orientation
  const ELEVATED_ROLES = {
    tech: {
      solo: [
        {
          title: "Autonomous Systems & Neural Architect",
          zh: "自主系统与神经架构大师",
          vibe: "Deep Code & Zero Meetings",
          demand: "🔥 Top 1% Growth (2026-2030)",
          why: "Your obsidian logic and solo focus let you master intricate model weights and decentralized infrastructure without distraction.",
          salary: "RM 9,000 - RM 16,000 / mo"
        },
        {
          title: "Algorithmic Integrity & Threat Synthesizer",
          zh: "算法完整性与零信任威胁解构官",
          vibe: "High Autonomy & Cyber Defense",
          demand: "🛡️ Critical National Priority",
          why: "You excel at anticipating systemic failure points before malicious actors even conceive them.",
          salary: "RM 8,500 - RM 15,000 / mo"
        }
      ],
      social: [
        {
          title: "AI Human-Agency & Ethics Strategist",
          zh: "人机共生伦理与技术普及战略官",
          vibe: "High Empathy & Product Vision",
          demand: "✨ Global Frontier Role",
          why: "You translate cold silicon algorithms into trustworthy, humane product experiences that teams and regulators embrace.",
          salary: "RM 8,000 - RM 14,500 / mo"
        },
        {
          title: "Generative Engineering Solutions Lead",
          zh: "生成式工程前沿方案交付指挥",
          vibe: "Team Synergy & Fast Impact",
          demand: "🚀 180% Surge in Malaysia",
          why: "You rally cross-functional designers and developers to deploy cutting-edge AI directly into enterprise production.",
          salary: "RM 8,500 - RM 15,500 / mo"
        }
      ]
    },
    health: {
      solo: [
        {
          title: "Bio-Molecular Intelligence & Genomic Explorer",
          zh: "生物分子智能与基因组学探索特使",
          vibe: "Lab Focus & Deep Science",
          demand: "🧬 High-Resilience Frontier",
          why: "You thrive deciphering intricate biological data matrices in quiet, dedicated research environments.",
          salary: "RM 6,500 - RM 12,000 / mo"
        },
        {
          title: "Precision Oncology Informatics Synthesizer",
          zh: "精准肿瘤学算法建模与临床智研员",
          vibe: "Data-Driven Life Saving",
          demand: "🩺 High Hospital Demand",
          why: "Zero bedside fatigue—you process vast patient health datasets into breakthrough predictive treatment pipelines.",
          salary: "RM 7,000 - RM 13,000 / mo"
        }
      ],
      social: [
        {
          title: "Holistic Patient Journey & Empathy Architect",
          zh: "全周期健康共情规划与关怀架构师",
          vibe: "Deep Human Touch & Advocacy",
          demand: "❤️ Irreplaceable by AI",
          why: "Far beyond clinical tasks, you design empathetic, reassuring care journeys that cure patient anxiety and build trust.",
          salary: "RM 5,500 - RM 9,500 / mo"
        },
        {
          title: "Digital Therapeutics & Community Health Navigator",
          zh: "数字疗法与社群身心领航专家",
          vibe: "Hybrid Care & Youth Wellness",
          demand: "📈 Booming ASEAN Market",
          why: "You connect vulnerable communities with modern wellness technologies through compassionate, relatable mentorship.",
          salary: "RM 6,000 - RM 10,500 / mo"
        }
      ]
    },
    creative: {
      solo: [
        {
          title: "Immersive Worldbuilding & Neural Scenographer",
          zh: "沉浸式世界观虚境构建与分镜宗师",
          vibe: "Unreal Engine & Pure Imagination",
          demand: "🎮 Gaming & Metaverse Boom",
          why: "You build breathtaking visual universes with mathematical precision and atmospheric storytelling.",
          salary: "RM 7,500 - RM 14,000 / mo"
        },
        {
          title: "Algorithmic Identity & Sensory Concept Artist",
          zh: "算力美学概念先锋与数字感官艺术家",
          vibe: "Solitary Craft & Cult Followings",
          demand: "🎨 Global Remote Freelance",
          why: "You refuse cookie-cutter graphics, creating iconic visual languages that define next-generation digital IPs.",
          salary: "RM 6,500 - RM 13,500 / mo"
        }
      ],
      social: [
        {
          title: "Cultural Zeitgeist & Transmedia Producer",
          zh: "跨媒介文化先锋与青年叙事制片人",
          vibe: "High Energy & Community Buzz",
          demand: "🔥 High Agency Production",
          why: "You spot emerging internet subcultures and mobilize creators to produce viral, meaningful storytelling.",
          salary: "RM 7,000 - RM 13,000 / mo"
        },
        {
          title: "Human Experience & Interactive Experience Director",
          zh: "全域数字交互与空间体验创意总监",
          vibe: "Exhibition, VR & Brand Soul",
          demand: "✨ High Corporate Prestige",
          why: "You curate experiential spaces that evoke profound emotion, making participants feel truly understood.",
          salary: "RM 8,000 - RM 15,000 / mo"
        }
      ]
    },
    green: {
      solo: [
        {
          title: "Carbon Offset Algorithmic Auditor",
          zh: "微气象与碳汇算法审计领航员",
          vibe: "Satellite Data & ESG Math",
          demand: "🌱 UN SDG Alignment",
          why: "You combine spatial satellite imagery and climate modeling to keep green financial claims rigorous and honest.",
          salary: "RM 7,000 - RM 12,500 / mo"
        },
        {
          title: "Circular Biomaterials Systems Engineer",
          zh: "循环生物基材料研发与生命周期建模师",
          vibe: "Lab Innovation & Green Future",
          demand: "♻️ Mandatory ASEAN 2030",
          why: "You obsess over sustainable supply chains, turning agricultural byproduct waste into commercial high-tech packaging.",
          salary: "RM 6,500 - RM 11,500 / mo"
        }
      ],
      social: [
        {
          title: "Just Transition & Community Climate Strategist",
          zh: "公正转型与社区气候韧性拓展官",
          vibe: "Grassroots & Policy Synergy",
          demand: "🌍 Global NGO & Govt Grants",
          why: "You bridge indigenous communities, clean energy startups, and policymakers to ensure no one is left behind.",
          salary: "RM 6,500 - RM 11,000 / mo"
        },
        {
          title: "Corporate ESG Transformation Storyteller",
          zh: "可持续发展战略传播与绿色叙事官",
          vibe: "C-Suite Influence & Authenticity",
          demand: "🏢 Bursa Malaysia Mandatory",
          why: "You turn complex environmental sustainability metrics into inspiring movements that energize entire workforces.",
          salary: "RM 7,500 - RM 13,500 / mo"
        }
      ]
    },
    finance: {
      solo: [
        {
          title: "Forensic Capital Flow & Quant Strategist",
          zh: "穿透式资本流向与量化套利策略官",
          vibe: "Terminal Focus & High Payout",
          demand: "📊 High Finance Standard",
          why: "You parse cross-border transaction matrices in silence, identifying alpha and hidden risk exposures.",
          salary: "RM 9,500 - RM 18,000 / mo"
        },
        {
          title: "Tokenomics & Decentralized Protocol Architect",
          zh: "通证经济学与去中心化协议构架师",
          vibe: "Web3 Math & Cryptography",
          demand: "⚡ Fintech Disruption",
          why: "You craft mathematically sound incentive mechanisms that govern global peer-to-peer liquidity safely.",
          salary: "RM 9,000 - RM 17,500 / mo"
        }
      ],
      social: [
        {
          title: "Impact Venture Capital & Founder Whisperer",
          zh: "影响力创投合伙与青年创业陪跑导师",
          vibe: "High Network & Vision Hunting",
          demand: "💎 Elite ASEAN VC",
          why: "You spot raw, unconventional talent early and provide emotional backing and capital when no one else believes.",
          salary: "RM 8,500 - RM 16,000 / mo"
        },
        {
          title: "Sustainable Wealth & Heritage Trust Strategist",
          zh: "跨世代可持续家族智库与财富治理顾问",
          vibe: "Deep Discretion & Long Term",
          demand: "🏛️ High Private Banking",
          why: "You guide multigenerational families into high-impact social investments, safeguarding both wealth and values.",
          salary: "RM 8,000 - RM 15,000 / mo"
        }
      ]
    }
  };

  // 4. Global 3D Cities & Day in the Life Profiles
  const GLOBAL_CITIES = {
    kl: {
      name: "Kuala Lumpur (TRX / Bangsar South)",
      country: "Malaysia",
      role: "Fintech & AI Cloud Solutions Engineer",
      salary: "RM 6,500 – RM 11,500 / mo",
      vibe: "Electric, Foodie Paradise, Hybrid 2-Day WFH",
      timeline: [
        { time: "09:00", text: "Walk from TRX MRT, grab Teh Tarik & toasted Kaya Butter bun at the food court." },
        { time: "11:00", text: "Fine-tune risk features for cross-border Islamic fintech payment models." },
        { time: "17:30", text: "Catch the rooftop sunset view over KLCC; join teammates for banana leaf rice in Bangsar." }
      ],
      tags: ["#NoWinterBlues", "#StreetFoodHeaven", "#RapidASEANGrowth"]
    },
    amsterdam: {
      name: "Amsterdam (Zuidas / Canal Ring)",
      country: "Netherlands",
      role: "Sustainable UX & Green Systems Designer",
      salary: "€4,200 – €5,800 / mo",
      vibe: "Chill, 36-hr Workweek, Cycling Paradise",
      timeline: [
        { time: "08:45", text: "Cycle alongside the leafy Prinsengracht canal, stopping for fresh stroopwafels." },
        { time: "10:30", text: "Team design sync in a timber-framed zero-emission studio overlooking houseboats." },
        { time: "16:45", text: "Laptops closed! Kayaking in the canals or reading on the grass at Vondelpark." }
      ],
      tags: ["#ZeroOvertime", "#BikeToWork", "#DesignFreedom"]
    },
    tokyo: {
      name: "Tokyo (Shibuya / Roppongi Hills)",
      country: "Japan",
      role: "Next-Gen Game & Neural Worldbuilder",
      salary: "¥480,000 – ¥750,000 / mo",
      vibe: "Cyberpunk Aesthetic, Craftsmanship, Late Izakaya Nights",
      timeline: [
        { time: "10:30", text: "Pick up seasonal matcha onigiri at 7-Eleven; enter motion capture VR lab." },
        { time: "14:00", text: "Render hyper-realistic lighting shaders for a neon-lit cyberpunk RPG." },
        { time: "20:00", text: "Team yakitori and iced highballs under the glowing lanterns of Omoide Yokocho." }
      ],
      tags: ["#AnimeCulture", "#InsanePublicSafety", "#ArtisanDetail"]
    },
    london: {
      name: "London (Shoreditch / Tech City)",
      country: "United Kingdom",
      role: "ESG Carbon Quant & Climate Strategist",
      salary: "£4,200 – £6,800 / mo",
      vibe: "Historic Meets Cutting Edge, Pub Fridays, Global Hub",
      timeline: [
        { time: "08:30", text: "Hop on the red double-decker bus, listening to a high-energy tech podcast." },
        { time: "12:30", text: "Grab artisan street food at Spitalfields Market; walk along brick warehouse lofts." },
        { time: "17:00", text: "Unwind at a 300-year-old pub near London Bridge with international colleagues." }
      ],
      tags: ["#MuseumPassports", "#GlobalCrossroads", "#FridayPubCulture"]
    }
  };

  // State
  let currentStep = 0; // 0 = welcome, 1-10 = questions, 11 = calculating, 12 = results
  let answers = {};
  let calculatedTotem = null;
  let selectedDomain = "tech";

  // Elements
  const section = document.getElementById("career-totem-experience");
  if (!section) return;

  const quizCard = document.getElementById("totemQuizCard");
  const resultCard = document.getElementById("totemResultCard");

  // Init Event Listeners
  window.startTotemQuiz = function () {
    currentStep = 1;
    answers = {};
    renderQuestion(1);
    const container = document.getElementById("career-totem-experience");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.skipTotemQuiz = function () {
    const portals = document.getElementById("home-portals");
    if (portals) {
      portals.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.retakeTotemQuiz = function () {
    currentStep = 1;
    answers = {};
    if (quizCard) quizCard.classList.remove("hidden");
    if (resultCard) resultCard.classList.add("hidden");
    renderQuestion(1);
    const container = document.getElementById("career-totem-experience");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  window.recordAnswer = function (questionId, value) {
    answers[questionId] = parseInt(value, 10);

    // Update active style on buttons
    const btns = document.querySelectorAll(".likert-btn");
    btns.forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-val") === String(value));
    });

    setTimeout(() => {
      if (questionId < QUESTIONS.length) {
        renderQuestion(questionId + 1);
      } else {
        finishQuiz();
      }
    }, 280);
  };

  window.prevQuestion = function () {
    if (currentStep > 1) {
      renderQuestion(currentStep - 1);
    }
  };

  function renderQuestion(qIndex) {
    currentStep = qIndex;
    const q = QUESTIONS[qIndex - 1];
    if (!q) return;

    const progressPct = Math.round((qIndex / QUESTIONS.length) * 100);
    const currentVal = answers[q.id] !== undefined ? answers[q.id] : null;

    quizCard.innerHTML = `
      <div class="space-y-6 fade-in">
        <!-- Top Progress -->
        <div class="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-white/10 pb-4">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>Question ${qIndex} of ${QUESTIONS.length}</span>
          </div>
          <div class="text-teal-300 font-mono">${progressPct}% Calculated</div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-teal-400 to-indigo-500 h-full rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
        </div>

        <!-- Question Prompt -->
        <div class="py-4 text-center max-w-xl mx-auto space-y-3">
          <span class="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-500/30">
            Workplace & Personality Vibe
          </span>
          <h3 class="text-xl sm:text-2xl font-extrabold text-white leading-snug">
            "${q.text}"
          </h3>
        </div>

        <!-- 5-Point Likert Scale -->
        <div class="space-y-3">
          <div class="likert-scale-container">
            <button type="button" class="likert-btn ${currentVal === -2 ? 'active' : ''}" data-val="-2" onclick="recordAnswer(${q.id}, -2)" title="Strongly Disagree">
              <span class="text-xs font-black">--</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === -1 ? 'active' : ''}" data-val="-1" onclick="recordAnswer(${q.id}, -1)" title="Disagree">
              <span class="text-xs font-bold">-</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === 0 ? 'active' : ''}" data-val="0" onclick="recordAnswer(${q.id}, 0)" title="Neutral">
              <span class="text-xs font-bold">0</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === 1 ? 'active' : ''}" data-val="1" onclick="recordAnswer(${q.id}, 1)" title="Agree">
              <span class="text-xs font-bold">+</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === 2 ? 'active' : ''}" data-val="2" onclick="recordAnswer(${q.id}, 2)" title="Strongly Agree">
              <span class="text-xs font-black">++</span>
            </button>
          </div>
          <div class="flex justify-between max-w-[520px] mx-auto text-[11px] font-bold text-slate-400 px-2">
            <span class="text-rose-400">Strongly Disagree</span>
            <span class="text-slate-400">Neutral</span>
            <span class="text-emerald-400">Strongly Agree</span>
          </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="flex items-center justify-between pt-6 border-t border-white/10 text-xs">
          ${qIndex > 1 ? `
            <button type="button" onclick="prevQuestion()" class="text-slate-400 hover:text-white flex items-center gap-1 font-bold transition">
              ← Previous Question
            </button>
          ` : `<div></div>`}
          
          <button type="button" onclick="skipTotemQuiz()" class="text-slate-400 hover:text-indigo-300 font-bold transition">
            Skip straight to Portals →
          </button>
        </div>
      </div>
    `;
  }

  function finishQuiz() {
    quizCard.innerHTML = `
      <div class="py-14 text-center space-y-6 fade-in">
        <div class="relative w-20 h-20 mx-auto">
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 animate-spin blur-md opacity-75"></div>
          <div class="relative w-20 h-20 rounded-full bg-slate-900 border border-white/20 grid place-items-center text-3xl">
            🔮
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-extrabold text-white">Synthesizing Your Authentic Totem DNA...</h3>
          <p class="text-xs text-slate-400">Calibrating 10 psychological vector coordinates across global workforce models</p>
        </div>
        <div class="w-48 mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div class="totem-shimmer h-full bg-teal-400 rounded-full w-full"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      calculateResult();
    }, 1400);
  }

  function calculateResult() {
    let soloScore = 0;
    let logicScore = 0;
    let empathyScore = 0;
    let autonomyScore = 0;
    let impactScore = 0;

    QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.dimension === "solo_vs_social") soloScore += val * q.weight;
      if (q.dimension === "boundary_vs_bonding") soloScore += val * q.weight;
      if (q.dimension === "deep_vs_interactive") { soloScore += val * q.weight; logicScore += val * q.weight; }
      if (q.dimension === "autonomous_vs_structured") autonomyScore += val * q.weight;
      if (q.dimension === "empathy_vs_objective") empathyScore -= val * q.weight; // negative = high empathy
      if (q.dimension === "truth_vs_harmony") logicScore += val * q.weight;
      if (q.dimension === "impact_vs_prestige") impactScore += val * q.weight;
      if (q.dimension === "introvert_recharge") soloScore += val * q.weight;
    });

    let chosenTotem = "owl";

    if (empathyScore > 2 && soloScore < 1) {
      chosenTotem = "retriever";
    } else if (autonomyScore > 2 && soloScore > 2) {
      chosenTotem = "leopard";
    } else if (impactScore > 2 && empathyScore > 0) {
      chosenTotem = "whale";
    } else if (logicScore > 2 && soloScore > 1) {
      chosenTotem = "owl";
    } else if (logicScore < 0 && autonomyScore > 0) {
      chosenTotem = "fox";
    } else {
      chosenTotem = "hawk";
    }

    calculatedTotem = TOTEMS[chosenTotem] || TOTEMS.owl;
    renderResult();
  }

  function renderResult() {
    quizCard.classList.add("hidden");
    resultCard.classList.remove("hidden");

    const t = calculatedTotem;
    const isSolo = (answers[1] || 0) + (answers[3] || 0) + (answers[10] || 0) >= 0;

    resultCard.innerHTML = `
      <div class="space-y-12 fade-in">
        <!-- 1. The Instant Identity Reveal -->
        <div class="totem-badge-card p-6 sm:p-10 relative overflow-hidden border border-white/20">
          <div class="grid md:grid-cols-12 gap-8 items-center">
            
            <div class="md:col-span-4 text-center space-y-4">
              <div class="relative w-36 h-36 mx-auto grid place-items-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-white/20 shadow-2xl backdrop-blur-md">
                <span class="text-6xl filter drop-shadow-lg">${t.icon}</span>
                <span class="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-900 text-[10px] font-black uppercase">
                  Verified Match
                </span>
              </div>
              <div>
                <span class="text-xs font-bold tracking-wider text-teal-400 uppercase">${t.zhBadge}</span>
                <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">${t.badge}</h2>
                <div class="text-xs text-indigo-300 font-bold mt-0.5">${t.tagline}</div>
              </div>
            </div>

            <div class="md:col-span-8 space-y-5 border-t md:border-t-0 md:border-l border-white/10 md:pl-8 pt-4 md:pt-0">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-300 text-xs font-bold">
                <span>✨</span><span>Psychological Trait Validation</span>
              </div>
              
              <p class="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                "${t.brief}"
              </p>

              <!-- Superpowers & Allergies -->
              <div class="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                <div class="p-3.5 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-1.5">
                  <div class="font-extrabold text-emerald-300 flex items-center gap-1.5">
                    <span>⚡</span> Authentic Superpowers
                  </div>
                  <ul class="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    ${t.strengths.map(s => `<li>${s}</li>`).join('')}
                  </ul>
                </div>

                <div class="p-3.5 rounded-2xl bg-white/5 border border-rose-500/30 space-y-1.5">
                  <div class="font-extrabold text-rose-300 flex items-center gap-1.5">
                    <span>🚫</span> Workplace Allergies
                  </div>
                  <ul class="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    ${t.allergies.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <!-- Action Bar -->
              <div class="flex flex-wrap items-center gap-3 pt-2">
                <button type="button" onclick="document.getElementById('deepDnaSection').scrollIntoView({behavior: 'smooth'})" class="btn btn-primary !py-2.5 !px-5 !text-xs font-black shadow-lg shadow-indigo-600/30">
                  🧬 Explore Deep DNA, Role Models & Careers ↓
                </button>
                <button type="button" onclick="retakeTotemQuiz()" class="btn btn-soft !py-2.5 !px-4 !text-xs font-bold border border-white/20 text-slate-300 hover:text-white">
                  🔄 Retake
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- 2. Deep DNA Breakdown & Role Models -->
        <div id="deepDnaSection" class="space-y-8 scroll-mt-20">
          
          <!-- Role Models Section -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <span>⭐</span> Who Walks Your Path? (Iconic Role Models)
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">Legends who carried your exact temperament, conquered self-doubt, and changed the world</p>
              </div>
            </div>

            <div class="grid md:grid-cols-3 gap-4">
              ${t.roleModels.map(rm => `
                <div class="role-model-card space-y-3 flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <h4 class="font-black text-sm text-white">${rm.name}</h4>
                      <span class="chip chip-indigo !text-[9px] font-bold">DNA Match</span>
                    </div>
                    <div class="text-[11px] text-teal-400 font-bold">${rm.field}</div>
                    
                    <div class="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
                      <span class="text-[10px] uppercase font-bold text-rose-300 block">The Early Grind & Struggle:</span>
                      ${rm.struggle}
                    </div>

                    <div class="text-[11px] text-slate-200">
                      <b class="text-indigo-300">Milestone:</b> ${rm.milestone}
                    </div>
                  </div>

                  <div class="pt-2 border-t border-white/10 text-[10px] italic text-slate-400">
                    "${rm.wisdom}"
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Composition Percentages -->
          <div class="totem-badge-card p-6 sm:p-8 space-y-5">
            <div>
              <h3 class="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🧪</span> Your "Career Ingredient" Composition
              </h3>
              <p class="text-xs text-slate-400">Quantitative psychological vector breakdown</p>
            </div>

            <div class="grid sm:grid-cols-2 gap-6 text-xs">
              <div class="space-y-2">
                <div class="flex justify-between font-bold">
                  <span class="text-slate-300">Cold Logic & Systems Thinking</span>
                  <span class="text-indigo-400 font-mono">${t.composition.logic}%</span>
                </div>
                <div class="composition-bar-track">
                  <div class="composition-bar-fill bg-indigo-500" style="width: ${t.composition.logic}%"></div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between font-bold">
                  <span class="text-slate-300">Autonomous Frontier Exploration</span>
                  <span class="text-teal-400 font-mono">${t.composition.autonomy}%</span>
                </div>
                <div class="composition-bar-track">
                  <div class="composition-bar-fill bg-teal-400" style="width: ${t.composition.autonomy}%"></div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between font-bold">
                  <span class="text-slate-300">Aesthetic Craftsmanship & Detail</span>
                  <span class="text-purple-400 font-mono">${t.composition.aesthetics}%</span>
                </div>
                <div class="composition-bar-track">
                  <div class="composition-bar-fill bg-purple-400" style="width: ${t.composition.aesthetics}%"></div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between font-bold">
                  <span class="text-slate-300">Human Empathy & Psychological Safety</span>
                  <span class="text-emerald-400 font-mono">${t.composition.empathy}%</span>
                </div>
                <div class="composition-bar-track">
                  <div class="composition-bar-fill bg-emerald-400" style="width: ${t.composition.empathy}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Domain Sector Picker & Elevated Job Recommendations -->
          <div class="space-y-5 pt-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <span>🎯</span> Elevated Careers Tailored to Your Totem
                </h3>
                <p class="text-xs text-slate-400">Choose your field of study or passion to generate future-proof career paths:</p>
              </div>

              <!-- Domain Pills -->
              <div class="flex flex-wrap items-center gap-2" id="domainPicker">
                <button type="button" class="domain-pill ${selectedDomain === 'tech' ? 'active' : ''}" onclick="selectDomain('tech')">💻 AI & Software</button>
                <button type="button" class="domain-pill ${selectedDomain === 'health' ? 'active' : ''}" onclick="selectDomain('health')">🏥 Healthcare & Bio</button>
                <button type="button" class="domain-pill ${selectedDomain === 'creative' ? 'active' : ''}" onclick="selectDomain('creative')">🎨 Creative & VR</button>
                <button type="button" class="domain-pill ${selectedDomain === 'green' ? 'active' : ''}" onclick="selectDomain('green')">🌿 ESG & Green</button>
                <button type="button" class="domain-pill ${selectedDomain === 'finance' ? 'active' : ''}" onclick="selectDomain('finance')">📈 Quant Finance</button>
              </div>
            </div>

            <!-- Elevated Job Container -->
            <div id="elevatedJobDisplay" class="grid sm:grid-cols-2 gap-4">
              <!-- Injected by renderElevatedJobs -->
            </div>
          </div>

          <!-- 4. "Already Have a Dream Job in Mind?" Freeform Box -->
          <div class="totem-badge-card p-6 sm:p-7 space-y-4 border border-teal-500/30">
            <div class="flex items-center gap-3">
              <span class="text-2xl">💡</span>
              <div>
                <h4 class="text-sm font-extrabold text-white">Have a specific dream job in mind?</h4>
                <p class="text-[11px] text-slate-400">Type any title to let CareerLens AI evaluate how your Totem DNA will perform:</p>
              </div>
            </div>

            <div class="flex flex-wrap sm:flex-nowrap gap-2.5">
              <input type="text" id="customJobInput" class="input !bg-slate-900/80 !border-white/20 !text-white !text-xs !py-3 flex-1" placeholder="e.g. Game Concept Artist, Renewable Energy Trader, Neuroscientist..." onkeydown="if(event.key==='Enter')analyzeCustomJob()" />
              <button type="button" onclick="analyzeCustomJob()" class="btn btn-primary !py-3 !px-6 !text-xs font-bold shrink-0">
                ⚡ Check Fit
              </button>
            </div>

            <div id="customJobFeedback" class="hidden p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
              <!-- Custom feedback injected here -->
            </div>
          </div>

          <!-- 5. 3D Global Work-Life Globe & City Routine -->
          <div class="totem-badge-card p-6 sm:p-8 space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="chip chip-indigo !text-[10px] font-bold mb-1">🌍 Global CareerLens Exploration</div>
                <h3 class="text-lg sm:text-xl font-extrabold text-white">How Do People in Your Field Live Around the World?</h3>
                <p class="text-xs text-slate-400">Click a city node on the globe to explore real work-life balance, salaries, and daily routines:</p>
              </div>

              <!-- City Buttons -->
              <div class="flex flex-wrap gap-2">
                <button type="button" onclick="showCityCard('kl')" class="btn btn-soft !py-1.5 !px-3 !text-xs font-bold border border-white/20 text-slate-200">🇲🇾 Kuala Lumpur</button>
                <button type="button" onclick="showCityCard('amsterdam')" class="btn btn-soft !py-1.5 !px-3 !text-xs font-bold border border-white/20 text-slate-200">🇳🇱 Amsterdam</button>
                <button type="button" onclick="showCityCard('tokyo')" class="btn btn-soft !py-1.5 !px-3 !text-xs font-bold border border-white/20 text-slate-200">🇯🇵 Tokyo</button>
                <button type="button" onclick="showCityCard('london')" class="btn btn-soft !py-1.5 !px-3 !text-xs font-bold border border-white/20 text-slate-200">🇬🇧 London</button>
              </div>
            </div>

            <!-- Globe Visualizer & City Display -->
            <div class="grid lg:grid-cols-12 gap-6 items-stretch">
              <div class="lg:col-span-7 relative">
                <div id="totemGlobeContainer" class="flex items-center justify-center">
                  <!-- Lightweight Canvas Globe -->
                  <canvas id="globeCanvas" class="w-full h-full cursor-grab"></canvas>
                  <div class="absolute bottom-3 left-4 text-[10px] text-slate-400 font-mono">
                    ✦ Interactive 3D Sphere · Drag to rotate
                  </div>
                </div>
              </div>

              <div class="lg:col-span-5" id="cityDetailsContainer">
                <!-- Injected city card -->
              </div>
            </div>
          </div>

          <!-- 6. Final Call to Action -->
          <div class="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900/80 border border-white/20 text-center space-y-4">
            <h3 class="text-xl sm:text-2xl font-extrabold text-white">Ready to Turn Your Totem DNA into Real Opportunities?</h3>
            <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Your profile traits are already pre-calibrated. Launch the Talent Portal to search nearby jobs, take mini-challenges, or screen with verified employers.
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button type="button" onclick="openAuth('register', 'job_seeker')" class="btn btn-primary !py-3.5 !px-8 !text-sm font-black shadow-xl shadow-indigo-600/30">
                Launch My Talent Portal →
              </button>
              <button type="button" onclick="openAuth('login')" class="btn btn-soft !py-3.5 !px-6 !text-sm font-bold border border-white/20 text-white">
                Sign In Directly
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    renderElevatedJobs(selectedDomain);
    showCityCard("kl");
    initGlobeVisual();
  }

  window.selectDomain = function (domain) {
    selectedDomain = domain;
    const pills = document.querySelectorAll(".domain-pill");
    pills.forEach(p => p.classList.remove("active"));
    const activePill = document.querySelector(`.domain-pill[onclick*="${domain}"]`);
    if (activePill) activePill.classList.add("active");

    const container = document.getElementById("elevatedJobDisplay");
    if (!container) return;

    // Loading shimmer
    container.innerHTML = `
      <div class="sm:col-span-2 py-8 text-center text-xs text-slate-400 space-y-2">
        <span class="inline-block animate-spin text-lg">🔮</span>
        <div>Synthesizing elevated roles for <b>${domain.toUpperCase()}</b>...</div>
      </div>
    `;

    setTimeout(() => {
      renderElevatedJobs(domain);
    }, 400);
  };

  function renderElevatedJobs(domain) {
    const container = document.getElementById("elevatedJobDisplay");
    if (!container) return;

    const isSolo = (answers[1] || 0) + (answers[3] || 0) + (answers[10] || 0) >= 0;
    const roleList = (ELEVATED_ROLES[domain] && ELEVATED_ROLES[domain][isSolo ? "solo" : "social"]) || ELEVATED_ROLES.tech.solo;

    container.innerHTML = roleList.map(r => `
      <div class="elevated-job-card space-y-3 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="chip chip-emerald !text-[9px] font-bold">${r.vibe}</span>
            <span class="text-[10px] text-teal-400 font-mono font-bold">${r.salary}</span>
          </div>
          <div>
            <h4 class="text-base font-black text-white leading-tight">${r.title}</h4>
            <div class="text-[11px] text-indigo-300 font-bold mt-0.5">${r.zh}</div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed pt-1">
            ${r.why}
          </p>
        </div>

        <div class="pt-3 border-t border-white/10 flex items-center justify-between">
          <span class="text-[10px] text-slate-400 font-bold">${r.demand}</span>
          <button type="button" onclick="openAuth('register', 'job_seeker')" class="text-xs font-bold text-teal-300 hover:text-teal-200 transition">
            Explore Openings →
          </button>
        </div>
      </div>
    `).join('');
  }

  window.analyzeCustomJob = function () {
    const input = document.getElementById("customJobInput");
    const feedback = document.getElementById("customJobFeedback");
    if (!input || !feedback) return;

    const val = input.value.trim();
    if (!val) {
      alert("Please enter a job title to analyze!");
      return;
    }

    feedback.classList.remove("hidden");
    feedback.innerHTML = `
      <div class="py-3 text-center text-xs text-slate-400 space-y-2">
        <span class="inline-block animate-spin text-base">⚙️</span>
        <div>Cross-referencing <b>"${val}"</b> with ${calculatedTotem.badge} competency radar...</div>
      </div>
    `;

    setTimeout(() => {
      feedback.innerHTML = `
        <div class="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h5 class="text-sm font-extrabold text-white">${val}</h5>
            <div class="text-[10px] text-slate-400">Evaluated against ${calculatedTotem.badge} DNA</div>
          </div>
          <span class="chip chip-emerald !text-xs font-black">94% Compatibility</span>
        </div>
        <div class="grid sm:grid-cols-2 gap-3 pt-1 text-[11px]">
          <div>
            <b class="text-emerald-300">Why You'll Excel:</b>
            <p class="text-slate-300 mt-0.5">Your high autonomous drive and zero-bullshit focus allow you to master the steep learning curve without needing hand-holding.</p>
          </div>
          <div>
            <b class="text-rose-300">Watch Out For:</b>
            <p class="text-slate-300 mt-0.5">Ensure you seek out employers that offer clear asynchronous communication rather than rigid calendar-cluttering meetings.</p>
          </div>
        </div>
      `;
    }, 700);
  };

  window.showCityCard = function (cityKey) {
    const c = GLOBAL_CITIES[cityKey] || GLOBAL_CITIES.kl;
    const container = document.getElementById("cityDetailsContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="city-day-card p-6 space-y-4 h-full flex flex-col justify-between fade-in">
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <div class="text-[11px] font-bold text-teal-400 uppercase tracking-wider">${c.country}</div>
              <h4 class="text-lg font-black text-white">${c.name}</h4>
            </div>
            <span class="chip chip-indigo !text-[10px] font-bold">${c.salary}</span>
          </div>

          <div class="text-xs text-indigo-300 font-bold">
            Target Role: <span class="text-white">${c.role}</span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
            <b class="text-slate-200">Work-Life Vibe:</b> ${c.vibe}
          </div>

          <!-- Schedule Timeline -->
          <div class="space-y-2 text-xs pt-1">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Day in the Life Routine:</div>
            ${c.timeline.map(item => `
              <div class="flex items-start gap-2.5">
                <span class="font-mono text-teal-400 font-bold text-[11px] shrink-0">${item.time}</span>
                <span class="text-slate-300 text-[11px]">${item.text}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div class="flex gap-1.5 text-[10px] text-slate-400">
            ${c.tags.map(t => `<span class="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">${t}</span>`).join('')}
          </div>
          <button type="button" onclick="openAuth('register', 'job_seeker')" class="btn btn-soft !py-1.5 !px-3 !text-[11px] font-bold border border-teal-500/30 text-teal-300 hover:text-white">
            Find Similar Roles →
          </button>
        </div>
      </div>
    `;
  };

  // Lightweight Interactive 3D Sphere on HTML5 Canvas
  function initGlobeVisual() {
    const canvas = document.getElementById("globeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.parentElement.clientWidth || 400;
    let height = canvas.parentElement.clientHeight || 380;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate wireframe latitude / longitude points
    const points = [];
    const numPoints = 280;
    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * Math.PI * 2;
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta)
      });
    }

    // Specific City Points
    const cities = [
      { name: "KL", key: "kl", lat: 3.139, lon: 101.686 },
      { name: "Tokyo", key: "tokyo", lat: 35.676, lon: 139.650 },
      { name: "Amsterdam", key: "amsterdam", lat: 52.367, lon: 4.904 },
      { name: "London", key: "london", lat: 51.507, lon: -0.127 }
    ];

    let rotY = 0;
    let rotX = 0.2;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    canvas.addEventListener("mousedown", e => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    window.addEventListener("mouseup", () => { isDragging = false; });
    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.005;
      rotX += dy * 0.005;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Auto slow rotation when idle
      if (!isDragging) {
        rotY += 0.004;
      }

      // Draw faint globe outline glow
      const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.05);
      grad.addColorStop(0, "rgba(99, 102, 241, 0.08)");
      grad.addColorStop(1, "rgba(20, 184, 166, 0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Project points
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      points.forEach(p => {
        // Rotate Y
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        if (z2 > 0) { // front hemisphere
          const alpha = Math.min(1, Math.max(0.1, z2 / radius));
          ctx.fillStyle = `rgba(167, 139, 250, ${alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(centerX + x1, centerY + y2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Project City Glowing Markers
      cities.forEach(city => {
        const phi = (city.lon * Math.PI) / 180;
        const theta = ((90 - city.lat) * Math.PI) / 180;
        const cx = radius * Math.sin(theta) * Math.cos(phi);
        const cy = -radius * Math.cos(theta);
        const cz = radius * Math.sin(theta) * Math.sin(phi);

        // Rotate
        let x1 = cx * cosY + cz * sinY;
        let z1 = -cx * sinY + cz * cosY;
        let y2 = cy * cosX - z1 * sinX;
        let z2 = cy * sinX + z1 * cosX;

        if (z2 > 0) {
          const px = centerX + x1;
          const py = centerY + y2;

          // Glowing pulse dot
          ctx.fillStyle = "#2dd4bf";
          ctx.shadowColor = "#2dd4bf";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px Plus Jakarta Sans, sans-serif";
          ctx.fillText(`📍 ${city.name}`, px + 8, py + 3);
        }
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

})();
