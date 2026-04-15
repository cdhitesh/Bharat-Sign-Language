// backend/utils/seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Subject from "../models/Subject.js";
import Sign from "../models/Sign.js";
import slugify from "slugify";

dotenv.config();

const subjects = [
  {
    name:        "Alphabets",
    slug: slugify("Alphabets", { lower: true, strict: true }),
    description: "A to Z letters in Indian Sign Language",
    icon:        "🔤",
    order:       1,
  },
  {
    name:        "Numbers",
    slug: slugify("Numbers", { lower: true, strict: true }),
    description: "Numbers 1 to 9 in Indian Sign Language",
    icon:        "🔢",
    order:       2,
  },
  {
    name:        "Greetings",
    slug: slugify("Greetings", { lower: true, strict: true }),
    description: "Common greeting signs",
    icon:        "👋",
    order:       3,
  },
];

// Signs for Alphabets — using placeholder images
const alphabetSigns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  name:            letter,
  meaning:         `The letter ${letter} in Indian Sign Language`,
  keywords:        [letter.toLowerCase(), "alphabet", "letter"],
  difficultyLevel: "beginner",
  imageUrl:
    `https://res.cloudinary.com/dwkfb3vye/image/upload/v1774550369/signlearn/signs/sign_${letter}.jpg`,
}));

// Signs for Numbers
const numberSigns = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
  (num) => ({
    name:            num,
    meaning:         `The number ${num} in Indian Sign Language`,
    keywords:        [num, "number", "digit"],
    difficultyLevel: "beginner",
    imageUrl:
      `https://res.cloudinary.com/dwkfb3vye/image/upload/v1774550308/signlearn/signs/sign_${num}.jpg`,
  })
);

// Greeting signs
const greetingSigns = [
  {
    name:            "Hello",
    meaning:         "A common greeting gesture",
    keywords:        ["hello", "hi", "greet", "greeting"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=Hello",
  },
  {
    name:            "Thank You",
    meaning:         "Expressing gratitude",
    keywords:        ["thanks", "thank you", "grateful", "gratitude"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=ThankYou",
  },
  {
    name:            "Please",
    meaning:         "Polite request gesture",
    keywords:        ["please", "request", "polite"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=Please",
  },
  {
    name:            "Sorry",
    meaning:         "Expressing apology",
    keywords:        ["sorry", "apology", "apologize"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=Sorry",
  },
  {
    name:            "Yes",
    meaning:         "Affirmative response",
    keywords:        ["yes", "agree", "correct", "affirmative"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=Yes",
  },
  {
    name:            "No",
    meaning:         "Negative response",
    keywords:        ["no", "disagree", "negative", "deny"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=No",
  },
  {
    name:            "Help",
    meaning:         "Asking for assistance",
    keywords:        ["help", "assist", "support", "aid"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=Help",
  },
  {
    name:            "Good",
    meaning:         "Expressing something is good or positive",
    keywords:        ["good", "great", "positive", "nice"],
    difficultyLevel: "beginner",
    imageUrl:        "https://placehold.co/200x200/4A5C3F/white?text=Good",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Subject.deleteMany({});
    await Sign.deleteMany({});
    console.log("Cleared existing subjects and signs");

    // Create subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`Created ${createdSubjects.length} subjects`);

    // Find each subject by name
    const alphabetSubject  = createdSubjects.find((s) => s.name === "Alphabets");
    const numberSubject    = createdSubjects.find((s) => s.name === "Numbers");
    const greetingSubject  = createdSubjects.find((s) => s.name === "Greetings");

    // Attach subjectId to each sign
    const allSigns = [
      ...alphabetSigns.map((s) => ({
        ...s, subjectId: alphabetSubject._id,
      })),
      ...numberSigns.map((s) => ({
        ...s, subjectId: numberSubject._id,
      })),
      ...greetingSigns.map((s) => ({
        ...s, subjectId: greetingSubject._id,
      })),
    ];

    const createdSigns = await Sign.insertMany(allSigns);
    console.log(`Created ${createdSigns.length} signs`);

    console.log("\n Database seeded successfully!");
    console.log(`Subjects : ${createdSubjects.length}`);
    console.log(`Signs : ${createdSigns.length}`);

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();