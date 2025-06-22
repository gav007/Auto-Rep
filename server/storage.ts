import { 
  users, workoutTemplates, workouts, exercises, workoutSets, progressRecords,
  type User, type InsertUser,
  type WorkoutTemplate, type InsertWorkoutTemplate,
  type Workout, type InsertWorkout,
  type Exercise, type InsertExercise,
  type WorkoutSet, type InsertWorkoutSet,
  type ProgressRecord, type InsertProgressRecord
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Workout Templates
  getWorkoutTemplates(userId: number): Promise<WorkoutTemplate[]>;
  getWorkoutTemplate(id: number): Promise<WorkoutTemplate | undefined>;
  createWorkoutTemplate(template: InsertWorkoutTemplate): Promise<WorkoutTemplate>;

  // Workouts
  getWorkouts(userId: number): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  getActiveWorkout(userId: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, updates: Partial<InsertWorkout>): Promise<Workout | undefined>;

  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercisesByEquipment(equipment: string[]): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Workout Sets
  getWorkoutSets(workoutId: number): Promise<WorkoutSet[]>;
  createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet>;
  updateWorkoutSet(id: number, updates: Partial<InsertWorkoutSet>): Promise<WorkoutSet | undefined>;

  // Progress Records
  getProgressRecord(userId: number, exerciseId: number): Promise<ProgressRecord | undefined>;
  updateProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord>;
  getUserProgress(userId: number): Promise<ProgressRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workoutTemplates: Map<number, WorkoutTemplate>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private workoutSets: Map<number, WorkoutSet>;
  private progressRecords: Map<string, ProgressRecord>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.workoutTemplates = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.workoutSets = new Map();
    this.progressRecords = new Map();
    this.currentId = 1;
    
    // Initialize with basic exercises
    this.initializeExercises();
  }

  private initializeExercises() {
    const basicExercises: Exercise[] = [
      {
        id: this.currentId++,
        name: "Bench Press",
        category: "chest",
        muscleGroups: ["chest", "triceps", "shoulders"],
        equipment: ["barbell", "dumbbells"],
        instructions: "Lie on bench, press weight up from chest",
        isCompound: true
      },
      {
        id: this.currentId++,
        name: "Squat",
        category: "legs",
        muscleGroups: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["barbell", "dumbbells", "bodyweight"],
        instructions: "Stand with feet shoulder-width apart, squat down",
        isCompound: true
      },
      {
        id: this.currentId++,
        name: "Deadlift",
        category: "back",
        muscleGroups: ["hamstrings", "glutes", "back", "traps"],
        equipment: ["barbell", "dumbbells"],
        instructions: "Lift weight from floor to standing position",
        isCompound: true
      },
      {
        id: this.currentId++,
        name: "Pull-ups",
        category: "back",
        muscleGroups: ["lats", "biceps", "rear delts"],
        equipment: ["pull_up_bar", "bodyweight"],
        instructions: "Hang from bar, pull body up until chin over bar",
        isCompound: true
      },
      {
        id: this.currentId++,
        name: "Push-ups",
        category: "chest",
        muscleGroups: ["chest", "triceps", "shoulders"],
        equipment: ["bodyweight"],
        instructions: "In plank position, lower and push body up",
        isCompound: true
      },
      {
        id: this.currentId++,
        name: "Overhead Press",
        category: "shoulders",
        muscleGroups: ["shoulders", "triceps", "core"],
        equipment: ["barbell", "dumbbells"],
        instructions: "Press weight overhead from shoulder level",
        isCompound: true
      },
      {
        id: this.currentId++,
        name: "Bent-over Row",
        category: "back",
        muscleGroups: ["lats", "rhomboids", "biceps"],
        equipment: ["barbell", "dumbbells"],
        instructions: "Bend over, pull weight to lower chest",
        isCompound: true
      }
    ];

    basicExercises.forEach(exercise => {
      this.exercises.set(exercise.id, exercise);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workout Templates
  async getWorkoutTemplates(userId: number): Promise<WorkoutTemplate[]> {
    return Array.from(this.workoutTemplates.values()).filter(template => template.userId === userId);
  }

  async getWorkoutTemplate(id: number): Promise<WorkoutTemplate | undefined> {
    return this.workoutTemplates.get(id);
  }

  async createWorkoutTemplate(template: InsertWorkoutTemplate): Promise<WorkoutTemplate> {
    const id = this.currentId++;
    const workoutTemplate: WorkoutTemplate = {
      ...template,
      id,
      createdAt: new Date()
    };
    this.workoutTemplates.set(id, workoutTemplate);
    return workoutTemplate;
  }

  // Workouts
  async getWorkouts(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout => workout.userId === userId);
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async getActiveWorkout(userId: number): Promise<Workout | undefined> {
    return Array.from(this.workouts.values()).find(
      workout => workout.userId === userId && !workout.completedAt
    );
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.currentId++;
    const newWorkout: Workout = { ...workout, id };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  async updateWorkout(id: number, updates: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const updatedWorkout = { ...workout, ...updates };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByEquipment(equipment: string[]): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise =>
      exercise.equipment.some(eq => equipment.includes(eq))
    );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.currentId++;
    const newExercise: Exercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  // Workout Sets
  async getWorkoutSets(workoutId: number): Promise<WorkoutSet[]> {
    return Array.from(this.workoutSets.values()).filter(set => set.workoutId === workoutId);
  }

  async createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet> {
    const id = this.currentId++;
    const workoutSet: WorkoutSet = { 
      ...set, 
      id,
      completedAt: new Date()
    };
    this.workoutSets.set(id, workoutSet);
    return workoutSet;
  }

  async updateWorkoutSet(id: number, updates: Partial<InsertWorkoutSet>): Promise<WorkoutSet | undefined> {
    const set = this.workoutSets.get(id);
    if (!set) return undefined;
    
    const updatedSet = { ...set, ...updates };
    this.workoutSets.set(id, updatedSet);
    return updatedSet;
  }

  // Progress Records
  async getProgressRecord(userId: number, exerciseId: number): Promise<ProgressRecord | undefined> {
    const key = `${userId}-${exerciseId}`;
    return this.progressRecords.get(key);
  }

  async updateProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord> {
    const key = `${record.userId}-${record.exerciseId}`;
    const existing = this.progressRecords.get(key);
    
    const progressRecord: ProgressRecord = {
      id: existing?.id ?? this.currentId++,
      ...record,
      lastUpdated: new Date()
    };
    
    this.progressRecords.set(key, progressRecord);
    return progressRecord;
  }

  async getUserProgress(userId: number): Promise<ProgressRecord[]> {
    return Array.from(this.progressRecords.values()).filter(record => record.userId === userId);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getWorkoutTemplates(userId: number): Promise<WorkoutTemplate[]> {
    return await db.select().from(workoutTemplates).where(eq(workoutTemplates.userId, userId));
  }

  async getWorkoutTemplate(id: number): Promise<WorkoutTemplate | undefined> {
    const [template] = await db.select().from(workoutTemplates).where(eq(workoutTemplates.id, id));
    return template || undefined;
  }

  async createWorkoutTemplate(template: InsertWorkoutTemplate): Promise<WorkoutTemplate> {
    const [created] = await db
      .insert(workoutTemplates)
      .values(template)
      .returning();
    return created;
  }

  async getWorkouts(userId: number): Promise<Workout[]> {
    return await db.select().from(workouts).where(eq(workouts.userId, userId));
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout || undefined;
  }

  async getActiveWorkout(userId: number): Promise<Workout | undefined> {
    const [workout] = await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId))
      .limit(1);
    return workout || undefined;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [created] = await db
      .insert(workouts)
      .values(workout)
      .returning();
    return created;
  }

  async updateWorkout(id: number, updates: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const [workout] = await db
      .update(workouts)
      .set(updates)
      .where(eq(workouts.id, id))
      .returning();
    return workout || undefined;
  }

  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercisesByEquipment(equipment: string[]): Promise<Exercise[]> {
    // For now, return all exercises - we'll improve this filter later
    return await db.select().from(exercises);
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise || undefined;
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [created] = await db
      .insert(exercises)
      .values(exercise)
      .returning();
    return created;
  }

  async getWorkoutSets(workoutId: number): Promise<WorkoutSet[]> {
    return await db.select().from(workoutSets).where(eq(workoutSets.workoutId, workoutId));
  }

  async createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet> {
    const [created] = await db
      .insert(workoutSets)
      .values(set)
      .returning();
    return created;
  }

  async updateWorkoutSet(id: number, updates: Partial<InsertWorkoutSet>): Promise<WorkoutSet | undefined> {
    const [set] = await db
      .update(workoutSets)
      .set(updates)
      .where(eq(workoutSets.id, id))
      .returning();
    return set || undefined;
  }

  async getProgressRecord(userId: number, exerciseId: number): Promise<ProgressRecord | undefined> {
    const [record] = await db
      .select()
      .from(progressRecords)
      .where(eq(progressRecords.userId, userId))
      .limit(1);
    return record || undefined;
  }

  async updateProgressRecord(record: InsertProgressRecord): Promise<ProgressRecord> {
    const existing = await this.getProgressRecord(record.userId, record.exerciseId);
    
    if (existing) {
      const [updated] = await db
        .update(progressRecords)
        .set(record)
        .where(eq(progressRecords.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(progressRecords)
        .values(record)
        .returning();
      return created;
    }
  }

  async getUserProgress(userId: number): Promise<ProgressRecord[]> {
    return await db.select().from(progressRecords).where(eq(progressRecords.userId, userId));
  }
}

export const storage = new DatabaseStorage();
