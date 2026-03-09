import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose"
import Post from "./Model/postschema.js"

const posts = [
    {
        postId: "post_001",
        title: "The Future of AI in Everyday Life",
        body: "Artificial intelligence is rapidly transforming how we live and work. From smart assistants to autonomous vehicles, AI is becoming an integral part of our daily routines.",
        subreddit: "r/technology",
        category: "technology",
        score: 245,
        numComments: 43,
        createdUtc: new Date(),
        engagementScore: 12.5,
        wordCount: 38,
        postLength: 220,
        recencyWeight: 1.0,
        hourPosted: 9,
        dayOfWeek: 1,
        image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800"
    },
    {
        postId: "post_002",
        title: "Best Workout Routines for Beginners",
        body: "Starting your fitness journey can be overwhelming. Here are the top exercises to build strength and endurance without needing a gym membership.",
        subreddit: "r/fitness",
        category: "health_fitness",
        score: 189,
        numComments: 31,
        createdUtc: new Date(),
        engagementScore: 9.8,
        wordCount: 34,
        postLength: 198,
        recencyWeight: 1.0,
        hourPosted: 7,
        dayOfWeek: 2,
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
    },
    {
        postId: "post_003",
        title: "Top 10 Travel Destinations for 2026",
        body: "From the mountains of Nepal to the beaches of Portugal, these destinations offer unforgettable experiences for every type of traveler.",
        subreddit: "r/travel",
        category: "travel",
        score: 312,
        numComments: 67,
        createdUtc: new Date(),
        engagementScore: 15.2,
        wordCount: 32,
        postLength: 185,
        recencyWeight: 1.0,
        hourPosted: 14,
        dayOfWeek: 3,
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    },
    {
        postId: "post_004",
        title: "How to Save Money on a Tight Budget",
        body: "Managing finances can be challenging. These practical tips will help you cut unnecessary expenses and build your savings even with a limited income.",
        subreddit: "r/personalfinance",
        category: "finance",
        score: 278,
        numComments: 52,
        createdUtc: new Date(),
        engagementScore: 11.3,
        wordCount: 35,
        postLength: 210,
        recencyWeight: 1.0,
        hourPosted: 11,
        dayOfWeek: 4,
        image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800"
    },
    {
        postId: "post_005",
        title: "Most Anticipated Games of 2026",
        body: "The gaming industry is set for an incredible year. Here are the most hyped upcoming releases that every gamer should have on their radar.",
        subreddit: "r/gaming",
        category: "gaming",
        score: 421,
        numComments: 89,
        createdUtc: new Date(),
        engagementScore: 18.7,
        wordCount: 33,
        postLength: 195,
        recencyWeight: 1.0,
        hourPosted: 20,
        dayOfWeek: 5,
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    },
    {
        postId: "post_006",
        title: "Mental Health Tips for Students",
        body: "Academic pressure can take a toll on mental wellbeing. These simple daily practices can help students manage stress, anxiety and maintain a healthy mindset.",
        subreddit: "r/mentalhealth",
        category: "mental_health",
        score: 356,
        numComments: 74,
        createdUtc: new Date(),
        engagementScore: 16.4,
        wordCount: 36,
        postLength: 215,
        recencyWeight: 1.0,
        hourPosted: 16,
        dayOfWeek: 6,
        image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800"
    },
    {
        postId: "post_007",
        title: "Easy Recipes for Busy Weeknights",
        body: "Short on time but want a home cooked meal? These quick and delicious recipes take under 30 minutes and require minimal ingredients.",
        subreddit: "r/cooking",
        category: "food_cooking",
        score: 198,
        numComments: 38,
        createdUtc: new Date(),
        engagementScore: 10.1,
        wordCount: 34,
        postLength: 190,
        recencyWeight: 1.0,
        hourPosted: 18,
        dayOfWeek: 0,
        image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800"
    },
    {
        postId: "post_008",
        title: "Breaking Down Quantum Computing",
        body: "Quantum computing promises to revolutionize computing power. But what exactly is it and how does it differ from classical computers? Here is a simple explanation.",
        subreddit: "r/science",
        category: "science",
        score: 267,
        numComments: 45,
        createdUtc: new Date(),
        engagementScore: 13.2,
        wordCount: 37,
        postLength: 225,
        recencyWeight: 1.0,
        hourPosted: 10,
        dayOfWeek: 2,
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800"
    }
]

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("Connected to MongoDB")

        await Post.deleteMany({})
        console.log("Cleared existing posts")

        await Post.insertMany(posts)
        console.log(`Seeded ${posts.length} posts!`)

        await mongoose.disconnect()
        console.log("Done!")
        process.exit(0)
    } catch (err) {
        console.error("Seed error:", err)
        process.exit(1)
    }
}

seed()