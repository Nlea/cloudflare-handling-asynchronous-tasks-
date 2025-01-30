import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";
import { seed } from "drizzle-seed";

config({ path: ".dev.vars" });

// biome-ignore lint/style/noNonNullAssertion: error from neon client is helpful enough to fix
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface Participant {
  id?: number;
  firstName: string;
  lastName?: string;
  email: string;
  address?: string;
  distance?: "10" | "half" | "full";
  createdAt?: Date;
  updatedAt?: Date;
}

export const marathonParticipants: Participant[] = [
  {
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma.thompson@example.com',
    distance: 'full'
  },
  {
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    email: 'mrod.runner@athletemail.example',
  },
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'schen.marathon@sportsmail.example',
  },
  {
    firstName: 'James',
    lastName: 'Wilson',
    email: 'jwilson.run@racermail.example',
  },
  {
    firstName: 'Aisha',
    lastName: 'Patel',
    email: 'apatel.2025@runnermail.example',
  },
  {
    firstName: 'Lucas',
    lastName: 'Schmidt',
    email: 'lschmidt.run@athletemail.example',
  },
  {
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'smartinez.race@sportsmail.example',
  },
  {
    firstName: 'Oliver',
    lastName: 'Brown',
    email: 'obrown.marathon@racermail.example',
  },
  {
    firstName: 'Nina',
    lastName: 'Ivanova',
    email: 'nivanova.run@runnermail.example',
  },
  {
    firstName: 'Thomas',
    lastName: 'Anderson',
    email: 'tanderson.2025@athletemail.example',
  },
  // ... continuing with more entries
  {
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'ytanaka.marathon@runnermail.example',
  },
  {
    firstName: 'Hassan',
    lastName: 'Ahmed',
    email: 'hahmed.run@athletemail.example',
  },
  {
    firstName: 'Isabella',
    lastName: 'Romano',
    email: 'iromano.race@sportsmail.example',
  }
];

async function seedDatabase() {
  await db.insert(schema.runners).values(marathonParticipants);
}

async function main() {
  try {
    await seedDatabase();
    console.log("✅ Database seeded successfully!");
    console.log("🪿 Run `npm run fiberplane` to explore data with your api.");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}
main();
