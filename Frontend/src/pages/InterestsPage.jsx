import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { saveInterests } from "../config/backendconnect";
import useAuthStore from "../lib/zustand";

const INTEREST_CATEGORIES = [
  {
    title: "GAMING",
    items: [
      "Fortnite",
      "Apex Legends",
      "League of Legends",
      "Minecraft",
      "Valorant",
      "Call of Duty",
      "PUBG",
      "RPG Games",
      "Esports",
      "Multiplayer Games",
    ],
  },
  {
    title: "RELATIONSHIPS",
    items: [
      "Dating",
      "Love & Romance",
      "Breakups",
      "Marriage",
      "Friendship",
      "Communication",
      "Trust & Jealousy",
      "Relationship Advice",
    ],
  },
  {
    title: "CAREER & JOBS",
    items: [
      "Job Search",
      "Career Development",
      "Resume Writing",
      "Job Interviews",
      "Internships",
      "Freelancing",
      "Networking",
      "Workplace Skills",
    ],
  },
  {
    title: "EDUCATION",
    items: [
      "School Life",
      "College & University",
      "Study Tips",
      "Exams & Tests",
      "Assignments",
      "Research",
      "Scholarships",
      "Online Learning",
    ],
  },
  {
    title: "FINANCE",
    items: [
      "Personal Finance",
      "Saving Money",
      "Investing",
      "Stock Market",
      "Cryptocurrency",
      "Budgeting",
      "Financial Planning",
      "Taxes & Banking",
    ],
  },
  {
    title: "TECHNOLOGY",
    items: [
      "Programming",
      "Python",
      "JavaScript",
      "AI & Machine Learning",
      "Web Development",
      "Data Science",
      "Cybersecurity",
      "Cloud Computing",
      "Blockchain",
      "Gadgets",
    ],
  },
  {
    title: "ENTERTAINMENT",
    items: [
      "Movies",
      "TV Series",
      "Netflix & Streaming",
      "Music",
      "Celebrity News",
      "YouTube",
      "TikTok",
      "Entertainment Reviews",
    ],
  },
  {
    title: "MENTAL HEALTH",
    items: [
      "Depression",
      "Anxiety",
      "Stress Management",
      "Mindfulness",
      "Therapy",
      "Meditation",
      "Self Care",
      "Motivation",
      "Burnout Recovery",
      "Emotional Wellbeing",
    ],
  },
  {
    title: "PARENTING & FAMILY",
    items: [
      "Parenting",
      "Family Life",
      "Childcare",
      "Pregnancy",
      "Kids Education",
      "Family Relationships",
      "Household Life",
    ],
  },
  {
    title: "HEALTH & FITNESS",
    items: [
      "Workout",
      "Gym Training",
      "Running",
      "Yoga",
      "Nutrition",
      "Diet & Weight Loss",
      "Strength Training",
      "Wellness",
      "Sports Fitness",
    ],
  },
  {
    title: "TRAVEL",
    items: [
      "Vacation Planning",
      "Backpacking",
      "Road Trips",
      "Adventure Travel",
      "Travel Tips",
      "Culture & Exploration",
      "Beaches",
      "Mountains",
      "Travel Blogging",
    ],
  },
  {
    title: "SPORTS",
    items: [
      "Football",
      "Basketball",
      "Tennis",
      "Cricket",
      "Baseball",
      "Hockey",
      "Golf",
      "Rugby",
      "Olympics",
      "Sports Training",
    ],
  },
  {
    title: "NEWS & POLITICS",
    items: [
      "World News",
      "Politics",
      "Elections",
      "Government Policy",
      "International Relations",
      "Political Debates",
      "Current Affairs",
    ],
  },
  {
    title: "FOOD & COOKING",
    items: [
      "Recipes",
      "Cooking",
      "Baking",
      "Healthy Eating",
      "Restaurants",
      "Desserts",
      "Vegetarian Cooking",
      "Vegan Food",
      "World Cuisine",
    ],
  },
  {
    title: "SCIENCE",
    items: [
      "Physics",
      "Chemistry",
      "Biology",
      "Astronomy",
      "Space Exploration",
      "Genetics",
      "Environmental Science",
      "Climate Research",
      "Scientific Discoveries",
    ],
  },
];

export default function InterestsPage() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const navigate = useNavigate();
  const { setAuthState } = useAuthStore()

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

const handleInterestsComplete = async (selectedItems) => {
  try {
    const selectedCategories = INTEREST_CATEGORIES.filter(category =>
      category.items.some(item => selectedItems.includes(item))
    ).map(category => category.title.toLowerCase());

    await saveInterests(selectedCategories);
    setAuthState({ isLoggedIn: true, hasInterests: true });

    navigate("/feed");
  } catch (err) {
    console.log(err);
  }
};
    // try {
    //   await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/interests`, {
    //     body: {
    //       interests: interests
    //     },
    //     method: 'POST'
    //   });

    // } catch (error) {
    //   console.log(error);
    // }

  const handleContinue = () => {
    handleInterestsComplete(
      selectedInterests.length > 0
        ? selectedInterests
        : ["Photography", "Travel"],
    );
  };

  const canContinue = selectedInterests.length >= 3;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header Section */}
        <div className="flex flex-col items-center px-6 pt-12 pb-8 animate-fade-in-down">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Personalize Your Feed
            </span>
          </div>
          <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            What catches your eye?
          </h1>
          <p className="max-w-lg text-center text-sm leading-relaxed text-muted-foreground md:text-base">
            Select at least 3 interests so our AI can curate your perfect feed.
            The more you pick, the better your recommendations.
          </p>
        </div>

        {/* Categories */}
        <div className="mx-auto w-full max-w-3xl px-6">
          {INTEREST_CATEGORIES.map((category, catIndex) => (
            <div
              key={category.title}
              className="mb-8 animate-fade-in-up"
              style={{ animationDelay: `${catIndex * 0.08}s` }}
            >
              {/* Category Header */}
              <div className="mb-4 flex items-center gap-4">
                <h2 className="shrink-0 text-xs font-bold tracking-widest text-muted-foreground">
                  {category.title}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2.5">
                {category.items.map((interest, index) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      style={{
                        animationDelay: `${catIndex * 0.08 + index * 0.03}s`,
                      }}
                      className={cn(
                        "rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 btn-tap animate-fade-in",
                        isSelected
                          ? "border-primary/60 bg-primary/8 text-primary shadow-sm shadow-primary/10"
                          : "border-border bg-card text-foreground hover:border-muted-foreground/30 hover:bg-secondary",
                      )}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg animate-fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <p className="text-sm text-muted-foreground">
            {selectedInterests.length < 3 ? (
              <>
                Pick topics that interest you
                <span className="ml-1.5 text-xs text-muted-foreground/70">
                  ({selectedInterests.length}/3 min)
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-primary">
                  {selectedInterests.length}
                </span>{" "}
                interests selected
              </>
            )}
          </p>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={cn(
              "flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-300 btn-tap",
              canContinue
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:brightness-110"
                : "cursor-not-allowed bg-primary/30 text-primary-foreground/50",
            )}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
