import "dotenv/config"
import {PrismaClient} from "@prisma/client/extension";
import {PrismaPg} from "@prisma/adapter-pg";

const connectionString = process.env.DARABASE_URL;

const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

export {prisma};