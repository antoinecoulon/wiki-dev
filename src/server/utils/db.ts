import { drizzle } from "drizzle-orm/d1";
import { db, schema} from '@nuxthub/db'

export function useDB() {
  return drizzle(db, { schema })
}