/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Seed script to populate the database with exercise templates from an external API
// This script fetches exercises by muscle group and stores them in the database
import { PrismaClient } from '@prisma/client';
import { InputExerciseTemplate } from 'src/common/interfaces/exercise_template';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
const prisma = new PrismaClient();
interface ApiExercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
}
async function main() {
  const fullData: Array<InputExerciseTemplate> = [];
  const muscles = [
    'abdominals',
    'abductors',
    'adductors',
    'biceps',
    'calves',
    'chest',
    'forearms',
    'glutes',
    'hamstrings',
    'lats',
    'lower_back',
    'middle_back',
    'neck',
    'quadriceps',
    'traps',
    'triceps',
  ];
  for (const muscle of muscles) {
    try {
      const res = await axios.get<ApiExercise[]>(
        'https://api.api-ninjas.com/v1/exercises?muscle=' + muscle,
        {
          headers: { 'X-Api-Key': process.env.EXERCISES_API_KEY },
        },
      );
      console.log('response for muscle: ', muscle, ' is: ', res.data);
      const muscleData: ApiExercise[] = res.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const dataCleaned: InputExerciseTemplate[] = muscleData.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ difficulty, ...rest }) => rest,
      ); // we remove difficulty as it is not needed in the db
      console.log('data cleaned: ', dataCleaned);
      fullData.push(...dataCleaned);
    } catch (error) {
      console.log('couldnt fetch data for muscle: ', muscle);
      console.log('the error was : ', error);
    }
  }
  try {
    await prisma.exerciseTemplate.createMany({
      data: fullData,
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('Error inserting data into the database:', error);
  }
}
main();
