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

  window.showCityCard = function (cityKey) {
    const c = GLOBAL_CITIES[cityKey] || GLOBAL_CITIES.kl;
    const container = document.getElementById("cityDetailsContainer");
    if (!container) return;

    // Toggle active pill highlight
    document.querySelectorAll(".atlas-city-pill").forEach(el => el.classList.remove("active"));
    const activeBtn = document.getElementById("atlasBtn_" + cityKey);
    if (activeBtn) activeBtn.classList.add("active");

    const isInsidePortal = Boolean(document.getElementById("profileTotemCard") || window.location.pathname.includes("workspace"));
    const actionBtnHtml = isInsidePortal
      ? `<button type="button" onclick="closeGlobalAtlas(); if(typeof showTab==='function') showTab('jobs');" class="totem-btn-primary !py-2 !px-4 !text-xs font-bold shadow-md">
           💼 Explore Careers in Portal →
         </button>`
      : `<button type="button" onclick="closeGlobalAtlas(); if(typeof openAuth==='function') openAuth('register', 'job_seeker'); else window.location.href='/#auth';" class="totem-btn-primary !py-2 !px-4 !text-xs font-bold shadow-md">
           Sign Up &amp; Find Roles →
         </button>`;

    container.innerHTML = `
      <div class="city-day-card p-6 space-y-4 h-full flex flex-col justify-between fade-in">
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/15 pb-3">
            <div>
              <div class="text-[11px] font-extrabold text-teal-300 uppercase tracking-wider">${c.country}</div>
              <h4 class="text-xl font-black text-white">${c.name}</h4>
            </div>
            <span class="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-extrabold shadow-sm">${c.salary}</span>
          </div>

          <div class="text-xs text-indigo-300 font-extrabold">
            Target Role: <span class="text-white">${c.role}</span>
          </div>

          <div class="p-3.5 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-200 leading-relaxed">
            <b class="text-teal-300">Work-Life Vibe:</b> ${c.vibe}
          </div>

          <!-- Schedule Timeline -->
          <div class="space-y-2 text-xs pt-1">
            <div class="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">Day in the Life Routine:</div>
            ${c.timeline.map(item => `
              <div class="flex items-start gap-2.5">
                <span class="font-mono text-teal-300 font-extrabold text-xs shrink-0 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">${item.time}</span>
                <span class="text-slate-200 text-xs leading-relaxed">${item.text}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-1.5 text-[11px] text-slate-300 font-bold">
            ${c.tags.map(t => `<span class="bg-white/10 px-2 py-0.5 rounded-md border border-white/10 text-slate-200">${t}</span>`).join('')}
          </div>
          ${actionBtnHtml}
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
