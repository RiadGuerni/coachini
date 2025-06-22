import { ExerciseTemplate } from '@prisma/client';
export type InputExerciseTemplate = Omit<
  ExerciseTemplate,
  'id' | 'createdAt' | 'updatedAt'
>;
