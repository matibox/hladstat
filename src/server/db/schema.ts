import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  pgTableCreator,
  text,
  timestamp,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import type { Position, roles, StatsCode } from "~/lib/constants";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hladstat_${name}`);

// ==== next auth ====

export const accounts = createTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
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
    sessionToken: text("session_token").notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires").notNull(),
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
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// ====

export const users = createTable("user", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified").defaultNow(),
  image: text("image"),
});

export const teams = createTable("team", {
  id: serial("teams").primaryKey().notNull(),
  name: text("name").notNull(),
  profilePicture: text("profile_picture"),
  allowTwoSetMatches: boolean("allow_two_set_matches").default(false),
});

export const usersToTeams = createTable(
  "users_to_teams",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id),
    role: text("role").notNull().$type<(typeof roles)[number]>(),
    position: text("position").$type<Position>(),
    shirtNumber: integer("shirt_number"),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.teamId, table.userId] }),
  }),
);

export const matches = createTable("matches", {
  id: serial("id").primaryKey().notNull(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  date: timestamp("date").notNull(),
  opponent: text("opponent").notNull(),
  score: text("score").notNull(),
  shared: boolean("shared").default(false),
  lockedAnalysis: boolean("locked_analysis").default(false),
});

export const stats = createTable("stats", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id")
    .notNull()
    .references(() => users.id),
  matchId: integer("match_id")
    .references(() => matches.id, { onDelete: "cascade" })
    .notNull(),
  set: integer("set").notNull(),
  code: text("code").notNull().$type<StatsCode>(),
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
