import { relations, sql } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  sqliteTableCreator,
  text,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";
import type { Position, roles, StatsCode } from "~/lib/constants";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `hladstat_${name}`);

// ==== next auth ====

export const accounts = createTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: text("token_type", { length: 255 }),
    scope: text("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// ====

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }),
  firstName: text("first_name", { length: 255 }),
  lastName: text("last_name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  emailVerified: int("email_verified", {
    mode: "timestamp",
  }).default(sql`(unixepoch())`),
  image: text("image", { length: 255 }),
});

export const teams = createTable("team", {
  id: int("id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull(),
  name: text("name", { length: 255 }).notNull(),
  profilePicture: text("profile_picture", { length: 255 }),
});

export const usersToTeams = createTable(
  "users_to_teams",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    teamId: int("team_id")
      .notNull()
      .references(() => teams.id),
    role: text("role", { length: 255 })
      .notNull()
      .$type<(typeof roles)[number]>(),
    position: text("position", { length: 255 }).$type<Position>(),
    shirtNumber: int("shirt_number"),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.teamId, table.userId] }),
  }),
);

export const matches = createTable("matches", {
  id: int("id", { mode: "number" })
    .primaryKey({ autoIncrement: true })
    .notNull(),
  teamId: int("team_id")
    .notNull()
    .references(() => teams.id),
  date: int("date", { mode: "timestamp" }).notNull(),
  opponent: text("opponent", { length: 255 }).notNull(),
  score: text("score", { length: 3 }).notNull(),
  shared: int("shared", { mode: "boolean" }).default(false),
  lockedAnalysis: int("locked_analysis", { mode: "boolean" }).default(false),
});

export const stats = createTable("stats", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id")
    .notNull()
    .references(() => users.id),
  matchId: int("match_id")
    .references(() => matches.id, { onDelete: "cascade" })
    .notNull(),
  set: int("set", { mode: "number" }).notNull(),
  code: text("code", { length: 20 }).notNull().$type<StatsCode>(),
});

// ==== relations ====

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  teams: many(usersToTeams),
  stats: many(stats),
}));

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  user: one(users, { fields: [usersToTeams.userId], references: [users.id] }),
  team: one(teams, { fields: [usersToTeams.teamId], references: [teams.id] }),
}));

export const teamRelations = relations(teams, ({ many }) => ({
  users: many(usersToTeams),
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  team: one(teams, { fields: [matches.teamId], references: [teams.id] }),
  stats: many(stats),
}));

export const statsRelations = relations(stats, ({ one }) => ({
  player: one(users, { fields: [stats.playerId], references: [users.id] }),
  match: one(matches, { fields: [stats.matchId], references: [matches.id] }),
}));
