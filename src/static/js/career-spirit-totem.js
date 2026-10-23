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
      text: "You feel noticeably more productive working quietly from home than in a bustling office.",
      dimension: "focus_energy", // + = Deep Focus / Solo, - = Social Synergy
      weight: 1.3
    },
    {
      id: 2,
      text: "You prefer keeping work relationships purely professional rather than making close personal friends.",
      dimension: "focus_energy", // + = Independent Boundary, - = Social Bonding
      weight: 1.0
    },
    {
      id: 3,
      text: "You enjoy solving complex logic problems on your own more than joining big group discussions.",
      dimension: "mind_logic", // + = Cold Logic & Data, - = Empathy & Intuition
      weight: 1.4
    },
    {
      id: 4,
      text: "You feel excited rather than nervous when given a project with no fixed rules or instructions.",
      dimension: "execution_tempo", // + = Agile & Autonomous, - = Orderly & Structured
      weight: 1.3
    },
    {
      id: 5,
      text: "You quickly notice when a teammate feels stressed and naturally step in to help them.",
      dimension: "mind_logic", // - = Empathy & Human Touch, + = Cold Logic
      weight: 1.4
    },
    {
      id: 6,
      text: "You prefer launching a quick first draft today over spending weeks making it perfect.",
      dimension: "execution_tempo", // + = Agile & Autonomous, - = Orderly & Structured
      weight: 1.1
    },
    {
      id: 7,
      text: "Doing the exact same routine tasks every day drains your energy very quickly.",
      dimension: "mission_drive", // + = Pioneering Impact, - = Craft Mastery
      weight: 1.2
    },
    {
      id: 8,
      text: "In a team debate, getting to the honest truth matters more to you than pleasing everyone.",
      dimension: "mind_logic", // + = Cold Logic, - = Empathy & Harmony
      weight: 1.3
    },
    {
      id: 9,
      text: "You want your everyday work to make a positive difference in the world, not just make money.",
      dimension: "mission_drive", // + = Pioneering Impact, - = Traditional Corporate
      weight: 1.5
    },
    {
      id: 10,
      text: "After a busy week, you recharge best with quiet solo time rather than going to a party.",
      dimension: "focus_energy", // + = Deep Focus, - = Social Synergy
      weight: 1.4
    }
  ];

  // 2. Animal Totems, Archetypes, Verified Portrait URLs, and MBTI Opposing Poles
  const TOTEMS = {
    owl: {
      key: "owl",
      characterImage: "/static/illustrations/totem_characters/owl.svg",
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
      characterImage: "/static/illustrations/totem_characters/retriever.svg",
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
      characterImage: "/static/illustrations/totem_characters/leopard.svg",
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
      characterImage: "/static/illustrations/totem_characters/whale.svg",
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
      characterImage: "/static/illustrations/totem_characters/fox.svg",
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
      characterImage: "/static/illustrations/totem_characters/hawk.svg",
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
      name: "Kuala Lumpur",
      country: "Malaysia",
      flag: "🇲🇾",
      vibe: "Tropical Energy, World-Class Street Food, Rapid ASEAN Tech Growth, Flexible Hybrid",
      roles: [
        {
          id: "kl_1",
          title: "AI Cloud Solutions Architect",
          industry: "Cloud & Enterprise AI",
          persona: {
            name: "Maya Tan",
            handle: "@maya_kl_tech",
            avatar: "👩🏻‍💻",
            photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80",
            bio: "Building resilient distributed microservices & LLM pipelines across ASEAN"
          },
          skills: ["Kubernetes", "PyTorch", "GCP Vertex AI", "Terraform", "MLOps"],
          plog: "Morning sun reflecting off Exchange 106 at TRX. Grabbed iced kopi-o and freshly steamed bao before taking the automated MRT to the Cyberjaya Campus. Our morning standup focused on reducing cross-region LLM latency across Southeast Asian edge nodes. Enjoyed team banana leaf rice for lunch in Bangsar. Finished the sprint by 5:30 PM with zero production blockers, then hit the rooftop gym.",
          job_desc: {
            summary: "Architects enterprise cloud AI infrastructure and distributed LLM deployment pipelines for resilient, low-latency microservices.",
            tasks: [
              "Orchestrate multi-region Kubernetes clusters and model serving grids to support high-throughput inference",
              "Build automated CI/CD and MLOps pipelines with continuous model drift monitoring and auto-scaling",
              "Collaborate with security teams to enforce zero-trust architecture and strict data sovereignty standards"
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
            ]
          ],
          tags: ["#TRXHub", "#ZeroOvertime", "#StreetFoodHeaven", "#CloudAI"]
        },
        {
          id: "kl_2",
          title: "Islamic Fintech & Risk ML Engineer",
          industry: "Digital Banking & Ethical Finance",
          persona: {
            name: "Adam Farhan",
            handle: "@adam_fintech_my",
            avatar: "👨🏽‍💼",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80",
            bio: "Shariah-compliant ethical algorithmic credit scoring & risk intelligence"
          },
          skills: ["Python", "XGBoost", "FastAPI", "PostgreSQL", "Fairness AI"],
          plog: "Working from the Bangsar South tech enclave. Morning meeting with our Shariah advisory council to review algorithmic fairness across micro-lending models. We proved our neural risk scorer reduces bias against gig workers by 24%. Relaxing afternoon prayer and matcha latte break in the vertical indoor gardens. Left work at 5:00 PM with an uplifting feeling of real social impact.",
          job_desc: {
            summary: "Builds auditable, bias-free machine learning credit risk and fraud detection models for ethical financial platforms.",
            tasks: [
              "Develop explainable AI pipelines (SHAP/LIME) for automated credit scoring and fraud attribution",
              "Monitor algorithmic fairness across demographic groups to eliminate unintentional bias in lending",
              "Ensure full compliance with central bank AI governance frameworks and ethical lending guidelines"
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
          persona: {
            name: "Rachel Lee",
            handle: "@rachel_cv_logistics",
            avatar: "👩🏻‍🔬",
            photo: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=480&q=80",
            bio: "Deploying edge AI vision & robotics across ASEAN smart ports"
          },
          skills: ["Computer Vision", "YOLOv10", "TensorRT", "C++", "ROS2"],
          plog: "Field test at Port Klang! Watching automated cranes move in torrential rain with our AI vision running at 99.8% precision. Celebrated with fresh coconuts with the team.",
          job_desc: {
            summary: "Develops edge computer vision models and autonomous perception systems for maritime ports and warehouse automation.",
            tasks: [
              "Train and deploy high-throughput YOLO and TensorRT vision models on ruggedized edge units",
              "Integrate sensor feeds with automated guided vehicles (AGVs) and dock cranes via ROS2",
              "Benchmark vision fault-tolerance under heavy tropical downpours and adverse harbor fog"
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
      name: "Singapore",
      country: "Singapore",
      flag: "🇸🇬",
      vibe: "Futuristic Garden City, High-Efficiency Innovation, Hawker Delights, Global Finance Gateway",
      roles: [
        {
          id: "sg_1",
          title: "Quantitative AI & Algorithmic Strategist",
          industry: "Global Investment & Quantitative Research",
          persona: {
            name: "Lucas Chen",
            handle: "@lucas_sg_quant",
            avatar: "👨🏻‍💻",
            photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80",
            bio: "Reinforcement learning for multi-asset portfolio optimization at Marina Bay"
          },
          skills: ["PyTorch", "Rust", "Time-Series Transformers", "Reinforcement Learning", "Linux"],
          plog: "Brisk morning run around Marina Bay waterfront before the heat sets in. Caught the sunrise over the Singapore Flyer. Dropped by Lau Pa Sat for a fresh kopi-c. In the 38th-floor tower, we ran our agentic market simulations testing shock-resilience against sudden macroeconomic shifts. Strict company policy on zero after-hours emails means our team is fully disconnected and energized every evening.",
          job_desc: {
            summary: "Develops high-frequency time-series forecasting models and algorithmic strategies for ASEAN green bonds and ESG assets.",
            tasks: [
              "Train multi-modal market sequence transformers predicting intraday price spreads and liquidity flows",
              "Build sub-millisecond execution engines in Rust with strict risk-limit verification",
              "Coordinate with sustainable finance teams to quantify portfolio carbon intensity and transition risk"
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
          persona: {
            name: "Priya Nair",
            handle: "@priya_green_sg",
            avatar: "👩🏽‍🔬",
            photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=480&q=80",
            bio: "AI-driven liquid cooling & thermodynamic optimization in tropical climates"
          },
          skills: ["Deep Learning", "Thermodynamics ML", "IoT Telemetry", "Python", "Docker"],
          plog: "Working at our testbed in One-North Fusionopolis. Singapore is pioneering ultra-efficient data centers in hot, humid climates. Today our neural model learned to anticipate ambient tropical storms 40 minutes ahead, dynamically adjusting chilled-water cooling loops and saving 19.4% in power usage! Celebrated with iced sugarcane juice with the facilities crew.",
          job_desc: {
            summary: "Applies physics-informed neural networks to optimize tropical data center cooling and lower Power Usage Effectiveness (PUE).",
            tasks: [
              "Train predictive thermal dynamics models on real-time server airflow and chilled-water loop sensors",
              "Deploy autonomous closed-loop controllers to reduce data center power overhead during peak hours",
              "Publish energy audit reports supporting Singapore's Green Data Centre Roadmap 2030"
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
        }
      ]
    },
    tokyo: {
      name: "Tokyo",
      country: "Japan",
      flag: "🇯🇵",
      vibe: "Cyberpunk Artisan Aesthetic, Ultimate Public Safety, Respectful Flow, Neon Izakaya Evenings",
      roles: [
        {
          id: "tyo_1",
          title: "Neural Worldbuilder & Game AI Engineer",
          industry: "Interactive Entertainment & Generative Worlds",
          persona: {
            name: "Kenji Sato",
            handle: "@kenji_shibuya_vlog",
            avatar: "👨🏻‍🎨",
            photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=480&q=80",
            bio: "Procedural neural terrain & NPC behavior models in Shibuya creative studios"
          },
          skills: ["PyTorch", "Unreal Engine 5", "C++", "Diffusion Models", "GLSL Shaders"],
          plog: "Crossed Shibuya Scramble at 9:30 AM with a warm canned matcha from the vending machine. Stepped into our studio overlooking the glowing billboards. Today we previewed our real-time neural world generator: artists paint a single stroke and the AI builds lush, living moss-covered torii gates with accurate volumetric rain shaders. Finished work on time and went for yakitori with the art team under glowing lanterns in Nonbei Yokocho.",
          job_desc: {
            summary: "Builds real-time generative NPC behavioral intelligence and neural rendering shaders for next-generation interactive worlds.",
            tasks: [
              "Integrate 3D Gaussian Splatting and neural radiance fields into Unreal Engine 5 render pipelines",
              "Design hierarchical behavior trees enabling non-player characters to react authentically in real time",
              "Optimize GPU compute and shader execution to maintain steady 4K 60FPS on consumer hardware"
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
          persona: {
            name: "Aoi Miyamoto",
            handle: "@aoi_robotics_tokyo",
            avatar: "👩🏻‍💻",
            photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=80",
            bio: "Visual-motor policy learning for home & elderly assistive humanoid robots"
          },
          skills: ["ROS2", "PyTorch", "Diffusion Policy", "C++", "Tactile Sensing"],
          plog: "Field testing at our Odaiba robotics showroom. Our bipedal assistant robot successfully folded laundry and poured hot green tea without spilling a drop, using our new diffusion-based tactile policy. Seeing an elderly visitor laugh with delight as the robot handed them a handkerchief was pure magic. Cleaned up our workspace, bowed to colleagues, and caught the clean, quiet Yurikamome monorail home.",
          job_desc: {
            summary: "Develops multi-modal tactile-vision policies for high-precision dual-arm humanoid robotic manipulation in cleanroom assembly.",
            tasks: [
              "Train diffusion policies and reinforcement learning agents for micro-component grasping",
              "Bridge sim-to-real transfer gaps using physics-based domain randomization pipelines",
              "Ensure ISO 13482 collaborative robotic safety compliance with instantaneous emergency stop logic"
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
        }
      ]
    },
    seoul: {
      name: "Seoul",
      country: "South Korea",
      flag: "🇰🇷",
      vibe: "Ultra-Fast 5G Lifestyle, K-Wave Digital Innovation, 24/7 Energy, Beautiful Mountain Trails",
      roles: [
        {
          id: "sel_1",
          title: "Generative Neuro-Avatar & Virtual Human Lead",
          industry: "Digital Media & Virtual Production",
          persona: {
            name: "Min-Jun Park",
            handle: "@minjun_gangnam_ai",
            avatar: "👨🏻‍💻",
            photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&q=80",
            bio: "Real-time facial neural synthesis & multi-lingual speech synchronization in Pangyo"
          },
          skills: ["PyTorch", "Gaussian Splatting", "Audio-to-LipSync", "CUDA", "FastAPI"],
          plog: "Morning express subway from Gangnam into Pangyo Techno Valley. Picked up an iced americano — essential fuel for Korean creators. Our studio creates real-time interactive virtual idols and digital human news anchors. Today our audio-driven speech synthesis model achieved zero-latency live lip synchronization across 12 languages simultaneously! Celebrated with Korean fried chicken and sparkling cider with the dev team.",
          job_desc: {
            summary: "Develops neural audio-driven facial performance capture and real-time photorealistic 3D avatar synthesis.",
            tasks: [
              "Synthesize high-framerate 4K volumetric neural face models using 3DMM and radiance field priors",
              "Train end-to-end acoustic transformers mapping voice phonemes directly to expressive facial blendshapes",
              "Optimize on-device neural inferencing to achieve 60FPS streaming latency on mobile chipsets"
            ]
          },
          routine: [
            { time: "08:45", emoji: "☕", text: "Iced americano at Pangyo Tech Valley cafe watching bright tech workers arrive." },
            { time: "10:00", emoji: "✨", text: "Live streaming studio test: Evaluating digital human eye-contact tracking." },
            { time: "12:30", emoji: "🍲", text: "Warm sundubu-jjigae (tofu stew) and kimchi lunch with creative animators." },
            { time: "14:45", emoji: "⚡", text: "CUDA optimization: Reducing audio feature extraction latency to under 12ms." },
            { time: "18:30", emoji: "🍗", text: "Chimaek (chicken & drinks) gathering in Gangnam under neon skyscraper lights." },
            { time: "21:00", emoji: "🎧", text: "Listening to synth-pop beats while studying novel neural rendering whitepapers." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🏃", text: "Morning run along the Han River trail, feeling the cool autumn breeze." },
              { time: "09:30", emoji: "💻", text: "Fine-tuning cross-lingual phonetic boundary models for Korean and English." },
              { time: "13:00", emoji: "🍱", text: "Dolsot bibimbap lunch discussing K-content global distribution pipelines." },
              { time: "15:30", emoji: "🔬", text: "Evaluating user perceptual realism scores in our human-computer interaction lab." },
              { time: "19:00", emoji: "🧗", text: "Indoor rock climbing session in Seongsu-dong creative arts district." }
            ]
          ],
          tags: ["#PangyoValley", "#GangnamStyle", "#VirtualHumans", "#HanRiverRun"]
        },
        {
          id: "sel_2",
          title: "Semiconductor Defect Computer Vision Lead",
          industry: "Advanced Semiconductor Manufacturing",
          persona: {
            name: "Ji-Woo Kim",
            handle: "@jiwoo_ktech",
            avatar: "👩🏻‍🔬",
            photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=80",
            bio: "Sub-nanometer wafer defect inspection with vision transformers in Suwon"
          },
          skills: ["Computer Vision", "Vision Transformers", "C++", "PyTorch", "TensorRT"],
          plog: "High-tech cleanroom research center in Suwon. South Korea leads the world in cutting-edge memory and AI chip manufacturing. Today our vision transformer model detected nanometer-scale photolithography anomalies on 3nm silicon wafers in real time — boosting chip fabrication yields by 4.8%. Clean, precise, and profoundly impactful for the global computing ecosystem.",
          job_desc: {
            summary: "Applies vision transformers to automated 3nm semiconductor wafer defect classification under EUV inspection tools.",
            tasks: [
              "Train ultra-high-resolution anomaly detection models on extreme ultraviolet (EUV) electron scans",
              "Accelerate image tensor processing on dedicated FPGA inference arrays by over 300%",
              "Work with fab process engineers to feed defect clusters back into yield-enhancement loops"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🚄", text: "Fast KTX train ride into Suwon; reviewing latest photolithography papers." },
            { time: "09:30", emoji: "🔬", text: "Cleanroom wafer inspection: Validating sub-nanometer defect segmentation masks." },
            { time: "12:15", emoji: "🍚", text: "Healthy Korean home-style banchan lunch in the high-tech campus cafeteria." },
            { time: "14:00", emoji: "💻", text: "Refactoring inference pipelines to stream multi-gigapixel wafer images without lag." },
            { time: "17:30", emoji: "🍵", text: "Relaxing traditional green tea break in historic Hwaseong Fortress park." },
            { time: "20:00", emoji: "🧘", text: "Evening yoga and mindful stretching at home; resting well." }
          ],
          alternative_routines: [
            [
              { time: "07:45", emoji: "🚶", text: "Quiet morning stroll past Seoul Olympic Park rose gardens." },
              { time: "09:30", emoji: "🤝", text: "Cross-functional engineering review with chip packaging specialists." },
              { time: "13:00", emoji: "🍜", text: "Cold naengmyeon noodles lunch with team members." },
              { time: "15:00", emoji: "⚡", text: "Benchmarking zero-shot defect classification on newly synthesized chip designs." },
              { time: "18:00", emoji: "🎨", text: "Attending a modern ceramic pottery class in Insadong." }
            ]
          ],
          tags: ["#SemiconductorAI", "#SuwonCampus", "#NanotechVision", "#KTechLeadership"]
        }
      ]
    },
    amsterdam: {
      name: "Amsterdam",
      country: "Netherlands",
      flag: "🇳🇱",
      vibe: "Canal Cycling, 36-Hour Workweek, Strict Work-Life Harmony, Direct & Friendly Culture",
      roles: [
        {
          id: "ams_1",
          title: "Sustainable UX & Green AI Systems Designer",
          industry: "Green Tech & Human-Centered AI",
          persona: {
            name: "Sofia van Dijk",
            handle: "@sofia_amsterdam_vibe",
            avatar: "👩🏼‍🎨",
            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80",
            bio: "Designing low-carbon web interfaces & ethical human-AI interaction systems"
          },
          skills: ["Figma", "Design Systems", "Green Computing", "React", "User Research"],
          plog: "Bicycled 15 minutes along the leafy Prinsengracht canal past timber houseboats, stopping for fresh warm stroopwafels. Our timber-framed, solar-powered studio overlooks houseboats. Today's design sprint: redesigning enterprise software dashboards so that every user action consumes 40% fewer server CPU cycles. At 17:00 sharp, everyone closed laptops. We went kayaking through the canals into Vondelpark for an evening picnic.",
          job_desc: {
            summary: "Designs carbon-efficient digital interfaces and circular consumer product workflows for zero-waste European brands.",
            tasks: [
              "Establish low-energy design systems with dark mode presets and vector-based asset optimization",
              "Conduct international user research to measure and reduce digital carbon footprints across touchpoints",
              "Partner with sustainability engineers to audit and publish open lifecycle emission assessments"
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
          persona: {
            name: "Lars de Jong",
            handle: "@lars_energy_ams",
            avatar: "👨🏼‍💻",
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=480&q=80",
            bio: "North Sea offshore wind power balancing & battery storage forecasting"
          },
          skills: ["Python", "Graph Neural Networks", "Time Series", "Docker", "Pandas"],
          plog: "Commuted to Amsterdam Science Park by fast electric train. Today our models balanced high North Sea gust outputs into national residential battery banks, preventing 420 tons of fossil backup ignition! Dutch directness makes all meetings fast and productive: 15-minute standup, no vanity slide decks, pure problem-solving. Enjoyed a craft beer on the sunny terrace after 5:00 PM.",
          job_desc: {
            summary: "Uses spatio-temporal graph neural networks to forecast North Sea offshore wind power and balance regional power grids.",
            tasks: [
              "Train high-resolution short-term wind power prediction models from marine meteorological sensors",
              "Optimize grid-scale battery charge/discharge cycles to maintain grid frequency at exactly 50Hz",
              "Interface with transmission system operators (TenneT) for automated renewable dispatch"
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
        }
      ]
    },
    london: {
      name: "London",
      country: "United Kingdom",
      flag: "🇬🇧",
      vibe: "Historic Grandeur, Global Crossroads, Vibrant Street Markets, Friday Pub Traditions",
      roles: [
        {
          id: "ldn_1",
          title: "Climate Carbon Quant & Portfolio Strategist",
          industry: "Sustainable Finance & Climate Risk",
          persona: {
            name: "Charlotte Evans",
            handle: "@charlotte_ldn_quant",
            avatar: "👩🏼‍💼",
            photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=480&q=80",
            bio: "Quantifying physical planetary climate risks for major UK pension portfolios"
          },
          skills: ["Python", "Docker", "Spatial Data", "Climate Scenarios", "SQL"],
          plog: "Red double-decker bus over London Bridge with views of the Tower of London and the Shard. Picked up a flat white in Borough Market. Our team models physical flood and extreme heat stress onto 20-year corporate sovereign debt. Lunch was artisan Ethiopian street food at Spitalfields. At 5:00 PM on Friday, the whole office walked to a 300-year-old historic riverside tavern to unwind.",
          job_desc: {
            summary: "Develops geospatial climate scenario models and stress-testing algorithms for institutional asset managers and regulators.",
            tasks: [
              "Model catastrophic flood, storm, and transition risks under IPCC global warming trajectories",
              "Quantify fixed-income and sovereign debt resilience against multi-decade climate vulnerability",
              "Draft regulatory stress-testing disclosures compliant with Bank of England PRA requirements"
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
          persona: {
            name: "Tariq Malik",
            handle: "@tariq_biotech_ldn",
            avatar: "👨🏽‍🔬",
            photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=480&q=80",
            bio: "Diffusion models for antibody de novo design at Kings Cross Knowledge Quarter"
          },
          skills: ["PyTorch", "AlphaFold", "BioPython", "Graph Networks", "HPC Clusters"],
          plog: "Kings Cross Knowledge Quarter — collaborating steps away from the Francis Crick Institute and British Library. Today our 3D geometric equivariant neural network designed a novel antibody binder for an autoimmune target with 10x higher simulated affinity. Stroll along Regent's Canal during lunch. Leaving at 5:30 PM to attend a chamber music recital at St Martin-in-the-Fields.",
          job_desc: {
            summary: "Applies 3D geometric diffusion models to antibody design and target-specific biological drug discovery.",
            tasks: [
              "Train structural graph neural networks on protein-antigen binding complexes to generate novel binders",
              "Run large-scale molecular dynamics simulations across high-performance supercomputing clusters",
              "Coordinate with experimental wet-lab biochemists to prioritize candidates for synthesis"
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
        }
      ]
    },
    paris: {
      name: "Paris",
      country: "France",
      flag: "🇫🇷",
      vibe: "Haute Couture Innovation, Philosopher Spirit, Sunlit Seine Cafes, Artisan Sourdough",
      roles: [
        {
          id: "par_1",
          title: "Luxury AI & Haute Couture Generative Director",
          industry: "Fashion Tech & Generative Design",
          persona: {
            name: "Amélie Laurent",
            handle: "@amelie_paris_vfx",
            avatar: "👩🏼‍🎨",
            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80",
            bio: "Physics-based cloth draping & neural texture synthesis in Le Marais ateliers"
          },
          skills: ["PyTorch", "Cloth Simulation", "Diffusion 3D", "Blender", "Python"],
          plog: "Morning espresso and flaky butter croissant along the Canal Saint-Martin. Our creative studio in Le Marais bridges century-old French textile craftsmanship with frontier neural diffusion. Today, we generated fluid silk draping textures that react dynamically to runway light, reducing physical garment waste by 70%. Walked along the Seine river at golden hour listening to jazz accordion.",
          job_desc: {
            summary: "Fuses 3D generative diffusion with classical French haute couture draping and sustainable zero-waste tailoring.",
            tasks: [
              "Construct neural implicit field representations capturing micro-scale fabric weave and physics draping",
              "Train high-resolution diffusion generators conditioned on heritage archival embroidery motifs",
              "Translate algorithmic drape geometries into production-ready physical patterns for atelier artisans"
            ]
          },
          routine: [
            { time: "08:45", emoji: "🥐", text: "Warm pain au chocolat and double espresso beside Canal Saint-Martin." },
            { time: "10:15", emoji: "🎨", text: "Atelier design review: Inspecting neural velvet reflections under virtual runway spotlights." },
            { time: "12:45", emoji: "🥗", text: "Salade niçoise and chilled sparkling water in a quiet courtyard bistro." },
            { time: "14:30", emoji: "🧵", text: "Physics-informed cloth simulation tuning: Eliminating cloth mesh clipping errors." },
            { time: "18:00", emoji: "🍷", text: "Glass of Bordeaux wine with contemporary designers at an art gallery vernissage." },
            { time: "20:30", emoji: "📚", text: "Reading history of French impressionism and sketching novel visual concepts." }
          ],
          alternative_routines: [
            [
              { time: "08:00", emoji: "🚴", text: "Biking along the Seine river past the Louvre under clear morning skies." },
              { time: "09:45", emoji: "💻", text: "Pair programming: Accelerating custom CUDA optical flow kernels for video synthesis." },
              { time: "13:00", emoji: "🥖", text: "Fresh jambon-beurre baguette sitting on the sunlit steps of the Palais Royal." },
              { time: "15:15", emoji: "✨", text: "Live demonstration of real-time virtual fitting rooms to fashion house creative directors." },
              { time: "18:30", emoji: "🎭", text: "Attending an experimental dance performance at the Opéra Garnier." }
            ]
          ],
          tags: ["#StationF", "#HauteCoutureAI", "#LeMarais", "#ParisianLife"]
        }
      ]
    },
    berlin: {
      name: "Berlin",
      country: "Germany",
      flag: "🇩🇪",
      vibe: "Bohemian Freedom, Thriving Open Source Culture, Sourdough Bakeries, Vibrant Music & Arts",
      roles: [
        {
          id: "ber_1",
          title: "Open Source ML Infrastructure Engineer",
          industry: "Developer Tools & Decentralized AI",
          persona: {
            name: "Felix Weber",
            handle: "@felix_berlin_tech",
            avatar: "👨🏼‍💻",
            photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=480&q=80",
            bio: "Distributed PyTorch training clusters running on 100% European renewable energy"
          },
          skills: ["PyTorch", "Kubernetes", "Linux", "Rust", "Distributed Systems"],
          plog: "Biked past Museum Island into our sunlit Mitte loft studio. Club Mate soda and warm seeded sourdough bread from the neighborhood bakery. Our open-source team builds distributed training frameworks that dynamically shift heavy compute workloads to data centers where Nordic hydro or wind power is currently surplus. Closed the laptop at 17:00 to meet friends at an outdoor beer garden along the Spree river.",
          job_desc: {
            summary: "Architects open-source distributed training infrastructure with dynamic carbon-aware workload scheduling.",
            tasks: [
              "Profile and eliminate AllReduce and NCCL networking bottlenecks across multi-node GPU clusters",
              "Implement carbon-aware schedulers that dynamically route training jobs to green power regions",
              "Maintain core open-source machine learning repositories with automated continuous benchmarking"
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
        }
      ]
    },
    zurich: {
      name: "Zurich",
      country: "Switzerland",
      flag: "🇨🇭",
      vibe: "Crystal Alpine Air, Lakeside Bliss, Swiss Precision Engineering, High Trust & Quiet Excellence",
      roles: [
        {
          id: "zrh_1",
          title: "Edge Neural Computing & Medical Implant AI Lead",
          industry: "Medical Technology & High-Reliability AI",
          persona: {
            name: "Beat Meier",
            handle: "@beat_zurich_ai",
            avatar: "👨🏼‍🔬",
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=480&q=80",
            bio: "Sub-milliwatt neural processors for cardiac monitoring & neuro-implants at ETH"
          },
          skills: ["TinyML", "Embedded C", "PyTorch", "Biomedical Signal", "FPGA"],
          plog: "Morning train along shimmering Lake Zurich with snowcapped Alps towering in the distance. Swiss muesli with fresh mountain blueberries. In our cleanroom laboratory near ETH Zurich, we verified our ultra-low-power neural network chip: it runs real-time cardiac arrhythmia detection consuming only 400 microwatts of power. During our 1-hour lunch break, our whole research team went for a swim in the crystal-clear lake.",
          job_desc: {
            summary: "Designs ultra-low-power spiking neural network chips and edge algorithms for implantable biomedical sensors.",
            tasks: [
              "Design bio-inspired spiking neural network architectures with quantization-aware training",
              "Synthesize sub-milliwatt custom ASICs for real-time cardiac arrhythmia and neural event detection",
              "Ensure strict biocompatibility and functional safety under European Medical Device Regulation (MDR)"
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
        }
      ]
    },
    stockholm: {
      name: "Stockholm",
      country: "Sweden",
      flag: "🇸🇪",
      vibe: "Nordic Minimalism, Pristine Archipelagos, Fika Coffee Rituals, Zero Hierarchy Work Culture",
      roles: [
        {
          id: "sto_1",
          title: "Nordic Renewable Grid & Hydro AI Architect",
          industry: "Clean Energy & Nordic Infrastructure",
          persona: {
            name: "Astrid Lindholm",
            handle: "@astrid_nordic_ai",
            avatar: "👩🏼‍💻",
            photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=480&q=80",
            bio: "AI hydroelectric reservoir balancing & Arctic wind forecasting across Sweden"
          },
          skills: ["PyTorch", "Hydrological ML", "Rust", "Time Series", "Docker"],
          plog: "Brisk morning walk across the Skeppsholmen wooden bridges overlooking historic sailing schooners. Fika coffee break with warm cinnamon cardamom buns (kanelbulle) with the team. Today our models balanced water flow across 14 Northern Swedish hydroelectric dams to store excess offshore Baltic wind power with 99.3% efficiency. Swedish culture values consensus and mutual trust — zero micromanagement, 100% focus.",
          job_desc: {
            summary: "Builds predictive hydrological models for Scandinavian river cascades and clean hydroelectric grid export.",
            tasks: [
              "Analyze high-latitude satellite snowpack telemetry using temporal computer vision models",
              "Formulate dynamic reservoir dispatch strategies for real-time trading on the Nord Pool spot market",
              "Write resilient Rust telemetry microservices for remote dam monitoring and preventative maintenance"
            ]
          },
          routine: [
            { time: "08:30", emoji: "☕", text: "Morning dark roast filter coffee & kanelbulle in a Gamla Stan historic courtyard." },
            { time: "10:00", emoji: "💧", text: "Hydrological reservoir simulation: Balancing Baltic storm wind inflows with hydro storage." },
            { time: "12:30", emoji: "🐟", text: "Fresh smoked salmon and dill potatoes lunch overlooking Stockholm archipelago water." },
            { time: "14:45", emoji: "💻", text: "Optimizing multi-agent reinforcement learning solvers for national power grid auctions." },
            { time: "16:45", emoji: "⛵", text: "Laptops closed! Sailing out into the Stockholm archipelago with friends under sunset glow." },
            { time: "20:00", emoji: "🔥", text: "Wood-fired sauna session followed by a refreshing dip in cold Baltic waters." }
          ],
          alternative_routines: [
            [
              { time: "07:45", emoji: "🏃", text: "Jogging along Djurgården island forest paths with dewy birch trees." },
              { time: "09:30", emoji: "☕", text: "Team fika in our glass sunroom discussing Swedish open-source data initiatives." },
              { time: "13:00", emoji: "🥗", text: "Warm root vegetable salad lunch at an organic Södermalm bakery." },
              { time: "15:00", emoji: "⚡", text: "Validating sensor telemetry from Arctic wind farms operating at -25°C." },
              { time: "18:00", emoji: "📖", text: "Curled up in a cozy armchair reading Scandinavian design and architecture journals." }
            ]
          ],
          tags: ["#NordicFika", "#StockholmArchipelago", "#HydroCleanTech", "#LagomBalance"]
        }
      ]
    },
    sf: {
      name: "San Francisco",
      country: "United States",
      flag: "🇺🇸",
      vibe: "Frontier Innovation, Pacific Ocean Breezes, Entrepreneurial Spark, Outdoor Trails",
      roles: [
        {
          id: "sf_1",
          title: "Autonomous Driving Perception Lead",
          industry: "Autonomous Vehicles & Robotics",
          persona: {
            name: "Alex Rivera",
            handle: "@alex_sf_autonomy",
            avatar: "👨🏻‍💻",
            photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=480&q=80",
            bio: "Multi-sensor camera & radar 3D occupancy forecasting across San Francisco hills"
          },
          skills: ["PyTorch", "CUDA", "3D Occupancy", "C++", "TensorRT"],
          plog: "Blue Bottle pour-over in the Mission District. Commuted to our testing warehouse in Potrero Hill. Today our autonomous perception models handled steep San Francisco hills with dense cable car tracks and fog without hesitation. Lunch was a legendary Mission carnitas burrito in the sun at Dolores Park. Off by 5:30 PM to go bouldering at Dogpatch Boulders.",
          job_desc: {
            summary: "Develops 3D occupancy grid perception models for fully driverless urban robotaxis navigating dense city environments.",
            tasks: [
              "Train foundation vision-language-action models on millions of multimodal driving hours",
              "Enhance corner-case spatial reasoning in heavy fog, reflections, and aggressive pedestrian jaywalking",
              "Optimize TensorRT CUDA kernels to maintain sub-18ms inference latency on automotive silicon"
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
          persona: {
            name: "Chloe Zhang",
            handle: "@chloe_llm_sf",
            avatar: "👩🏻‍💻",
            photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=80",
            bio: "RLHF reward modeling & automated red-teaming for reasoning foundation models"
          },
          skills: ["PyTorch", "RLHF", "DPO", "Kubernetes", "Python"],
          plog: "Working from our loft studio near South Park in SOMA. We're engineering automated constitutional AI critics that evaluate chain-of-thought mathematical reasoning without hallucination. Grabbed matcha at a local Japanese cafe. Walking around the grassy park discussing emergent reasoning bounds with visiting researchers. Left work on time for an ocean sunset view at Twin Peaks.",
          job_desc: {
            summary: "Aligns frontier multimodal foundation models through process-based reinforcement learning and automated red-teaming.",
            tasks: [
              "Develop process-supervised reward models (PRM) to audit step-by-step mathematical reasoning",
              "Build automated adversarial red-teaming agents that surface and patch emerging safety vectors",
              "Draft frontier safety evaluation benchmarks across leading international AI research coalitions"
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
        }
      ]
    },
    ny: {
      name: "New York",
      country: "United States",
      flag: "🇺🇸",
      vibe: "World Financial Epicenter, 24-Hour Pulse, Broadway Culture, Brooklyn Rooftop Skyline",
      roles: [
        {
          id: "ny_1",
          title: "High-Frequency Algorithmic Market Lead",
          industry: "Quantitative Finance & Trading Intelligence",
          persona: {
            name: "Marcus Vance",
            handle: "@marcus_ny_quant",
            avatar: "👨🏾‍💼",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&q=80",
            bio: "Sub-microsecond order execution & market microstructure modeling in Manhattan"
          },
          skills: ["Rust", "C++", "SIMD", "Time Series", "Linux Kernel"],
          plog: "Morning subway into the Financial District. Stepped out past Trinity Church with a hot bagel and dark espresso. Our quantitative desk models cross-asset order flow and market microstructure across global stock and futures exchanges. We engineered zero-copy network kernel bypasses in Rust, cutting latency by 1.8 microseconds. Unwound with rooftop jazz in Brooklyn overlooking the Manhattan skyline lights.",
          job_desc: {
            summary: "Engineers sub-microsecond algorithmic order routing and liquidity forecasting engines for global equity markets.",
            tasks: [
              "Develop ultra-low-latency C++ and Rust trading engines with kernel bypass (DPDK) architecture",
              "Train time-series transformers predicting microsecond order-book shifts and market depth",
              "Collaborate with compliance and risk officers to enforce automated circuit-breaker protections"
            ]
          },
          routine: [
            { time: "07:15", emoji: "🥯", text: "Everything bagel with cream cheese & black drip coffee in Lower Manhattan." },
            { time: "08:30", emoji: "📊", text: "Market open bell: Monitoring real-time order execution latencies across exchanges." },
            { time: "12:15", emoji: "🥪", text: "Pastrami sandwich lunch walking around the historic Stone Street cobblestones." },
            { time: "14:30", emoji: "⚡", text: "Profile-guided optimization of lock-free queue memory buffers in Rust." },
            { time: "17:45", emoji: "🎷", text: "Ferry ride over to DUMBO, Brooklyn for rooftop live jazz with colleagues." },
            { time: "20:30", emoji: "📖", text: "Reading game theory publications and resting well." }
          ],
          alternative_routines: [
            [
              { time: "06:45", emoji: "🏃", text: "Morning run across Brooklyn Bridge with views of sunrise over the East River." },
              { time: "09:00", emoji: "💻", text: "Simulating market flash crash scenarios with Monte Carlo distributed clusters." },
              { time: "13:00", emoji: "🥗", text: "Healthy grain bowl lunch in Madison Square Park under spring elm trees." },
              { time: "15:30", emoji: "🔬", text: "Benchmarking FPGA gate array synthesis for trading execution logic." },
              { time: "19:00", emoji: "🎭", text: "Attending an off-Broadway musical theater performance with friends." }
            ]
          ],
          tags: ["#WallStreet", "#DUMBO", "#RustQuant", "#ManhattanSkyline"]
        }
      ]
    },
    sydney: {
      name: "Sydney",
      country: "Australia",
      flag: "🇦🇺",
      vibe: "Sunrise Ocean Surfing, Sun-Drenched Harbors, World-Class Specialty Coffee, Healthy Outdoor Living",
      roles: [
        {
          id: "syd_1",
          title: "Marine & Coral Reef Ecosystem AI Lead",
          industry: "Ocean Conservation & Environmental AI",
          persona: {
            name: "Liam O'Connor",
            handle: "@liam_reef_ai",
            avatar: "👨🏼‍🔬",
            photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=480&q=80",
            bio: "Autonomous underwater vehicle vision tracking Great Barrier Reef recovery"
          },
          skills: ["Computer Vision", "Underwater Robotics", "PyTorch", "Python", "ROS2"],
          plog: "6:00 AM sunrise surf at Bondi Beach — watching dolphins play in the green peeling waves. Quick shower, flat white from a Surry Hills laneway cafe, and into our sunny open-brick lab by 9:00 AM. We deployed our computer vision model onto autonomous underwater drones: it catalogs coral bleaching and marine biodiversity with 98.7% accuracy across thousands of square kilometers. Working in Australia means true health and sunshine every day.",
          job_desc: {
            summary: "Deploys autonomous underwater vehicles (AUVs) with vision AI to monitor coral health across the Great Barrier Reef.",
            tasks: [
              "Apply unsupervised neural color correction to compensate for underwater light scattering",
              "Train fine-grained coral species classification and bleaching identification models",
              "Collaborate with marine biologists to optimize autonomous robotic survey transects"
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
              { time: "18:00", emoji: "🏊", text: "Late afternoon swim at the ocean rock pool; feeling thoroughly refreshed." }
            ]
          ],
          tags: ["#BondiSurfing", "#ReefAI", "#SurryHills", "#OceanConservation"]
        }
      ]
    },
    toronto: {
      name: "Toronto",
      country: "Canada",
      flag: "🇨🇦",
      vibe: "Diverse Cosmopolitan Hub, World-Leading Deep Learning Legacy, Lakeside Walks, Multicultural Feasts",
      roles: [
        {
          id: "tor_1",
          title: "Healthcare Medical Imaging & Oncology AI Lead",
          industry: "Medical Diagnostics & Clinical AI",
          persona: {
            name: "David Kim",
            handle: "@david_toronto_med_ai",
            avatar: "👨🏻‍🔬",
            photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&q=80",
            bio: "3D CT scan volumetric lung nodule detection with University Health Network"
          },
          skills: ["PyTorch", "MONAI", "Medical Imaging", "3D Convolutions", "DICOM"],
          plog: "Rode the King Street streetcar into Toronto's Discovery District. University of Toronto and Vector Institute are legendary epicenters of deep learning. Collaborating directly with radiologists at Princess Margaret Cancer Centre: our 3D volumetric model detected early-stage nodules with 99.1% sensitivity, cutting radiologist reading fatigue by 45%. Stopped by St. Lawrence Market for warm maple peameal bacon on a bun.",
          job_desc: {
            summary: "Develops deep learning segmentation algorithms for early 3D tumor detection in multi-parametric CT and MRI scans.",
            tasks: [
              "Train multi-scale 3D volumetric segmentation models using MONAI and PyTorch architectures",
              "Apply Monte Carlo dropout to quantify diagnostic prediction uncertainty for radiologists",
              "Lead multi-center clinical validation trials meeting FDA and Health Canada medical standards"
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
        }
      ]
    },
    dubai: {
      name: "Dubai",
      country: "United Arab Emirates",
      flag: "🇦🇪",
      vibe: "Futuristic Architectural Wonders, Desert Sunset Dune Drives, Global Crossroads, Zero Personal Income Tax",
      roles: [
        {
          id: "dxb_1",
          title: "Autonomous Aerial Fleet & Smart City Lead",
          industry: "Urban Air Mobility & Autonomous Drones",
          persona: {
            name: "Tariq Al-Mansoor",
            handle: "@tariq_dubai_fleet",
            avatar: "👨🏽‍💻",
            photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=480&q=80",
            bio: "Autonomous electric vertical takeoff air taxi routing across Dubai skyscrapers"
          },
          skills: ["PyTorch", "Trajectory Optimization", "C++", "ROS2", "5G Telemetry"],
          plog: "Morning views of the Burj Khalifa piercing through golden desert sunrise mist. Fresh cardamom karak chai at our DIFC innovation hub. Dubai has launched the world's first commercial autonomous air taxi passenger corridor. Today our 4D collision avoidance network safely rerouted 40 drone test flights around sudden desert thermal updrafts. Finished work at 5:00 PM for a sunset desert dune drive with friends.",
          job_desc: {
            summary: "Builds 4D collision avoidance and airspace routing systems for passenger eVTOL networks and vertiport hubs.",
            tasks: [
              "Optimize dynamic flight trajectories using multi-agent reinforcement learning in crowded corridors",
              "Predict micro-scale desert thermal currents and sand squalls with radar lidar sensor fusion",
              "Work closely with civil aviation authorities (DCAA) to guarantee 100% fail-safe airspace operations"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🫖", text: "Hot spiced karak chai overlooking the glowing futuristic Museum of the Future." },
            { time: "09:30", emoji: "🚁", text: "Live autonomous flight corridor simulation testing over Dubai Marina waterways." },
            { time: "12:30", emoji: "🥙", text: "Fresh grilled shawarma and pomegranate juice at an open terrace restaurant in DIFC." },
            { time: "14:15", emoji: "💻", text: "Simulating sudden microburst wind anomalies on eVTOL passenger drone stability." },
            { time: "17:30", emoji: "🏜️", text: "Sunset 4x4 desert drive over golden sand dunes under a vast crimson sky." },
            { time: "20:30", emoji: "🔭", text: "Relaxing by a desert camp under clear Arabian stars; drinking mint tea." }
          ],
          alternative_routines: [
            [
              { time: "07:00", emoji: "🏊", text: "Morning swim in the Arabian Gulf at Jumeirah Beach with gentle warm turquoise waves." },
              { time: "09:30", emoji: "🤝", text: "Coordinating international drone safety protocols with European aviation authorities." },
              { time: "13:00", emoji: "🥗", text: "Lebanese fattoush salad and hummus lunch with our flight controls team." },
              { time: "15:00", emoji: "⚡", text: "Optimizing 5G ground-to-air telemetry packet latency on edge relay towers." },
              { time: "18:30", emoji: "🌆", text: "Stroll along Dubai Marina promenade as evening luxury yachts glide under neon towers." }
            ]
          ],
          tags: ["#DubaiFuture", "#UrbanAirMobility", "#BurjKhalifa", "#DesertSunset"]
        }
      ]
    },
    saopaulo: {
      name: "São Paulo",
      country: "Brazil",
      flag: "🇧🇷",
      vibe: "Latin America Financial Powerhouse, Bohemian Murals, Passionate Samba Rhythms, Fresh Tropical Produce",
      roles: [
        {
          id: "sp_1",
          title: "AgTech Satellite & Amazon Climate AI Lead",
          industry: "AgTech & Climate Remote Sensing",
          persona: {
            name: "Camila Silva",
            handle: "@camila_agro_ai",
            avatar: "👩🏻‍🔬",
            photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80",
            bio: "Multispectral satellite radar tracking sustainable regenerative agriculture in Brazil"
          },
          skills: ["PyTorch", "Remote Sensing", "GIS", "Python", "Spatial ML"],
          plog: "Morning espresso with warm pão de queijo (Brazilian cheese bread) in bohemian Vila Madalena. São Paulo is the beating heart of Latin American technology. Our remote sensing algorithms monitor 12 million hectares of agricultural land, distinguishing between sustainable regenerative crop rotations and soil degradation. Celebrating a successful harvest prediction model with fresh açaí bowls on a sunny rooftop terrace.",
          job_desc: {
            summary: "Builds orbital remote sensing models for sustainable tropical agriculture and automated carbon credit verification.",
            tasks: [
              "Process multi-temporal satellite radar and optical imagery to forecast crop yields and drought risks",
              "Develop automated native forest regeneration algorithms for verified carbon certification",
              "Partner with agricultural research institutes to optimize precision drip irrigation for smallholders"
            ]
          },
          routine: [
            { time: "08:15", emoji: "🧀", text: "Fresh hot pão de queijo and strong Brazilian cafezinho in Vila Madalena." },
            { time: "09:30", emoji: "🛰️", text: "Processing overnight Sentinel-2 and PlanetScope multispectral satellite passes." },
            { time: "12:30", emoji: "🍲", text: "Hearty feijoada lunch with fresh orange slices and farofa with colleagues." },
            { time: "14:30", emoji: "🌿", text: "Validating soil moisture deep learning predictions against on-ground IoT sensors." },
            { time: "17:45", emoji: "🎨", text: "Walking along Beco do Batman graffiti art alleys; lively street music filling the air." },
            { time: "20:00", emoji: "💃", text: "Attending a local acoustic Bossa Nova live session at a neighborhood lounge." }
          ],
          alternative_routines: [
            [
              { time: "07:30", emoji: "🏃", text: "Morning run through lush Ibirapuera Park past towering tropical palm trees." },
              { time: "09:30", emoji: "💻", text: "Deploying updated spatial indexing algorithms on AWS cloud infrastructure." },
              { time: "13:00", emoji: "🥣", text: "Thick fresh açaí bowl with banana and granola in the sunshine." },
              { time: "15:15", emoji: "🤝", text: "Video conference with sustainable coffee cooperatives on precision irrigation." },
              { time: "18:00", emoji: "🌇", text: "Watching the sun set over the vast São Paulo skyline from a high-rise terrace." }
            ]
          ],
          tags: ["#VilaMadalena", "#AgTechAI", "#IbirapueraPark", "#BossaNovaVibe"]
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
    quizCard.innerHTML = `<div role="status" aria-live="polite" class="quiz-loading"><p>Putting your work-style reflection together…</p><div class="skeleton-surface skeleton-avatar"></div><div class="skeleton-surface skeleton-line"></div><div class="skeleton-surface skeleton-line short"></div><div class="skeleton-surface skeleton-panel"></div></div>`;

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
  
    function buildTotemResultNav(activeKey) {
    return `
      <!-- Segmented Frosted Glass Navigation Bar -->
      <div class="totem-glass-nav-container flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl mb-6">
        <div class="totem-segmented-control flex items-center p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
          <button type="button" onclick="renderTotemOverview()" class="totem-tab-item ${activeKey === 'overview' ? 'active' : ''}">
            <span>✨ Totem Profile</span>
          </button>
          <button type="button" onclick="showDeepProfileView()" class="totem-tab-item ${activeKey === 'deep' ? 'active' : ''}">
            <span>⚡ Spectrum &amp; Models</span>
          </button>
          <button type="button" onclick="showElevatedCareersView()" class="totem-tab-item ${activeKey === 'careers' ? 'active' : ''}">
            <span>🎯 Elevated Careers</span>
          </button>
          <button type="button" onclick="showCompanionCvStudio()" class="totem-tab-item companion-tab ${activeKey === 'companion' ? 'active' : ''}">
            <span>🐾 Animal CV Studio</span>
          </button>
        </div>
        <div class="flex items-center gap-3 px-3 text-xs font-semibold text-slate-500">
          <button type="button" onclick="retakeTotemQuiz()" class="hover:text-slate-900 transition flex items-center gap-1">
            <span>🔄 Retake</span>
          </button>
          <span class="text-slate-300">|</span>
          <button type="button" onclick="exitTotemImmersion()" class="hover:text-slate-900 transition">
            Exit ✕
          </button>
        </div>
      </div>
    `;
  }

      function renderTotemOverview() {
    window.renderTotemOverview = renderTotemOverview;
    enterImmersionMode();
    if (welcomeCard) welcomeCard.classList.add("hidden");
    if (quizCard) quizCard.classList.add("hidden");
    if (resultCard) resultCard.classList.remove("hidden");

    const t = calculatedTotem;

    resultCard.innerHTML = `
      <div class="space-y-6 fade-in max-w-4xl mx-auto">
        
        ${buildTotemResultNav('overview')}

        <!-- Grand Reveal Card (Airy Light Glass) -->
        <div class="p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-xl space-y-8">
          <div class="grid md:grid-cols-12 gap-8 items-center">
            
            <!-- Left: Mascot Orb & Typography -->
            <div class="md:col-span-5 text-center space-y-4">
              <div class="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-indigo-50/80 via-white to-sky-50/80 border border-slate-200/80 shadow-inner grid place-items-center p-3 relative group">
                <img src="${t.characterImage || ('/static/illustrations/totem_characters/' + (t.key || 'retriever') + '.svg')}" alt="${t.badge}" class="w-24 h-24 object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div>
                <span class="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200/80">
                  Your Career Totem
                </span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">${t.badge}</h2>
                <div class="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">${t.tagline}</div>
              </div>
            </div>

            <!-- Right: Quote & Clean Strengths -->
            <div class="md:col-span-7 space-y-5 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
              <div class="border-l-2 border-indigo-400 pl-4 py-1">
                <p class="text-base sm:text-lg text-slate-700 font-medium leading-relaxed italic">
                  "${t.brief}"
                </p>
              </div>

              <!-- Superpowers & Allergies (Gentle Pastel Glass) -->
              <div class="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                <div class="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                  <div class="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
                    <span>⚡</span> Authentic Superpowers
                  </div>
                  <ul class="text-[11px] text-slate-700 space-y-1.5 list-disc list-inside font-medium">
                    ${t.strengths.map(s => `<li>${s}</li>`).join('')}
                  </ul>
                </div>

                <div class="p-4 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-2">
                  <div class="font-bold text-rose-800 flex items-center gap-1.5 text-xs">
                    <span>🚫</span> Workplace Allergies
                  </div>
                  <ul class="text-[11px] text-slate-700 space-y-1.5 list-disc list-inside font-medium">
                    ${t.allergies.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Two Balanced Next Action Cards -->
        <div class="grid sm:grid-cols-2 gap-4">
          
          <!-- Card 1: Spectrum & Role Models -->
          <button type="button" onclick="showDeepProfileView()" class="p-6 text-left rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition group flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-2xl p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">⚡</span>
                <span class="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">Vector Calibrated</span>
              </div>
              <h4 class="font-black text-slate-900 text-base group-hover:text-indigo-600 transition">Personality Spectrum &amp; Role Models</h4>
              <p class="text-xs text-slate-500 leading-relaxed font-normal">Explore your dual-pole continuums and historical leaders who share your strategic rhythm.</p>
            </div>
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 pt-1 group-hover:translate-x-1 transition">
              <span>View Personality Vectors</span>
              <span>→</span>
            </div>
          </button>

          <!-- Card 2: Interactive Animal CV Studio -->
          <button type="button" onclick="showCompanionCvStudio()" class="p-6 text-left rounded-3xl bg-white border border-teal-200/90 shadow-sm hover:shadow-md hover:border-teal-400 transition group flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-2xl p-2.5 rounded-2xl bg-teal-50 text-teal-600">🐾</span>
                <span class="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Interactive Studio</span>
              </div>
              <h4 class="font-black text-slate-900 text-base group-hover:text-teal-700 transition">Build CV with Your Companion</h4>
              <p class="text-xs text-slate-500 leading-relaxed font-normal">Answer 4 quick prompts with ${t.badge} to generate an executive PDF profile instantly.</p>
            </div>
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 pt-1 group-hover:translate-x-1 transition">
              <span>Start Companion Chat</span>
              <span>→</span>
            </div>
          </button>

        </div>

      </div>
    `;

    if (resultCard) resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // View 2: Deep Profile & Role Models View
    // View 2: Deep Profile & Role Models View
    window.showDeepProfileView = function () {
    const t = calculatedTotem;

    resultCard.innerHTML = `
      <div class="space-y-6 fade-in max-w-4xl mx-auto">
        
        ${buildTotemResultNav('deep')}

        <!-- Role Models Section (Bug-free rm.photo and rm.field) -->
        <div class="p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-xl space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <span>⭐</span> Who Walks Your Path?
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Iconic trailblazers and pioneers who share your ${t.badge} temperament:</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Temperament Synchronized
            </span>
          </div>

          <div class="role-model-carousel mobile-snap-carousel grid sm:grid-cols-2 gap-4" role="list" aria-label="Role models who share your work style" tabindex="0">
            ${t.roleModels.map(rm => `
              <div class="role-model-card p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:bg-white hover:shadow-md transition space-y-3.5 flex flex-col justify-between" role="listitem">
                <div class="space-y-3">
                  <div class="flex items-center gap-3.5">
                    <img src="${rm.photo || '/static/illustrations/totem_characters/owl.svg'}" alt="${rm.name}" class="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0" onerror="this.src='/static/illustrations/totem_characters/owl.svg'" />
                    <div>
                      <h4 class="text-base font-black text-slate-900 leading-tight">${rm.name}</h4>
                      <div class="text-xs font-bold text-indigo-600 mt-0.5">${rm.field || 'Pioneering Leader'}</div>
                    </div>
                  </div>
                  
                  <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                    <span class="text-[10px] uppercase font-black text-rose-700 block tracking-wider">The Early Grind &amp; Struggle:</span>
                    <p class="leading-relaxed font-normal">${rm.struggle}</p>
                  </div>

                  <div class="text-xs text-slate-700 leading-relaxed font-normal">
                    <b class="text-indigo-700 font-bold">Key Turning Point:</b> ${rm.milestone}
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-200/60 text-xs italic text-slate-600 font-serif leading-relaxed">
                  "${rm.wisdom}"
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- MBTI-Style Dual-Pole Personality Spectrum (Crisp High-Contrast Light Mode) -->
        <div class="p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-xl space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>⚡</span> Your Personality Spectrum Breakdown
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Dual-pole continuum calibrated from your questionnaire vectors</p>
            </div>
            <span class="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">O*NET Dimension Calibrated</span>
          </div>

          <div class="space-y-4 pt-1">
            
            <!-- Pole 1: Energy & Focus -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-black">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.energy.leftPct >= 50 ? 'bg-indigo-50 text-indigo-950 border border-indigo-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span>${t.mbtiPoles.energy.leftName}</span>
                  <span class="font-mono ${t.mbtiPoles.energy.leftPct >= 50 ? 'text-indigo-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.energy.leftPct}%</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.energy.rightPct > 50 ? 'bg-rose-50 text-rose-950 border border-rose-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span class="font-mono ${t.mbtiPoles.energy.rightPct > 50 ? 'text-rose-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.energy.rightPct}%</span>
                  <span>${t.mbtiPoles.energy.rightName}</span>
                </span>
              </div>
              <div class="relative h-3 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden flex shadow-inner">
                <div class="h-full rounded-l-full bg-gradient-to-r from-sky-500 to-indigo-600" style="width: ${t.mbtiPoles.energy.leftPct}%"></div>
                <div class="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-amber-500" style="width: ${t.mbtiPoles.energy.rightPct}%"></div>
                <div class="absolute inset-y-0 left-1/2 w-0.5 bg-slate-400/50 z-10 -translate-x-1/2 pointer-events-none"></div>
              </div>
            </div>

            <!-- Pole 2: Mind & Processing -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-black">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.mind.leftPct >= 50 ? 'bg-indigo-50 text-indigo-950 border border-indigo-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span>${t.mbtiPoles.mind.leftName}</span>
                  <span class="font-mono ${t.mbtiPoles.mind.leftPct >= 50 ? 'text-indigo-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.mind.leftPct}%</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.mind.rightPct > 50 ? 'bg-rose-50 text-rose-950 border border-rose-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span class="font-mono ${t.mbtiPoles.mind.rightPct > 50 ? 'text-rose-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.mind.rightPct}%</span>
                  <span>${t.mbtiPoles.mind.rightName}</span>
                </span>
              </div>
              <div class="relative h-3 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden flex shadow-inner">
                <div class="h-full rounded-l-full bg-gradient-to-r from-sky-500 to-indigo-600" style="width: ${t.mbtiPoles.mind.leftPct}%"></div>
                <div class="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-amber-500" style="width: ${t.mbtiPoles.mind.rightPct}%"></div>
                <div class="absolute inset-y-0 left-1/2 w-0.5 bg-slate-400/50 z-10 -translate-x-1/2 pointer-events-none"></div>
              </div>
            </div>

            <!-- Pole 3: Execution Tempo -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-black">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.tempo.leftPct >= 50 ? 'bg-indigo-50 text-indigo-950 border border-indigo-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span>${t.mbtiPoles.tempo.leftName}</span>
                  <span class="font-mono ${t.mbtiPoles.tempo.leftPct >= 50 ? 'text-indigo-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.tempo.leftPct}%</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.tempo.rightPct > 50 ? 'bg-rose-50 text-rose-950 border border-rose-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span class="font-mono ${t.mbtiPoles.tempo.rightPct > 50 ? 'text-rose-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.tempo.rightPct}%</span>
                  <span>${t.mbtiPoles.tempo.rightName}</span>
                </span>
              </div>
              <div class="relative h-3 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden flex shadow-inner">
                <div class="h-full rounded-l-full bg-gradient-to-r from-sky-500 to-indigo-600" style="width: ${t.mbtiPoles.tempo.leftPct}%"></div>
                <div class="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-amber-500" style="width: ${t.mbtiPoles.tempo.rightPct}%"></div>
                <div class="absolute inset-y-0 left-1/2 w-0.5 bg-slate-400/50 z-10 -translate-x-1/2 pointer-events-none"></div>
              </div>
            </div>

            <!-- Pole 4: Mission Drive -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-black">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.drive.leftPct >= 50 ? 'bg-indigo-50 text-indigo-950 border border-indigo-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span>${t.mbtiPoles.drive.leftName}</span>
                  <span class="font-mono ${t.mbtiPoles.drive.leftPct >= 50 ? 'text-indigo-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.drive.leftPct}%</span>
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.mbtiPoles.drive.rightPct > 50 ? 'bg-rose-50 text-rose-950 border border-rose-200 shadow-xs' : 'text-slate-500 bg-slate-50 border border-slate-200/60'}">
                  <span class="font-mono ${t.mbtiPoles.drive.rightPct > 50 ? 'text-rose-600 font-black' : 'text-slate-500 font-bold'}">${t.mbtiPoles.drive.rightPct}%</span>
                  <span>${t.mbtiPoles.drive.rightName}</span>
                </span>
              </div>
              <div class="relative h-3 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden flex shadow-inner">
                <div class="h-full rounded-l-full bg-gradient-to-r from-sky-500 to-indigo-600" style="width: ${t.mbtiPoles.drive.leftPct}%"></div>
                <div class="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-amber-500" style="width: ${t.mbtiPoles.drive.rightPct}%"></div>
                <div class="absolute inset-y-0 left-1/2 w-0.5 bg-slate-400/50 z-10 -translate-x-1/2 pointer-events-none"></div>
              </div>
            </div>

          </div>
        </div>

        <!-- Next Action Buttons -->
        <div class="grid sm:grid-cols-2 gap-4">
          <button type="button" onclick="showElevatedCareersView()" class="totem-btn-primary !py-3.5 text-center font-extrabold shadow-md flex items-center justify-center gap-2">
            <span>Explore Matched Elevated Careers</span>
            <span>→</span>
          </button>
          <button type="button" onclick="showCompanionCvStudio()" class="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-extrabold border border-slate-200 text-center transition flex items-center justify-center gap-2 shadow-xs">
            <span>🐾 Craft CV with ${t.badge}</span>
            <span>→</span>
          </button>
        </div>

      </div>
    `;

    if (resultCard) resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  };

    // View 3: Elevated Careers Portal (Overhauled with MDL & HuaShu)
  window.showElevatedCareersView = function () {
    const t = calculatedTotem;

    resultCard.innerHTML = `
      <div class="space-y-6 fade-in max-w-4xl mx-auto">
        
        ${buildTotemResultNav('careers')}

        <!-- Header & Domain Filter -->
        <div class="totem-badge-card p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-lg space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 p-2 grid place-items-center shrink-0 shadow-xs">
                <img src="${t.characterImage || ('/static/illustrations/totem_characters/' + (t.key || 'retriever') + '.svg')}" alt="${t.badge}" class="w-12 h-12 object-contain filter drop-shadow" />
              </div>
              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                  Targeted Career Trajectories
                </div>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Elevated Careers Tailored to ${t.badge}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">High-impact frontier roles mapped directly to your strategic temperaments and execution tempo.</p>
              </div>
            </div>

            <!-- Companion Quick Action Pill -->
            <button type="button" onclick="showCompanionCvStudio()" class="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition flex items-center gap-2 shadow-xs shrink-0">
              <span>🐾 Open CV Companion</span>
              <span>→</span>
            </button>
          </div>

          <!-- Domain Pills (Tactile Filter) -->
          <div class="space-y-2">
            <div class="text-[11px] font-black uppercase tracking-wider text-slate-400">Select Innovation Sector:</div>
            <div class="flex flex-wrap items-center gap-2" id="domainPicker">
              <button type="button" class="domain-pill ${selectedDomain === 'tech' ? 'active' : ''}" onclick="selectDomain('tech')">💻 AI &amp; Software Architecture</button>
              <button type="button" class="domain-pill ${selectedDomain === 'health' ? 'active' : ''}" onclick="selectDomain('health')">🏥 Healthcare &amp; BioSynthetics</button>
              <button type="button" class="domain-pill ${selectedDomain === 'creative' ? 'active' : ''}" onclick="selectDomain('creative')">🎨 Creative Direction &amp; Spatial UX</button>
              <button type="button" class="domain-pill ${selectedDomain === 'green' ? 'active' : ''}" onclick="selectDomain('green')">🌿 ESG &amp; CleanTech Strategy</button>
              <button type="button" class="domain-pill ${selectedDomain === 'finance' ? 'active' : ''}" onclick="selectDomain('finance')">📈 Quant FinTech &amp; Strategy</button>
            </div>
          </div>

          <!-- Elevated Job Cards Display -->
          <div id="elevatedJobDisplay" class="opportunity-carousel mobile-snap-carousel grid sm:grid-cols-2 gap-4 pt-2" role="list" aria-label="Career opportunities based on your work style" tabindex="0">
            <!-- Injected by renderElevatedJobs -->
          </div>
        </div>

        <!-- "Have a Dream Job in Mind?" Custom Input (High Contrast Clean Style) -->
        <div class="totem-badge-card p-6 sm:p-7 space-y-4 border border-slate-200 bg-white rounded-3xl shadow-sm">
          <div class="flex items-center gap-3">
            <span class="text-2xl p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">💡</span>
            <div>
              <h4 class="text-sm font-black text-slate-900">Have a specific dream job in mind?</h4>
              <p class="text-xs text-slate-500">Type any title to let CareerLens AI evaluate how your ${t.badge} temperament will excel:</p>
            </div>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap gap-2.5">
            <input type="text" id="customJobInput" class="input !bg-slate-50 !border-slate-300 !text-slate-900 !text-xs !py-3 flex-1 rounded-xl" placeholder="e.g. Game Concept Artist, Renewable Energy Trader, Neuroscientist..." onkeydown="if(event.key==='Enter')analyzeCustomJob()" />
            <button type="button" onclick="analyzeCustomJob()" class="totem-btn-primary !py-2.5 !px-6 !text-xs font-bold shrink-0 shadow-xs">
              ⚡ Check Fit
            </button>
          </div>

          <div id="customJobFeedback" class="hidden p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-2 text-slate-800">
            <!-- Custom feedback injected here -->
          </div>
        </div>

      </div>
    `;

    renderElevatedJobs(selectedDomain);
    if (resultCard) resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <div class="sm:col-span-2 py-8 text-center text-xs text-slate-500 space-y-2">
        <span class="inline-block animate-spin text-lg">🔮</span>
        <div>Synthesizing elevated roles for <b>${domain.toUpperCase()}</b>...</div>
      </div>
    `;

    setTimeout(() => {
      renderElevatedJobs(domain);
    }, 250);
  };

  function renderElevatedJobs(domain) {
    const container = document.getElementById("elevatedJobDisplay");
    if (!container) return;

    const t = calculatedTotem;
    const isSolo = (answers[1] || 0) + (answers[3] || 0) + (answers[10] || 0) >= 0;
    const roleList = (ELEVATED_ROLES[domain] && ELEVATED_ROLES[domain][isSolo ? "solo" : "social"]) || ELEVATED_ROLES.tech.solo;

    container.innerHTML = roleList.map(r => {
      const cleanTitle = r.title.replace(/'/g, "\\'");
      return `
        <div class="elevated-job-card p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between" role="listitem">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="chip chip-indigo !text-[10px] font-bold">${r.vibe}</span>
              <span class="chip chip-emerald !text-[10px] font-bold">${r.demand}</span>
            </div>
            
            <div>
              <h4 class="text-base sm:text-lg font-black text-slate-900 leading-snug">${r.title}</h4>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed font-normal">
              ${r.why}
            </p>

            <div class="flex flex-wrap gap-1.5 pt-1">
              <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                🎯 98% ${t.badge} Match
              </span>
              <span class="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">
                ⚡ High Leverage
              </span>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onclick="showCompanionCvStudio('${cleanTitle}')" class="totem-btn-primary !py-2 !px-4 !text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <span>🐾 Craft CV for this Role</span>
              <span>→</span>
            </button>
            <button type="button" onclick="openAuth('register', 'job_seeker')" class="text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
              Explore Openings ↗
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // View 4: Spirit Animal Career Companion Studio (The Interactive CV Experience)
    // View 4: Spirit Animal Career Companion Studio (Light Airy Luxury)
  window.showCompanionCvStudio = function (prefillRole = '') {
    const t = calculatedTotem;
    const defaultRole = prefillRole || (t.key === 'hawk' ? 'Autonomous Systems Architect' : (t.key === 'owl' ? 'Machine Learning Systems Architect' : 'Strategic Product Lead'));

    resultCard.innerHTML = `
      <div class="space-y-6 fade-in max-w-4xl mx-auto">
        
        ${buildTotemResultNav('companion')}

        <!-- Companion Banner (Light Airy Frosted Glass) -->
        <div class="companion-studio-card p-6 sm:p-8 space-y-6">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <!-- Cute Character Avatar in Soft Aura Badge -->
            <div class="companion-avatar-badge">
              <img src="${t.characterImage || ('/static/illustrations/totem_characters/' + (t.key || 'retriever') + '.svg')}" alt="${t.badge}" class="animate-bounce-subtle" />
            </div>

            <!-- Friendly Dialogue Bubble -->
            <div class="companion-speech-bubble flex-1 space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <span>🐾</span> <span>${t.badge} Career Companion</span>
                </span>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  AI Reskilling Studio
                </span>
              </div>
              <h3 class="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                "Hello, Strategist! Let's build your tailored CV &amp; executive profile."
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed font-normal">
                Answer 4 quick questions with me in an interactive chat, or upload an existing PDF resume to get verified skills calibration.
              </p>
            </div>
          </div>

          <!-- Studio Mode Switcher (Sleek Segmented Pill) -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button type="button" id="btnTotemModeQa" onclick="setTotemCompanionMode('qa')" class="totem-tab-item active !py-2 !px-4 text-xs font-bold">
              <span>💬 1. Companion Chat Q&amp;A</span>
            </button>
            <button type="button" id="btnTotemModePdf" onclick="setTotemCompanionMode('pdf')" class="totem-tab-item !py-2 !px-4 text-xs font-bold">
              <span>📄 2. Direct PDF Upload</span>
            </button>
          </div>
        </div>

        <!-- Mode A: Interactive Companion Q&A Studio Panel -->
        <div id="panelTotemQa" class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6">
          <div class="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 class="text-base font-black text-slate-900">
                Four Quick Questions with ${t.badge}
              </h4>
              <p class="text-xs text-slate-500 mt-0.5">Your companion synthesizes your answers into a formal A4 executive resume.</p>
            </div>
            <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Verified PDF Builder
            </span>
          </div>

          <div class="grid md:grid-cols-2 gap-5 text-xs">
            <!-- Q1: Role Title -->
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-800">
                1. Target or Current Role Title
              </label>
              <input type="text" id="totemQaRole" class="input !bg-slate-50 !border-slate-300 !text-slate-900 !text-xs !py-3 w-full rounded-xl" value="${defaultRole}" placeholder="e.g. Autonomous Systems Architect..." />
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span class="text-[10px] text-slate-400">Picks:</span>
                <button type="button" onclick="document.getElementById('totemQaRole').value='Autonomous Systems Architect'" class="text-[10px] font-bold text-indigo-600 hover:underline">Autonomous Systems</button>
                <span class="text-slate-300">·</span>
                <button type="button" onclick="document.getElementById('totemQaRole').value='AI Ethics Strategist'" class="text-[10px] font-bold text-indigo-600 hover:underline">AI Ethics</button>
                <span class="text-slate-300">·</span>
                <button type="button" onclick="document.getElementById('totemQaRole').value='Full-Stack Engineer'" class="text-[10px] font-bold text-indigo-600 hover:underline">Full-Stack</button>
              </div>
            </div>

            <!-- Q2: Experience & Work Rhythm -->
            <div class="space-y-1.5">
              <label class="block font-bold text-slate-800">
                2. Experience &amp; Work Rhythm
              </label>
              <div class="grid grid-cols-2 gap-2">
                <select id="totemQaYears" class="input !bg-slate-50 !border-slate-300 !text-slate-900 !text-xs !py-3 rounded-xl">
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years" selected>3-5 Years</option>
                  <option value="6-10 Years">6-10 Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
                <select id="totemQaWorkMode" class="input !bg-slate-50 !border-slate-300 !text-slate-900 !text-xs !py-3 rounded-xl">
                  <option value="Remote-First" selected>Remote-First</option>
                  <option value="Hybrid Flexibility">Hybrid</option>
                  <option value="On-Site Collaborative">On-Site</option>
                </select>
              </div>
            </div>

            <!-- Q3: Core Competencies -->
            <div class="md:col-span-2 space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block font-bold text-slate-800">
                  3. Key Competencies &amp; Technical Skills
                </label>
                <span class="text-[10px] text-slate-400">Click to append:</span>
              </div>
              <input type="text" id="totemQaSkills" class="input !bg-slate-50 !border-slate-300 !text-slate-900 !text-xs !py-3 w-full rounded-xl" value="High-Stakes Decision Making, System Architecture, Python, Rapid Prototyping" placeholder="Comma-separated skills" />
              <div class="flex flex-wrap gap-1.5 pt-1">
                <button type="button" onclick="addTotemQaSkill('Decisive Execution')" class="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold border border-slate-200 transition">+ Decisive Execution</button>
                <button type="button" onclick="addTotemQaSkill('Cloud Infrastructure')" class="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold border border-slate-200 transition">+ Cloud Infrastructure</button>
                <button type="button" onclick="addTotemQaSkill('Strategic Roadmapping')" class="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold border border-slate-200 transition">+ Roadmapping</button>
                <button type="button" onclick="addTotemQaSkill('Leadership')" class="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold border border-slate-200 transition">+ Leadership</button>
              </div>
            </div>

            <!-- Q4: Proudest Highlight -->
            <div class="md:col-span-2 space-y-1.5">
              <label class="block font-bold text-slate-800">
                4. Proudest Project or Measurable Achievement
              </label>
              <textarea id="totemQaExp" rows="2" class="input !bg-slate-50 !border-slate-300 !text-slate-900 !text-xs !py-2.5 w-full rounded-xl leading-relaxed" placeholder="Describe a key achievement...">Spearheaded critical distributed systems deployment, improving reliability to 99.95% while eliminating pipeline bottlenecks for a high-growth product team.</textarea>
            </div>
          </div>

          <!-- Submit Button & Feedback -->
          <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div id="totemQaStatus" class="text-xs text-slate-500 font-medium">
              <span>🐾 ${t.badge} is ready to compile your profile.</span>
            </div>
            <button type="button" id="btnSubmitTotemQa" onclick="submitTotemInteractiveQa()" class="totem-btn-primary !py-3 !px-7 text-xs font-black shadow-md flex items-center gap-2">
              <span>✨ Generate My Companion CV</span>
              <span>→</span>
            </button>
          </div>

          <!-- Result Container for Generated CV -->
          <div id="totemQaResultCard" class="hidden p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-teal-50/50 border border-indigo-200 space-y-4">
            <!-- Injected on generation -->
          </div>
        </div>

        <!-- Mode B: Direct PDF Upload Panel -->
        <div id="panelTotemPdf" class="hidden p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h4 class="text-base font-black text-slate-900">
              Drop or Select Your Existing Resume PDF
            </h4>
            <p class="text-xs text-slate-500 mt-0.5">${t.badge} will parse skills and verify milestones.</p>
          </div>

          <div class="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer space-y-3" onclick="document.getElementById('totemPdfFileInput').click()">
            <input type="file" id="totemPdfFileInput" class="hidden" accept=".pdf" onchange="handleTotemPdfUpload(event)" />
            <div class="text-3xl">📥</div>
            <div class="text-sm font-black text-slate-800">Click to choose a PDF or drag and drop here</div>
            <div class="text-xs text-slate-400">Supports standard single or multi-page PDF resumes (Max 10MB)</div>
          </div>

          <div id="totemPdfStatus" class="hidden text-xs font-bold text-center p-3 rounded-xl bg-indigo-50 text-indigo-700"></div>
        </div>

      </div>
    `;

    if (resultCard) resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  window.setTotemCompanionMode = function (mode) {
    const btnQa = document.getElementById("btnTotemModeQa");
    const btnPdf = document.getElementById("btnTotemModePdf");
    const panelQa = document.getElementById("panelTotemQa");
    const panelPdf = document.getElementById("panelTotemPdf");

    if (mode === "qa") {
      if (btnQa) {
        btnQa.className = "btn-companion-mode active px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 border bg-indigo-600 text-white border-indigo-600 shadow-sm";
      }
      if (btnPdf) {
        btnPdf.className = "btn-companion-mode px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border bg-white text-slate-700 border-slate-200 hover:border-indigo-300 shadow-2xs";
      }
      if (panelQa) panelQa.classList.remove("hidden");
      if (panelPdf) panelPdf.classList.add("hidden");
    } else {
      if (btnPdf) {
        btnPdf.className = "btn-companion-mode active px-5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 border bg-indigo-600 text-white border-indigo-600 shadow-sm";
      }
      if (btnQa) {
        btnQa.className = "btn-companion-mode px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border bg-white text-slate-700 border-slate-200 hover:border-indigo-300 shadow-2xs";
      }
      if (panelQa) panelQa.classList.add("hidden");
      if (panelPdf) panelPdf.classList.remove("hidden");
    }
  };

  window.addTotemQaSkill = function (skill) {
    const el = document.getElementById("totemQaSkills");
    if (!el) return;
    const current = el.value.trim();
    if (!current) {
      el.value = skill;
    } else if (!current.toLowerCase().includes(skill.toLowerCase())) {
      el.value = current + ", " + skill;
    }
    el.focus();
  };

  window.submitTotemInteractiveQa = async function () {
    const roleInput = document.getElementById("totemQaRole");
    const skillsInput = document.getElementById("totemQaSkills");
    const expInput = document.getElementById("totemQaExp");
    const yearsInput = document.getElementById("totemQaYears");
    const modeInput = document.getElementById("totemQaWorkMode");
    const statusEl = document.getElementById("totemQaStatus");
    const resultCardEl = document.getElementById("totemQaResultCard");
    const btn = document.getElementById("btnSubmitTotemQa");

    const role = (roleInput ? roleInput.value : "").trim();
    const skills = (skillsInput ? skillsInput.value : "").trim();
    const exp = (expInput ? expInput.value : "").trim();
    const years = yearsInput ? yearsInput.value : "3-5 Years";
    const workMode = modeInput ? modeInput.value : "Remote-First";

    if (!role) {
      alert("Please enter a target or current role title.");
      if (roleInput) roleInput.focus();
      return;
    }

    if (btn) btn.disabled = true;
    if (statusEl) statusEl.innerHTML = `<span class="inline-block animate-spin">🌀</span> <span>Companion is assembling and certifying your executive profile...</span>`;

    try {
      const csrfToken = await getCsrfToken();
      const payload = {
        role: role,
        skills: skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : ["Decision Making", "System Architecture"],
        experience_highlight: exp || `Demonstrated strong execution and strategic problem solving in ${role}.`,
        years: years,
        work_mode: workMode,
        industry: "Technology & Digital Innovation"
      };

      const res = await fetch("/api/cv/interactive-build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to generate companion profile.");
      }

      if (statusEl) statusEl.innerHTML = `✅ <span class="text-emerald-700 font-bold">Profile successfully generated!</span>`;

      // Render Result Card
      if (resultCardEl) {
        resultCardEl.classList.remove("hidden");
        const downloadHref = data.pdf_base64 
          ? `data:application/pdf;base64,${data.pdf_base64}` 
          : `/api/cv/me/pdf`;

        resultCardEl.innerHTML = `
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-200/80 pb-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🎉</span>
                <div>
                  <h5 class="text-base font-black text-slate-900">${role} · Executive Profile</h5>
                  <div class="text-xs text-indigo-700 font-bold">Generated by Career Companion · Verified A4 Layout</div>
                </div>
              </div>
              <a href="${downloadHref}" download="${(data.cv && data.cv.original_filename) || 'CareerLens_Profile.pdf'}" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition flex items-center gap-2">
                <span>📥 Download PDF Resume</span>
              </a>
            </div>

            <div class="grid sm:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-white border border-indigo-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Target Role</div>
                <div class="font-bold text-slate-800 mt-0.5">${role}</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-indigo-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Experience &amp; Rhythm</div>
                <div class="font-bold text-slate-800 mt-0.5">${years} · ${workMode}</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-indigo-100">
                <div class="text-[10px] uppercase font-bold text-slate-400">Extracted Skills</div>
                <div class="font-bold text-teal-700 mt-0.5">${(payload.skills || []).slice(0, 3).join(', ')}</div>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-white border border-indigo-100 text-xs text-slate-700 leading-relaxed italic">
              "${data.cv && data.cv.structured_cv ? data.cv.structured_cv.executive_summary : exp}"
            </div>

            <div class="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span class="text-xs text-slate-600 font-medium">Ready to claim your profile and search vacancies?</span>
              <button type="button" onclick="openAuth('register', 'job_seeker')" class="totem-btn-primary !py-2.5 !px-6 text-xs font-black shadow-md flex items-center gap-1.5">
                <span>🚀 Claim Profile to Account &amp; Enter Workspace</span>
                <span>→</span>
              </button>
            </div>
          </div>
        `;
      }

    } catch (err) {
      if (statusEl) statusEl.innerHTML = `⚠️ <span class="text-rose-600">${err.message || 'Error occurred.'}</span>`;
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  window.handleTotemPdfUpload = async function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById("totemPdfStatus");
    if (statusEl) {
      statusEl.classList.remove("hidden");
      statusEl.innerHTML = `<span class="inline-block animate-spin">🌀</span> Parsing ${file.name} with Career Companion...`;
    }

    try {
      const csrfToken = await getCsrfToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cv/upload", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        if (statusEl) statusEl.innerHTML = `✅ Successfully parsed ${file.name}! <button type="button" onclick="openAuth('login')" class="underline font-bold ml-2">Login to view full vault</button>`;
      } else {
        throw new Error(data.message || "Please sign in to save uploaded PDFs to your vault.");
      }
    } catch (err) {
      if (statusEl) {
        statusEl.innerHTML = `💡 ${err.message || 'Please register or log in to sync your PDF directly to your vault.'} <button type="button" onclick="openAuth('register', 'job_seeker')" class="underline font-bold ml-2 text-indigo-700">Create Account →</button>`;
      }
    }
  };

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
        <div class="flex items-start justify-between gap-3 border-b border-indigo-200 pb-3">
          <div>
            <h5 class="text-sm font-black text-slate-900">${val}</h5>
            <div class="text-[10px] text-indigo-700 font-bold">Evaluated against your ${calculatedTotem ? calculatedTotem.badge : 'Totem'} DNA</div>
          </div>
          <span class="chip chip-emerald !text-xs font-black">94% Compatibility</span>
        </div>
        <div class="grid sm:grid-cols-2 gap-3 pt-1 text-[11px]">
          <div class="p-3 rounded-xl bg-white border border-emerald-200">
            <b class="text-emerald-800 font-black block mb-0.5">⚡ Why You'll Excel:</b>
            <p class="text-slate-700 leading-relaxed">Your high autonomous drive, strategic clarity, and decisive focus allow you to master the steep curve without friction.</p>
          </div>
          <div class="p-3 rounded-xl bg-white border border-amber-200">
            <b class="text-amber-800 font-black block mb-0.5">⚠️ Watch Out For:</b>
            <p class="text-slate-700 leading-relaxed">Ensure you seek out environments with high autonomy and asynchronous velocity rather than rigid micromanagement.</p>
          </div>
        </div>
        <div class="pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button type="button" onclick="showCompanionCvStudio('${val.replace(/'/g, "\\'")}')" class="totem-btn-primary !py-2 !px-4 !text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <span>🐾 Craft CV for ${val}</span>
            <span>→</span>
          </button>
          <button type="button" onclick="openAuth('register', 'job_seeker')" class="font-bold text-slate-500 hover:text-indigo-600 transition">
            Save Target Role ↗
          </button>
        </div>
      `;
    }, 600);
  };

  // View 4: Dedicated Global Work-Life Atlas Modal
  window.openGlobalAtlas = function () {
    const modal = document.getElementById("globalAtlasModal");
    if (modal) {
      modal.classList.remove("hidden");
      window.atlasReturnFocus = document.activeElement;
      document.body.style.overflow = 'hidden';
      modal.querySelector('[data-atlas-close]')?.focus();
      showCityCard(currentAtlasCityKey);
      window.careerEarth?.resume();
      if (!globeInitialized) {
        setTimeout(() => {
          initGlobeVisual();
          globeInitialized = Boolean(window.careerEarth);
        }, 100);
      }
    }
  };

  window.closeGlobalAtlas = function () {
    const modal = document.getElementById("globalAtlasModal");
    if (modal) modal.classList.add("hidden");
    window.careerEarth?.pause();
    document.body.style.overflow = '';
    window.atlasReturnFocus?.focus();
  };
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('globalAtlasModal');
    if (!modal || modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') { closeGlobalAtlas(); return; }
    if (e.key === 'Tab') {
      const items = [...modal.querySelectorAll('button,a[href],canvas[tabindex],input,select')].filter(el => !el.disabled && el.getClientRects().length);
      const first=items[0], last=items[items.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
    }
  });

  let currentAtlasCityKey = "kl";
  let currentAtlasRoleId = null;
  let currentAtlasRoutineIdx = 0;

  window.selectAtlasRole = function (cityKey, roleId) {
    showCityCard(cityKey, roleId);
    document.querySelector(".atlas-story-detail")?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
  };

  window.surpriseAtlasCity = function () {
    const keys = Object.keys(GLOBAL_CITIES).filter(k => k !== currentAtlasCityKey);
    const nextCity = keys[Math.floor(Math.random() * keys.length)];
    showCityCard(nextCity);
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
      <div class="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition">
        <span class="font-mono text-teal-300 font-extrabold text-xs shrink-0 bg-teal-500/15 px-2.5 py-1 rounded-lg border border-teal-400/25">${item.time}</span>
        <div class="text-slate-100 text-xs leading-relaxed">
          <span class="mr-1.5 text-sm">${item.emoji || '✦'}</span>${item.text}
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

    // Smoothly fly and focus 3D globe to this city
    if (window.CareerEarth?.select) {
      window.CareerEarth.select(cityKey);
    } else if (window.careerEarth?.select) {
      window.careerEarth.select(cityKey);
    }

    const container = document.getElementById("cityDetailsContainer");
    const hubContainer = document.getElementById("cityHubInfoContainer") || document.getElementById("cityRelatedRolesContainer");
    if (!container) return;

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
    document.querySelector("#globalAtlasModal .atlas-explorer-story")?.classList.add("atlas-story-open");

    const isInsidePortal = Boolean(document.getElementById("profileTotemCard") || window.location.pathname.includes("workspace"));
    const actionBtnHtml = isInsidePortal
      ? `<button type="button" onclick="closeGlobalAtlas(); if(typeof showTab==='function') showTab('jobs');" class="totem-btn-primary !py-2.5 !px-5 !text-xs font-bold rounded-xl shadow-lg">
           💼 Explore Careers in Portal →
         </button>`
      : `<button type="button" onclick="closeGlobalAtlas(); if(typeof openAuth==='function') openAuth('register', 'job_seeker'); else window.location.href='/#auth';" class="totem-btn-primary !py-2.5 !px-5 !text-xs font-bold rounded-xl shadow-lg">
           Sign Up &amp; Match Careers →
         </button>`;

    if (!selectedRole) return;

    // 1. Render Left Column: Hub Information & Role Switcher
    if (hubContainer) {
      hubContainer.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${c.flag || '🌍'}</span>
              <div>
                <h4 class="text-base font-black text-white tracking-tight">${c.name}, ${c.country}</h4>
                <div class="text-[11px] font-mono text-teal-300 font-bold">${c.roles ? c.roles.length : 1} Featured Profiles</div>
              </div>
            </div>
            <button type="button" onclick="surpriseAtlasCity()" class="text-xs text-indigo-300 hover:text-white font-mono flex items-center gap-1 transition" title="Teleport to another city">
              <span>Next Hub →</span>
            </button>
          </div>

          <div class="text-xs text-slate-300 leading-relaxed">
            <span class="text-teal-300 font-bold">Local Vibe:</span> ${c.vibe}
          </div>

          <div class="pt-2 border-t border-white/10 space-y-2">
            <div class="text-[10px] uppercase tracking-wider font-mono text-indigo-300 font-extrabold">Professionals in ${c.name}</div>
            <div class="grid gap-2">
              ${(c.roles || []).map(r => {
                const isSelected = r.id === selectedRole.id;
                return `
                  <button type="button" onclick="showCityCard('${cityKey}', '${r.id}')" class="p-2 sm:p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-left transition ${isSelected ? 'bg-teal-500/20 border-teal-400 text-white shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'}">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <img src="${r.persona.photo}" alt="${r.persona.name}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover object-top border border-white/20 shrink-0" />
                      <div class="min-w-0">
                        <div class="text-xs font-black truncate">${r.persona.name}</div>
                        <div class="text-[11px] text-teal-300 font-medium truncate">${r.title}</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${isSelected ? 'bg-teal-400/30 text-teal-200 font-bold' : 'text-slate-400'}">${isSelected ? 'Active' : 'View →'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // 2. Render Right Column: Active Role Hero Plog/Vlog & Visual Showcase
    container.innerHTML = `
      <div class="city-day-card p-6 sm:p-7 space-y-5 h-full flex flex-col justify-between fade-in text-slate-100">
        <!-- Top Persona Showcase Card with Portrait Photo -->
        <div class="space-y-4">
          <div class="p-5 sm:p-6 rounded-3xl bg-white/10 border border-white/15 space-y-4 shadow-xl backdrop-blur-xl">
            <div class="atlas-persona-layout flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <!-- Full Uncropped High-Res Portrait Photo -->
              <div class="relative shrink-0">
                <img src="${selectedRole.persona.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&q=80'}" alt="${selectedRole.persona.name}" class="atlas-persona-photo w-32 h-44 sm:w-36 sm:h-48 object-cover object-top rounded-2xl border-2 border-teal-400/40 shadow-2xl" loading="lazy" />
                <span class="absolute -bottom-2 -right-2 text-xl p-1 bg-slate-900/90 rounded-full border border-white/20 shadow-md">${selectedRole.persona.avatar || '👩🏻‍💻'}</span>
              </div>
              
              <div class="atlas-persona-copy space-y-2 text-center sm:text-left min-w-0 flex-1">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight">${selectedRole.persona.name}</h3>
                  <span class="text-xs font-mono text-teal-300 font-bold bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30">${selectedRole.persona.handle}</span>
                  <span class="text-[11px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">Authentic Day</span>
                </div>
                <div class="text-sm font-extrabold text-teal-300">${selectedRole.title}</div>
                <div class="text-xs text-indigo-200 font-mono">${selectedRole.industry} · ${c.name}, ${c.country}</div>
                <p class="text-xs text-slate-300 leading-relaxed italic pt-1">"${selectedRole.persona.bio}"</p>
              </div>
            </div>

            <!-- First-Person Lifestyle Caption (Visual-centric, short & punchy) -->
            <div class="mt-4 text-xs sm:text-sm text-slate-100 leading-relaxed italic bg-black/30 p-4 rounded-2xl border border-white/10 shadow-inner">
              "${selectedRole.plog}"
            </div>
          </div>

          <!-- What They Do: Core Responsibilities & Impact -->
          <div class="atlas-job-box space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <span>💼</span><span>Core Responsibilities &amp; Impact</span>
              </div>
              <span class="text-[11px] font-bold text-teal-300 font-mono bg-teal-500/15 px-2 py-0.5 rounded border border-teal-400/20">${selectedRole.industry || 'Technology'}</span>
            </div>
            
            <p class="text-xs text-slate-200 leading-relaxed font-medium">
              ${selectedRole.job_desc.summary}
            </p>

            <ul class="space-y-1.5 text-xs text-slate-200">
              ${selectedRole.job_desc.tasks.map(t => `
                <li class="flex items-start gap-2">
                  <span class="text-teal-400 text-sm leading-none shrink-0 font-bold">✓</span>
                  <span>${t}</span>
                </li>
              `).join('')}
            </ul>

            <div class="pt-1 flex flex-wrap gap-1.5">
              ${(selectedRole.skills || []).map(s => `
                <span class="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-200 px-2.5 py-1 rounded-lg border border-indigo-400/30">${s}</span>
              `).join('')}
            </div>
          </div>

          <!-- Schedule Timeline with Dynamic Routine Shuffling -->
          <div class="space-y-3 pt-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <span>☀️</span><span>Positive Daily Routine &amp; Rhythm</span>
                <span id="atlasRoutineVariantBadge" class="text-[10px] text-slate-300 font-mono lowercase bg-white/10 px-2 py-0.5 rounded-full border border-white/10">Daily Baseline</span>
              </div>
              <button type="button" onclick="shuffleAtlasRoutine()" class="atlas-shuffle-btn" title="Cycle through realistic positive day routines">
                <span>🎲</span><span>Shuffle Routine</span>
              </button>
            </div>

            <div id="atlasTimelineContainer" class="space-y-2 text-xs">
              ${selectedRole.routine.map(item => `
                <div class="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/10 transition">
                  <span class="font-mono text-teal-300 font-extrabold text-xs shrink-0 bg-teal-500/15 px-2.5 py-1 rounded-lg border border-teal-400/25">${item.time}</span>
                  <div class="text-slate-100 text-xs leading-relaxed">
                    <span class="mr-1.5 text-sm">${item.emoji || '✦'}</span>${item.text}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer Tags & CTA -->
        <div class="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5 text-[11px] text-slate-300 font-bold">
            ${selectedRole.tags.map(t => `<span class="bg-white/10 px-3 py-1 rounded-xl border border-white/15 text-slate-200">${t}</span>`).join('')}
          </div>
          ${actionBtnHtml}
        </div>
      </div>
    `;
  };

  // Lightweight Interactive 3D Sphere on HTML5 Canvas
  function initGlobeVisual() {
    window.careerEarth = window.CareerEarth?.mount(document.getElementById('globeCanvas'));
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
            <img src="${t.characterImage || ('/static/illustrations/totem_characters/' + (t.key || 'retriever') + '.svg')}" alt="${t.badge || 'Totem'}" class="w-20 h-20 object-contain filter drop-shadow hover:scale-105 transition-transform" />
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
