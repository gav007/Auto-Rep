import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  equipment: text("equipment").array().notNull().default([]),
  goals: text("goals").notNull(),
  trainingDays: integer("training_days").notNull().default(3),
  preferredRestTime: integer("preferred_rest_time").notNull().default(120),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutTemplates = pgTable("workout_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  exercises: jsonb("exercises").notNull(), // Array of exercise configurations
  estimatedDuration: integer("estimated_duration").notNull(), // minutes
  difficulty: text("difficulty").notNull().default("beginner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateId: integer("template_id").references(() => workoutTemplates.id),
  name: text("name").notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  totalVolume: real("total_volume").default(0), // kg
  duration: integer("duration"), // minutes
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // chest, back, legs, etc.
  muscleGroups: text("muscle_groups").array().notNull(),
  equipment: text("equipment").array().notNull(),
  instructions: text("instructions"),
  isCompound: boolean("is_compound").default(false),
});

export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").references(() => workouts.id).notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  setNumber: integer("set_number").notNull(),
  weight: real("weight"),
  reps: integer("reps").notNull(),
  rpe: integer("rpe"), // Rate of Perceived Exertion (1-10)
  restTime: integer("rest_time"), // seconds
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const progressRecords = pgTable("progress_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  oneRepMax: real("one_rep_max"),
  bestSet: jsonb("best_set"), // {weight, reps, date}
  totalVolume: real("total_volume").default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutTemplateSchema = createInsertSchema(workoutTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({
  id: true,
  completedAt: true,
});

export const insertProgressRecordSchema = createInsertSchema(progressRecords).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type InsertWorkoutTemplate = z.infer<typeof insertWorkoutTemplateSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;

export type ProgressRecord = typeof progressRecords.$inferSelect;
export type InsertProgressRecord = z.infer<typeof insertProgressRecordSchema>;

// Equipment types
export const EQUIPMENT_TYPES = [
  'dumbbells',
  'barbell',
  'bands',
  'bodyweight',
  'kettlebells',
  'cable_machine',
  'pull_up_bar'
] as const;

export type EquipmentType = typeof EQUIPMENT_TYPES[number];

// Goal types
export const GOAL_TYPES = [
  'muscle',
  'fat-loss', 
  'strength',
  'mobility',
  'general-fitness'
] as const;

export type GoalType = typeof GOAL_TYPES[number];
