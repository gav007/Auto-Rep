import { db } from "./db";
import { exercises } from "@shared/schema";

const basicExercises = [
  {
    name: "Bench Press",
    category: "chest",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["barbell", "dumbbells"],
    instructions: "Lie on bench, press weight up from chest",
    isCompound: true
  },
  {
    name: "Squat",
    category: "legs",
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    equipment: ["barbell", "dumbbells", "bodyweight"],
    instructions: "Stand with feet shoulder-width apart, squat down",
    isCompound: true
  },
  {
    name: "Deadlift",
    category: "back",
    muscleGroups: ["hamstrings", "glutes", "back", "traps"],
    equipment: ["barbell", "dumbbells"],
    instructions: "Lift weight from floor to standing position",
    isCompound: true
  },
  {
    name: "Pull-ups",
    category: "back",
    muscleGroups: ["lats", "biceps", "rear delts"],
    equipment: ["pull_up_bar", "bodyweight"],
    instructions: "Hang from bar, pull body up until chin over bar",
    isCompound: true
  },
  {
    name: "Push-ups",
    category: "chest",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["bodyweight"],
    instructions: "In plank position, lower and push body up",
    isCompound: true
  },
  {
    name: "Overhead Press",
    category: "shoulders",
    muscleGroups: ["shoulders", "triceps", "core"],
    equipment: ["barbell", "dumbbells"],
    instructions: "Press weight overhead from shoulder level",
    isCompound: true
  },
  {
    name: "Bent-over Row",
    category: "back",
    muscleGroups: ["lats", "rhomboids", "biceps"],
    equipment: ["barbell", "dumbbells"],
    instructions: "Bend over, pull weight to lower chest",
    isCompound: true
  }
];

export async function seedDatabase() {
  try {
    // Check if exercises already exist
    const existingExercises = await db.select().from(exercises);
    
    if (existingExercises.length === 0) {
      console.log("Seeding database with exercises...");
      await db.insert(exercises).values(basicExercises);
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already has exercises, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}