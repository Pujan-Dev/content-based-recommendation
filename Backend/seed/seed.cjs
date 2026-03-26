/**
 * MongoDB Seed Script
 * Run with: mongosh "your-mongo-uri" seed.js
 * Or:       node seed.js  (after setting MONGO_URI in .env)
 */

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DATABASE || "social_media";
const COLLECTION = process.env.MONGODB_POSTS_COLLECTION || "posts";

// ─── Category Keywords (for subreddit naming) ────────────────────────────────
const CATEGORIES = {
  gaming: ["Fortnite", "Apex Legends", "Valorant", "Minecraft", "League of Legends", "PUBG", "Call of Duty", "Elden Ring", "Rocket League", "Esports"],
  relationships: ["Dating", "Breakups", "Love & Romance", "Marriage", "Trust", "Communication", "Friendship", "Jealousy", "Toxic Relationships", "Proposals"],
  career_jobs: ["Job Search", "Resume Writing", "Interviews", "Freelancing", "Internships", "Salary Negotiation", "Networking", "Career Growth", "Remote Work", "Promotions"],
  education: ["Study Tips", "Exams", "College Life", "Scholarships", "Research", "Online Learning", "Assignments", "University", "Grades", "Learning Hacks"],
  finance: ["Investing", "Crypto", "Budgeting", "Stock Market", "Bitcoin", "Saving Money", "Financial Planning", "Debt Management", "Passive Income", "Trading"],
  technology: ["AI & ML", "Web Development", "Python", "JavaScript", "Cybersecurity", "Cloud Computing", "Data Science", "Blockchain", "React", "Programming Tips"],
  entertainment: ["Movies", "Netflix", "TV Series", "Music", "YouTube", "Celebrity News", "TikTok", "Streaming", "Bollywood", "Hollywood"],
  mental_health: ["Anxiety", "Depression", "Stress Management", "Mindfulness", "Self Care", "Therapy", "Meditation", "Burnout", "Motivation", "Emotional Wellness"],
  parenting_family: ["Parenting Tips", "Childcare", "Family Life", "Pregnancy", "Kids Education", "Discipline", "Household", "Toddlers", "Siblings", "Family Bonds"],
  health_fitness: ["Workout", "Gym Training", "Running", "Yoga", "Nutrition", "Weight Loss", "Cardio", "Strength Training", "Wellness", "Healthy Eating"],
  travel: ["Backpacking", "Vacation Planning", "Road Trips", "Adventure Travel", "Travel Tips", "Culture", "Beaches", "Mountains", "Travel Blogging", "Destinations"],
  sports: ["Football", "Basketball", "Cricket", "Tennis", "Olympics", "Rugby", "Baseball", "Hockey", "Golf", "Sports Training"],
  news_politics: ["World News", "Elections", "Government Policy", "Politics", "Current Affairs", "Debates", "International Relations", "Protests", "Law", "Diplomacy"],
  food_cooking: ["Recipes", "Baking", "Healthy Eating", "Restaurants", "Vegetarian", "Vegan Food", "Desserts", "World Cuisine", "Cooking Tips", "Meal Prep"],
  science: ["Physics", "Space Exploration", "Biology", "Chemistry", "Genetics", "Climate Research", "Astronomy", "Discoveries", "Quantum", "Environment"],
};

// ─── Post templates per category ─────────────────────────────────────────────
const POST_TEMPLATES = {
  gaming: [
    { title: "Finally hit Diamond in Valorant after 3 months of grinding", body: "It took me countless hours of practice, watching VODs, and adjusting my crosshair placement. The key improvement was my communication with teammates. Anyone else grind ranked this season? Tips that helped me: always warm up in deathmatch for 15 mins before ranked, focus on one agent, and never tilt queue." },
    { title: "Minecraft 1.21 update is absolutely insane - new features breakdown", body: "The new trial chambers are incredible for mid-game progression. Copper bulbs as a new light source are game changing for building. The breeze mob adds a whole new challenge dynamic. Been playing since beta and this might be one of the best updates they've ever dropped." },
    { title: "Why Elden Ring is the best FromSouls game ever made", body: "The open world design fundamentally changed how exploration works in soulslike games. No longer are you funneled through corridors - you can approach any challenge from multiple angles. The lore depth combined with Miyazaki and GRRM collaboration created something truly special. 300+ hours and I'm still discovering new things." },
    { title: "Best budget gaming setup under $500 in 2026", body: "Built my entire setup for under $500 and it handles everything I throw at it. Key picks: AMD Ryzen 5 5600 for CPU, RX 6600 GPU, 16GB DDR4 RAM. For peripherals I went with a 144hz 1080p IPS monitor, mechanical keyboard with budget switches, and a decent optical mouse. Full breakdown in the comments." },
    { title: "Apex Legends Season 21 tier list - which legends to main", body: "After 2000+ hours I finally feel qualified to rank all legends. S tier: Bloodhound, Wraith, Horizon. A tier: Lifeline, Gibraltar, Valkyrie. The ranked meta has shifted heavily toward mobility and information gathering. Damage dealers without utility are struggling in high elo. What's your main and why?" },
  ],
  relationships: [
    { title: "How I fixed communication issues in my 3-year relationship", body: "We were arguing constantly about small things until we realized the real issue was neither of us felt heard. We started doing a weekly 'check-in' - 30 mins no phones where we each share how we felt about the week. Game changer. Also learning each other's love language helped enormously. Highly recommend the book by Gary Chapman." },
    { title: "Dating in your late 20s hits different - here's what I learned", body: "Everyone knows what they want. No more playing games, no more breadcrumbing. People are direct about intentions which is actually refreshing. The dating pool is smaller but the quality of connections is higher. The downside is everyone carries more baggage and trauma. Learning to have honest conversations early saves so much time." },
    { title: "Red flags I ignored that I wish I hadn't - lessons learned", body: "Looking back, all the signs were there in month one. Love bombing, isolation from friends, inconsistent communication, gaslighting when I brought up concerns. I want to write this so someone else can recognize these patterns. Trust your gut. If something feels off early on, it usually doesn't improve - it gets worse." },
    { title: "Long distance relationships can work - here's how we did it", body: "3 years long distance across two time zones and we made it work. Key things: scheduled video calls, not just texting. Sending care packages monthly. Having a clear timeline for when the distance ends. Visiting every 6-8 weeks. Trust is everything - if you don't have that foundation, distance will destroy it." },
    { title: "When is the right time to move in together?", body: "We waited 2 years before moving in and I think that was the right call for us. We had already worked through most major conflicts and knew each other's habits. My advice: make sure you've seen each other stressed, sick, and angry before committing to shared space. Also discuss finances and chores explicitly before signing a lease." },
  ],
  career_jobs: [
    { title: "I got rejected 47 times before landing my dream job - here's my story", body: "Started applying in January, got my first offer in August. The turning point was completely rewriting my resume using ATS-friendly formatting, tailoring every cover letter, and aggressively networking on LinkedIn. The job I got wasn't even publicly posted - someone I connected with referred me. Networking is not optional anymore." },
    { title: "How to negotiate salary without losing the offer", body: "Most people leave 10-20% on the table because they're afraid to negotiate. Always negotiate. The worst they can say is no. Research market rates on levels.fyi and Glassdoor. Counter with a specific number, not a range. Silence after your counter is powerful - let them respond. I negotiated $15k more than the initial offer last month." },
    { title: "Freelancing full time - 6 months in, honest review", body: "Income is 40% higher than my old job but the instability is real. Some months are great, some are slow. The freedom is incredible but self-discipline is everything. Best advice: build 3 months of savings before going full-time, have at least 2-3 clients before quitting, and always be looking for new clients even when busy." },
    { title: "Skills that got me promoted in 18 months as a junior dev", body: "Technical skills are table stakes. What actually got me promoted: clear written communication, proactively identifying problems before they became crises, mentoring the newest hire, and documenting everything I built. Also, I made my manager's job easier by providing weekly status updates without being asked. Visibility matters." },
    { title: "Remote work is killing my career - controversial take", body: "I've been fully remote for 2 years and I've noticed I'm getting passed over for opportunities that go to office people. Out of sight, out of mind is real. I'm not saying remote work is bad - the flexibility is great - but if you're early career and want to move up fast, being in the office has strategic advantages." },
  ],
  education: [
    { title: "Study technique that helped me go from C's to A's in one semester", body: "Active recall and spaced repetition completely changed how I study. Instead of rereading notes (passive), I test myself constantly (active). Using Anki for flashcards and the Pomodoro technique for focus sessions. Also stopped studying in my room - library only. The environmental change alone improved focus by 50%." },
    { title: "Is a college degree worth it in 2026? My honest take", body: "Depends entirely on the field. For medicine, law, engineering - absolutely yes. For business, arts, communications - the ROI is questionable when you factor in debt. Bootcamps and certifications are genuinely replacing degrees in tech. I have a CS degree and I'm glad I got it but I understand why many people are choosing alternatives." },
    { title: "How I got a full scholarship to a top university", body: "Applied to 12 scholarships, won 3, one of which was a full ride. Key strategies: start early (junior year of high school), tailor every essay to the specific scholarship's values, get multiple readers for your essays, and apply to scholarships others don't know about - local ones are less competitive. Persistence is everything." },
    { title: "Online learning platforms ranked after completing 20+ courses", body: "Coursera for academic content and certificates that employers recognize. Udemy for practical skills - wait for sales, never pay full price. YouTube is genuinely underrated for technical content. MasterClass is good but overpriced for most use cases. LinkedIn Learning is decent if your employer pays for it. Consistency matters more than platform." },
    { title: "PhD student reality check - what nobody tells you before applying", body: "The stipend is barely livable. Your advisor relationship will make or break your experience. Imposter syndrome is universal and constant. The job market for academia is brutal. That said, if you're genuinely passionate about your research area and want to push the frontier of knowledge, it's worth it. Just go in with eyes open." },
  ],
  finance: [
    { title: "How I paid off $40,000 in student loans in 2 years", body: "Aggressive strategy: lived with parents, drove a 2012 Honda, took every overtime shift available, and put 70% of every paycheck toward the debt. Used the avalanche method - highest interest first. Refinanced at a lower rate once I had good credit. The psychological weight that lifted when it was gone was indescribable. Worth every sacrifice." },
    { title: "Crypto in 2026 - what I learned from losing $8000", body: "Don't invest what you can't afford to lose is cliche because it's true. I went in without understanding the technology, chased hype cycles, panic sold at bottoms and FOMO bought at tops. Classic mistakes. Now I only hold BTC and ETH, dollar cost average monthly, and never check prices more than once a week. Much more sane." },
    { title: "Index funds vs individual stocks - 5 year comparison", body: "I split my portfolio 50/50 five years ago. The index funds beat my stock picks by 12% cumulative. And I spent dozens of hours researching individual stocks. Buffett was right - most people should just buy the index and forget about it. I keep a small percentage for individual picks because it's fun but I don't pretend it's optimal." },
    { title: "The 50/30/20 budget rule actually works - here's my breakdown", body: "50% needs (rent, food, utilities), 30% wants (entertainment, dining out, hobbies), 20% savings and debt. Simple, memorable, flexible. I've been using it for 3 years and my emergency fund is fully funded, retirement contributions are on track, and I don't feel deprived. The key is automating the 20% the day your paycheck hits." },
    { title: "Starting investing at 22 vs 32 - the math is shocking", body: "If you invest $300/month starting at 22 at 7% average return, by 65 you have $1.1 million. Starting at 32? $560,000. Same monthly investment, 10 year difference, almost double the outcome. Compound interest is the eighth wonder of the world. Start now, even if it's a small amount. Time in the market beats timing the market." },
  ],
  technology: [
    { title: "I built a full-stack app in a weekend using AI tools - here's what I learned", body: "Used Claude for architecture decisions, Cursor for code generation, and Vercel for deployment. The app was a habit tracker with a React frontend and Node/MongoDB backend. What would have taken me 2 weeks took 2 days. The bottleneck wasn't code - it was product decisions and debugging unexpected edge cases. AI is a multiplier, not a replacement." },
    { title: "Python vs JavaScript for beginners in 2026 - which should you learn first?", body: "Python for data science, ML, automation, and backend. JavaScript for web development, full-stack, and the widest job market. If you don't know your direction yet, JavaScript has more immediate visible results (you build things in the browser) which keeps beginners motivated. If you know you want data science, Python all the way." },
    { title: "My cybersecurity home lab setup for under $200", body: "Running a pfSense firewall on an old PC, VLANs for network segmentation, a Raspberry Pi as a Pi-hole DNS server, and a TrueNAS box for storage. Practice environment includes Kali Linux VMs and vulnerable machines from HackTheBox. Learning hands-on is 10x more effective than just reading. This setup covers most CompTIA Security+ exam topics." },
    { title: "Why I switched from AWS to self-hosting and never looked back", body: "My AWS bill was $400/month for a side project. I bought a used Dell PowerEdge server for $300, set up Proxmox, and now run everything myself for $15/month in electricity. The learning curve was steep but I understand infrastructure so much better now. For production services with compliance requirements, still use cloud. For personal projects, self-host is amazing." },
    { title: "React is overused - fight me", body: "A static blog does not need React. A landing page does not need React. A portfolio site does not need React. The JavaScript ecosystem has gone insane with complexity. For content sites: use Astro, Hugo, or plain HTML/CSS. Save React for genuinely interactive applications that need component state management. Your users' batteries will thank you." },
  ],
  entertainment: [
    { title: "Movies that genuinely changed how I see the world", body: "Parasite made me think about class and capitalism in ways I never had before. Everything Everywhere All at Once destroyed me emotionally in the best way. The Zone of Interest made me sit in silence for 20 minutes after. Cinema at its best isn't just entertainment - it's forced perspective taking. These films stayed with me for months." },
    { title: "Best underrated TV series you probably haven't watched", body: "Halt and Catch Fire is the most realistic depiction of startup culture ever made. Dark (German) is the most complex time travel story in any medium. The Leftovers is about grief in a way that nothing else has ever captured. Station Eleven is beautiful and devastating. All streaming, all worth your time more than the shows everyone talks about." },
    { title: "Spotify algorithm decoded - how to actually use it for music discovery", body: "Your listening habits train the algorithm. If you want better recommendations: create separate playlists for different moods, use the radio feature from songs you love, check Discover Weekly every single Monday morning, and explore the artists your favorite artists follow. Also: the more niche your taste, the better the recommendations get." },
    { title: "YouTube creator burnout is a real crisis nobody talks about", body: "The platform demands consistent uploads, constant engagement with comments, thumbnail optimization, SEO, multiple social media channels, and merchandise - all while creating genuinely good content. Many creators are burning out silently because their audience sees the highlights, not the exhaustion. The business model incentivizes quantity over wellbeing." },
    { title: "Why film photography is making a genuine comeback", body: "There's something about the constraint of 36 exposures that makes you think more carefully about each shot. The grain, the imperfections, the delayed gratification of developing film - it's a completely different relationship with photography. Kodak Ultramax and Fuji Superia 400 are great starting points. Film cameras are available cheaply second-hand right now." },
  ],
  mental_health: [
    { title: "What actually helped my anxiety after years of struggling", body: "Therapy was the foundation - specifically CBT helped me identify thought patterns I didn't even know I had. Daily exercise (even 20 min walks) was more effective than I expected. Cutting caffeine by 50% made a noticeable difference. Journaling consistently for 10 minutes each morning. And being honest with close friends instead of performing wellness I didn't feel." },
    { title: "Burnout looks different than you think - my experience", body: "I wasn't exhausted in the traditional sense. I could still function. But I felt nothing. No excitement about things I used to love, no motivation even for enjoyable activities, emotional flatness. This is what burnout actually looks like for many people - not dramatic collapse but quiet numbness. Recovery took 4 months of genuinely reduced output." },
    { title: "Meditation changed my relationship with my thoughts", body: "I was skeptical for years. Then I did a 10-day Vipassana silent retreat and understood why people talk about it. You realize you are not your thoughts - they're just events that pass through consciousness. This realization doesn't make problems disappear but it fundamentally changes how much power they have over you. Start with just 5 minutes a day." },
    { title: "Being honest about my depression helped more than hiding it", body: "I spent 3 years hiding it perfectly - high performer at work, socially active, 'fine' in every conversation. Exhausting. When I finally told my manager and close friends, the relief was immediate. People were kinder and more accommodating than I expected. Vulnerability is terrifying and also the only path through. You don't have to announce it publicly but tell someone." },
    { title: "The connection between sleep and mental health is underrated", body: "Before I fixed my sleep, no amount of therapy or exercise made a lasting difference. After consistently getting 7-8 hours, everything else worked better. Sleep hygiene basics that actually helped: consistent wake time 7 days a week, no screens 30 minutes before bed, keeping the bedroom cold, and no caffeine after 2pm. Foundation before optimization." },
  ],
  parenting_family: [
    { title: "Things I wish I knew before becoming a parent", body: "The love is overwhelming but so is the sleep deprivation. Your relationship with your partner will be tested in ways you didn't expect - make time for that relationship intentionally. It's okay to not love every moment of parenting while still loving your child deeply. Ask for help. Take the village where you can find it. And lower the bar on 'perfect' immediately." },
    { title: "How we handle screen time in our household without the guilt", body: "We don't ban screens entirely - that creates obsession. Instead: screens earn time through reading and outdoor play first, co-viewing when possible so we discuss content together, no phones at meals, and the content we allow is actively educational or social. It's not perfect but it's realistic and our kids understand the reasoning." },
    { title: "Talking to kids about mental health from a young age", body: "We normalize therapy by framing it as 'you have a feelings coach, like a sports coach but for your emotions.' We name emotions explicitly and often. We share when we're stressed and how we're managing it. The goal isn't to burden kids but to give them a vocabulary and framework before they need it desperately in adolescence." },
    { title: "Co-parenting after divorce - what's working for us two years in", body: "The key insight: our relationship as co-parents has nothing to do with our feelings about each other as former partners. We have a business relationship focused entirely on our kids' wellbeing. Consistent rules across both houses, no badmouthing each other, direct communication app instead of texting personally, and therapy for both kids and both of us individually." },
    { title: "Why I stopped trying to be a perfect parent", body: "Perfectionism in parenting is a trap that leads to anxiety, resentment, and modeling that mistakes are catastrophic. My kids learning to see me be wrong and recover, apologize and repair, struggle and persist - that's more valuable than any structured activity I could plan. Good enough parenting, done consistently, produces resilient kids." },
  ],
  health_fitness: [
    { title: "Lost 30lbs without tracking calories - here's what actually changed", body: "I focused on protein first (aiming for 150g/day), cut out liquid calories (alcohol and sugary drinks), ate whole foods 80% of the time, and went to the gym 4x a week doing progressive overload. No calorie counting, no obsessive food rules. The weight came off over 8 months naturally. Sustainable > optimal." },
    { title: "Running from couch to 5K - my 8 week journey", body: "Week one I could barely run 60 seconds. Week eight I completed a 5K in 31 minutes. The C25K app is genuinely excellent - the intervals are well-designed. Most important lessons: slow down more than you think you should, rest days are mandatory not optional, and new running shoes made a bigger difference than I expected." },
    { title: "Strength training changed my body and my relationship with it", body: "I started lifting to look better and stayed for how it made me feel. There's something deeply satisfying about measurable progress - lifting more than you did last month is concrete evidence of growth. I also noticed significant improvements in anxiety, sleep quality, and energy levels. The 'bulking' fear is vastly overblown for most people." },
    { title: "What I learned from tracking sleep for 6 months with a wearable", body: "My deep sleep is almost always between 1-3am - I shifted my bedtime earlier to capture more of it. Alcohol absolutely wrecks sleep quality even if it helps you fall asleep. Exercise timing matters - I sleep best when I work out before 6pm. And consistent wake times are more important than consistent bedtimes for circadian rhythm." },
    { title: "Yoga for athletes - why I added it to my lifting program", body: "Was skeptical that yoga was 'real training' until mobility issues started affecting my squat depth and shoulder press. Added 2 sessions per week for 3 months. Squat depth improved, shoulder pain gone, recovery between sessions faster. The hip flexor and thoracic mobility work specifically is directly applicable to barbell training. Wish I started sooner." },
  ],
  travel: [
    { title: "Solo travel for the first time at 28 - complete honest review", body: "The first day in a new city alone is disorienting. By day three you realize you can do exactly what you want, eat what you want, stay as long or short as you like at each place. The freedom is intoxicating. I met more interesting people traveling solo than I ever did in groups because solo travelers are forced to engage with strangers. Changed my life honestly." },
    { title: "Southeast Asia on $40/day - complete budget breakdown", body: "Vietnam was the cheapest (under $30/day in smaller cities), Thailand moderate ($40-50 in Bangkok, less outside), Indonesia varied wildly. Accommodation in hostels averaged $8-12/night. Street food is both the cheapest and best option everywhere. Night buses and trains between destinations save on both time and hotel costs. 2 months, 5 countries, under $2500 total." },
    { title: "Why I always get travel insurance and you should too", body: "Had a medical emergency in Peru that would have cost $15,000 out of pocket. Insurance covered everything. Annual travel insurance costs $200-400 depending on coverage. It's the one thing you buy hoping you never need. Credit cards with travel insurance are a good start but often have exclusions. Read the policy before you're sitting in a foreign hospital." },
    { title: "The most underrated travel destinations in 2026", body: "Albania is stunning and costs half of nearby Croatia. Georgia (the country) has world-class wine, incredible mountain hiking, and ancient churches with almost no crowds. Uzbekistan's Silk Road cities are genuinely awe-inspiring. Kyrgyzstan for horse trekking in landscapes that look unreal. These places won't be cheap and unknown for much longer." },
    { title: "How to travel with a full-time job - making it work", body: "I take every Friday off as PTO connected to a national holiday to make 4-day weekends. I bank PTO aggressively and take 2-week trips twice a year instead of many short ones (jet lag math makes this efficient). Remote work one day a week from a destination adds effectively free travel days. Prioritize and plan 6 months ahead for flights." },
  ],
  sports: [
    { title: "What watching 500 basketball games taught me about the sport", body: "Defense wins championships is actually true. Teams that win championships almost always have top-10 defenses. Spacing and ball movement are more predictive of playoff success than individual star power. And the mental game - composure in crunch time, how players respond to adversity - is more important than physical talent at the elite level." },
    { title: "Training for my first marathon at 35 - week by week", body: "16 week program, peaked at 55 miles/week. The long run is king - everything builds around it. I underestimated nutrition: calories in on runs over 90 minutes matter enormously. My biggest mistake was increasing mileage too fast in weeks 8-10 which caused minor injuries that set me back. Taper week felt terrible but race day was transcendent." },
    { title: "Cricket World Cup 2026 - tactical analysis of the final", body: "The batting powerplay strategy from India was revolutionary - using the fielding restrictions for accumulation rather than aggression allowed for a platform that Pakistan couldn't match. The death bowling innovations with slower balls and wide yorkers have made traditional slog hitting increasingly difficult. Fascinating evolution of the format." },
    { title: "Why youth sports coaching philosophy needs to change", body: "Specialization before age 13 increases injury rates and burnout while not improving long-term outcomes. The research is clear. Kids who play multiple sports develop better athleticism, resilience, and love of movement. Coaches and parents who prioritize winning at age 10 over development at age 20 are doing the opposite of what they intend." },
    { title: "The mental side of tennis nobody talks about", body: "Technical and physical training gets 95% of the attention but the mental game decides most matches between equally skilled players. Pre-point routine, breathing between points, how you respond to errors - these are trainable skills that most club players ignore completely. Read The Inner Game of Tennis. Still the most useful sports psychology book ever written." },
  ],
  news_politics: [
    { title: "How to read news critically without becoming cynical", body: "Check the primary source before sharing anything. Note the difference between news reporting and opinion. Read coverage from multiple perspectives on the same story. Ask who benefits from this framing. Recognize that outrage-generating content gets more engagement which shapes what gets published. Stay informed without letting it consume your emotional bandwidth." },
    { title: "Local government affects your daily life more than national politics", body: "Zoning laws determine whether you can afford to live somewhere. School board decisions affect education quality. Local infrastructure spending determines road quality and transit options. District attorney priorities shape policing. Yet voter turnout in local elections is 15-20% vs 50-60% nationally. The math on impact per vote is radically different at the local level." },
    { title: "Understanding how bills become laws - a practical guide", body: "Most people know the schoolhouse rock version but the reality involves committee markup, cloture votes to overcome filibusters, conference committees when House and Senate versions differ, and presidential signing statements that affect implementation. Understanding the actual process explains why even popular legislation frequently fails and why incrementalism dominates." },
    { title: "Media bias - why everyone thinks the other side is the problem", body: "Motivated reasoning means we evaluate evidence differently based on whether it confirms existing beliefs. Studies consistently show people rate their own news sources as neutral and opposing sources as biased. The solution isn't finding 'unbiased' media (it doesn't exist) but consuming multiple biased sources and triangulating. Ground truth is somewhere in between." },
    { title: "International relations explained without the jargon", body: "Realism: states pursue self-interest and power, international cooperation is always fragile. Liberalism: shared institutions and trade create genuine cooperation incentives. Constructivism: what states want is socially constructed, not fixed. Most situations require all three lenses to understand. Applying only one framework consistently will mislead you." },
  ],
  food_cooking: [
    { title: "The 5 cooking techniques that will change everything you make", body: "Proper searing (dry protein, hot pan, don't move it). Building a fond and deglazing for pan sauces. Blooming spices in oil before adding other ingredients. Seasoning in layers throughout cooking, not just at the end. And resting meat before cutting. These techniques cost nothing to learn and apply to every cuisine. Everything tastes better." },
    { title: "My grandmother's pasta sauce recipe finally written down", body: "San Marzano tomatoes only. Garlic sliced, never pressed. Olive oil quantity that would terrify a cardiologist. No sugar - if it's acidic your tomatoes are bad. Low and slow for at least 2 hours. Fresh basil added in the last 5 minutes only. Never overcook - the sauce should coat pasta, not drown it. This is a 60-year recipe that survived immigration." },
    { title: "Plant-based eating for 6 months - honest nutritional review", body: "Iron and B12 need active supplementation - don't skip this. Protein is achievable but requires intentionality: legumes, tofu, tempeh, seitan. I felt better digestively within 2 weeks. Energy levels took 6 weeks to stabilize as my gut microbiome adjusted. Weight dropped slightly without trying. Grocery bills went down 30%. Would continue with strategic supplementation." },
    { title: "Budget meal prep for the week under $50", body: "Sunday: cook a large batch of rice and beans, roast two sheet pans of vegetables, prepare a protein (chicken thighs are the most economical). Portion into containers for 5 weekday lunches and dinners. Vary seasoning profiles so Monday's rice bowl and Thursday's rice bowl taste different despite using the same ingredients. Learning this skill is genuinely life-changing." },
    { title: "Best street food cities in the world - ranked after eating my way through 30 countries", body: "Bangkok is the consensus top pick for good reason - accessible, affordable, incredibly diverse. Mexico City has the most complex flavor profiles I've encountered. Istanbul bridges two continents on a single plate in ways that feel effortless. Marrakech medina at night is an experience. Penang, Malaysia is criminally underrated. Tokyo for precision and quality at every price point." },
  ],
  science: [
    { title: "The James Webb Telescope is changing everything we thought we knew about the early universe", body: "Galaxies that should not exist according to our models are being found in abundance at high redshift. The universe appears to have structured earlier than Lambda-CDM cosmology predicts. This doesn't disprove the Big Bang - it refines our understanding of what happened in the first billion years. Science working exactly as it should: observations challenging models." },
    { title: "CRISPR gene editing explained without the hype", body: "CRISPR-Cas9 is a molecular scissors system derived from bacterial immune function. It can cut DNA at precise locations, allowing deletion or insertion of sequences. Current medical applications are focused on single-gene disorders like sickle cell disease where the target is clear and the edit is well-defined. Germline editing (heritable changes) remains deeply ethically contested." },
    { title: "Climate change: separating the science from the politics", body: "The science is settled: CO2 is a greenhouse gas, we're adding unprecedented amounts, global temperatures are rising. Attribution science now confidently links specific extreme weather events to climate change. The policy debates - carbon tax vs cap-and-trade, nuclear vs renewables, international agreements - are genuinely complex and involve value tradeoffs beyond the science." },
    { title: "Quantum computing is real but not what the media says it is", body: "Current quantum computers are not universally faster than classical computers. They're useful for specific problem classes: certain optimization problems, quantum simulation, cryptography. RSA encryption is theoretically vulnerable to Shor's algorithm but current machines don't have enough stable qubits to threaten current key sizes. The timeline is years to decades, not imminent." },
    { title: "Why we still don't have a cure for the common cold", body: "Rhinovirus, the primary cause of colds, exists in over 160 distinct serotypes. A vaccine or cure would need to work against all of them. The evolutionary pressure on rhinovirus favors high mutation rates precisely because it faces immune pressure. Additionally, because colds are rarely fatal, the commercial incentive for expensive drug development is limited. Fascinating biology, frustrating medicine." },
  ],
};

// ─── Helper functions ─────────────────────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(4));
}

function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  return date;
}

function computeEngagementScore(score, numComments) {
  const engagement = Math.log1p(score) + Math.log1p(numComments * 2);
  return parseFloat(Math.min(engagement / 12.0, 1.0).toFixed(4));
}

function computeRecencyWeight(createdUtc) {
  const daysAgo = (Date.now() - createdUtc.getTime()) / (1000 * 60 * 60 * 24);
  return parseFloat(Math.min(Math.exp(-daysAgo / 7.0), 1.0).toFixed(4));
}

// ─── Build post documents ─────────────────────────────────────────────────────
function buildPosts() {
  const posts = [];

  for (const [category, templates] of Object.entries(POST_TEMPLATES)) {
    for (const template of templates) {
      const mongoId = new ObjectId();
      const createdUtc = randomDate(180);
      const score = randomInt(10, 2000);
      const numComments = randomInt(5, 500);
      const wordCount = template.body.split(" ").length;
      const subreddit = `r/${category}`;

      posts.push({
        _id: mongoId,
        postId: mongoId.toString(),
        title: template.title,
        body: template.body,
        subreddit,
        category,
        score,
        numComments,
        createdUtc,
        engagementScore: computeEngagementScore(score, numComments),
        wordCount,
        postLength: template.body.length,
        recencyWeight: computeRecencyWeight(createdUtc),
        hourPosted: randomInt(0, 23),
        dayOfWeek: randomInt(0, 6),
        embedding: [],          // FastAPI BackgroundPostMonitor will fill this
        image: null,
        likes: [],
        dislikes: [],
        likesCount: 0,
        dislikesCount: 0,
      });
    }
  }

  return posts;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    const existing = await col.countDocuments();
    if (existing > 0) {
      console.log(`Collection already has ${existing} posts. Skipping seed.`);
      console.log("To reseed, drop the collection first: db.posts.drop()");
      return;
    }

    const posts = buildPosts();
    const result = await col.insertMany(posts);

    console.log(`✅ Seeded ${result.insertedCount} posts across ${Object.keys(POST_TEMPLATES).length} categories`);
    console.log("Categories seeded:", Object.keys(POST_TEMPLATES).join(", "));
    console.log("Note: embedding[] is empty - FastAPI BackgroundPostMonitor will auto-encode them on startup.");

  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await client.close();
  }
}

seed();