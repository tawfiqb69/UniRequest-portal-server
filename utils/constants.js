// All roles used in the project. Never type these words by hand elsewhere.
export const ROLES = {
  STUDENT: "student",
  REVIEWER: "reviewer",
  ADMIN: "admin",
};

// The one database name for the whole server
export const DB_NAME = "unirequest-portal";

// Maximum size of one uploaded file (5 MB)
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Max number of categories one request can ask for (stops huge queries)
export const MAX_CATEGORY_LIMIT = 50;