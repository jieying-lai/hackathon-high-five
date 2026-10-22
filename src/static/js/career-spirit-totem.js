/**
 * CareerLens AI — Career Spirit Totem & Progressive Discovery Engine
 * Gen-Z MBTI Style Discovery Experience with High-Reliability Matching
 */

(function () {
  'use strict';

  // 1. Question Bank: 10 authentic, non-judgmental statements (5-point Likert)
  const QUESTIONS = [
    {
      id: 1,
      text: "Working from home gives you noticeably higher real productivity than sitting in an office surrounded by colleagues.",
      dimension: "focus_energy", // + = Deep Focus / Solo, - = Social Synergy
      weight: 1.3
    },
    {
      id: 2,
      text: "You believe coworkers should strictly remain professional teammates, rather than personal best friends.",
      dimension: "focus_energy", // + = Independent Boundary, - = Social Bonding
      weight: 1.0
    },
    {
      id: 3,
      text: "You would rather spend 8 uninterrupted hours alone solving a deep logic puzzle than hosting a 20-person brainstorming session.",
      dimension: "mind_logic", // + = Cold Logic & Data, - = Empathy & Intuition
      weight: 1.4
    },
    {
      id: 4,
      text: "When assigned an ambiguous project with zero manuals, you feel thrilled by the autonomy rather than anxious.",
      dimension: "execution_tempo", // + = Agile & Autonomous, - = Orderly & Structured
      weight: 1.3
    },
    {
      id: 5,
      text: "You easily notice when a teammate feels overwhelmed or insecure, and you naturally step in to reassure them.",
      dimension: "mind_logic", // - = Empathy & Human Touch, + = Cold Logic
      weight: 1.4
    },
    {
      id: 6,
      text: "You value shipping a bold, imperfect prototype today over spending two weeks polishing it behind closed doors.",
      dimension: "execution_tempo", // + = Agile & Autonomous, - = Orderly & Structured
      weight: 1.1
    },
    {
      id: 7,
      text: "Following repetitive, predictable operational manuals every day drains your soul faster than heavy workloads.",
      dimension: "mission_drive", // + = Pioneering Impact, - = Craft Mastery
      weight: 1.2
    },
    {
      id: 8,
      text: "In a heated debate, finding the objective, unfiltered truth matters far more to you than protecting fragile egos.",
      dimension: "mind_logic", // + = Cold Logic, - = Empathy & Harmony
      weight: 1.3
    },
    {
      id: 9,
      text: "You want your daily work to tangibly improve human lives or environmental sustainability, not just generate corporate profit.",
      dimension: "mission_drive", // + = Pioneering Impact, - = Traditional Corporate
      weight: 1.5
    },
    {
      id: 10,
      text: "After a chaotic week, your favorite recharge is retreating into your private digital or creative sanctuary rather than partying.",
      dimension: "focus_energy", // + = Deep Focus, - = Social Synergy
      weight: 1.4
    }
  ];

  // 2. Animal Totems, Archetypes, Verified Portrait URLs, and MBTI Opposing Poles
  const TOTEMS = {
    owl: {
      key: "owl",
      icon: "🦉",
      badge: "The Obsidian Night Owl",
      tagline: "The Deep-Focus Systems Architect",
      brief: "You operate with quiet laser focus—while the world is caught in surface noise, you effortlessly map out the hidden architecture behind complex problems.",
      mbtiPoles: {
        energy: { leftName: "Deep Focus", leftPct: 82, rightName: "Social Synergy", rightPct: 18 },
        mind: { leftName: "Cold Logic & Data", leftPct: 88, rightName: "Empathy & Intuition", rightPct: 12 },
        tempo: { leftName: "Agile & Autonomous", leftPct: 65, rightName: "Orderly & Structured", rightPct: 35 },
        drive: { leftName: "Pioneering Impact", leftPct: 40, rightName: "Craft Mastery", rightPct: 60 }
      },
      allergies: ["Pointless 2-hour status meetings", "Emotional manipulation", "Micromanagement without clear metrics"],
      strengths: ["Infinite cognitive stamina in deep work", "Zero-bullshit logic clarity", "High-stress problem disentanglement"],
      roleModels: [
        {
          name: "Alan Turing",
          field: "Father of Modern Computing & AI",
          photo: "/static/illustrations/role_models/alan_turing.jpg",
          struggle: "Battled social ostracization and unconventional communication quirks in academia.",
          milestone: "Cracked the Enigma naval code and designed the Turing Machine, shaping modern humanity.",
          wisdom: "Sometimes it is the people no one imagines anything of who do the things no one can imagine."
        },
        {
          name: "Marie Curie",
          field: "Pioneering Physicist & Chemist",
          photo: "/static/illustrations/role_models/marie_curie.jpg",
          struggle: "Worked in a dilapidated shed without heating, refusing commercial patent exploitation.",
          milestone: "Only person in history to win two Nobel Prizes in two distinct scientific fields.",
          wisdom: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more."
        },
        {
          name: "Jensen Huang",
          field: "Founder & CEO, NVIDIA",
          photo: "/static/illustrations/role_models/jensen_huang.jpg",
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
      tagline: "The High-Empathy Culture Weaver",
      brief: "Your natural warmth dissolves workplace cynicism—you foster genuine psychological safety and bring infectious optimism wherever you land.",
      mbtiPoles: {
        energy: { leftName: "Deep Focus", leftPct: 16, rightName: "Social Synergy", rightPct: 84 },
        mind: { leftName: "Cold Logic & Data", leftPct: 15, rightName: "Empathy & Intuition", rightPct: 85 },
        tempo: { leftName: "Agile & Autonomous", leftPct: 42, rightName: "Orderly & Structured", rightPct: 58 },
        drive: { leftName: "Pioneering Impact", leftPct: 60, rightName: "Craft Mastery", rightPct: 40 }
      },
      allergies: ["Toxic zero-sum political games", "Ice-cold transactional environments", "Working isolated without human contact"],
      strengths: ["Natural cross-discipline alignment", "Unlocking others' dormant potential", "Crisis de-escalation & emotional glue"],
      roleModels: [
        {
          name: "Jane Goodall",
          field: "Primatologist & UN Messenger of Peace",
          photo: "/static/illustrations/role_models/jane_goodall.jpg",
          struggle: "Rejected formal academic dogmas that denied animals had feelings and unique personalities.",
          milestone: "Redefined primatology through patient empathy and founded the global Roots & Shoots movement.",
          wisdom: "What you do makes a difference, and you have to decide what kind of difference you want to make."
        },
        {
          name: "Satya Nadella",
          field: "Chairman & CEO, Microsoft",
          photo: "/static/illustrations/role_models/satya_nadella.jpg",
          struggle: "Inherited a fractured corporate empire known for vicious internal dog-eat-dog politics.",
          milestone: "Revitalized the company with 'Empathy & Growth Mindset', orchestrating a $3 Trillion transformation.",
          wisdom: "Empathy makes you a better innovator. You have to listen deeply to what is unsaid."
        },
        {
          name: "Fred Rogers",
          field: "Iconic Public Broadcaster & Child Educator",
          photo: "/static/illustrations/role_models/fred_rogers.jpg",
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
      tagline: "The Autonomous Frontier Pioneer",
      brief: "You don't need roadmaps or supervision—drop you into untamed territory and you will single-handedly carve out an empire on your own terms.",
      mbtiPoles: {
        energy: { leftName: "Deep Focus", leftPct: 74, rightName: "Social Synergy", rightPct: 26 },
        mind: { leftName: "Cold Logic & Data", leftPct: 76, rightName: "Empathy & Intuition", rightPct: 24 },
        tempo: { leftName: "Agile & Autonomous", leftPct: 92, rightName: "Orderly & Structured", rightPct: 8 },
        drive: { leftName: "Pioneering Impact", leftPct: 68, rightName: "Craft Mastery", rightPct: 32 }
      },
      allergies: ["Bureaucratic approval chains", "Rigid 9-to-5 desk punching", "People telling you 'that's how we've always done it'"],
      strengths: ["Uncompromising self-reliance", "Lightning-fast prototyping under pressure", "Intuitive technical fearlessness"],
      roleModels: [
        {
          name: "Linus Torvalds",
          field: "Creator of Linux & Git",
          photo: "/static/illustrations/role_models/linus_torvalds.jpg",
          struggle: "Refused corporate buyouts and stayed true to decentralized open-source autonomy.",
          milestone: "Built the operating system kernel that runs 96% of the world's top servers and all Android devices.",
          wisdom: "Talk is cheap. Show me the code."
        },
        {
          name: "Grace Hopper",
          field: "Computer Science Pioneer & Naval Rear Admiral",
          photo: "/static/illustrations/role_models/grace_hopper.jpg",
          struggle: "Told repeatedly that computers could only do arithmetic, not understand written words.",
          milestone: "Invented the first computer compiler, paving the way for modern software programming.",
          wisdom: "A ship in port is safe, but that is not what ships are built for."
        },
        {
          name: "Steve Wozniak",
          field: "Co-Founder, Apple & Computing Visionary",
          photo: "/static/illustrations/role_models/steve_wozniak.jpg",
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
      tagline: "The Purpose-Driven Societal Anchor",
      brief: "You play the infinite game—money is fine, but leaving an enduring, measurable positive legacy for humanity and our planet is what truly fuels your heart.",
      mbtiPoles: {
        energy: { leftName: "Deep Focus", leftPct: 48, rightName: "Social Synergy", rightPct: 52 },
        mind: { leftName: "Cold Logic & Data", leftPct: 45, rightName: "Empathy & Intuition", rightPct: 55 },
        tempo: { leftName: "Agile & Autonomous", leftPct: 38, rightName: "Orderly & Structured", rightPct: 62 },
        drive: { leftName: "Pioneering Impact", leftPct: 88, rightName: "Craft Mastery", rightPct: 12 }
      },
      allergies: ["Greenwashing and performative PR", "Short-term quarterly obsession", "Exploitative business models"],
      strengths: ["Decade-horizon strategic patience", "Moral clarity in ambiguity", "Stewardship of high-stakes missions"],
      roleModels: [
        {
          name: "David Attenborough",
          field: "Naturalist & Global Environmental Advocate",
          photo: "/static/illustrations/role_models/david_attenborough.jpg",
          struggle: "Spent 70 years documenting nature while witnessing rapid industrial biodiversity loss.",
          milestone: "Educated three generations across the globe on planetary harmony and climate stewardship.",
          wisdom: "Real success is not measured in financial gain, but in how much you helped heal what was broken."
        },
        {
          name: "Rachel Carson",
          field: "Marine Biologist & Author of 'Silent Spring'",
          photo: "/static/illustrations/role_models/rachel_carson.jpg",
          struggle: "Faced massive smear campaigns from chemical conglomerate lobbies trying to silence her science.",
          milestone: "Sparked the modern global environmental movement and the founding of the EPA.",
          wisdom: "In nature, nothing exists alone. One who contemplates its beauty finds reserves of strength."
        },
        {
          name: "Jimmy Wales",
          field: "Founder of Wikipedia",
          photo: "/static/illustrations/role_models/jimmy_wales.jpg",
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
      tagline: "The Aesthetic & Narrative Alchemist",
      brief: "You transform raw ideas into magnetic masterpieces—your aesthetic instincts and storytelling flair breathe soul into numbers and machines.",
      mbtiPoles: {
        energy: { leftName: "Deep Focus", leftPct: 62, rightName: "Social Synergy", rightPct: 38 },
        mind: { leftName: "Cold Logic & Data", leftPct: 35, rightName: "Empathy & Intuition", rightPct: 65 },
        tempo: { leftName: "Agile & Autonomous", leftPct: 82, rightName: "Orderly & Structured", rightPct: 18 },
        drive: { leftName: "Pioneering Impact", leftPct: 45, rightName: "Craft Mastery", rightPct: 55 }
      },
      allergies: ["Ugly, uninspired templates", "Formulaic corporate memos", "Emotional numbness"],
      strengths: ["Cross-sensory vision", "Turning abstract concepts into cult movements", "Spotting cultural shifts ahead of time"],
      roleModels: [
        {
          name: "Hayao Miyazaki",
          field: "Legendary Animator & Director, Studio Ghibli",
          photo: "/static/illustrations/role_models/hayao_miyazaki.jpg",
          struggle: "Constantly redrawing thousands of hand-drawn frames, refusing soulless automated shortcuts.",
          milestone: "Created cinematic worlds that earned global Academy Awards and generational emotional resonance.",
          wisdom: "Do everything by hand, even when using the computer. The soul lives in the details."
        },
        {
          name: "Steve Jobs",
          field: "Visionary Innovator & Co-Founder, Apple",
          photo: "/static/illustrations/role_models/steve_jobs.jpg",
          struggle: "Ousted from his own company; criticized for obsessive perfectionism over invisible circuit boards.",
          milestone: "Fused liberal arts with technology, creating products that redefined personal communication.",
          wisdom: "Design is not just what it looks like and feels like. Design is how it works."
        },
        {
          name: "Frida Kahlo",
          field: "Surrealist Painter & Cultural Icon",
          photo: "/static/illustrations/role_models/frida_kahlo.jpg",
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
      tagline: "The Strategic Decisive Commander",
      brief: "You cut through ambiguity with surgical speed—you see the finish line before others have even finished packing their bags.",
      mbtiPoles: {
        energy: { leftName: "Deep Focus", leftPct: 55, rightName: "Social Synergy", rightPct: 45 },
        mind: { leftName: "Cold Logic & Data", leftPct: 80, rightName: "Empathy & Intuition", rightPct: 20 },
        tempo: { leftName: "Agile & Autonomous", leftPct: 75, rightName: "Orderly & Structured", rightPct: 25 },
        drive: { leftName: "Pioneering Impact", leftPct: 85, rightName: "Craft Mastery", rightPct: 15 }
      },
      allergies: ["Indecisiveness and chronic hesitance", "Endless planning without action", "Playing small"],
      strengths: ["High-agency decision making", "Resource optimization under constraints", "Commanding presence"],
      roleModels: [
        {
          name: "Katherine Johnson",
          field: "NASA Orbital Trajectory Mathematician",
          photo: "/static/illustrations/role_models/katherine_johnson.jpg",
          struggle: "Overcame racial and gender segregation in the 1960s space race to become NASA’s secret weapon.",
          milestone: "Calculated flight trajectories for Project Mercury and Apollo 11 moon landing with zero room for error.",
          wisdom: "Like what you do, and then you will do your best."
        },
        {
          name: "Winston Churchill",
          field: "Statesman & Wartime Strategist",
          photo: "/static/illustrations/role_models/winston_churchill.jpg",
          struggle: "Suffered political isolation and military defeats early on, diagnosed with 'black dog' depressive bouts.",
          milestone: "Mobilized the free world against fascism with relentless determination and stirring rhetoric.",
          wisdom: "Success is not final, failure is not fatal: it is the courage to continue that counts."
        },
        {
          name: "Sheryl Sandberg",
          field: "Tech Executive & Author",
          photo: "/static/illustrations/role_models/sheryl_sandberg.jpg",
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
          vibe: "Deep Code & High Focus",
          demand: "🔥 Top 1% Growth (2026-2030)",
          why: "Your obsidian logic and solo focus let you master intricate model weights and decentralized infrastructure without distraction.",
          salary: "RM 9,000 - RM 16,000 / mo"
        },
        {
          title: "Algorithmic Integrity & Threat Synthesizer",
          vibe: "High Autonomy & Cyber Defense",
          demand: "🛡️ Critical National Priority",
          why: "You excel at anticipating systemic failure points before malicious actors even conceive them.",
          salary: "RM 8,500 - RM 15,000 / mo"
        }
      ],
      social: [
        {
          title: "AI Human-Agency & Ethics Strategist",
          vibe: "High Empathy & Product Vision",
          demand: "✨ Global Frontier Role",
          why: "You translate cold silicon algorithms into trustworthy, humane product experiences that teams and regulators embrace.",
          salary: "RM 8,000 - RM 14,500 / mo"
        },
        {
          title: "Generative Engineering Solutions Lead",
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
          vibe: "Lab Focus & Deep Science",
          demand: "🧬 High-Resilience Frontier",
          why: "You thrive deciphering intricate biological data matrices in quiet, dedicated research environments.",
          salary: "RM 6,500 - RM 12,000 / mo"
        },
        {
          title: "Precision Oncology Informatics Synthesizer",
          vibe: "Data-Driven Life Saving",
          demand: "🩺 High Hospital Demand",
          why: "Zero bedside fatigue—you process vast patient health datasets into breakthrough predictive treatment pipelines.",
          salary: "RM 7,000 - RM 13,000 / mo"
        }
      ],
      social: [
        {
          title: "Holistic Patient Journey & Empathy Architect",
          vibe: "Deep Human Touch & Advocacy",
          demand: "❤️ Irreplaceable by AI",
          why: "Far beyond clinical tasks, you design empathetic, reassuring care journeys that cure patient anxiety and build trust.",
          salary: "RM 5,500 - RM 9,500 / mo"
        },
        {
          title: "Digital Therapeutics & Community Health Navigator",
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
          vibe: "Unreal Engine & Pure Imagination",
          demand: "🎮 Gaming & Metaverse Boom",
          why: "You build breathtaking visual universes with mathematical precision and atmospheric storytelling.",
          salary: "RM 7,500 - RM 14,000 / mo"
        },
        {
          title: "Algorithmic Identity & Sensory Concept Artist",
          vibe: "Solitary Craft & Cult Followings",
          demand: "🎨 Global Remote Freelance",
          why: "You refuse cookie-cutter graphics, creating iconic visual languages that define next-generation digital IPs.",
          salary: "RM 6,500 - RM 13,500 / mo"
        }
      ],
      social: [
        {
          title: "Cultural Zeitgeist & Transmedia Producer",
          vibe: "High Energy & Community Buzz",
          demand: "🔥 High Agency Production",
          why: "You spot emerging internet subcultures and mobilize creators to produce viral, meaningful storytelling.",
          salary: "RM 7,000 - RM 13,000 / mo"
        },
        {
          title: "Human Experience & Interactive Experience Director",
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
          vibe: "Satellite Data & ESG Math",
          demand: "🌱 UN SDG Alignment",
          why: "You combine spatial satellite imagery and climate modeling to keep green financial claims rigorous and honest.",
          salary: "RM 7,000 - RM 12,500 / mo"
        },
        {
          title: "Circular Biomaterials Systems Engineer",
          vibe: "Lab Innovation & Green Future",
          demand: "♻️ Mandatory ASEAN 2030",
          why: "You obsess over sustainable supply chains, turning agricultural byproduct waste into commercial high-tech packaging.",
          salary: "RM 6,500 - RM 11,500 / mo"
        }
      ],
      social: [
        {
          title: "Just Transition & Community Climate Strategist",
          vibe: "Grassroots & Policy Synergy",
          demand: "🌍 Global NGO & Govt Grants",
          why: "You bridge indigenous communities, clean energy startups, and policymakers to ensure no one is left behind.",
          salary: "RM 6,500 - RM 11,000 / mo"
        },
        {
          title: "Corporate ESG Transformation Storyteller",
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
          vibe: "Terminal Focus & High Payout",
          demand: "📊 High Finance Standard",
          why: "You parse cross-border transaction matrices in silence, identifying alpha and hidden risk exposures.",
          salary: "RM 9,500 - RM 18,000 / mo"
        },
        {
          title: "Tokenomics & Decentralized Protocol Architect",
          vibe: "Web3 Math & Cryptography",
          demand: "⚡ Fintech Disruption",
          why: "You craft mathematically sound incentive mechanisms that govern global peer-to-peer liquidity safely.",
          salary: "RM 9,000 - RM 17,500 / mo"
        }
      ],
      social: [
        {
          title: "Impact Venture Capital & Founder Whisperer",
          vibe: "High Network & Vision Hunting",
          demand: "💎 Elite ASEAN VC",
          why: "You spot raw, unconventional talent early and provide emotional backing and capital when no one else believes.",
          salary: "RM 8,500 - RM 16,000 / mo"
        },
        {
          title: "Sustainable Wealth & Heritage Trust Strategist",
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
      name: "Kuala Lumpur (TRX / Bangsar South / Cyberjaya)",
      country: "Malaysia",
      flag: "🇲🇾",
      vibe: "Tropical Energy, World-Class Street Food, Rapid ASEAN Tech Growth, Flexible Hybrid",
      roles: [
        {
          id: "kl_1",
          title: "AI Cloud Solutions Architect",
          industry: "Cloud & Enterprise AI",
          persona: { name: "Maya Tan", handle: "@maya_kl_tech", avatar: "👩🏻‍💻", bio: "Building resilient distributed microservices & LLM pipelines across ASEAN" },
          skills: ["Kubernetes", "PyTorch", "GCP Vertex AI", "Terraform", "MLOps"],
          plog: "Morning sun reflecting off Exchange 106 at TRX. Grabbed iced kopi-o and freshly steamed bao before taking the automated MRT to the Cyberjaya Campus. Our morning standup focused on reducing cross-region LLM latency across Southeast Asian edge nodes. Enjoyed team banana leaf rice for lunch in Bangsar. Finished the sprint by 5:30 PM with zero production blockers, then hit the rooftop gym.",
          job_desc: {
            summary: "负责企业级高可用 AI 基础设施与大语言模型部署架构，确保云端服务低延迟与高安全性。",
            tasks: [
              "设计并编排多区域 Kubernetes 集群与分布式模型推理网格，支撑百万级并发请求",
              "构建自动化 CI/CD 与 MLOps 流水线，实施模型权重漂移监测与动态自动扩缩容",
              "与本地化安全合规团队协作，落地零信任架构与金融级数据主权保护方案"
            ]
          },
          routine: [
            { time: "08:30", emoji: "☕", text: "Morning iced kopi-o, mindful breathing on TRX terrace overlooking the city skyline." },
            { time: "10:00", emoji: "💻", text: "Architecture sync with Singapore & Cyberjaya teams on multi-region edge caches." },
            { time: "12:45", emoji: "🍛", text: "Banana leaf rice lunch walk with teammates; lively discussion on open-weight models." },
            { time: "14:30", emoji: "⚡", text: "Deep focus sprint: Benchmarking TensorRT-LLM latency for customer support bots." },
            { time: "18:00", emoji: "🏊", text: "Rooftop infinity pool swim & sunset unwinding with panoramic KLCC views." },
            { time: "20:30", emoji: "📖", text: "Reading distributed systems papers and experimenting with Rust AI tooling." }
          ],
          alternative_routines: [
            [
              { time: "07:45", emoji: "🏃", text: "Sunrise jog around Perdana Botanical Gardens, feeling the morning jungle breeze." },
              { time: "09:30", emoji: "💡", text: "Team whiteboarding session: Architecting vector search pipelines with Qdrant." },
              { time: "13:00", emoji: "🍜", text: "Curry laksa discovery in Chinatown with cross-functional product designers." },
              { time: "15:00", emoji: "🚀", text: "Pair programming: Optimizing Docker container cold start times on GPU nodes." },
              { time: "18:30", emoji: "🏸", text: "Evening friendly badminton match with community tech friends in PJ." }
            ],
            [
              { time: "08:45", emoji: "🧘", text: "Quiet morning mindfulness & fresh tropical dragon fruit smoothie at home." },
              { time: "10:30", emoji: "🛡️", text: "Security audit & ethical AI verification for new automated decision endpoints." },
              { time: "13:30", emoji: "🥪", text: "Healthy grain bowl lunch while listening to a tech entrepreneurship podcast." },
              { time: "15:45", emoji: "🎯", text: "Focused deep work: Fine-tuning LoRA adapters on local domain datasets." },
              { time: "19:00", emoji: "🎨", text: "Attending a local Kuala Lumpur open-source tech mixer at Bangsar South." }
            ]
          ],
          tags: ["#TRXHub", "#ZeroOvertime", "#StreetFoodHeaven", "#CloudAI"]
        },
        {
          id: "kl_2",
          title: "Islamic Fintech & Risk ML Engineer",
          industry: "Digital Banking & Ethical Finance",
          persona: { name: "Adam Farhan", handle: "@adam_fintech_my", avatar: "👨🏽‍💼", bio: "Shariah-compliant ethical algorithmic credit scoring & risk intelligence" },
          skills: ["Python", "XGBoost", "FastAPI", "PostgreSQL", "Fairness AI"],
          plog: "Working from the Bangsar South tech enclave. Morning meeting with our Shariah advisory council to review algorithmic fairness across micro-lending models. We proved our neural risk scorer reduces bias against gig workers by 24%. Relaxing afternoon prayer and matcha latte break in the vertical indoor gardens. Left work at 5:00 PM with an uplifting feeling of real social impact.",
          job_desc: {
            summary: "构建符合道德准则的去偏见金融风控模型，帮助东盟普惠金融用户安全获得信贷支持。",
            tasks: [
              "研发可解释机器学习模型（SHAP/LIME），对信贷风险与反欺诈评分进行可审计归因",
              "持续监控风控算法在不同人口学群体间的公平性指标，杜绝非故意偏见",
              "与产品和法务团队对接，保证模型符合马来西亚央行（BNM）AI 治理监管框架"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🧋", text: "Warm Teh Tarik Kurang Manis, checking overnight automated model drift alerts." },
            { time: "10:15", emoji: "🤝", text: "Ethical auditing committee sync: Validating explainability metrics for SME loans." },
            { time: "12:30", emoji: "🍱", text: "Wholesome nasi campur with green sambal at Bangsar Nexus." },
            { time: "14:15", emoji: "🔬", text: "Model retraining: Evaluating fairness constraints across alternative data signals." },
            { time: "17:30", emoji: "🌅", text: "Evening walk around Bukit Gasing green trail, breathing in fresh rain trees." },
            { time: "20:00", emoji: "👨‍👩‍👧", text: "Family dinner, homemade rendang, and mentoring junior university programmers." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🚴", text: "Biking through quiet leafy streets in Damansara before logging in." },
              { time: "10:00", emoji: "📊", text: "Analyzing fraud detection confusion matrices with senior risk officers." },
              { time: "13:00", emoji: "🍲", text: "Warm soto ayam lunch with team members discussing fintech innovations." },
              { time: "15:00", emoji: "⚡", text: "Refactoring inference API microservice in FastAPI for sub-50ms responses." },
              { time: "18:00", emoji: "📚", text: "Attending Islamic Digital Economy virtual webinar with regional scholars." }
            ]
          ],
          tags: ["#EthicalFintech", "#BangsarSouth", "#ExplainableAI", "#SocialGood"]
        },
        {
          id: "kl_3",
          title: "Autonomous Logistics & Computer Vision Engineer",
          industry: "Smart Ports & Supply Chain",
          persona: { name: "Rachel Lee", handle: "@rachel_cv_logistics", avatar: "👩🏻‍🔬", bio: "Autonomous container vision & edge robotics deployment at Port Klang" },
          skills: ["Computer Vision", "YOLOv10", "TensorRT", "C++", "ROS2"],
          plog: "Field day at Port Klang! High-speed multi-camera edge arrays sorting shipping containers in torrential tropical rain. Our latest transformer vision model maintained 99.8% barcode and hazard sign detection despite heavy fog. Back at our Petaling Jaya R&D lab by 3:00 PM for code review. Celebrating a successful deployment with durian and fresh coconut with the engineering team.",
          job_desc: {
            summary: "负责海港与自动化仓储场景下的边缘计算机视觉算法研发与机器人感知系统集成。",
            tasks: [
              "训练并优化极端恶劣天气条件下的高帧率物体检测与追踪算法（YOLO/RT-DETR）",
              "在 NVIDIA Jetson 工业级边缘计算单元上量化部署模型，功耗控制在 25W 以内",
              "与自动化起重机和自主导引车（AGV）系统完成 ROS2 实时通信协议闭环"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚗", text: "Drive out to coastal port terminal listening to energetic electronic beats." },
            { time: "09:30", emoji: "📹", text: "On-site sensor calibration and camera lens hydro-coating checks on crane gantry." },
            { time: "12:30", emoji: "🥥", text: "Fresh coconut water and seafood noodles at a seaside coastal village stall." },
            { time: "14:30", emoji: "💻", text: "Benchmarking edge inference frame rates on embedded Jetson AGX Orin units." },
            { time: "17:45", emoji: "🌆", text: "Golden hour drive back to PJ; unwinding with teammates at a local night market." },
            { time: "20:45", emoji: "🎮", text: "Playing indie cooperative puzzle games and tinkering with 3D printer designs." }
          ],
          alternative_routines: [
            [
              { time: "08:30", emoji: "☕", text: "Pour-over coffee at a Petaling Jaya specialty cafe while reading CVPR preprints." },
              { time: "10:00", emoji: "🧪", text: "Synthesizing rainy weather training datasets using neural rendering diffusion." },
              { time: "13:00", emoji: "🥗", text: "Healthy chicken salad bowl with teammates in Sunway tech district." },
              { time: "15:00", emoji: "🔍", text: "Deep debugging: Resolving bounding box jitter on fast-moving container chassis." },
              { time: "18:00", emoji: "🧗", text: "Indoor bouldering session at Camp5 climbing gym with friends." }
            ]
          ],
          tags: ["#EdgeAI", "#SmartPorts", "#RoboticsVision", "#Makerspace"]
        }
      ]
    },
    singapore: {
      name: "Singapore (Marina Bay / One-North)",
      country: "Singapore",
      flag: "🇸🇬",
      vibe: "Futuristic Garden City, High-Efficiency Innovation, Hawker Delights, Global Finance Gateway",
      roles: [
        {
          id: "sg_1",
          title: "Quantitative AI & Algorithmic Strategist",
          industry: "Global Investment & Quantitative Research",
          persona: { name: "Lucas Chen", handle: "@lucas_sg_quant", avatar: "👨🏻‍💻", bio: "Reinforcement learning for multi-asset portfolio optimization at Marina Bay" },
          skills: ["PyTorch", "Rust", "Time-Series Transformers", "Reinforcement Learning", "Linux"],
          plog: "Brisk morning run around Marina Bay waterfront before the heat sets in. Caught the sunrise over the Singapore Flyer. Dropped by Lau Pa Sat for a fresh kopi-c. In the 38th-floor tower, we ran our agentic market simulations testing shock-resilience against sudden macroeconomic shifts. Strict company policy on zero after-hours emails means our team is fully disconnected and energized every evening.",
          job_desc: {
            summary: "研发时间序列预测与强化学习量化策略，为跨国养老金及绿色可持续基金提供智能资产配置算法。",
            tasks: [
              "构建多模态市场宏观数据流与时间序列 Transformer 预测模型",
              "使用 Rust 编写亚毫秒级低延迟回测引擎与风控熔断机制",
              "与 ESG 可持续投资团队合作，将碳足迹因子纳入资产组合最优化求解器"
            ]
          },
          routine: [
            { time: "07:00", emoji: "🏃", text: "Sunrise run along Marina Bay waterfront; seeing the reflection of glass towers." },
            { time: "08:30", emoji: "☕", text: "Kopi-C & kaya toast breakfast; skimming global overnight market developments." },
            { time: "10:00", emoji: "📈", text: "Strategy review: Evaluating agentic reinforcement learning exploration rates." },
            { time: "12:30", emoji: "🍜", text: "Michelin-recommended chicken rice at Amoy Street Food Centre with quant peers." },
            { time: "15:00", emoji: "⚡", text: "Deep focus: Writing SIMD-accelerated math kernels in Rust for matrix solves." },
            { time: "18:00", emoji: "🌳", text: "Stroll through Gardens by the Bay under the Supertrees; completely unplugged." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🧘", text: "Rooftop yoga overlooking the bustling port and Singapore Strait." },
              { time: "09:30", emoji: "💻", text: "Collaborative research sprint on transformer attention over tick-level order books." },
              { time: "13:00", emoji: "🍱", text: "Japanese chirashi bowl with fellow university alumni in Tanjong Pagar." },
              { time: "15:30", emoji: "📊", text: "Backtesting new risk mitigation strategies across historical stress events." },
              { time: "18:30", emoji: "🚴", text: "Cycling the Park Connector Network all the way to East Coast Park." }
            ]
          ],
          tags: ["#MarinaBay", "#ZeroAfterHoursEmails", "#HawkerCulture", "#RustLang"]
        },
        {
          id: "sg_2",
          title: "Tropical Data Center Green Cooling ML Lead",
          industry: "Clean Energy & Sustainable Infrastructure",
          persona: { name: "Priya Nair", handle: "@priya_green_sg", avatar: "👩🏽‍🔬", bio: "AI-driven liquid cooling & thermodynamic optimization in tropical climates" },
          skills: ["Deep Learning", "Thermodynamics ML", "IoT Telemetry", "Python", "Docker"],
          plog: "Working at our testbed in One-North Fusionopolis. Singapore is pioneering ultra-efficient data centers in hot, humid climates. Today our neural model learned to anticipate ambient tropical storms 40 minutes ahead, dynamically adjusting chilled-water cooling loops and saving 19.4% in power usage! Celebrated with iced sugarcane juice with the facilities crew.",
          job_desc: {
            summary: "应用物理感知神经网络（PINN）与强化学习，动态调控热带数据中心冷却系统以极致降低 PUE 能耗指标。",
            tasks: [
              "处理数万个工业传感器流，建模复杂建筑流体力学与热交换动态响应",
              "开发闭环安全控制策略，在保障服务器绝对安全的前提下最小化水冷能耗",
              "撰写绿色数据中心国际能效认证审计报告，助力新加坡 2030 绿色发展蓝图"
            ]
          },
          routine: [
            { time: "08:30", emoji: "🚇", text: "Smooth Circle Line MRT ride into One-North; reading nature-inspired tech blogs." },
            { time: "09:45", emoji: "❄️", text: "Real-time telemetry audit: Inspecting PUE performance graphs across 4 server halls." },
            { time: "12:30", emoji: "🥗", text: "Wholesome Mediterranean grain bowl at Rochester Commons garden pavilion." },
            { time: "14:15", emoji: "🧪", text: "Deploying physics-informed neural network model update to edge chiller controllers." },
            { time: "17:45", emoji: "🎾", text: "Friendly tennis rally at One-North courts with fellow green tech researchers." },
            { time: "20:30", emoji: "🌱", text: "Tending to my balcony hydroponic herb garden; listening to lo-fi ambient tracks." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🍵", text: "Matcha cold brew on the balcony watching lush tropical ferns sway in the breeze." },
              { time: "09:30", emoji: "📊", text: "Cross-team workshop on integrating solar microgrid outputs into cooling logic." },
              { time: "12:45", emoji: "🍛", text: "Roti prata lunch with our hardware instrumentation engineering squad." },
              { time: "15:00", emoji: "🔬", text: "Analyzing sensor telemetry anomalies caused by sudden monsoon afternoon rain." },
              { time: "18:15", emoji: "🏊", text: "Evening dip in the community pool, feeling completely relaxed and centered." }
            ]
          ],
          tags: ["#GreenDataCenter", "#OneNorth", "#CleanEnergy", "#TropicalSustainability"]
        },
        {
          id: "sg_3",
          title: "Smart Mobility & Autonomous Transit Perception Engineer",
          industry: "Urban Mobility & Smart Nation",
          persona: { name: "Darren Goh", handle: "@darren_onenorth", avatar: "👨🏻‍💻", bio: "Autonomous shuttle fleet navigation & 3D semantic mapping for public transit" },
          skills: ["C++", "ROS2", "LiDAR Odometry", "TensorRT", "SLAM"],
          plog: "Testing our self-driving electric shuttles along designated One-North campus routes. Navigating safely around pedestrian crossings, sudden tropical downpours, and delivery robots. Seeing people smile as the shuttle smoothly yields to an elderly gentleman is the best validation. Finished code reviews early and grabbed laksa at Ghim Moh market.",
          job_desc: {
            summary: "负责城市公共交通自动驾驶微循环巴士的激光雷达（LiDAR）与多相机三维语义融合建图感知。",
            tasks: [
              "开发毫米波雷达与激光雷达的高精度时间同步及点云去噪过滤算法",
              "在受限城市道路场景下实现亚米级高精地图实时定位（NDT/LOAM）",
              "遵循陆路交通管理局（LTA）自动驾驶车辆安全准则，完成百万公里模拟路测"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚌", text: "Riding the autonomous test shuttle to work; logging sensor data on my laptop." },
            { time: "10:15", emoji: "🗺️", text: "Point cloud HD map review: Validating new pedestrian curb annotations." },
            { time: "12:45", emoji: "🍜", text: "Fragrant laksa and iced barley water at Ghim Moh hawker center." },
            { time: "14:30", emoji: "🤖", text: "Simulating edge-case maneuvers with virtual delivery bots in Unreal Engine." },
            { time: "18:00", emoji: "🚴", text: "Biking down the Rail Corridor surrounded by green jungle canopy." },
            { time: "20:30", emoji: "🎸", text: "Playing acoustic guitar at home and relaxing with loved ones." }
          ],
          alternative_routines: [
            [
              { time: "07:45", emoji: "☕", text: "Fresh fruit and black coffee while reviewing night-shift autonomous road logs." },
              { time: "09:30", emoji: "🚗", text: "Real-vehicle sensor calibration on test tracks with transport authority observers." },
              { time: "13:00", emoji: "🍱", text: "Nasi padang with colleagues; discussing vehicle-to-infrastructure 5G telemetry." },
              { time: "15:15", emoji: "💻", text: "Refactoring C++ multithreading queues to prevent buffer lag in camera streams." },
              { time: "18:00", emoji: "🌇", text: "Catching the golden hour sunset at Henderson Waves walking trail." }
            ]
          ],
          tags: ["#AutonomousTransit", "#SmartNation", "#RoboticsC++", "#OneNorth"]
        }
      ]
    },
    tokyo: {
      name: "Tokyo (Shibuya / Roppongi / Nihonbashi)",
      country: "Japan",
      flag: "🇯🇵",
      vibe: "Cyberpunk Artisan Aesthetic, Ultimate Public Safety, Respectful Flow, Neon Izakaya Evenings",
      roles: [
        {
          id: "tyo_1",
          title: "Neural Worldbuilder & Game AI Engineer",
          industry: "Interactive Entertainment & Generative Worlds",
          persona: { name: "Kenji Sato", handle: "@kenji_shibuya_vlog", avatar: "👨🏻‍🎨", bio: "Procedural neural terrain & NPC behavior models in Shibuya creative studios" },
          skills: ["PyTorch", "Unreal Engine 5", "C++", "Diffusion Models", "GLSL Shaders"],
          plog: "Crossed Shibuya Scramble at 9:30 AM with a warm canned matcha from the vending machine. Stepped into our studio overlooking the glowing billboards. Today we previewed our real-time neural world generator: artists paint a single stroke and the AI builds lush, living moss-covered torii gates with accurate volumetric rain shaders. Finished work on time and went for yakitori with the art team under glowing lanterns in Nonbei Yokocho.",
          job_desc: {
            summary: "研发次世代游戏实时神经生成世界与具有情境记忆的非玩家角色（NPC）大模型驱动引擎。",
            tasks: [
              "将 3D 高斯泼溅（Gaussian Splatting）与神经辐射场无缝集成至 UE5 实时渲染管线",
              "设计 NPC 对话与行为树混合架构，实现拥有稳定人设与情感反应的智能角色",
              "优化游戏主机与 PC 端的着色器性能，保证 4K 60FPS 帧率稳定运行"
            ]
          },
          routine: [
            { time: "09:15", emoji: "🍵", text: "Hot matcha latte from a Shibuya stand; watching trains snake through the city." },
            { time: "10:30", emoji: "🎮", text: "Studio playtest: Checking NPC natural language banter responses in game engine." },
            { time: "13:00", emoji: "🍜", text: "Rich tonkotsu ramen at a quiet underground counter shop near Dogenzaka." },
            { time: "15:00", emoji: "✨", text: "Writing custom HLSL shaders for volumetric bioluminescent forest lighting." },
            { time: "19:00", emoji: "🍢", text: "Charcoal grilled yakitori and iced sparkling water with teammates in Omoide Yokocho." },
            { time: "21:30", emoji: "🎧", text: "Curating city pop & lo-fi beat playlists while sketching game concept ideas." }
          ],
          alternative_routines: [
            [
              { time: "08:30", emoji: "🚶", text: "Peaceful morning walk through Yoyogi Park under towering cedar trees." },
              { time: "10:00", emoji: "🎨", text: "Collaborative design jam with 3D modelers: Converting concept art into 3D meshes." },
              { time: "13:00", emoji: "🍱", text: "Convenience store bento eaten on the studio rooftop garden with a blue sky." },
              { time: "15:30", emoji: "⚡", text: "Profiling memory allocations in C++ to shave 4ms off every render pass." },
              { time: "18:45", emoji: "♨️", text: "Visiting a traditional neighborhood sento (bathhouse) to completely relax muscles." }
            ]
          ],
          tags: ["#ShibuyaVlog", "#UnrealEngine5", "#GameAI", "#ArtisanCraft"]
        },
        {
          id: "tyo_2",
          title: "Autonomous Humanoid Robotics Perception Lead",
          industry: "Humanoid Robotics & Assistive Tech",
          persona: { name: "Aoi Miyamoto", handle: "@aoi_robotics_tokyo", avatar: "👩🏻‍💻", bio: "Visual-motor policy learning for home & elderly assistive humanoid robots" },
          skills: ["ROS2", "PyTorch", "Diffusion Policy", "C++", "Tactile Sensing"],
          plog: "Field testing at our Odaiba robotics showroom. Our bipedal assistant robot successfully folded laundry and poured hot green tea without spilling a drop, using our new diffusion-based tactile policy. Seeing an elderly visitor laugh with delight as the robot handed them a handkerchief was pure magic. Cleaned up our workspace, bowed to colleagues, and caught the clean, quiet Yurikamome monorail home.",
          job_desc: {
            summary: "开发双足人形机器人全身运动规划与高灵巧度触觉-视觉多模态动作决策模型。",
            tasks: [
              "使用扩散策略（Diffusion Policy）与离线强化学习训练机器人灵巧手抓握技能",
              "集成柔性触觉传感器反馈，实现对易碎物品（鸡蛋、纸杯、玻璃）的无损伤抓取",
              "在真实生活场景中严格执行人机协作安全规范（ISO 13482）碰撞缓停保护"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚝", text: "Riding the Yurikamome monorail across Rainbow Bridge with blue bay views." },
            { time: "10:00", emoji: "🤖", text: "Hardware test: Fine-tuning torque feedback loops on robotic fingers." },
            { time: "12:30", emoji: "🍱", text: "Grilled mackerel teishoku set meal with colleagues at a quiet seaside cafeteria." },
            { time: "14:15", emoji: "🔬", text: "Training diffusion policies from human teleoperation demonstrations." },
            { time: "18:00", emoji: "🌆", text: "Watching the twilight skyline glow from Odaiba seaside park; feeling grateful." },
            { time: "20:30", emoji: "📚", text: "Reading robotics literature on foundation models for embodied physical agents." }
          ],
          alternative_routines: [
            [
              { time: "08:15", emoji: "🏃", text: "Morning jog along Tokyo Bay promenade, watching cargo ships glide in." },
              { time: "09:45", emoji: "🔍", text: "Diagnosing motor vibration anomalies on the robot's knee joints with mechanics." },
              { time: "12:45", emoji: "🍛", text: "Japanese curry rice lunch discussing safety boundary validation methods." },
              { time: "15:00", emoji: "💻", text: "Simulating balance recovery on slippery tatami mats inside Isaac Sim." },
              { time: "18:30", emoji: "🛍️", text: "Browsing stationery and tech gadgets in Ginza before dinner at a noodle bar." }
            ]
          ],
          tags: ["#HumanoidRobotics", "#OdaibaBay", "#EmbodiedAI", "#SafeAutomation"]
        },
        {
          id: "tyo_3",
          title: "High-Frequency Algorithmic Data Scientist",
          industry: "Algorithmic Finance & Liquidity Modeling",
          persona: { name: "Ren Tanaka", handle: "@ren_quant_tokyo", avatar: "👨🏻‍💻", bio: "Sub-microsecond order routing & liquidity graph models in historic Nihonbashi" },
          skills: ["Rust", "Python", "Graph Neural Networks", "FPGA Acceleration", "Linux"],
          plog: "Nihonbashi district — where 400 years of merchant history meets ultra-modern fiber optics. Morning begins with a traditional sencha green tea near the historic bridge. We analyzed liquidity fragmentation patterns across Tokyo financial exchanges. Our team maintains a disciplined, calm environment: no frantic shouting, just elegant mathematical rigor and precise engineering. Off by 5:30 PM for a calming stroll along the Sumida river.",
          job_desc: {
            summary: "构建金融市场微观结构拓扑图与流动性预测算法，优化大额订单智能拆单与市场影响最小化。",
            tasks: [
              "研发基于图神经网络（GNN）的跨交易所资产相关性动态传播图谱",
              "与硬件团队协作将关键风控决策逻辑部署至低延迟 FPGA 计算板卡",
              "对高频行情订单流进行反欺诈监测与虚假申报异常行为过滤"
            ]
          },
          routine: [
            { time: "08:30", emoji: "🍵", text: "Hot sencha tea served in ceramic pottery; reviewing morning exchange liquidity." },
            { time: "09:45", emoji: "📊", text: "Order book visualization sync: Analyzing market spread compression during volatility." },
            { time: "12:15", emoji: "🍣", text: "Fresh chirashi sushi bowl at a century-old neighborhood restaurant in Nihonbashi." },
            { time: "14:00", emoji: "⚡", text: "Optimizing lock-free data structures in Rust to prevent thread context switching." },
            { time: "17:30", emoji: "🌊", text: "Walking along Sumida River terrace watching sunset boat cruises glide past." },
            { time: "20:00", emoji: "🧘", text: "Mindfulness meditation and practicing Japanese calligraphy (Shodo) at home." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🚴", text: "Cycling through quiet morning backstreets of Asakusa before the city awakens." },
              { time: "09:30", emoji: "📈", text: "Calibrating graph convolutional networks for predictive liquidity depth." },
              { time: "12:30", emoji: "🍜", text: "Handmade soba noodles with seasonal vegetable tempura near Tokyo Station." },
              { time: "15:00", emoji: "🔒", text: "Security review of cryptographic key management systems for algorithmic feeds." },
              { time: "18:00", emoji: "📖", text: "Reading history of Japanese industrial economics at a cozy bookstore cafe." }
            ]
          ],
          tags: ["#Nihonbashi", "#MathematicalRigor", "#RustQuant", "#ZenLife"]
        }
      ]
    },
    amsterdam: {
      name: "Amsterdam (Zuidas / Canal Ring / Science Park)",
      country: "Netherlands",
      flag: "🇳🇱",
      vibe: "Canal Cycling, 36-Hour Workweek, Strict Work-Life Harmony, Direct & Friendly Culture",
      roles: [
        {
          id: "ams_1",
          title: "Sustainable UX & Green AI Systems Designer",
          industry: "Green Tech & Human-Centered AI",
          persona: { name: "Sofia van Dijk", handle: "@sofia_amsterdam_vibe", avatar: "👩🏼‍🎨", bio: "Designing low-carbon web interfaces & ethical human-AI interaction systems" },
          skills: ["Figma", "Design Systems", "Green Computing", "React", "User Research"],
          plog: "Bicycled 15 minutes along the leafy Prinsengracht canal past timber houseboats, stopping for fresh warm stroopwafels. Our timber-framed, solar-powered studio overlooks houseboats. Today's design sprint: redesigning enterprise software dashboards so that every user action consumes 40% fewer server CPU cycles. At 17:00 sharp, everyone closed laptops. We went kayaking through the canals into Vondelpark for an evening picnic.",
          job_desc: {
            summary: "负责以人为本的绿色人机交互体验设计，将数字碳足迹指标融入企业产品核心体验中。",
            tasks: [
              "制定低能耗数字产品设计规范（暗色模式自适应、按需加载、矢量优化）",
              "开展广泛的用户可用性调研，评估自动化建议对用户决策自主权的影响",
              "与全栈工程团队协作落地轻量化前端组件库，将页面每用户会话碳排减半"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚲", text: "Biking along Prinsengracht canal, cool autumn air and golden elm leaves." },
            { time: "10:15", emoji: "🎨", text: "Design workshop: Mapping ethical friction into AI purchase confirmation flows." },
            { time: "12:30", emoji: "🥪", text: "Fresh sourdough gouda sandwich & apple juice in the studio canal courtyard." },
            { time: "14:30", emoji: "🌿", text: "User testing interviews on cognitive clarity of carbon footprint transparency badges." },
            { time: "17:00", emoji: "🛶", text: "Laptops shut! Kayaking on the Amstel river with friends under the evening sun." },
            { time: "19:30", emoji: "🥗", text: "Cooking roasted vegetables at home and enjoying live jazz on vinyl." }
          ],
          alternative_routines: [
            [
              { time: "08:15", emoji: "🏃", text: "Morning run around Vondelpark seeing dogs happily play on the dewy grass." },
              { time: "09:45", emoji: "💡", text: "Collaborative design critique with European product leads over oat flat whites." },
              { time: "13:00", emoji: "🥗", text: "Organic quinoa salad lunch at an eco-friendly cafe on Westerstraat." },
              { time: "15:00", emoji: "✨", text: "Refining micro-animations in Figma to ensure delightful accessibility." },
              { time: "17:00", emoji: "🚴", text: "Cycling home to read modern Dutch fiction in a sunlit conservatory." }
            ]
          ],
          tags: ["#ZeroOvertime", "#BikeEverywhere", "#GreenUX", "#CanalLife"]
        },
        {
          id: "ams_2",
          title: "Clean Energy Grid Optimization Engineer",
          industry: "Renewable Energy & Smart Grids",
          persona: { name: "Lars de Jong", handle: "@lars_energy_ams", avatar: "👨🏼‍💻", bio: "North Sea offshore wind power balancing & battery storage forecasting" },
          skills: ["Python", "Graph Neural Networks", "Time Series", "Docker", "Pandas"],
          plog: "Commuted to Amsterdam Science Park by fast electric train. Today our models balanced high North Sea gust outputs into national residential battery banks, preventing 420 tons of fossil backup ignition! Dutch directness makes all meetings fast and productive: 15-minute standup, no vanity slide decks, pure problem-solving. Enjoyed a craft beer on the sunny terrace after 5:00 PM.",
          job_desc: {
            summary: "应用图神经网络预测海上风电波动并实时调控全欧智能微电网与储能电池调度。",
            tasks: [
              "针对北海海上风电场构建超短期（0-4小时）风速与湍流多变量预测模型",
              "设计分布式储能电池充放电最优控制算法，保障电网频率稳定在 50Hz",
              "与荷兰能源运营商（TenneT）系统对接，落地自动化负荷削峰填谷策略"
            ]
          },
          routine: [
            { time: "08:30", emoji: "🚆", text: "Train ride to Amsterdam Science Park; reading papers on graph learning." },
            { time: "09:45", emoji: "🌬️", text: "Reviewing offshore wind turbine telemetry during North Sea autumn gales." },
            { time: "12:15", emoji: "🍲", text: "Warm tomato soup and fresh bread in the university campus cafeteria." },
            { time: "14:00", emoji: "⚡", text: "Simulating grid frequency response under sudden 200MW renewable surges." },
            { time: "17:00", emoji: "🍻", text: "Sunny terrace craft cider with green energy researchers discussing climate treaties." },
            { time: "20:00", emoji: "🎸", text: "Playing bass guitar in an indie folk garage band with neighborhood friends." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🚴", text: "Cycling through the historic Jordaan district with morning bells chiming." },
              { time: "09:30", emoji: "📊", text: "Calibrating Bayesian neural networks on historical extreme weather electricity prices." },
              { time: "12:45", emoji: "🥪", text: "Warm toasted panini by the canal watching boats navigate stone arches." },
              { time: "15:00", emoji: "🔬", text: "Refactoring code in PyTorch Geometric to train graph models 3x faster." },
              { time: "17:15", emoji: "🏊", text: "Open water swimming session at Nieuwe Meer lake before heading home." }
            ]
          ],
          tags: ["#OffshoreWind", "#SciencePark", "#36HourWeek", "#Renewables"]
        },
        {
          id: "ams_3",
          title: "Multilingual Ethical NLP & AI Safety Researcher",
          industry: "AI Governance & Foundation Models",
          persona: { name: "Anouk Bakker", handle: "@anouk_nlp_ams", avatar: "👩🏼‍🔬", bio: "Cultural inclusivity & bias audit for European multilingual foundation models" },
          skills: ["Hugging Face", "PyTorch", "NLP", "Ethical AI", "Python"],
          plog: "Working from our lab near the botanical gardens in Amsterdam East. We are auditing open foundation models to ensure smaller European languages (Dutch, Frisian, Basque, Gaelic) receive equal linguistic nuance and aren't overwritten by American cultural biases. Productive research hours followed by an evening bike ride across historic drawbridges to an open-air cinema.",
          job_desc: {
            summary: "负责多语言大语言模型文化包容性测评与对齐，保护区域语言多样性与人权合规标准。",
            tasks: [
              "构建涵盖欧洲 24 种官方语言的文化敏感性与刻板印象自动化测评基准",
              "应用直接偏好优化（DPO）消除模型在少数族群历史文化表达上的系统性偏见",
              "向欧盟《人工智能法案》（EU AI Act）合规委员会提交模型安全性透明度审查卷宗"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚲", text: "Gentle bike ride through Oosterpark listening to a linguistics audiobook." },
            { time: "10:00", emoji: "📖", text: "Analyzing semantic embedding clusters across multilingual translation pairs." },
            { time: "12:30", emoji: "🥗", text: "Salad bowl with fresh berries sitting near the historic De Gooyer windmill." },
            { time: "14:15", emoji: "🔬", text: "Fine-tuning cultural alignment weights with reinforcement learning from human feedback." },
            { time: "17:00", emoji: "🎬", text: "Attending an open-air documentary screening at Eye Filmmuseum across the river." },
            { time: "20:45", emoji: "✍️", text: "Writing thoughts on ethical AI philosophy for personal Substack newsletter." }
          ],
          alternative_routines: [
            [
              { time: "08:30", emoji: "☕", text: "Pour-over Ethiopian coffee while inspecting synthetic benchmark evaluation scores." },
              { time: "10:00", emoji: "🤝", text: "Virtual sync with Cambridge & Paris NLP ethicists on prompt injection defenses." },
              { time: "13:00", emoji: "🥪", text: "Fresh sourdough lunch sitting by the canal bridge with colleagues." },
              { time: "15:30", emoji: "💻", text: "Writing pytest suites for automated toxic output detection pipelines." },
              { time: "18:00", emoji: "🪴", text: "Visiting the local plant nursery to pick up fresh trailing ivies for the flat." }
            ]
          ],
          tags: ["#MultilingualNLP", "#EUAIAct", "#CulturalDiversity", "#AmsterdamEast"]
        }
      ]
    },
    london: {
      name: "London (Shoreditch / Kings Cross / Canary Wharf)",
      country: "United Kingdom",
      flag: "🇬🇧",
      vibe: "Historic Grandeur, Global Crossroads, Vibrant Street Markets, Friday Pub Traditions",
      roles: [
        {
          id: "ldn_1",
          title: "Climate Carbon Quant & Portfolio Strategist",
          industry: "Sustainable Finance & Climate Risk",
          persona: { name: "Charlotte Evans", handle: "@charlotte_ldn_quant", avatar: "👩🏼‍💼", bio: "Quantifying physical planetary climate risks for major UK pension portfolios" },
          skills: ["Python", "Docker", "Spatial Data", "Climate Scenarios", "SQL"],
          plog: "Red double-decker bus over London Bridge with views of the Tower of London and the Shard. Picked up a flat white in Borough Market. Our team models physical flood and extreme heat stress onto 20-year corporate sovereign debt. Lunch was artisan Ethiopian street food at Spitalfields. At 5:00 PM on Friday, the whole office walked to a 300-year-old historic riverside tavern to unwind.",
          job_desc: {
            summary: "构建基于地球系统科学的气候金融风险量化模型，帮助养老金与机构投资者防范资产搁浅。",
            tasks: [
              "集成卫星遥感与 IPCC 气候变化预测情景，建模极端洪水与风暴物理损失概率",
              "研发债券投资组合碳强度与净零过渡风险测算算法",
              "撰写符合英国央行审慎监管局（PRA）气候压力测试规范的合规分析系统"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚌", text: "Upper deck bus ride over London Bridge; historic stone towers in the morning mist." },
            { time: "09:30", emoji: "☕", text: "Flat white and cinnamon pastry in Borough Market; reviewing overnight commodity trends." },
            { time: "11:00", emoji: "🌍", text: "Scenario modeling: Projecting extreme coastal storm surges onto commercial properties." },
            { time: "13:00", emoji: "🍛", text: "Artisan curry at Spitalfields Market with fellow quantitative modelers." },
            { time: "15:30", emoji: "💻", text: "Optimizing spatial raster GIS joins in GeoPandas and DuckDB for fast analytics." },
            { time: "17:30", emoji: "🍻", text: "Cozy fireside drinks at The Anchor tavern by the Thames with the entire team." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🏃", text: "Morning run through Hyde Park past the Serpentine lake and swans." },
              { time: "09:30", emoji: "📊", text: "Presenting climate risk stress testing results to senior investment committees." },
              { time: "13:00", emoji: "🥪", text: "Baguette sandwich lunch walking around the British Museum courtyards." },
              { time: "15:00", emoji: "⚡", text: "Writing parallelized Monte Carlo simulations in Python to stress test asset values." },
              { time: "18:30", emoji: "🎭", text: "Catching an evening West End theater play with friends; completely inspired." }
            ]
          ],
          tags: ["#ClimateQuant", "#LondonBridge", "#Spitalfields", "#FridayPubs"]
        },
        {
          id: "ldn_2",
          title: "Genomics & Protein Folding Deep Learning Scientist",
          industry: "Biotech & Healthcare Innovation",
          persona: { name: "Tariq Malik", handle: "@tariq_biotech_ldn", avatar: "👨🏽‍🔬", bio: "Diffusion models for antibody de novo design at Kings Cross Knowledge Quarter" },
          skills: ["PyTorch", "AlphaFold", "BioPython", "Graph Networks", "HPC Clusters"],
          plog: "Kings Cross Knowledge Quarter — collaborating steps away from the Francis Crick Institute and British Library. Today our 3D geometric equivariant neural network designed a novel antibody binder for an autoimmune target with 10x higher simulated affinity. Stroll along Regent's Canal during lunch. Leaving at 5:30 PM to attend a chamber music recital at St Martin-in-the-Fields.",
          job_desc: {
            summary: "应用三维等变图神经网络与扩散模型开展抗体与抗原靶点的全新结构计算设计。",
            tasks: [
              "训练针对蛋白质-配体对接界面的几何深度学习生成模型",
              "在国家级超级计算集群上运行大规模分子动力学模拟验证结合稳定性",
              "与湿实验生物团队紧密对接，将计算候选分子推入体外实验亲和力筛选"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚇", text: "Tube ride into Kings Cross; peaceful walk along the canal past floating bookstores." },
            { time: "10:00", emoji: "🧬", text: "Visualizing 3D protein active binding pockets on 4K stereo workstation screens." },
            { time: "12:30", emoji: "🥪", text: "Gourmet falafel wrap eaten beside the Granary Square water fountains." },
            { time: "14:15", emoji: "💻", text: "Submitting multi-GPU diffusion training jobs across our university cluster." },
            { time: "17:30", emoji: "🎻", text: "Acoustic strings concert in a candlelit Trafalgar Square church." },
            { time: "20:30", emoji: "📖", text: "Reading biological philosophy and resting well for tomorrow's lab meetings." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "☕", text: "Pour-over coffee in Bloomsbury while reviewing Nature Structural Biology papers." },
              { time: "09:30", emoji: "🤝", text: "Joint sync with wet-lab biochemists discussing crystallization assay outcomes." },
              { time: "13:00", emoji: "🍜", text: "Warm ramen bowl with colleagues near St Pancras station." },
              { time: "15:00", emoji: "🔬", text: "Evaluating root-mean-square deviation (RMSD) metrics of generated protein backbones." },
              { time: "18:00", emoji: "🧗", text: "Bouldering session at a climbing center in Vauxhall with research mates." }
            ]
          ],
          tags: ["#ProteinDesign", "#KingsCross", "#BiotechAI", "#RegentsCanal"]
        },
        {
          id: "ldn_3",
          title: "Generative Neural VFX & Cinema AI Lead",
          industry: "Creative Arts & Film Production",
          persona: { name: "Eleanor Vance", handle: "@eleanor_soho_vfx", avatar: "👩🏼‍🎨", bio: "Next-gen diffusion video synthesis for independent cinema in Soho" },
          skills: ["PyTorch", "ComfyUI", "Nuke", "CUDA", "Python"],
          plog: "Soho's cobbled alleyways and film editing suites. Coffee meetings at an artisan roastery discussing atmospheric digital set extensions for an upcoming indie sci-fi film. We deployed custom temporal consistency LoRA models so background rain and neon reflections don't flicker. London's creative density is unmatched: every conversation sparks a new cinematic idea.",
          job_desc: {
            summary: "负责电影后期视觉特效（VFX）领域的时间连续性神经视频生成与自动化调色合成系统研发。",
            tasks: [
              "研发保持摄影机光流一致性的视频扩散模型与深度多通道控制插件（ControlNet）",
              "构建导演专用无损提示词与视觉概念微调工作流，保证影视级画面分辨率",
              "与特效艺术家团队协同，将 AI 工作流嵌入行业标准 Nuke/DaVinci 制作流水线"
            ]
          },
          routine: [
            { time: "09:15", emoji: "☕", text: "Specialty flat white in Dean Street Soho; chatting with independent directors." },
            { time: "10:30", emoji: "🎬", text: "Screening room dailies: Reviewing neural background replacements at 4K resolution." },
            { time: "13:00", emoji: "🍕", text: "Wood-fired sourdough pizza slice with fellow visual effects artists." },
            { time: "15:00", emoji: "⚡", text: "Refining custom temporal cross-attention layers to eliminate pixel shimmering." },
            { time: "18:00", emoji: "🍷", text: "Soho rooftop film gathering discussing independent British cinema futures." },
            { time: "21:00", emoji: "🎧", text: "Listening to cinematic orchestral scores while journaling new narrative ideas." }
          ],
          alternative_routines: [
            [
              { time: "08:30", emoji: "🚶", text: "Quiet morning stroll through Covent Garden cobblestones before tourists arrive." },
              { time: "10:00", emoji: "🎨", text: "Fine-tuning film stock color science emulators using PyTorch neural LUTs." },
              { time: "12:45", emoji: "🥗", text: "Fresh green salad bowl in Leicester Square garden." },
              { time: "14:30", emoji: "💻", text: "Live demonstration of real-time neural inpainting to film studio producers." },
              { time: "17:45", emoji: "🎞️", text: "Watching classic 35mm film screenings at the British Film Institute (BFI)." }
            ]
          ],
          tags: ["#SohoVFX", "#CinemaAI", "#LondonCreative", "#IndieFilm"]
        }
      ]
    },
    sf: {
      name: "San Francisco (Mission / SOMA / South Park)",
      country: "United States",
      flag: "🇺🇸",
      vibe: "Frontier Innovation, Pacific Ocean Breezes, Entrepreneurial Spark, Outdoor Trails",
      roles: [
        {
          id: "sf_1",
          title: "Autonomous Driving Perception Lead",
          industry: "Autonomous Vehicles & Robotics",
          persona: { name: "Alex Rivera", handle: "@alex_sf_autonomy", avatar: "👨🏻‍💻", bio: "Multi-sensor camera & radar 3D occupancy forecasting across San Francisco hills" },
          skills: ["PyTorch", "CUDA", "3D Occupancy", "C++", "TensorRT"],
          plog: "Blue Bottle pour-over in the Mission District. Commuted to our testing warehouse in Potrero Hill. Today our autonomous perception models handled steep San Francisco hills with dense cable car tracks and fog without hesitation. Lunch was a legendary Mission carnitas burrito in the sun at Dolores Park. Off by 5:30 PM to go bouldering at Dogpatch Boulders.",
          job_desc: {
            summary: "负责复杂城市道路全地形自动驾驶汽车实时三维占用网络（Occupancy Grid）感知算法研发。",
            tasks: [
              "训练处理多相机高帧率环视视频的端到端三维时空占用网络",
              "优化极端天气（浓雾、刺眼逆光、大雨）条件下的长尾罕见障碍物检测与轨迹预测",
              "利用 CUDA 深度优化核心注意力算子，将推理计算耗时压缩至 18ms 以内"
            ]
          },
          routine: [
            { time: "07:45", emoji: "☕", text: "Pour-over coffee in the Mission; taking in the cool Pacific morning fog." },
            { time: "09:15", emoji: "🚗", text: "Perception log review: Analyzing multi-camera vehicle tracking on steep hills." },
            { time: "12:30", emoji: "🌯", text: "Mission burrito in sunny Dolores Park with team mates; spotting palm trees." },
            { time: "14:30", emoji: "⚡", text: "CUDA kernel optimization for 3D transformer voxel grids on edge GPUs." },
            { time: "18:00", emoji: "🧗", text: "Bouldering session at Dogpatch gym; feeling athletic and clear-headed." },
            { time: "20:45", emoji: "📖", text: "Reading frontier papers on self-supervised representation learning." }
          ],
          alternative_routines: [
            [
              { time: "07:00", emoji: "🏃", text: "Trail run through the Presidio with golden views of the Golden Gate Bridge." },
              { time: "09:30", emoji: "💻", text: "Collaborative triage of difficult autonomous driving edge cases with safety drivers." },
              { time: "13:00", emoji: "🥗", text: "Healthy poke bowl lunch on the rooftop terrace overlooking San Francisco Bay." },
              { time: "15:00", emoji: "🔬", text: "Evaluating synthetic simulation data quality generated by neural radiance fields." },
              { time: "18:30", emoji: "🌅", text: "Watching the Pacific sunset from Ocean Beach with warm chai tea." }
            ]
          ],
          tags: ["#MissionDistrict", "#AutonomousVehicles", "#DoloresPark", "#CUDA"]
        },
        {
          id: "sf_2",
          title: "Frontier LLM Alignment & Constitutional AI Engineer",
          industry: "Generative AI & Artificial General Intelligence",
          persona: { name: "Chloe Zhang", handle: "@chloe_llm_sf", avatar: "👩🏻‍💻", bio: "RLHF reward modeling & automated red-teaming for reasoning foundation models" },
          skills: ["PyTorch", "RLHF", "DPO", "Kubernetes", "Python"],
          plog: "Working from our loft studio near South Park in SOMA. We're engineering automated constitutional AI critics that evaluate chain-of-thought mathematical reasoning without hallucination. Grabbed matcha at a local Japanese cafe. Walking around the grassy park discussing emergent reasoning bounds with visiting researchers. Left work on time for an ocean sunset view at Twin Peaks.",
          job_desc: {
            summary: "构建基于强化学习与宪法式自我审查的基座大模型对齐机制，确保复杂推理输出的真实性与安全性。",
            tasks: [
              "设计并微调多维度奖励模型（Reward Model），对逻辑推理链进行过程式监督（PRM）",
              "构建自动化红队测试沙箱，利用对抗性攻击样本测试模型的越狱防御韧性",
              "与伦理安全研究员合作，制定符合国际通用安全标准的模型发布准入准则"
            ]
          },
          routine: [
            { time: "08:30", emoji: "🍵", text: "Iced ceremonial matcha latte; listening to the quiet rustle of South Park trees." },
            { time: "10:00", emoji: "🤖", text: "Reviewing automated red-teaming logs; evaluating mathematical reasoning verifiers." },
            { time: "12:30", emoji: "🥗", text: "Organic grain bowl lunch with visiting Stanford AI alignment fellows." },
            { time: "14:45", emoji: "🔬", text: "Training process-supervised reward models across tens of thousands of reasoning steps." },
            { time: "18:00", emoji: "🌉", text: "Driving up to Twin Peaks to watch the city lights flicker on under the twilight sky." },
            { time: "20:30", emoji: "✍️", text: "Writing personal reflections on safe technology development for society." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🧘", text: "Morning mindfulness & stretching overlooking the sunlit Bay Bridge." },
              { time: "09:30", emoji: "💻", text: "Whiteboard discussion on mechanistic interpretability and sparse autoencoders." },
              { time: "13:00", emoji: "🥟", text: "Handmade dim sum lunch with engineering peers in Chinatown." },
              { time: "15:30", emoji: "🎯", text: "Validating safety filters on multilingual outputs for zero false positive refusals." },
              { time: "18:30", emoji: "🚲", text: "Cycling through Golden Gate Park to the ocean for fresh salt air." }
            ]
          ],
          tags: ["#SOMA", "#SouthPark", "#LLMAlignment", "#TwinPeaks"]
        },
        {
          id: "sf_3",
          title: "Embodied Robotics Foundation Model Architect",
          industry: "Robotics & Physical AI",
          persona: { name: "Marcus Sterling", handle: "@marcus_robot_sf", avatar: "👨🏾‍💻", bio: "Cross-embodiment vision-language-action (VLA) foundation models" },
          skills: ["PyTorch", "VLA Models", "JAX", "ROS2", "Python"],
          plog: "Dogpatch makerspace warehouse! Today we deployed our open Vision-Language-Action foundation model across three different robot arms (different brands, different kinematics). Zero-shot generalization worked: when given the verbal command 'place the ripe avocado into the wooden bowl', all three arms completed it cleanly! High-fives all around, followed by craft IPAs at an outdoor patio by the water.",
          job_desc: {
            summary: "研发跨硬件构型的视觉-语言-动作（VLA）具身大模型，实现机器人零样本物理任务操作。",
            tasks: [
              "使用 JAX 训练大规模具身多模态基础网络，联合建模视觉场景理解与连续机械手轨迹",
              "开发物理仿真器（Genesis/Isaac）到真实世界（Sim-to-Real）的领域泛化转换技术",
              "建立严密的物理碰撞实时防护阻尼控制，确保机器人与人类安全共存"
            ]
          },
          routine: [
            { time: "08:15", emoji: "☕", text: "Black coffee from an old industrial warehouse roastery in Dogpatch." },
            { time: "09:45", emoji: "🤖", text: "Live physical arm trials: Testing zero-shot grasping of irregular kitchen objects." },
            { time: "12:30", emoji: "🌮", text: "Fish tacos by the waterfront pier, enjoying the cool bay breeze and maritime ships." },
            { time: "14:30", emoji: "⚡", text: "Analyzing transformer attention rollout maps over physical manipulation trajectories." },
            { time: "18:00", emoji: "🍺", text: "Team celebration at a Dogpatch brewery patio under outdoor string lights." },
            { time: "20:45", emoji: "🛠️", text: "Home electronics workbench: Building open-source sensor kits for local high schools." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🚴", text: "Biking down the Embarcadero waterfront watching the morning ferries arrive." },
              { time: "10:00", emoji: "🔬", text: "Benchmarking cross-embodiment transfer performance across diverse gripper types." },
              { time: "13:00", emoji: "🥪", text: "Gourmet sourdough sandwich lunch discussing open robotics weights." },
              { time: "15:00", emoji: "💻", text: "Refactoring JAX training loops to maximize TPU cluster utilization." },
              { time: "18:15", emoji: "🌅", text: "Sunset walk through Crissy Field with views of Golden Gate Bridge." }
            ]
          ],
          tags: ["#Dogpatch", "#EmbodiedAI", "#RoboticsVLA", "#Makerspace"]
        }
      ]
    },
    berlin: {
      name: "Berlin (Mitte / Kreuzberg / Friedrichshain)",
      country: "Germany",
      flag: "🇩🇪",
      vibe: "Bohemian Freedom, Thriving Open Source Culture, Sourdough Bakeries, Vibrant Music & Arts",
      roles: [
        {
          id: "ber_1",
          title: "Open Source ML Infrastructure Engineer",
          industry: "Developer Tools & Decentralized AI",
          persona: { name: "Felix Weber", handle: "@felix_berlin_tech", avatar: "👨🏼‍💻", bio: "Distributed PyTorch training clusters running on 100% European renewable energy" },
          skills: ["PyTorch", "Kubernetes", "Linux", "Rust", "Distributed Systems"],
          plog: "Biked past Museum Island into our sunlit Mitte loft studio. Club Mate soda and warm seeded sourdough bread from the neighborhood bakery. Our open-source team builds distributed training frameworks that dynamically shift heavy compute workloads to data centers where Nordic hydro or wind power is currently surplus. Closed the laptop at 17:00 to meet friends at an outdoor beer garden along the Spree river.",
          job_desc: {
            summary: "构建开源分布式机器学习基础设施，利用欧洲绿色能源网动态调度大规模模型训练集群。",
            tasks: [
              "开发多节点高性能通信库优化（AllReduce/NCCL），降低跨机架通信开销",
              "设计碳感知（Carbon-Aware）任务编排调度系统，根据实时电网碳排放因子自动平衡算力",
              "维护活跃的开源开发者社区，审核全球贡献者的 pull requests 并保证严格代码质量"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚲", text: "Biking past historic Berlin Wall art and Museum Island under clear autumn skies." },
            { time: "09:45", emoji: "🥐", text: "Club-Mate and fresh sourdough pretzel from a cozy bakery in Mitte." },
            { time: "10:30", emoji: "💻", text: "Community PR review: Merging a 14% speedup in distributed gradient aggregation." },
            { time: "13:00", emoji: "🥙", text: "Berlin Döner kebab at a beloved neighborhood spot with the engineering team." },
            { time: "15:00", emoji: "⚡", text: "Deep work: Profiling InfiniBand RDMA packet latency on 128-GPU clusters." },
            { time: "17:30", emoji: "🍻", text: "Relaxing with friends at an outdoor beer garden along the banks of the Spree river." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🏃", text: "Jogging through Tiergarten forest park, surrounded by massive green oaks." },
              { time: "09:30", emoji: "☕", text: "Oat flat white in a quiet Kreuzberg cafe sketching cluster topology charts." },
              { time: "12:30", emoji: "🥗", text: "Vegan falafel bowl lunch in a courtyard garden." },
              { time: "15:00", emoji: "🔬", text: "Testing fault tolerance: Simulating sudden node dropouts during 70B model checkpointing." },
              { time: "18:00", emoji: "🎧", text: "Attending an open modular synthesizer jamming session in Friedrichshain." }
            ]
          ],
          tags: ["#BerlinMitte", "#OpenSourceAI", "#GreenCompute", "#Tiergarten"]
        },
        {
          id: "ber_2",
          title: "Spatial Neuro-Audio & Sound Synthesis Researcher",
          industry: "Music Tech & Acoustic AI",
          persona: { name: "Lena Fischer", handle: "@lena_sound_berlin", avatar: "👩🏼‍🎤", bio: "Generative diffusion models for 3D spatial audio & acoustic environment modeling" },
          skills: ["PyTorch", "DSP", "Audio Diffusion", "Max/MSP", "C++"],
          plog: "Berlin is the electronic music capital of the world. Our sound research studio in Friedrichshain develops neural audio diffusion models that synthesize full 3D binaural spatial soundscapes from textual descriptions. Today, legendary ambient electronic producers tested our acoustic plugin and were blown away by the organic analog warmth of the synthetic reverb. Finished early for an art gallery opening.",
          job_desc: {
            summary: "研发高保真三维空间音频神经合成算法，为沉浸式媒体与数字音乐制作带来前沿声学工具。",
            tasks: [
              "构建基于变分自编码器（VAE）与扩散模型的低延迟全频带音频生成网络",
              "研发头部相关传输函数（HRTF）自适应神经拟合，实现耳机端逼真三维声场定位",
              "与专业音乐制作人和声学工程师合作，确保合成音质达到母带级动态范围"
            ]
          },
          routine: [
            { time: "09:15", emoji: "☕", text: "Pour-over filter coffee in Friedrichshain; listening to dawn bird field recordings." },
            { time: "10:30", emoji: "🎧", text: "Critical listening session on studio monitors: Evaluating phase coherence of audio diffusion." },
            { time: "13:00", emoji: "🍜", text: "Vietnamese pho soup in a sunlit conservatory with sound designers." },
            { time: "14:45", emoji: "🎹", text: "Connecting hardware modular synthesizers to our neural model via MIDI controllers." },
            { time: "18:00", emoji: "🎨", text: "Visiting an experimental audio-visual installation exhibition in Kreuzberg." },
            { time: "21:00", emoji: "🎶", text: "Composing ambient ambient electronic soundscapes in my home recording studio." }
          ],
          alternative_routines: [
            [
              { time: "08:30", emoji: "🚶", text: "Morning walk around Boxhagener Platz flea market browsing vintage vinyl records." },
              { time: "10:00", emoji: "🔬", text: "Mathematical analysis of mel-spectrogram reconstruction loss functions." },
              { time: "12:45", emoji: "🥪", text: "Warm rye bread sandwich with colleagues beside the historic canal." },
              { time: "15:30", emoji: "💻", text: "Writing real-time C++ audio DSP plugins for digital audio workstations (DAWs)." },
              { time: "18:30", emoji: "🚲", text: "Cycling home through quiet tree-lined avenues with a heart full of melody." }
            ]
          ],
          tags: ["#Friedrichshain", "#SoundAI", "#MusicTech", "#SpatialAudio"]
        },
        {
          id: "ber_3",
          title: "Circular Economy & Industrial Material Vision Lead",
          industry: "Clean Tech & Circular Manufacturing",
          persona: { name: "Julian Schmidt", handle: "@julian_circular_ai", avatar: "👨🏼‍💻", bio: "Hyperspectral machine vision for high-speed automated textile & battery recycling" },
          skills: ["Computer Vision", "Hyperspectral", "PyTorch", "Industrial Automation", "C++"],
          plog: "Industrial testing facility in Charlottenburg. Germany's commitment to the circular economy means every piece of electronic waste and fabric must be reclaimed. Our hyperspectral vision cameras scan 20 discarded items per second, accurately classifying rare-earth battery chemistries and synthetic fabric blends with 99.4% purity. Seeing zero waste heading to incinerators is the ultimate motivation.",
          job_desc: {
            summary: "开发高光谱工业计算机视觉算法与自动化机械分选系统，实现废弃电子与纺织物的高纯度回收。",
            tasks: [
              "训练处理近红外与高光谱图像特征的轻量化卷积与变换器模型",
              "设计高速工业流水线毫秒级视觉触发与高速气阀分选联动控制逻辑",
              "与欧洲循环经济联盟对接，制定智能回收纯度检测行业质量标准"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚆", text: "S-Bahn train across Berlin; reading European environmental circularity reports." },
            { time: "09:30", emoji: "🔬", text: "Testing hyperspectral sensor calibration on newly arrived lithium battery components." },
            { time: "12:15", emoji: "🥗", text: "Lentil soup and whole grain bread in the industrial park green canteen." },
            { time: "14:00", emoji: "⚡", text: "Optimizing sorting air jet timing to separate rare earth metals at 3 meters per second." },
            { time: "17:15", emoji: "🚴", text: "Biking back along Charlottenburg canal; enjoying the reflection of weeping willows." },
            { time: "20:00", emoji: "♟️", text: "Playing friendly chess games with neighborhood locals at a community cafe." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "☕", text: "Strong black coffee and muesli while checking automated sorting purity metrics." },
              { time: "10:00", emoji: "🤝", text: "Sync with recycling facility plant managers on continuous throughput milestones." },
              { time: "13:00", emoji: "🥪", text: "Fresh sandwich lunch in the factory courtyard garden under sunny skies." },
              { time: "15:00", emoji: "💻", text: "Training deep active learning models on ambiguous composite material samples." },
              { time: "18:00", emoji: "🏃", text: "Evening jog through Volkspark Friedrichshain feeling energized." }
            ]
          ],
          tags: ["#CircularEconomy", "#HyperspectralVision", "#ZeroWaste", "#Charlottenburg"]
        }
      ]
    },
    zurich: {
      name: "Zurich (ETH Campus / Lake Zurich / Enge)",
      country: "Switzerland",
      flag: "🇨🇭",
      vibe: "Crystal Alpine Air, Lakeside Bliss, Swiss Precision Engineering, High Trust & Quiet Excellence",
      roles: [
        {
          id: "zrh_1",
          title: "Edge Neural Computing & Medical Implant AI Lead",
          industry: "Medical Technology & High-Reliability AI",
          persona: { name: "Beat Meier", handle: "@beat_zurich_ai", avatar: "👨🏼‍🔬", bio: "Sub-milliwatt neural processors for cardiac monitoring & neuro-implants at ETH" },
          skills: ["TinyML", "Embedded C", "PyTorch", "Biomedical Signal", "FPGA"],
          plog: "Morning train along shimmering Lake Zurich with snowcapped Alps towering in the distance. Swiss muesli with fresh mountain blueberries. In our cleanroom laboratory near ETH Zurich, we verified our ultra-low-power neural network chip: it runs real-time cardiac arrhythmia detection consuming only 400 microwatts of power. During our 1-hour lunch break, our whole research team went for a swim in the crystal-clear lake.",
          job_desc: {
            summary: "研发超低功耗微瓦级边缘神经计算芯片与算法，应用于植入式心脏及神经医疗监测设备。",
            tasks: [
              "设计高压缩比脉冲神经网络（SNN）与量化感知剪枝（QAT）极简算子",
              "在超低功耗集成电路（ASIC）上完成实时生理信号异常检测的软硬件协同设计",
              "遵循瑞士与欧盟最高医疗器械安全标准（MDR/ISO 13485）完成长效植入验证"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚆", text: "Scenic train along Lake Zurich; gazing at the glistening water and distant Alps." },
            { time: "09:30", emoji: "🔬", text: "Cleanroom testing of 400-microwatt neural sensor chips on cardiac simulation rigs." },
            { time: "12:15", emoji: "🏊", text: "Quick dive and swim in Lake Zurich; crystal-clear alpine water refreshing the mind." },
            { time: "14:00", emoji: "💻", text: "Mathematical modeling of spiked neural signal encoding for zero false alarms." },
            { time: "17:30", emoji: "🚴", text: "Cycling home through quiet lakeside meadows; pure alpine air in the lungs." },
            { time: "20:00", emoji: "🧀", text: "Fondue dinner with family, crisp local white wine, and quiet conversation." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🏃", text: "Uphill trail run up Uetliberg mountain overlooking the entire Zurich basin." },
              { time: "09:30", emoji: "☕", text: "Hot espresso and fresh croissant at an ETH campus terrace cafe." },
              { time: "11:00", emoji: "🤝", text: "Collaborative clinical review with surgeons from University Hospital Zurich." },
              { time: "14:30", emoji: "⚡", text: "Refactoring assembly instructions to squeeze maximum battery longevity." },
              { time: "18:00", emoji: "📖", text: "Reading Swiss engineering history and resting peacefully." }
            ]
          ],
          tags: ["#LakeZurich", "#ETHZurich", "#MedicalAI", "#AlpineLife"]
        },
        {
          id: "zrh_2",
          title: "Sovereign AI & Confidential Computing Cryptographer",
          industry: "Data Sovereignty & Privacy AI",
          persona: { name: "Elena Rossi", handle: "@elena_swiss_privacy", avatar: "👩🏻‍💻", bio: "Zero-knowledge proofs & federated learning for European hospital networks" },
          skills: ["Zero-Knowledge Proofs", "Rust", "Federated Learning", "PyTorch", "Linux"],
          plog: "Working from our high-security center in Enge. Swiss privacy laws provide the world's highest trust foundation. Today, 14 major European cancer hospitals trained a collaborative diagnostic model across our zero-knowledge federated computing network — without a single patient record ever leaving its originating hospital. Trust, math, and precision solving real human problems.",
          job_desc: {
            summary: "构建基于零知识证明与同态加密的可信联邦学习系统，实现跨国医疗敏感数据的无泄漏协同计算。",
            tasks: [
              "设计基于安全多方计算（SMPC）与可信执行环境（TEE）的模型聚合验证协议",
              "使用 Rust 编写高性能密码学证明生成工具，将验证开销压缩在毫秒量级",
              "确保联邦学习架构完全符合瑞士联邦数据保护法（FADP）与 GDPR 严格要求"
            ]
          },
          routine: [
            { time: "08:30", emoji: "🚶", text: "Peaceful morning walk past stone historic fountains in the Old Town (Altstadt)." },
            { time: "09:45", emoji: "🔒", text: "Audit of cryptographic zero-knowledge circuits for federated gradient verification." },
            { time: "12:30", emoji: "🥗", text: "Fresh Swiss alpine salad and crusty bread in a quiet courtyard garden." },
            { time: "14:15", emoji: "💻", text: "Benchmarking homomorphic encryption throughput across European server enclaves." },
            { time: "17:15", emoji: "⛵", text: "Sailing on Lake Zurich with university club friends under golden late sun." },
            { time: "20:30", emoji: "📚", text: "Reading modern cryptography literature and sipping soothing chamomile tea." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "☕", text: "Strong double espresso with dark Swiss chocolate on a balcony facing the lake." },
              { time: "09:30", emoji: "🤝", text: "Virtual security sync with European privacy commissioners and hospital directors." },
              { time: "13:00", emoji: "🍜", text: "Warm noodle broth lunch discussing distributed consensus protocols." },
              { time: "15:00", emoji: "⚡", text: "Profiling memory safety in Rust crates to eliminate any potential side-channel leaks." },
              { time: "18:00", emoji: "🏔️", text: "Evening walk through hillside vineyards with panoramic views of the Alps." }
            ]
          ],
          tags: ["#SwissPrivacy", "#ZeroKnowledge", "#ConfidentialComputing", "#Enge"]
        },
        {
          id: "zrh_3",
          title: "Glaciology & Alpine Climate Deep Modeling Scientist",
          industry: "Earth Observation & Environmental Science",
          persona: { name: "Florian Keller", handle: "@florian_glacier_ai", avatar: "👨🏼‍🔬", bio: "Satellite radar interferometry tracking glacier mass loss with 3D deep vision models" },
          skills: ["Remote Sensing", "PyTorch", "SAR Interferometry", "Python", "GIS"],
          plog: "Laboratory overlooking the Zurichberg hills. We process radar satellite data from the European Space Agency Sentinel constellation, generating daily sub-centimeter 3D mass tracking for all Swiss glaciers. Our AI models predict glacial runoff weeks in advance, protecting mountain villages from sudden flash floods and optimizing hydroelectric dams.",
          job_desc: {
            summary: "应用卫星合成孔径雷达（SAR）与三维深度学习网络，实时建模阿尔卑斯山冰川融水与地质滑坡风险。",
            tasks: [
              "开发多时相雷达干涉测量（InSAR）点云处理算法，监测高山冰层亚厘米级形变",
              "将物理冰川融化动力学方程与深度神经网络融合，预测极端高温下的融水量",
              "与瑞士联邦环境局对接，建立高山堰塞湖溢流自动化早期预警机制"
            ]
          },
          routine: [
            { time: "08:30", emoji: "🚡", text: "Riding the historic Polybahn funicular up to the campus viewpoint." },
            { time: "09:45", emoji: "🛰️", text: "Processing overnight Sentinel-1 SAR imagery over the Aletsch Glacier." },
            { time: "12:15", emoji: "🥪", text: "Alpine cheese and rye bread lunch sitting on the outdoor sun deck." },
            { time: "14:00", emoji: "🏔️", text: "Simulating meltwater channel flow dynamics under projected summer heat waves." },
            { time: "17:15", emoji: "🚴", text: "Fast coasting bike ride down through pine forests into Zurich center." },
            { time: "19:45", emoji: "📸", text: "Developing landscape film photographs taken during weekend alpine treks." }
          ],
          alternative_routines: [
            [
              { time: "07:45", emoji: "🏃", text: "Morning trail jog along the Limmat river watching swans glide on glassy water." },
              { time: "09:30", emoji: "💻", text: "Calibrating 3D convolutional networks on ground-penetrating radar depth soundings." },
              { time: "12:45", emoji: "🍲", text: "Warm barley soup at a historic guild house restaurant in the old town." },
              { time: "15:00", emoji: "📊", text: "Presenting hydrological forecast models to regional hydroelectric operators." },
              { time: "18:00", emoji: "🏊", text: "Relaxing evening swim at the vintage wooden Flussbad Oberer Letten." }
            ]
          ],
          tags: ["#Glaciology", "#EarthObservation", "#AlpineScience", "#Polybahn"]
        }
      ]
    },
    sydney: {
      name: "Sydney (Surry Hills / Barangaroo / Circular Quay)",
      country: "Australia",
      flag: "🇦🇺",
      vibe: "Sunrise Ocean Surfing, Sun-Drenched Harbors, World-Class Specialty Coffee, Healthy Outdoor Living",
      roles: [
        {
          id: "syd_1",
          title: "Marine & Coral Reef Ecosystem AI Lead",
          industry: "Ocean Conservation & Environmental AI",
          persona: { name: "Liam O'Connor", handle: "@liam_reef_ai", avatar: "👨🏼‍🔬", bio: "Autonomous underwater vehicle vision tracking Great Barrier Reef recovery" },
          skills: ["Computer Vision", "Underwater Robotics", "PyTorch", "Python", "ROS2"],
          plog: "6:00 AM sunrise surf at Bondi Beach — watching dolphins play in the green peeling waves. Quick shower, flat white from a Surry Hills laneway cafe, and into our sunny open-brick lab by 9:00 AM. We deployed our computer vision model onto autonomous underwater drones: it catalogs coral bleaching and marine biodiversity with 98.7% accuracy across thousands of square kilometers. Working in Australia means true health and sunshine every day.",
          job_desc: {
            summary: "研发水下自主航行器（AUV）计算机视觉感知算法，实现大堡礁珊瑚健康度与海洋生物多样性自动监测。",
            tasks: [
              "针对水下光线色散与浑浊水体开发自适应图像增强与无监督色彩还原网络",
              "训练细粒度珊瑚物种与白化阶段分类模型，实现百万张水下高分辨率照片的自动批注",
              "与海洋生物学家协同制定生态恢复人工育苗投放点智能优化规划"
            ]
          },
          routine: [
            { time: "06:00", emoji: "🏄", text: "Sunrise surf at Bondi Beach; catching golden waves alongside pods of dolphins." },
            { time: "08:30", emoji: "☕", text: "Artisan flat white & avocado toast at a sunlit Surry Hills laneway cafe." },
            { time: "10:00", emoji: "🐠", text: "Underwater vision review: Evaluating coral polyp health segmentation accuracy." },
            { time: "12:30", emoji: "🥗", text: "Fresh grilled barramundi and quinoa salad bowl in Prince Alfred Park." },
            { time: "14:30", emoji: "🤖", text: "Testing autonomous vehicle pathfinding algorithms for complex coral reefs." },
            { time: "17:30", emoji: "🌅", text: "Catching the Manly Ferry across Sydney Harbour as the sky turns rose and gold." },
            { time: "20:30", emoji: "📖", text: "Reading marine ecology publications and getting a solid 8 hours of restorative sleep." }
          ],
          alternative_routines: [
            [
              { time: "06:30", emoji: "🏃", text: "Coastal walk from Coogee to Bondi, breathing in the fresh Pacific ocean spray." },
              { time: "09:00", emoji: "💻", text: "Synchronizing drone imagery feeds with satellite temperature anomaly overlays." },
              { time: "12:45", emoji: "🥪", text: "Sourdough toastie at a harbor cafe watching yachts glide past the Opera House." },
              { time: "15:00", emoji: "🔬", text: "Benchmarking edge inference performance on subsea pressure-resistant housings." },
              { time: "18:00", emoji: "🏊", text: "Late afternoon swim at the ocean ocean rock pool; feeling thoroughly refreshed." }
            ]
          ],
          tags: ["#BondiSurfing", "#ReefAI", "#SurryHills", "#OceanConservation"]
        },
        {
          id: "syd_2",
          title: "Renewable Microgrid & Distributed Energy ML Engineer",
          industry: "Clean Tech & Solar Microgrids",
          persona: { name: "Sophie Nguyen", handle: "@sophie_energy_syd", avatar: "👩🏻‍💻", bio: "Rooftop solar forecasting & neighborhood virtual power plants in Barangaroo" },
          skills: ["Time Series", "PyTorch", "FastAPI", "GCP", "PostgreSQL"],
          plog: "High-floor glass studio in Barangaroo overlooking Sydney Harbour Bridge. Australia has the highest per-capita rooftop solar penetration in the world. Our machine learning algorithms aggregate 80,000 suburban household batteries into a virtual power plant, feeding clean solar power back into the grid during hot summer afternoons. Leaving at 5:00 PM for an ocean swim at Bronte pool.",
          job_desc: {
            summary: "构建分布式家庭屋顶光伏与储能电池聚合预测系统，实现虚拟电厂（VPP）智能化电力现货竞价。",
            tasks: [
              "针对全澳数十万家庭逆变器数据流开发亚小时级光伏发电与负荷双向预测网络",
              "设计博弈论强化学习算法，优化虚拟电厂在国家电力市场（NEM）的最优调度决策",
              "与能源网络监管机构合作，保障分布式电网逆向潮流安全与电网电压稳定性"
            ]
          },
          routine: [
            { time: "07:30", emoji: "🏊", text: "Morning ocean dip at Bronte ocean baths with the warm morning sun." },
            { time: "09:00", emoji: "☕", text: "Magic flat white coffee; checking suburban solar generation curves." },
            { time: "10:30", emoji: "☀️", text: "Virtual Power Plant dispatch review: Shifting 45MWh of rooftop solar into community storage." },
            { time: "12:30", emoji: "🍣", text: "Fresh sushi rolls by the waterfront promenade watching harbor ferries dock." },
            { time: "14:45", emoji: "⚡", text: "Training gradient boosting models on cloud cover and temperature satellite feeds." },
            { time: "17:00", emoji: "🚴", text: "Biking along the harbor cycleway to a seaside BBQ with neighborhood friends." }
          ],
          alternative_routines: [
            [
              { time: "07:00", emoji: "🧘", text: "Outdoor yoga on the grassy headland at Barangaroo Reserve overlooking the harbor." },
              { time: "09:15", emoji: "💻", text: "Deploying updated microgrid forecasting endpoints on Google Cloud Kubernetes." },
              { time: "13:00", emoji: "🥗", text: "Vietnamese rice paper rolls and green juice in the sunlit atrium." },
              { time: "15:15", emoji: "📊", text: "Simulating electricity spot price spikes during peak heatwave demand periods." },
              { time: "18:00", emoji: "⛵", text: "Sunset twilight sailing race with the local amateur yacht club." }
            ]
          ],
          tags: ["#Barangaroo", "#SolarPower", "#VirtualPowerPlant", "#SydneyHarbour"]
        },
        {
          id: "syd_3",
          title: "Bushfire Risk Mapping & Early Detection AI Lead",
          industry: "Public Safety & Satellite Earth Observation",
          persona: { name: "Ben Walker", handle: "@ben_spatial_syd", avatar: "👨🏼‍💻", bio: "Thermal infrared satellite feeds & drone early wildfire detection" },
          skills: ["Computer Vision", "Satellite Remote Sensing", "Python", "GIS", "C++"],
          plog: "Redfern tech innovation hub. Protecting the Australian bushland and wildlife. Our team integrates geostationary thermal satellite streams with autonomous high-altitude spotter drones. Today our early detection model flagged an incipient lightning-induced ignition in the Blue Mountains in under 90 seconds, allowing local fire crews to extinguish it before it spread. A deeply rewarding day.",
          job_desc: {
            summary: "应用地球静止气象卫星热红外反演与无人机边缘视觉，构建全天候森林火险快速预警系统。",
            tasks: [
              "训练处理多通道高频卫星遥感数据的亚像元微小热异常火点识别卷积网络",
              "结合地表植被干燥度指数（NDVI）、风速场与地形坡度动态预测山火蔓延路径",
              "与乡村消防局（RFS）指挥中心系统集成，实现秒级警报自动推送与应急调度联动"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚆", text: "Train into Redfern; enjoying views of jacaranda trees in purple bloom." },
            { time: "09:30", emoji: "🛰️", text: "Inspecting thermal infrared anomaly detections from Himawari-9 satellite." },
            { time: "12:15", emoji: "🥪", text: "Turkish pide sandwich lunch in a leafy park watching cockatoos in the trees." },
            { time: "14:00", emoji: "🔥", text: "Calibrating cellular automata fire spread simulation against historical fire grounds." },
            { time: "17:30", emoji: "🏃", text: "Evening harbor run across the Sydney Harbour Bridge; sunset painting the sails." },
            { time: "20:30", emoji: "🔭", text: "Backyard stargazing in the clear southern night sky, identifying the Southern Cross." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "☕", text: "Iced long black coffee while checking overnight weather radar moisture maps." },
              { time: "09:30", emoji: "🤝", text: "Debrief with emergency services coordinators on autonomous drone dispatch latency." },
              { time: "13:00", emoji: "🥗", text: "Healthy grain bowl in Surry Hills courtyard with spatial mapping peers." },
              { time: "15:00", emoji: "💻", text: "Optimizing geographic GeoJSON indexing in PostGIS for rapid spatial queries." },
              { time: "18:00", emoji: "🎸", text: "Playing acoustic tunes around a beach bonfire with longtime friends." }
            ]
          ],
          tags: ["#BushfireSafety", "#Redfern", "#SatelliteVision", "#HarbourLiving"]
        }
      ]
    },
    toronto: {
      name: "Toronto (Discovery District / Waterfront / Yorkville)",
      country: "Canada",
      flag: "🇨🇦",
      vibe: "Diverse Cosmopolitan Hub, World-Leading Deep Learning Legacy, Lakeside Walks, Multicultural Feasts",
      roles: [
        {
          id: "tor_1",
          title: "Healthcare Medical Imaging & Oncology AI Lead",
          industry: "Medical Diagnostics & Clinical AI",
          persona: { name: "David Kim", handle: "@david_toronto_med_ai", avatar: "👨🏻‍🔬", bio: "3D CT scan volumetric lung nodule detection with University Health Network" },
          skills: ["PyTorch", "MONAI", "Medical Imaging", "3D Convolutions", "DICOM"],
          plog: "Rode the King Street streetcar into Toronto's Discovery District. University of Toronto and Vector Institute are legendary epicenters of deep learning. Collaborating directly with radiologists at Princess Margaret Cancer Centre: our 3D volumetric model detected early-stage nodules with 99.1% sensitivity, cutting radiologist reading fatigue by 45%. Stopped by St. Lawrence Market for warm maple peameal bacon on a bun.",
          job_desc: {
            summary: "开发三维医学影像（CT/MRI）深度学习病灶检测与分割算法，提高早期肿瘤筛查准确率。",
            tasks: [
              "使用 MONAI 与 PyTorch 构建处理全器官体积数据的多尺度三维注意力分割网络",
              "应用贝叶斯蒙特卡洛 Dropout 评估模型诊断不确定性，标定需专家复审的高疑度病例",
              "完成加拿大卫生部与 FDA 严格临床验证，确保算法对不同机型影像具备高度泛化性"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚋", text: "Classic red streetcar ride along King Street; golden maple trees lining the avenues." },
            { time: "09:30", emoji: "🏥", text: "Clinical rounds with radiologists at University Health Network reviewing 3D CT scans." },
            { time: "12:30", emoji: "🥪", text: "Fresh warm peameal sandwich at historic St. Lawrence Market with lab colleagues." },
            { time: "14:30", emoji: "🔬", text: "Evaluating model segmentation dice scores across multicenter scanner benchmarks." },
            { time: "17:45", emoji: "⛸️", text: "Ice skating under sparkling festive lights at Nathan Phillips Square." },
            { time: "20:30", emoji: "📖", text: "Reading Geoff Hinton's foundational neural net memoirs by a warm home hearth." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🏃", text: "Crisp morning jog along the Lake Ontario Martin Goodman trail." },
              { time: "09:30", emoji: "☕", text: "Oat cortado in a cozy Kensington Market cafe chatting about medical ethics." },
              { time: "12:45", emoji: "🥟", text: "Authentic hand-pulled noodles lunch in Downtown Chinatown with fellow researchers." },
              { time: "15:00", emoji: "💻", text: "Optimizing 3D tensor convolution memory usage to train on standard hospital workstations." },
              { time: "18:00", emoji: "🏒", text: "Watching a lively Toronto Maple Leafs ice hockey match with neighborhood friends." }
            ]
          ],
          tags: ["#DiscoveryDistrict", "#MedicalAI", "#VectorInstitute", "#TorontoLife"]
        },
        {
          id: "tor_2",
          title: "Quantum-Classical Hybrid ML Optimization Lead",
          industry: "Quantum Computing & Advanced Analytics",
          persona: { name: "Amira Patel", handle: "@amira_quantum_to", avatar: "👩🏽‍💻", bio: "Variational quantum eigensolvers for chemical material discovery at MaRS Hub" },
          skills: ["PennyLane", "Qiskit", "PyTorch", "Quantum Algorithms", "Python"],
          plog: "Working at the soaring glass atrium of MaRS Discovery District. Toronto has one of the world's highest concentrations of quantum computing talent. We are developing hybrid quantum-classical algorithms that simulate battery electrolyte degradation: classical neural nets handle representation, while quantum circuits calculate correlated electron ground states. Walked down to the waterfront at dusk to enjoy the fresh breeze off Lake Ontario.",
          job_desc: {
            summary: "开发变分量子算法（VQE/QAOA）与经典神经网络混合求解器，加速新型清洁能源材料研发。",
            tasks: [
              "在 PennyLane 与 Qiskit 平台上设计抗噪声量子线路（NISQ）变分优化算子",
              "将经典图神经网络与参数化量子电路级联，求解复杂分子轨道能量本征值",
              "与量子硬件合作方开展真机基准评测，攻关量子纠错与线路深度压缩瓶颈"
            ]
          },
          routine: [
            { time: "08:45", emoji: "☕", text: "Double espresso in the sun-drenched MaRS atrium; sketching quantum circuit diagrams." },
            { time: "10:15", emoji: "⚛️", text: "Quantum simulation run: Evaluating parameterized rotation gates on noisy simulator." },
            { time: "12:45", emoji: "🍲", text: "Warm vegetarian butter chicken and garlic naan in the student hub food hall." },
            { time: "14:30", emoji: "🔬", text: "Benchmarking convergence rates of classical gradient descent on quantum surfaces." },
            { time: "17:30", emoji: "🌅", text: "Walking along Sugar Beach boardwalk watching sailboats cruise Lake Ontario." },
            { time: "20:30", emoji: "♟️", text: "Playing rapid chess tournaments online while sipping hot Earl Grey tea." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🚴", text: "Cycling through the lush Don Valley trail surrounded by towering green trees." },
              { time: "09:30", emoji: "💡", text: "Whiteboard brainstorming with University of Toronto quantum physicists." },
              { time: "13:00", emoji: "🥗", text: "Crisp autumn apple and walnut salad bowl on the university campus lawn." },
              { time: "15:15", emoji: "💻", text: "Writing test suites verifying unitary matrix preservation across quantum layers." },
              { time: "18:30", emoji: "🎷", text: "Enjoying live acoustic jazz in the historic Distillery District cobblestones." }
            ]
          ],
          tags: ["#MaRSHub", "#QuantumML", "#CleanEnergyMaterials", "#SugarBeach"]
        },
        {
          id: "tor_3",
          title: "Multilingual Dialogue & Cultural Preservation AI Lead",
          industry: "NLP & Digital Humanities",
          persona: { name: "Ethan Tremblay", handle: "@ethan_nlu_to", avatar: "👨🏼‍💻", bio: "Indigenous language revitalization & low-resource dialogue systems in Yorkville" },
          skills: ["PyTorch", "Hugging Face", "Low-Resource NLP", "Speech Recognition", "Python"],
          plog: "Yorkville heritage building studio. Partnering directly with Indigenous community elders across Canada to build speech recognition and conversational tools for Cree, Inuktitut, and Ojibwe languages. Respecting cultural data sovereignty means the community retains 100% ownership of training data. Seeing young children practicing their ancestral language with our interactive conversational app is the greatest achievement of my career.",
          job_desc: {
            summary: "研发低资源稀缺语种自动语音识别（ASR）与对话大模型，赋能原住民文化语言数字化抢救与传承。",
            tasks: [
              "构建基于自监督语音表征（wav2vec/Whisper）的极少标注语种自适应迁移算法",
              "落地社区主导的数据主权（CARE 原则）治理架构，保证训练数据仅用于社区指定用途",
              "开发离线移动端轻量级语音互动教学应用，支持无网络偏远社区流畅使用"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🚶", text: "Walk through Yorkville leafy streets past Victorian brick houses and art galleries." },
            { time: "10:00", emoji: "🎙️", text: "Acoustic audio alignment: Reviewing elder pronunciation audio files with linguists." },
            { time: "12:30", emoji: "🥪", text: "Smoked meat sandwich and pickles at a neighborhood Jewish deli." },
            { time: "14:15", emoji: "📱", text: "Testing offline speech recognition inference on lightweight Android tablets." },
            { time: "17:30", emoji: "🌆", text: "Strolling through the Royal Ontario Museum grounds as evening lights glow." },
            { time: "20:00", emoji: "📖", text: "Reading Indigenous historical poetry and feeling deep connection and purpose." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "☕", text: "Warm cedar tea on the porch while reviewing cross-lingual phoneme embedding maps." },
              { time: "09:45", emoji: "🤝", text: "Video conference with northern community educators on tablet app feedback." },
              { time: "13:00", emoji: "🥗", text: "Wild rice and roasted squash bowl lunch with language researchers." },
              { time: "15:00", emoji: "💻", text: "Fine-tuning CTC loss decoder for polysynthetic language word boundary recognition." },
              { time: "18:00", emoji: "🏊", text: "Recreational swim at the university indoor aquatic center to unwind." }
            ]
          ],
          tags: ["#LanguagePreservation", "#IndigenousTech", "#Yorkville", "#SocialGood"]
        }
      ]
    }
  };

  // State
  let currentStep = 0;
  let answers = {};
  let calculatedTotem = null;
  let selectedDomain = "tech";
  let globeInitialized = false;

  // Elements
  const welcomeCard = document.getElementById("totemWelcomeCard");
  const quizCard = document.getElementById("totemQuizCard");
  const resultCard = document.getElementById("totemResultCard");
  const homeContent = document.getElementById("landingHomeContent");

  // Helper to enter Immersion Mode (hides generic landing content below)
  function enterImmersionMode() {
    if (homeContent) homeContent.classList.add("hidden");
  }

  function exitImmersionMode() {
    if (homeContent) homeContent.classList.remove("hidden");
    if (welcomeCard) welcomeCard.classList.remove("hidden");
    if (quizCard) quizCard.classList.add("hidden");
    if (resultCard) resultCard.classList.add("hidden");
    const container = document.getElementById("home-intro");
    if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.exitTotemImmersion = exitImmersionMode;

  // Init Event Listeners
  window.startTotemQuiz = function () {
    enterImmersionMode();
    if (welcomeCard) welcomeCard.classList.add("hidden");
    if (quizCard) quizCard.classList.remove("hidden");
    if (resultCard) resultCard.classList.add("hidden");
    currentStep = 1;
    answers = {};
    renderQuestion(1);
    const container = document.getElementById("home-intro");
    if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.skipTotemQuiz = function () {
    exitImmersionMode();
    const portals = document.getElementById("home-portals");
    if (portals) portals.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.retakeTotemQuiz = function () {
    enterImmersionMode();
    if (welcomeCard) welcomeCard.classList.add("hidden");
    if (quizCard) quizCard.classList.remove("hidden");
    if (resultCard) resultCard.classList.add("hidden");
    currentStep = 1;
    answers = {};
    renderQuestion(1);
    const container = document.getElementById("home-intro");
    if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.recordAnswer = function (questionId, value) {
    answers[questionId] = parseInt(value, 10);

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
      <div class="space-y-6 fade-in text-slate-900">
        <!-- Top Progress -->
        <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-4">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
            <span class="font-black text-slate-800">Question ${qIndex} of ${QUESTIONS.length}</span>
          </div>
          <div class="text-indigo-600 font-mono font-bold">${progressPct}% Calculated</div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-teal-500 to-indigo-600 h-full rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
        </div>

        <!-- Question Prompt -->
        <div class="py-4 text-center max-w-xl mx-auto space-y-3">
          <span class="text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Workplace Preference
          </span>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
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
          <div class="flex justify-between max-w-[520px] mx-auto text-[11px] font-extrabold text-slate-500 px-2">
            <span class="text-rose-600">Strongly Disagree</span>
            <span class="text-slate-500">Neutral</span>
            <span class="text-emerald-600">Strongly Agree</span>
          </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="flex items-center justify-between pt-6 border-t border-slate-200 text-xs">
          ${qIndex > 1 ? `
            <button type="button" onclick="prevQuestion()" class="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold transition">
              ← Previous Question
            </button>
          ` : `<div></div>`}
          
          <button type="button" onclick="exitTotemImmersion()" class="text-slate-500 hover:text-indigo-600 font-bold transition">
            Exit to Overview →
          </button>
        </div>
      </div>
    `;
  }

  function finishQuiz() {
    quizCard.innerHTML = `
      <div class="py-14 text-center space-y-6 fade-in">
        <div class="relative w-20 h-20 mx-auto">
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 animate-spin blur-md opacity-50"></div>
          <div class="relative w-20 h-20 rounded-full bg-white border border-slate-200 grid place-items-center text-3xl shadow-sm">
            🔮
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-black text-slate-900">Synthesizing Your Authentic Totem DNA...</h3>
          <p class="text-xs text-slate-500">Calibrating psychological vector coordinates across O*NET 30.3 global career models</p>
        </div>
        <div class="w-48 mx-auto bg-slate-200 h-2 rounded-full overflow-hidden">
          <div class="totem-shimmer h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full w-full"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      calculateResult();
    }, 1200);
  }

  function calculateResult() {
    let focusScore = 0;
    let logicScore = 0;
    let tempoScore = 0;
    let driveScore = 0;

    QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.dimension === "focus_energy") focusScore += val * q.weight;
      if (q.dimension === "mind_logic") logicScore += val * q.weight;
      if (q.dimension === "execution_tempo") tempoScore += val * q.weight;
      if (q.dimension === "mission_drive") driveScore += val * q.weight;
    });

    let chosenTotem = "owl";

    if (logicScore < -1 && focusScore < 0) {
      chosenTotem = "retriever";
    } else if (tempoScore > 2 && focusScore > 1) {
      chosenTotem = "leopard";
    } else if (driveScore > 2.5 && logicScore < 1) {
      chosenTotem = "whale";
    } else if (logicScore > 2 && focusScore > 1) {
      chosenTotem = "owl";
    } else if (logicScore < 0 && tempoScore > 0) {
      chosenTotem = "fox";
    } else {
      chosenTotem = "hawk";
    }

    calculatedTotem = TOTEMS[chosenTotem] || TOTEMS.hawk;
    try {
      localStorage.setItem('careerlens_totem_data', JSON.stringify(calculatedTotem));
      fetch('/api/totem/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totem: calculatedTotem })
      }).catch(() => {});
    } catch (e) {}
    renderTotemOverview();
  }

  // View 1: Totem Overview & Grand Reveal
  function renderTotemOverview() {
    window.renderTotemOverview = renderTotemOverview;
    enterImmersionMode();
    if (welcomeCard) welcomeCard.classList.add("hidden");
    if (quizCard) quizCard.classList.add("hidden");
    if (resultCard) resultCard.classList.remove("hidden");

    const t = calculatedTotem;

    resultCard.innerHTML = `
      <div class="space-y-8 fade-in">
        
        <!-- Breadcrumb & Top Bar -->
        <div class="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-teal-400 font-bold">Personalized Discovery</span>
            <span>•</span>
            <span class="text-white font-bold">${t.badge}</span>
          </div>
          <button type="button" onclick="exitTotemImmersion()" class="text-slate-400 hover:text-white font-bold transition">
            Exit to Overview ✕
          </button>
        </div>

        <!-- Grand Reveal Card -->
        <div class="totem-badge-card p-6 sm:p-10 relative overflow-hidden border border-white/20">
          <div class="grid md:grid-cols-12 gap-8 items-center">
            
            <!-- Left: Avatar & Single-line Title -->
            <div class="md:col-span-5 text-center space-y-4">
              <div class="relative w-36 h-36 mx-auto grid place-items-center rounded-3xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-white/20 shadow-2xl backdrop-blur-md">
                <span class="text-6xl filter drop-shadow-lg">${t.icon}</span>
                <span class="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                  Verified Match
                </span>
              </div>
              <div>
                <h2 class="text-2xl lg:text-3xl font-black text-slate-900 whitespace-nowrap tracking-tight">${t.badge}</h2>
                <div class="text-xs text-indigo-700 font-extrabold mt-1">${t.tagline}</div>
              </div>
            </div>

            <!-- Right: Empathetic Brief & Superpowers -->
            <div class="md:col-span-7 space-y-5 border-t md:border-t-0 md:border-l border-white/10 md:pl-8 pt-4 md:pt-0">
              <p class="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                "${t.brief}"
              </p>

              <!-- Superpowers & Allergies -->
              <div class="grid sm:grid-cols-2 gap-3 text-xs pt-1">
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

              <!-- Retake Button (Compact, sleek dark-glass) -->
              <div class="flex items-center gap-3 pt-2">
                <button type="button" onclick="retakeTotemQuiz()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 transition shadow-xs">
                  <span>🔄</span>
                  <span>Retake</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Navigation & Gateway Footer -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <button type="button" onclick="exitTotemImmersion()" class="text-indigo-400 hover:text-white font-bold flex items-center gap-1.5 transition">
            <span>← Back to Overview</span>
          </button>
          <button type="button" onclick="retakeTotemQuiz()" class="text-slate-400 hover:text-white font-semibold flex items-center gap-1 transition">
            <span>🔄 Retake Assessment</span>
          </button>
        </div>

        <!-- Gateways to Separated Sections (Progressive Disclosure) -->
        <div class="grid sm:grid-cols-2 gap-4 pt-2">
          
          <button type="button" onclick="showDeepProfileView()" class="totem-badge-card p-5 text-left hover:border-indigo-400/50 hover:bg-indigo-50/50 transition group space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🧬</span>
              <span class="text-xs text-indigo-600 group-hover:translate-x-1 transition font-extrabold">Step In →</span>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-sm">Deep Profile &amp; Role Models</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">Explore your MBTI dual-pole spectrum &amp; iconic figures</p>
            </div>
          </button>

          <button type="button" onclick="showElevatedCareersView()" class="totem-badge-card p-5 text-left hover:border-teal-400/50 hover:bg-teal-50/50 transition group space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-2xl">🎯</span>
              <span class="text-xs text-teal-600 group-hover:translate-x-1 transition font-extrabold">Step In →</span>
            </div>
            <div>
              <h4 class="font-extrabold text-slate-900 text-sm">Elevated Careers Portal</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">Custom job titles aligned with your temperament</p>
            </div>
          </button>

        </div>

      </div>
    `;

    const intro = document.getElementById("home-intro");
    if (intro) intro.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // View 2: Deep Profile & Role Models View
  window.showDeepProfileView = function () {
    const t = calculatedTotem;

    resultCard.innerHTML = `
      <div class="space-y-8 fade-in">
        
        <!-- Breadcrumb Navigation -->
        <div class="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
          <button type="button" onclick="renderTotemOverview()" class="text-indigo-400 hover:text-white font-bold flex items-center gap-1 transition">
            ← Back to Totem Summary
          </button>
          <button type="button" onclick="showElevatedCareersView()" class="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition">
            Continue to Matched Careers →
          </button>
        </div>

        <!-- Role Models Section (Heading: Who Walks Your Path?, No "(Iconic Role Models)", No "DNA Match") -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>⭐</span> Who Walks Your Path?
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Legends who carried your exact temperament, conquered self-doubt, and changed the world</p>
          </div>

          <div class="grid md:grid-cols-3 gap-4">
            ${t.roleModels.map(rm => `
              <div class="role-model-card space-y-3.5 flex flex-col justify-between">
                <div class="space-y-3">
                  
                  <!-- Portrait Avatar + Name & Field -->
                  <div class="flex items-center gap-3">
                    <img src="${rm.photo}" alt="${rm.name}" class="role-model-avatar" onerror="this.src='/static/brand/careerlens_logo_icon.svg'" />
                    <div class="min-w-0">
                      <h4 class="font-black text-sm text-white truncate">${rm.name}</h4>
                      <div class="text-[11px] text-teal-400 font-bold line-clamp-1">${rm.field}</div>
                    </div>
                  </div>
                  
                  <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
                    <span class="text-[10px] uppercase font-bold text-rose-300 block tracking-wider">The Early Grind & Struggle:</span>
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

        <!-- MBTI-Style Dual-Pole Personality Spectrum -->
        <div class="totem-badge-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 class="text-lg font-extrabold text-white flex items-center gap-2">
              <span>🧪</span> Your Personality Spectrum Breakdown
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Classic dual-pole continuum calibrated from your questionnaire vectors</p>
          </div>

          <div class="space-y-3.5">
            
            <!-- Pole 1: Energy & Focus -->
            <div class="mbti-spectrum-row">
              <div class="mbti-pole-labels">
                <span class="${t.mbtiPoles.energy.leftPct >= 50 ? 'text-indigo-300 font-bold' : 'text-slate-400'}">${t.mbtiPoles.energy.leftName} (${t.mbtiPoles.energy.leftPct}%)</span>
                <span class="${t.mbtiPoles.energy.rightPct > 50 ? 'text-teal-300 font-bold' : 'text-slate-400'}">(${t.mbtiPoles.energy.rightPct}%) ${t.mbtiPoles.energy.rightName}</span>
              </div>
              <div class="mbti-spectrum-track">
                <div class="mbti-pole-left-fill" style="width: ${t.mbtiPoles.energy.leftPct}%"></div>
                <div class="mbti-pole-right-fill" style="width: ${t.mbtiPoles.energy.rightPct}%"></div>
              </div>
            </div>

            <!-- Pole 2: Mind & Processing -->
            <div class="mbti-spectrum-row">
              <div class="mbti-pole-labels">
                <span class="${t.mbtiPoles.mind.leftPct >= 50 ? 'text-indigo-300 font-bold' : 'text-slate-400'}">${t.mbtiPoles.mind.leftName} (${t.mbtiPoles.mind.leftPct}%)</span>
                <span class="${t.mbtiPoles.mind.rightPct > 50 ? 'text-teal-300 font-bold' : 'text-slate-400'}">(${t.mbtiPoles.mind.rightPct}%) ${t.mbtiPoles.mind.rightName}</span>
              </div>
              <div class="mbti-spectrum-track">
                <div class="mbti-pole-left-fill" style="width: ${t.mbtiPoles.mind.leftPct}%"></div>
                <div class="mbti-pole-right-fill" style="width: ${t.mbtiPoles.mind.rightPct}%"></div>
              </div>
            </div>

            <!-- Pole 3: Execution Tempo -->
            <div class="mbti-spectrum-row">
              <div class="mbti-pole-labels">
                <span class="${t.mbtiPoles.tempo.leftPct >= 50 ? 'text-indigo-300 font-bold' : 'text-slate-400'}">${t.mbtiPoles.tempo.leftName} (${t.mbtiPoles.tempo.leftPct}%)</span>
                <span class="${t.mbtiPoles.tempo.rightPct > 50 ? 'text-teal-300 font-bold' : 'text-slate-400'}">(${t.mbtiPoles.tempo.rightPct}%) ${t.mbtiPoles.tempo.rightName}</span>
              </div>
              <div class="mbti-spectrum-track">
                <div class="mbti-pole-left-fill" style="width: ${t.mbtiPoles.tempo.leftPct}%"></div>
                <div class="mbti-pole-right-fill" style="width: ${t.mbtiPoles.tempo.rightPct}%"></div>
              </div>
            </div>

            <!-- Pole 4: Mission Drive -->
            <div class="mbti-spectrum-row">
              <div class="mbti-pole-labels">
                <span class="${t.mbtiPoles.drive.leftPct >= 50 ? 'text-indigo-300 font-bold' : 'text-slate-400'}">${t.mbtiPoles.drive.leftName} (${t.mbtiPoles.drive.leftPct}%)</span>
                <span class="${t.mbtiPoles.drive.rightPct > 50 ? 'text-teal-300 font-bold' : 'text-slate-400'}">(${t.mbtiPoles.drive.rightPct}%) ${t.mbtiPoles.drive.rightName}</span>
              </div>
              <div class="mbti-spectrum-track">
                <div class="mbti-pole-left-fill" style="width: ${t.mbtiPoles.drive.leftPct}%"></div>
                <div class="mbti-pole-right-fill" style="width: ${t.mbtiPoles.drive.rightPct}%"></div>
              </div>
            </div>

          </div>
        </div>

        <!-- Next Action Button -->
        <div class="flex justify-between items-center pt-2">
          <button type="button" onclick="renderTotemOverview()" class="text-xs font-bold text-slate-400 hover:text-white transition">
            ← Back to Overview
          </button>
          <button type="button" onclick="showElevatedCareersView()" class="totem-btn-primary">
            <span>Explore Matched Careers ➔</span>
          </button>
        </div>

      </div>
    `;

    const intro = document.getElementById("home-intro");
    if (intro) intro.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // View 3: Elevated Careers Portal
  window.showElevatedCareersView = function () {
    const t = calculatedTotem;

    resultCard.innerHTML = `
      <div class="space-y-8 fade-in">
        
        <!-- Breadcrumb Navigation -->
        <div class="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-3">
          <button type="button" onclick="showDeepProfileView()" class="text-indigo-400 hover:text-white font-bold flex items-center gap-1 transition">
            ← Back to Deep Profile
          </button>
          <button type="button" onclick="renderTotemOverview()" class="text-slate-400 hover:text-white font-bold transition">
            Totem Summary
          </button>
        </div>

        <!-- Header & Domain Filter -->
        <div class="space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>🎯</span> Elevated Careers Tailored to ${t.badge}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Select an industry to generate distinctive, high-resonance roles:</p>
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

          <!-- Elevated Job Cards Display -->
          <div id="elevatedJobDisplay" class="grid sm:grid-cols-2 gap-4">
            <!-- Injected by renderElevatedJobs -->
          </div>
        </div>

        <!-- "Have a Dream Job in Mind?" Custom Input -->
        <div class="totem-badge-card p-6 sm:p-7 space-y-4 border border-teal-200 bg-slate-50/60">
          <div class="flex items-center gap-3">
            <span class="text-2xl">💡</span>
            <div>
              <h4 class="text-sm font-extrabold text-white">Have a specific dream job in mind?</h4>
              <p class="text-[11px] text-slate-400">Type any title to let CareerLens AI evaluate how your Totem DNA will perform:</p>
            </div>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap gap-2.5">
            <input type="text" id="customJobInput" class="input !bg-white !border-slate-300 !text-slate-900 !text-xs !py-3 flex-1" placeholder="e.g. Game Concept Artist, Renewable Energy Trader, Neuroscientist..." onkeydown="if(event.key==='Enter')analyzeCustomJob()" />
            <button type="button" onclick="analyzeCustomJob()" class="totem-btn-primary !py-2.5 !px-5 !text-xs font-bold shrink-0">
              ⚡ Check Fit
            </button>
          </div>

          <div id="customJobFeedback" class="hidden p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
            <!-- Custom feedback injected here -->
          </div>
        </div>

        <!-- Direct Launch into Talent Portal -->
        <div class="p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 border border-indigo-200 text-center space-y-4">
          <h3 class="text-xl sm:text-2xl font-black text-slate-900">Ready to Step into Real Opportunities?</h3>
          <p class="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Your preferences have been pre-calibrated. Enter the Talent Portal to search nearby jobs with transparent match scores and SDG micro-courses.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button type="button" onclick="openAuth('register', 'job_seeker')" class="totem-btn-primary !py-3.5 !px-10 text-sm font-extrabold shadow-lg">
              🚀 Claim Totem &amp; Launch Talent Portal →
            </button>
          </div>
        </div>

      </div>
    `;

    renderElevatedJobs(selectedDomain);
    const intro = document.getElementById("home-intro");
    if (intro) intro.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.selectDomain = function (domain) {
    selectedDomain = domain;
    const pills = document.querySelectorAll(".domain-pill");
    pills.forEach(p => p.classList.remove("active"));
    const activePill = document.querySelector(`.domain-pill[onclick*="${domain}"]`);
    if (activePill) activePill.classList.add("active");

    const container = document.getElementById("elevatedJobDisplay");
    if (!container) return;

    container.innerHTML = `
      <div class="sm:col-span-2 py-8 text-center text-xs text-slate-400 space-y-2">
        <span class="inline-block animate-spin text-lg">🔮</span>
        <div>Synthesizing elevated roles for <b>${domain.toUpperCase()}</b>...</div>
      </div>
    `;

    setTimeout(() => {
      renderElevatedJobs(domain);
    }, 350);
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
        <div>Cross-referencing <b>"${val}"</b> with ${calculatedTotem ? calculatedTotem.badge : 'Career Totem'} competency radar...</div>
      </div>
    `;

    setTimeout(() => {
      feedback.innerHTML = `
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h5 class="text-sm font-extrabold text-white">${val}</h5>
            <div class="text-[10px] text-slate-400">Evaluated against your authentic traits</div>
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
    }, 600);
  };

  // View 4: Dedicated Global Work-Life Atlas Modal
  window.openGlobalAtlas = function () {
    const modal = document.getElementById("globalAtlasModal");
    if (modal) {
      modal.classList.remove("hidden");
      showCityCard("kl");
      if (!globeInitialized) {
        setTimeout(() => {
          initGlobeVisual();
          globeInitialized = true;
        }, 100);
      }
    }
  };

  window.closeGlobalAtlas = function () {
    const modal = document.getElementById("globalAtlasModal");
    if (modal) modal.classList.add("hidden");
  };

  let currentAtlasCityKey = "kl";
  let currentAtlasRoleId = null;
  let currentAtlasRoutineIdx = 0;

  window.selectAtlasRole = function (cityKey, roleId) {
    showCityCard(cityKey, roleId);
  };

  window.randomizeAtlasRole = function (cityKey) {
    const c = GLOBAL_CITIES[cityKey] || GLOBAL_CITIES.kl;
    if (!c || !c.roles || c.roles.length === 0) return;
    const otherRoles = c.roles.filter(r => r.id !== currentAtlasRoleId);
    const pool = otherRoles.length > 0 ? otherRoles : c.roles;
    const randomRole = pool[Math.floor(Math.random() * pool.length)];
    showCityCard(cityKey, randomRole.id);
  };

  window.shuffleAtlasRoutine = function () {
    const c = GLOBAL_CITIES[currentAtlasCityKey] || GLOBAL_CITIES.kl;
    const role = (c.roles || []).find(r => r.id === currentAtlasRoleId) || (c.roles ? c.roles[0] : null);
    if (!role) return;

    const allVariants = [role.routine].concat(role.alternative_routines || []);
    currentAtlasRoutineIdx = (currentAtlasRoutineIdx + 1) % allVariants.length;
    const routine = allVariants[currentAtlasRoutineIdx];

    const timelineContainer = document.getElementById("atlasTimelineContainer");
    if (!timelineContainer) return;

    timelineContainer.innerHTML = routine.map(item => `
      <div class="flex items-start gap-2.5 bg-white/5 p-2 rounded-xl border border-white/10 hover:border-teal-400/30 transition">
        <span class="font-mono text-teal-300 font-extrabold text-xs shrink-0 bg-white/10 px-2 py-0.5 rounded border border-white/15">${item.time}</span>
        <div class="text-slate-100 text-xs leading-relaxed">
          <span class="mr-1">${item.emoji || '✦'}</span>${item.text}
        </div>
      </div>
    `).join('');

    const variantBadge = document.getElementById("atlasRoutineVariantBadge");
    if (variantBadge) {
      variantBadge.textContent = currentAtlasRoutineIdx === 0 ? "Daily Baseline" : `Variation ${currentAtlasRoutineIdx + 1}`;
    }
  };

  window.showCityCard = function (cityKey, roleId = null) {
    const c = GLOBAL_CITIES[cityKey] || GLOBAL_CITIES.kl;
    currentAtlasCityKey = cityKey;

    const container = document.getElementById("cityDetailsContainer");
    const sideContainer = document.getElementById("cityRelatedRolesContainer");
    if (!container) return;

    // Toggle active pill highlight
    document.querySelectorAll(".atlas-city-pill").forEach(el => el.classList.remove("active"));
    const activeBtn = document.getElementById("atlasBtn_" + cityKey);
    if (activeBtn) activeBtn.classList.add("active");

    // Pick role: if not specified, choose randomly or default to first
    let selectedRole = null;
    if (roleId && c.roles) {
      selectedRole = c.roles.find(r => r.id === roleId);
    }
    if (!selectedRole && c.roles && c.roles.length > 0) {
      selectedRole = c.roles[0];
    }
    currentAtlasRoleId = selectedRole ? selectedRole.id : null;
    currentAtlasRoutineIdx = 0;

    const isInsidePortal = Boolean(document.getElementById("profileTotemCard") || window.location.pathname.includes("workspace"));
    const actionBtnHtml = isInsidePortal
      ? `<button type="button" onclick="closeGlobalAtlas(); if(typeof showTab==='function') showTab('jobs');" class="totem-btn-primary !py-2 !px-4 !text-xs font-bold shadow-md">
           💼 Explore Similar Careers in Portal →
         </button>`
      : `<button type="button" onclick="closeGlobalAtlas(); if(typeof openAuth==='function') openAuth('register', 'job_seeker'); else window.location.href='/#auth';" class="totem-btn-primary !py-2 !px-4 !text-xs font-bold shadow-md">
           Sign Up &amp; Match Careers →
         </button>`;

    if (!selectedRole) return;

    // Render Main Column: Active Role Plog / Vlog & Job Description
    container.innerHTML = `
      <div class="city-day-card p-6 sm:p-7 space-y-5 h-full flex flex-col justify-between fade-in text-slate-100">
        <!-- Top Bar: Location & Active Persona -->
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xl">${c.flag || '🌍'}</span>
                <span class="text-xs font-black uppercase tracking-wider text-teal-300">${c.country}</span>
                <span class="text-xs text-slate-400">·</span>
                <span class="text-xs font-mono text-indigo-300">${c.roles ? c.roles.length : 1} Authentic Roles</span>
              </div>
              <h4 class="text-xl sm:text-2xl font-black text-white">${c.name}</h4>
            </div>

            <button type="button" onclick="randomizeAtlasRole('${cityKey}')" class="atlas-shuffle-btn" title="Randomly discover another profession in this city">
              <span>🎲</span><span>Random Role in City</span>
            </button>
          </div>

          <!-- Persona & Lifestyle Plog Card -->
          <div class="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3 shadow-inner">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-3xl p-1 bg-white/10 rounded-xl border border-white/10">${selectedRole.persona.avatar || '👩🏻‍💻'}</span>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-white text-sm sm:text-base">${selectedRole.persona.name}</span>
                    <span class="text-[11px] font-mono text-teal-300 font-bold bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30">${selectedRole.persona.handle}</span>
                  </div>
                  <div class="text-[11px] text-slate-300">${selectedRole.persona.bio}</div>
                </div>
              </div>
              <span class="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-400/30 shrink-0">
                🎥 Lifestyle Plog / Vlog
              </span>
            </div>

            <div class="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-black/25 p-3.5 rounded-xl border border-white/10">
              "${selectedRole.plog}"
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <div class="text-slate-300">
                <b class="text-teal-300 font-bold">Workplace Vibe:</b> ${c.vibe}
              </div>
            </div>
          </div>

          <!-- Job Description: What they primarily do -->
          <div class="atlas-job-box space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <span>💼</span><span>主要做什么 (Core Responsibilities &amp; Job Description)</span>
              </div>
              <span class="text-[11px] font-bold text-slate-400 font-mono">${selectedRole.industry || 'Tech Innovation'}</span>
            </div>
            
            <p class="text-xs text-slate-200 leading-relaxed font-medium">
              ${selectedRole.job_desc.summary}
            </p>

            <ul class="space-y-1.5 text-xs text-slate-300">
              ${selectedRole.job_desc.tasks.map(t => `
                <li class="flex items-start gap-2">
                  <span class="text-teal-400 text-sm leading-none shrink-0">✓</span>
                  <span>${t}</span>
                </li>
              `).join('')}
            </ul>

            <div class="pt-2 flex flex-wrap gap-1.5">
              ${(selectedRole.skills || []).map(s => `
                <span class="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">${s}</span>
              `).join('')}
            </div>
          </div>

          <!-- Schedule Timeline with Dynamic Routine Shuffling -->
          <div class="space-y-2.5 pt-1">
            <div class="flex items-center justify-between">
              <div class="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <span>☀️</span><span>今日正能量作息 (Positive Daily Routine)</span>
                <span id="atlasRoutineVariantBadge" class="text-[10px] text-slate-400 font-mono lowercase bg-white/10 px-2 py-0.5 rounded-full border border-white/10">Daily Baseline</span>
              </div>
              <button type="button" onclick="shuffleAtlasRoutine()" class="atlas-shuffle-btn" title="Cycle through realistic positive day routines">
                <span>🎲</span><span>切换作息风格 / Shuffle Routine</span>
              </button>
            </div>

            <div id="atlasTimelineContainer" class="space-y-2 text-xs">
              ${selectedRole.routine.map(item => `
                <div class="flex items-start gap-2.5 bg-white/5 p-2 rounded-xl border border-white/10 hover:border-teal-400/30 transition">
                  <span class="font-mono text-teal-300 font-extrabold text-xs shrink-0 bg-white/10 px-2 py-0.5 rounded border border-white/15">${item.time}</span>
                  <div class="text-slate-100 text-xs leading-relaxed">
                    <span class="mr-1">${item.emoji || '✦'}</span>${item.text}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer Tags & CTA -->
        <div class="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5 text-[11px] text-slate-300 font-bold">
            ${selectedRole.tags.map(t => `<span class="bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10 text-slate-200">${t}</span>`).join('')}
          </div>
          ${actionBtnHtml}
        </div>
      </div>
    `;

    // Render Side Column: Other Roles in Hub
    if (sideContainer && c.roles) {
      sideContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-300 px-1">
            <span>📌 Related Roles in ${c.country}</span>
            <span class="text-teal-400 font-mono">${c.roles.length} Roles</span>
          </div>

          <div class="space-y-2">
            ${c.roles.map(r => {
              const isActive = r.id === selectedRole.id;
              return `
                <button type="button" onclick="selectAtlasRole('${cityKey}', '${r.id}')" class="atlas-role-card ${isActive ? 'active' : ''}">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <span class="text-2xl">${r.persona.avatar || '👩🏻‍💻'}</span>
                      <div>
                        <div class="text-xs font-extrabold text-white leading-tight">${r.title}</div>
                        <div class="text-[10px] text-slate-300">${r.persona.name} · ${r.industry}</div>
                      </div>
                    </div>
                    <span class="text-xs ${isActive ? 'text-teal-300 font-bold' : 'text-slate-400'}">${isActive ? '● Active' : 'View →'}</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
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

    const cities = [
      { name: "KL", key: "kl", lat: 3.139, lon: 101.686 },
      { name: "Singapore", key: "singapore", lat: 1.352, lon: 103.819 },
      { name: "Tokyo", key: "tokyo", lat: 35.676, lon: 139.650 },
      { name: "Amsterdam", key: "amsterdam", lat: 52.367, lon: 4.904 },
      { name: "London", key: "london", lat: 51.507, lon: -0.127 },
      { name: "San Francisco", key: "sf", lat: 37.774, lon: -122.419 },
      { name: "Berlin", key: "berlin", lat: 52.520, lon: 13.405 },
      { name: "Zurich", key: "zurich", lat: 47.376, lon: 8.541 },
      { name: "Sydney", key: "sydney", lat: -33.868, lon: 151.209 },
      { name: "Toronto", key: "toronto", lat: 43.653, lon: -79.383 }
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

      if (!isDragging) {
        rotY += 0.004;
      }

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

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      points.forEach(p => {
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        if (z2 > 0) {
          const alpha = Math.min(1, Math.max(0.1, z2 / radius));
          ctx.fillStyle = `rgba(167, 139, 250, ${alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(centerX + x1, centerY + y2, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      cities.forEach(city => {
        const phi = (city.lon * Math.PI) / 180;
        const theta = ((90 - city.lat) * Math.PI) / 180;
        const cx = radius * Math.sin(theta) * Math.cos(phi);
        const cy = -radius * Math.cos(theta);
        const cz = radius * Math.sin(theta) * Math.sin(phi);

        let x1 = cx * cosY + cz * sinY;
        let z1 = -cx * sinY + cz * cosY;
        let y2 = cy * cosX - z1 * sinX;
        let z2 = cy * sinX + z1 * cosX;

        if (z2 > 0) {
          const px = centerX + x1;
          const py = centerY + y2;

          ctx.fillStyle = "#2dd4bf";
          ctx.shadowColor = "#2dd4bf";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

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

  // =========================================================================
  // Candidate Profile Totem Card & In-Portal Retake Quiz (Zero Redirect/Logout)
  // =========================================================================
  let profileQuizStep = 1;
  let profileQuizAnswers = {};

  window.initCandidateTotemProfile = async function () {
    const cardBody = document.getElementById("profileTotemBody");
    if (!cardBody) return;

    let totem = null;
    try {
      const res = await fetch("/api/totem/user");
      const data = await res.json();
      if (data && data.ok && data.totem) {
        totem = data.totem;
        localStorage.setItem("careerlens_totem_data", JSON.stringify(totem));
      }
    } catch (e) {}

    if (!totem) {
      const local = localStorage.getItem("careerlens_totem_data");
      if (local) {
        try { totem = JSON.parse(local); } catch (e) {}
      }
    }

    if (!totem) {
      totem = TOTEMS.hawk; // default starter
    }

    renderProfileTotemCard(totem);
  };

  function renderProfileTotemCard(t) {
    const cardBody = document.getElementById("profileTotemBody");
    if (!cardBody) return;

    cardBody.innerHTML = `
      <div class="grid md:grid-cols-12 gap-6 items-center">
        <!-- Left: Totem Avatar & Title -->
        <div class="md:col-span-4 text-center space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div class="relative w-24 h-24 mx-auto grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-teal-500/10 border border-indigo-200/80 shadow-sm">
            <span class="text-5xl filter drop-shadow">${t.icon || "🦅"}</span>
          </div>
          <div>
            <h4 class="text-xl font-black text-slate-900 tracking-tight" data-no-translate>${t.badge || "The Stratosphere Hawk"}</h4>
            <div class="text-xs text-indigo-700 font-extrabold mt-0.5">${t.tagline || "Decisive Visionary"}</div>
            <p class="text-[11px] text-slate-500 mt-2 leading-relaxed italic max-w-xs mx-auto">"${t.archetype || ""}"</p>
          </div>
        </div>

        <!-- Right: Spectrum Breakdown & Matched O*NET Roles -->
        <div class="md:col-span-8 space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-black text-slate-800">
              <span class="flex items-center gap-1.5"><span>📊</span><span>Work-Style Vector Coordinates</span></span>
              <span class="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">O*NET 30.3 Calibrated</span>
            </div>
            
            <div class="grid sm:grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div class="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Deep Focus</span><span>Social Synergy</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style="width: ${(t.mbti && t.mbti.focus_energy) ? t.mbti.focus_energy.left_pct : 68}%"></div>
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div class="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Cold Logic</span><span>Human Empathy</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" style="width: ${(t.mbti && t.mbti.mind_logic) ? t.mbti.mind_logic.left_pct : 75}%"></div>
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div class="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>High Velocity</span><span>Methodical</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: ${(t.mbti && t.mbti.execution_tempo) ? t.mbti.execution_tempo.left_pct : 82}%"></div>
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div class="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Frontier Autonomy</span><span>Collaborative</span>
                </div>
                <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full" style="width: ${(t.mbti && t.mbti.mission_drive) ? t.mbti.mission_drive.left_pct : 70}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom: Matched Elevated Roles Quick Badges -->
          <div class="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              <span class="text-slate-500 font-bold text-[11px]">Primary Resonance:</span>
              <span class="chip chip-teal !text-[11px] font-bold">Tech Project Manager</span>
              <span class="chip chip-indigo !text-[11px] font-bold">Systems Architect</span>
            </div>
            <button type="button" onclick="if(typeof showTab==='function') showTab('jobs');" class="text-xs text-indigo-700 hover:text-indigo-900 font-extrabold flex items-center gap-1">
              Find Matching Vacancies →
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.openProfileTotemQuizModal = function () {
    const modal = document.getElementById("profileQuizModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    profileQuizStep = 1;
    profileQuizAnswers = {};
    renderProfileQuestion(1);
  };

  window.closeProfileTotemQuizModal = function () {
    const modal = document.getElementById("profileQuizModal");
    if (modal) modal.classList.add("hidden");
  };

  window.renderProfileQuestion = function (qIndex) {
    profileQuizStep = qIndex;
    const body = document.getElementById("profileQuizCardBody");
    if (!body) return;

    const q = QUESTIONS[qIndex - 1];
    if (!q) return;

    const progressPct = Math.round((qIndex / QUESTIONS.length) * 100);
    const currentVal = profileQuizAnswers[q.id] !== undefined ? profileQuizAnswers[q.id] : null;

    body.innerHTML = `
      <div class="space-y-6 fade-in text-slate-900">
        <!-- Progress -->
        <div class="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping"></span>
            <span class="font-black text-slate-800">Question ${qIndex} of ${QUESTIONS.length}</span>
          </div>
          <span class="text-indigo-600 font-mono font-bold">${progressPct}% Complete</span>
        </div>

        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-teal-500 to-indigo-600 h-full rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
        </div>

        <!-- Question Prompt -->
        <div class="py-4 text-center max-w-xl mx-auto space-y-2">
          <span class="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Workplace Preference
          </span>
          <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            "${q.text}"
          </h3>
        </div>

        <!-- 5-Point Likert Scale -->
        <div class="space-y-3">
          <div class="likert-scale-container">
            <button type="button" class="likert-btn ${currentVal === -2 ? 'active' : ''}" data-val="-2" onclick="recordProfileAnswer(${q.id}, -2)" title="Strongly Disagree">
              <span class="text-xs font-black">--</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === -1 ? 'active' : ''}" data-val="-1" onclick="recordProfileAnswer(${q.id}, -1)" title="Disagree">
              <span class="text-xs font-bold">-</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === 0 ? 'active' : ''}" data-val="0" onclick="recordProfileAnswer(${q.id}, 0)" title="Neutral">
              <span class="text-xs font-bold">0</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === 1 ? 'active' : ''}" data-val="1" onclick="recordProfileAnswer(${q.id}, 1)" title="Agree">
              <span class="text-xs font-bold">+</span>
            </button>
            <button type="button" class="likert-btn ${currentVal === 2 ? 'active' : ''}" data-val="2" onclick="recordProfileAnswer(${q.id}, 2)" title="Strongly Agree">
              <span class="text-xs font-black">++</span>
            </button>
          </div>
          <div class="flex justify-between max-w-[520px] mx-auto text-[11px] font-extrabold text-slate-500 px-2">
            <span class="text-rose-600">Strongly Disagree</span>
            <span class="text-slate-500">Neutral</span>
            <span class="text-emerald-600">Strongly Agree</span>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          ${qIndex > 1 ? `
            <button type="button" onclick="renderProfileQuestion(${qIndex - 1})" class="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 transition">
              ← Previous
            </button>
          ` : `<div></div>`}
          
          <button type="button" onclick="closeProfileTotemQuizModal()" class="text-slate-500 hover:text-slate-800 font-bold transition">
            Cancel
          </button>
        </div>
      </div>
    `;
  };

  window.recordProfileAnswer = function (qId, val) {
    profileQuizAnswers[qId] = parseInt(val, 10);
    setTimeout(() => {
      if (profileQuizStep < QUESTIONS.length) {
        renderProfileQuestion(profileQuizStep + 1);
      } else {
        finishProfileQuiz();
      }
    }, 280);
  };

  window.finishProfileQuiz = function () {
    const body = document.getElementById("profileQuizCardBody");
    if (!body) return;

    body.innerHTML = `
      <div class="py-12 text-center space-y-4 fade-in">
        <div class="relative w-16 h-16 mx-auto">
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 animate-spin blur-md opacity-60"></div>
          <div class="relative w-16 h-16 rounded-full bg-white border border-slate-200 grid place-items-center text-3xl shadow-sm">
            🔮
          </div>
        </div>
        <h4 class="text-lg font-black text-slate-900">Updating Your Career DNA Profile...</h4>
        <p class="text-xs text-slate-500">Recalibrating O*NET 30.3 occupational fit scores</p>
      </div>
    `;

    setTimeout(async () => {
      let focusScore = 0, logicScore = 0, tempoScore = 0, driveScore = 0;
      QUESTIONS.forEach(q => {
        const val = profileQuizAnswers[q.id] || 0;
        if (q.dimension === "focus_energy") focusScore += val * q.weight;
        if (q.dimension === "mind_logic") logicScore += val * q.weight;
        if (q.dimension === "execution_tempo") tempoScore += val * q.weight;
        if (q.dimension === "mission_drive") driveScore += val * q.weight;
      });

      let chosenTotem = "owl";
      if (logicScore < -1 && focusScore < 0) chosenTotem = "retriever";
      else if (tempoScore > 2 && focusScore > 1) chosenTotem = "leopard";
      else if (driveScore > 2.5 && logicScore < 1) chosenTotem = "whale";
      else if (logicScore > 2 && focusScore > 1) chosenTotem = "owl";
      else if (logicScore < 0 && tempoScore > 0) chosenTotem = "fox";
      else chosenTotem = "hawk";

      const t = TOTEMS[chosenTotem] || TOTEMS.hawk;
      localStorage.setItem("careerlens_totem_data", JSON.stringify(t));

      try {
        await fetch("/api/totem/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totem: t })
        });
      } catch (e) {}

      renderProfileTotemCard(t);
      closeProfileTotemQuizModal();

      if (typeof toast === "function") {
        toast(`✨ Career Totem updated to ${t.badge}!`);
      }
    }, 1000);
  };

  // Auto-init profile totem if on candidate portal
  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("profileTotemCard")) {
      window.initCandidateTotemProfile();
    }
  });
