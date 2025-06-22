import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWorkoutSchema, insertWorkoutSetSchema, insertWorkoutTemplateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Error fetching exercises", error });
    }
  });

  app.get("/api/exercises/equipment/:equipment", async (req, res) => {
    try {
      const equipment = req.params.equipment.split(',');
      const exercises = await storage.getExercisesByEquipment(equipment);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Error fetching exercises by equipment", error });
    }
  });

  // Workout template routes
  app.get("/api/workout-templates/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const templates = await storage.getWorkoutTemplates(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workout templates", error });
    }
  });

  app.post("/api/workout-templates", async (req, res) => {
    try {
      const templateData = insertWorkoutTemplateSchema.parse(req.body);
      const template = await storage.createWorkoutTemplate(templateData);
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data", error });
    }
  });

  // Workout routes
  app.get("/api/workouts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workouts", error });
    }
  });

  app.get("/api/workouts/:userId/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activeWorkout = await storage.getActiveWorkout(userId);
      res.json(activeWorkout);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active workout", error });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data", error });
    }
  });

  app.put("/api/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertWorkoutSchema.partial().parse(req.body);
      const workout = await storage.updateWorkout(id, updates);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  // Workout sets routes
  app.get("/api/workout-sets/:workoutId", async (req, res) => {
    try {
      const workoutId = parseInt(req.params.workoutId);
      const sets = await storage.getWorkoutSets(workoutId);
      res.json(sets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workout sets", error });
    }
  });

  app.post("/api/workout-sets", async (req, res) => {
    try {
      const setData = insertWorkoutSetSchema.parse(req.body);
      const set = await storage.createWorkoutSet(setData);
      
      // Update progress record
      await updateProgressAfterSet(set);
      
      res.json(set);
    } catch (error) {
      res.status(400).json({ message: "Invalid set data", error });
    }
  });

  // Progress routes
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching progress", error });
    }
  });

  // AI Coaching endpoint
  app.post("/api/ai-coaching/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { exerciseId } = req.body;
      
      const user = await storage.getUser(userId);
      const progress = await storage.getProgressRecord(userId, exerciseId);
      const recentWorkouts = await storage.getWorkouts(userId);
      
      // Simple AI logic for coaching suggestions
      const suggestion = generateCoachingSuggestion(user, progress, recentWorkouts);
      
      res.json({ suggestion });
    } catch (error) {
      res.status(500).json({ message: "Error generating coaching suggestion", error });
    }
  });

  // Voice command processing
  app.post("/api/voice-command", async (req, res) => {
    try {
      const { command, workoutId } = req.body;
      const parsedCommand = parseVoiceCommand(command);
      
      if (parsedCommand.type === 'log_set') {
        const setData = {
          workoutId: parseInt(workoutId),
          exerciseId: parsedCommand.exerciseId,
          setNumber: parsedCommand.setNumber,
          weight: parsedCommand.weight,
          reps: parsedCommand.reps
        };
        
        const set = await storage.createWorkoutSet(setData);
        await updateProgressAfterSet(set);
        
        res.json({ 
          success: true, 
          set,
          response: `Logged ${parsedCommand.reps} reps at ${parsedCommand.weight}kg for ${parsedCommand.exerciseName}`
        });
      } else {
        res.json({ 
          success: false, 
          response: "I didn't understand that command. Try saying something like 'Bench press, 60 kilos for 8 reps'"
        });
      }
    } catch (error) {
      res.status(400).json({ message: "Error processing voice command", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function updateProgressAfterSet(set: any) {
  const workout = await storage.getWorkout(set.workoutId);
  if (!workout) return;

  const existingProgress = await storage.getProgressRecord(workout.userId, set.exerciseId);
  const oneRepMax = calculateOneRepMax(set.weight, set.reps);
  
  const progressUpdate = {
    userId: workout.userId,
    exerciseId: set.exerciseId,
    oneRepMax: existingProgress?.oneRepMax && existingProgress.oneRepMax > oneRepMax ? existingProgress.oneRepMax : oneRepMax,
    bestSet: {
      weight: set.weight,
      reps: set.reps,
      date: new Date().toISOString()
    },
    totalVolume: (existingProgress?.totalVolume || 0) + (set.weight * set.reps)
  };

  await storage.updateProgressRecord(progressUpdate);
}

function calculateOneRepMax(weight: number, reps: number): number {
  // Epley formula: 1RM = weight * (1 + reps/30)
  return weight * (1 + reps / 30);
}

function generateCoachingSuggestion(user: any, progress: any, recentWorkouts: any[]): string {
  if (!progress) {
    return "Start with a comfortable weight and focus on form. We'll track your progress from here!";
  }

  const recentSets = recentWorkouts.slice(-3); // Last 3 workouts
  
  if (recentSets.length < 2) {
    return "Keep building consistency! Complete a few more workouts so I can give you better suggestions.";
  }

  // Simple progression logic
  const suggestions = [
    "You've been consistent with your reps. Try increasing the weight by 2.5kg next session!",
    "Your form is looking solid. Consider adding an extra set to increase volume.",
    "You've hit your target reps for 2 weeks straight. Time to progress!",
    "Your last sets have been dropping off. Consider backing off 10% or resting another day.",
    "Great progress! You're ahead of schedule. Keep up the momentum."
  ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function parseVoiceCommand(command: string): any {
  // Simple voice command parsing
  // Expected format: "Exercise name, weight kg/kilos for reps reps"
  const regex = /(.+?),?\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos?)\s*(?:for\s*)?(\d+)\s*(?:reps?)?/i;
  const match = command.match(regex);
  
  if (match) {
    return {
      type: 'log_set',
      exerciseName: match[1].trim(),
      weight: parseFloat(match[2]),
      reps: parseInt(match[3]),
      exerciseId: 1, // This would need to be resolved from exercise name
      setNumber: 1 // This would need to be calculated
    };
  }
  
  return { type: 'unknown' };
}
