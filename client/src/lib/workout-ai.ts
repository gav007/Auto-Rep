import type { User, WorkoutSet, ProgressRecord, Exercise } from '@shared/schema';

export interface WorkoutRecommendation {
  exercises: ExerciseRecommendation[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string;
}

export interface ExerciseRecommendation {
  exerciseId: number;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime: number;
  notes?: string;
}

export interface ProgressionSuggestion {
  type: 'increase_weight' | 'increase_reps' | 'increase_sets' | 'deload' | 'maintain';
  message: string;
  newWeight?: number;
  newReps?: number;
  newSets?: number;
}

export class WorkoutAI {
  generateWorkoutPlan(user: User, exercises: Exercise[]): WorkoutRecommendation {
    const userEquipment = user.equipment;
    const availableExercises = exercises.filter(exercise =>
      exercise.equipment.some(eq => userEquipment.includes(eq))
    );

    // Basic workout structure based on goals
    let selectedExercises: ExerciseRecommendation[] = [];
    
    if (user.goals === 'muscle') {
      selectedExercises = this.buildMuscleWorkout(availableExercises);
    } else if (user.goals === 'fat-loss') {
      selectedExercises = this.buildFatLossWorkout(availableExercises);
    } else if (user.goals === 'strength') {
      selectedExercises = this.buildStrengthWorkout(availableExercises);
    } else {
      selectedExercises = this.buildGeneralWorkout(availableExercises);
    }

    const estimatedDuration = this.calculateWorkoutDuration(selectedExercises);

    return {
      exercises: selectedExercises,
      estimatedDuration,
      difficulty: this.determineDifficulty(selectedExercises),
      focus: this.getWorkoutFocus(user.goals)
    };
  }

  analyzeProgress(sets: WorkoutSet[], progressRecords: ProgressRecord[]): ProgressionSuggestion {
    if (sets.length < 3) {
      return {
        type: 'maintain',
        message: "Keep building consistency! Complete a few more sets to get personalized suggestions."
      };
    }

    // Analyze recent performance
    const recentSets = sets.slice(-6); // Last 6 sets
    const avgReps = recentSets.reduce((sum, set) => sum + set.reps, 0) / recentSets.length;
    const avgWeight = recentSets.reduce((sum, set) => sum + (set.weight || 0), 0) / recentSets.length;

    // Check for progression patterns
    const isConsistent = this.checkConsistency(recentSets);
    const isProgressing = this.checkProgression(recentSets);
    const isStalling = this.checkStalling(sets);

    if (isStalling) {
      return {
        type: 'deload',
        message: "You've been at the same weight for 3+ sessions. Try reducing weight by 10% and building back up.",
        newWeight: Math.round((avgWeight * 0.9) * 2) / 2 // Round to nearest 0.5kg
      };
    }

    if (isConsistent && avgReps >= 8) {
      return {
        type: 'increase_weight',
        message: "Great consistency! Time to increase the weight by 2.5kg.",
        newWeight: Math.round((avgWeight + 2.5) * 2) / 2
      };
    }

    if (avgReps < 6) {
      return {
        type: 'increase_reps',
        message: "Focus on hitting your target reps before increasing weight.",
        newReps: Math.ceil(avgReps) + 1
      };
    }

    return {
      type: 'maintain',
      message: "Keep up the good work! Maintain current weight and focus on form."
    };
  }

  parseVoiceCommand(command: string, exercises: Exercise[]): {
    exerciseId?: number;
    weight?: number;
    reps?: number;
    success: boolean;
    message: string;
  } {
    // Clean up the command
    const normalizedCommand = command.toLowerCase().trim();
    
    // Extract numbers (weight and reps)
    const numbers = normalizedCommand.match(/\d+(?:\.\d+)?/g);
    if (!numbers || numbers.length < 2) {
      return {
        success: false,
        message: "I couldn't understand the weight and reps. Try saying 'Bench press, 60 kilos for 8 reps'"
      };
    }

    const weight = parseFloat(numbers[0]);
    const reps = parseInt(numbers[1]);

    // Extract exercise name (everything before the first number)
    const exerciseNameMatch = normalizedCommand.match(/^(.+?)\s*,?\s*\d/);
    if (!exerciseNameMatch) {
      return {
        success: false,
        message: "I couldn't identify the exercise. Try starting with the exercise name."
      };
    }

    const exerciseName = exerciseNameMatch[1].trim();
    
    // Find matching exercise
    const matchedExercise = this.findBestExerciseMatch(exerciseName, exercises);
    
    if (!matchedExercise) {
      return {
        success: false,
        message: `I couldn't find an exercise matching "${exerciseName}". Try being more specific.`
      };
    }

    return {
      exerciseId: matchedExercise.id,
      weight,
      reps,
      success: true,
      message: `Logging ${reps} reps at ${weight}kg for ${matchedExercise.name}`
    };
  }

  private buildMuscleWorkout(exercises: Exercise[]): ExerciseRecommendation[] {
    const compounds = exercises.filter(e => e.isCompound);
    const accessories = exercises.filter(e => !e.isCompound);
    
    const workout: ExerciseRecommendation[] = [];
    
    // Add 2-3 compound movements
    const selectedCompounds = compounds.slice(0, 3);
    selectedCompounds.forEach(exercise => {
      workout.push({
        exerciseId: exercise.id,
        name: exercise.name,
        sets: 3,
        reps: 8,
        restTime: 180,
        notes: "Focus on progressive overload"
      });
    });

    // Add 2-3 accessory movements
    const selectedAccessories = accessories.slice(0, 2);
    selectedAccessories.forEach(exercise => {
      workout.push({
        exerciseId: exercise.id,
        name: exercise.name,
        sets: 3,
        reps: 12,
        restTime: 120,
        notes: "Focus on muscle contraction"
      });
    });

    return workout;
  }

  private buildFatLossWorkout(exercises: Exercise[]): ExerciseRecommendation[] {
    const bodyweightExercises = exercises.filter(e => 
      e.equipment.includes('bodyweight')
    );
    
    return bodyweightExercises.slice(0, 5).map(exercise => ({
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Keep rest periods short"
    }));
  }

  private buildStrengthWorkout(exercises: Exercise[]): ExerciseRecommendation[] {
    const compounds = exercises.filter(e => e.isCompound);
    
    return compounds.slice(0, 4).map(exercise => ({
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 5,
      reps: 5,
      restTime: 300,
      notes: "Focus on heavy weights and form"
    }));
  }

  private buildGeneralWorkout(exercises: Exercise[]): ExerciseRecommendation[] {
    const balanced = exercises.slice(0, 5);
    
    return balanced.map(exercise => ({
      exerciseId: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 10,
      restTime: 120,
      notes: "Balanced approach"
    }));
  }

  private calculateWorkoutDuration(exercises: ExerciseRecommendation[]): number {
    // Estimate: set time + rest time + warmup/cooldown
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const avgRestTime = exercises.reduce((sum, ex) => sum + ex.restTime, 0) / exercises.length;
    const setTime = 45; // seconds per set
    
    return Math.round((totalSets * setTime + totalSets * avgRestTime + 600) / 60); // Convert to minutes
  }

  private determineDifficulty(exercises: ExerciseRecommendation[]): 'beginner' | 'intermediate' | 'advanced' {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const avgReps = exercises.reduce((sum, ex) => sum + ex.reps, 0) / exercises.length;
    
    if (totalSets <= 12 && avgReps >= 10) return 'beginner';
    if (totalSets <= 18 && avgReps >= 8) return 'intermediate';
    return 'advanced';
  }

  private getWorkoutFocus(goal: string): string {
    const focuses = {
      'muscle': 'Hypertrophy & Muscle Building',
      'fat-loss': 'Fat Loss & Conditioning',
      'strength': 'Strength & Power',
      'mobility': 'Mobility & Movement',
      'general-fitness': 'General Fitness'
    };
    return focuses[goal as keyof typeof focuses] || 'General Fitness';
  }

  private checkConsistency(sets: WorkoutSet[]): boolean {
    const targetReps = sets[0]?.reps || 8;
    const consistentSets = sets.filter(set => 
      Math.abs(set.reps - targetReps) <= 1
    );
    return consistentSets.length >= sets.length * 0.8;
  }

  private checkProgression(sets: WorkoutSet[]): boolean {
    if (sets.length < 3) return false;
    
    const recent = sets.slice(-3);
    const older = sets.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, set) => sum + (set.weight || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, set) => sum + (set.weight || 0), 0) / older.length;
    
    return recentAvg > olderAvg;
  }

  private checkStalling(sets: WorkoutSet[]): boolean {
    if (sets.length < 6) return false;
    
    const recentSix = sets.slice(-6);
    const weights = recentSix.map(set => set.weight || 0);
    const uniqueWeights = new Set(weights);
    
    return uniqueWeights.size <= 2; // Same weight for most recent sets
  }

  private findBestExerciseMatch(input: string, exercises: Exercise[]): Exercise | null {
    const normalizedInput = input.toLowerCase();
    
    // Exact match first
    const exactMatch = exercises.find(ex => 
      ex.name.toLowerCase() === normalizedInput
    );
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = exercises.find(ex =>
      ex.name.toLowerCase().includes(normalizedInput) ||
      normalizedInput.includes(ex.name.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Fuzzy match based on keywords
    const keywords = normalizedInput.split(' ');
    const fuzzyMatch = exercises.find(ex => {
      const exerciseWords = ex.name.toLowerCase().split(' ');
      return keywords.some(keyword => 
        exerciseWords.some(word => word.includes(keyword) || keyword.includes(word))
      );
    });
    
    return fuzzyMatch || null;
  }
}

export const workoutAI = new WorkoutAI();
