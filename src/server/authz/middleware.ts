import "server-only";

import { TRPCError } from "@trpc/server";

import type { Session } from "next-auth";

import type { db } from "~/server/db";
import type { matches } from "~/server/db/schema";

import {
  assertMatchBelongsToTeam,
  getMatchById,
  getTeamMembership,
  type TeamMembership,
} from "./queries";
import {
  canEditMatch,
  canEditTeamContent,
  canManageTeam,
  canReadMatch,
  canReadTeam,
} from "./permissions";
import {
  applyDevAuthzToMatch,
  applyDevAuthzToMembership,
  getDevAuthzOverride,
  type EffectiveMembership,
} from "~/dev/assert-dev-authz-override";

type Db = typeof db;

export type AuthzTeamMembership = TeamMembership & {
  teamId: number;
};

export type AuthzContext = {
  teamMembership?: AuthzTeamMembership;
  match?: typeof matches.$inferSelect;
};

type MatchAuthzRequirement = "editor" | "owner" | "statEditor";

function parseIntegerId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

function parseTeamIdFromRaw(raw: unknown): number {
  if (typeof raw !== "object" || raw === null || !("teamId" in raw)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Brak identyfikatora drużyny.",
    });
  }

  const teamId = parseIntegerId((raw as { teamId: unknown }).teamId);

  if (teamId === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Nieprawidłowy identyfikator drużyny.",
    });
  }

  return teamId;
}

async function parseTeamId(getRawInput: () => Promise<unknown>): Promise<number> {
  return parseTeamIdFromRaw(await getRawInput());
}

function parseMatchIdFromRaw(raw: unknown): number {
  if (typeof raw !== "object" || raw === null || !("matchId" in raw)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Brak identyfikatora meczu.",
    });
  }

  const matchId = parseIntegerId((raw as { matchId: unknown }).matchId);

  if (matchId === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Nieprawidłowy identyfikator meczu.",
    });
  }

  return matchId;
}

async function parseMatchId(getRawInput: () => Promise<unknown>): Promise<number> {
  return parseMatchIdFromRaw(await getRawInput());
}

function parseOptionalMatchIdFromRaw(raw: unknown): number | undefined {
  if (typeof raw !== "object" || raw === null || !("matchId" in raw)) {
    return undefined;
  }

  const matchId = parseIntegerId((raw as { matchId: unknown }).matchId);

  return matchId ?? undefined;
}

function parseOptionalTeamId(raw: unknown): number | undefined {
  if (typeof raw !== "object" || raw === null || !("teamId" in raw)) {
    return undefined;
  }

  try {
    return parseTeamIdFromRaw(raw);
  } catch {
    return undefined;
  }
}

function resolveEffectiveMembership(
  membership: EffectiveMembership | null,
  override: ReturnType<typeof getDevAuthzOverride>,
  teamId: number,
): EffectiveMembership | null {
  return applyDevAuthzToMembership(membership, override, teamId);
}

async function resolveMatchAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  requirement: MatchAuthzRequirement,
  headers?: Headers,
): Promise<{
  match: typeof matches.$inferSelect;
  teamMembership: AuthzTeamMembership;
}> {
  const matchId = await parseMatchId(getRawInput);
  const match = await getMatchById(db, matchId);

  if (!match) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Nie znaleziono meczu.",
    });
  }

  const override = headers ? getDevAuthzOverride(headers) : null;
  const effectiveMatch = applyDevAuthzToMatch(match, override);
  const membership = await getTeamMembership(db, userId, effectiveMatch.teamId);
  const effectiveMembership = resolveEffectiveMembership(
    membership
      ? { teamId: effectiveMatch.teamId, ...membership }
      : null,
    override,
    effectiveMatch.teamId,
  );

  if (requirement === "owner") {
    if (!effectiveMembership || !canManageTeam(effectiveMembership.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Tylko właściciel może wykonać tę operację.",
      });
    }
  } else if (!effectiveMembership || !canEditTeamContent(effectiveMembership)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: effectiveMembership?.teamArchived
        ? "Drużyna jest zarchiwizowana."
        : "Brak uprawnień do edycji meczu.",
    });
  } else if (
    requirement === "statEditor" &&
    !canEditMatch({
      membership: effectiveMembership,
      matchLocked: effectiveMatch.lockedAnalysis ?? false,
    })
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Analiza meczu jest zablokowana.",
    });
  }

  if (!effectiveMembership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Brak uprawnień do tego meczu.",
    });
  }

  return {
    match: effectiveMatch,
    teamMembership: effectiveMembership,
  };
}

export async function resolveTeamMemberAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<AuthzTeamMembership> {
  const teamId = await parseTeamId(getRawInput);
  const membership = await getTeamMembership(db, userId, teamId);
  const override = headers ? getDevAuthzOverride(headers) : null;
  const effective = resolveEffectiveMembership(
    membership ? { teamId, ...membership } : null,
    override,
    teamId,
  );

  if (!effective || !canReadTeam(effective.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Brak dostępu do tej drużyny.",
    });
  }

  return effective;
}

export async function resolveTeamEditorAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<AuthzTeamMembership> {
  const teamId = await parseTeamId(getRawInput);
  const membership = await getTeamMembership(db, userId, teamId);
  const override = headers ? getDevAuthzOverride(headers) : null;
  const effective = resolveEffectiveMembership(
    membership ? { teamId, ...membership } : null,
    override,
    teamId,
  );

  if (!effective || !canEditTeamContent(effective)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: effective?.teamArchived
        ? "Drużyna jest zarchiwizowana."
        : "Brak uprawnień do edycji drużyny.",
    });
  }

  return effective;
}

export async function resolveTeamOwnerAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<AuthzTeamMembership> {
  const teamId = await parseTeamId(getRawInput);
  const membership = await getTeamMembership(db, userId, teamId);
  const override = headers ? getDevAuthzOverride(headers) : null;
  const effective = resolveEffectiveMembership(
    membership ? { teamId, ...membership } : null,
    override,
    teamId,
  );

  if (!effective || !canManageTeam(effective.role)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tylko właściciel może wykonać tę operację.",
    });
  }

  return effective;
}

export async function resolveMatchReaderAuthz(
  db: Db,
  session: Session | null,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<{
  match: typeof matches.$inferSelect;
  teamMembership: AuthzTeamMembership | null;
}> {
  const raw = await getRawInput();
  const matchId = parseMatchIdFromRaw(raw);
  const teamId = parseOptionalTeamId(raw);

  const match = await getMatchById(db, matchId);

  if (!match) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Nie znaleziono meczu.",
    });
  }

  if (teamId !== undefined) {
    assertMatchBelongsToTeam(match, teamId);
  }

  const override = headers ? getDevAuthzOverride(headers) : null;
  const effectiveMatch = applyDevAuthzToMatch(match, override);

  const membership = session?.user
    ? await getTeamMembership(db, session.user.id, effectiveMatch.teamId)
    : null;

  const effectiveMembership = resolveEffectiveMembership(
    membership
      ? { teamId: effectiveMatch.teamId, ...membership }
      : null,
    override,
    effectiveMatch.teamId,
  );

  if (
    !canReadMatch({
      membership: effectiveMembership,
      matchShared: effectiveMatch.shared ?? false,
    })
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Brak dostępu do tego meczu.",
    });
  }

  return {
    match: effectiveMatch,
    teamMembership: effectiveMembership,
  };
}

export async function resolveMatchEditorAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<{
  match: typeof matches.$inferSelect;
  teamMembership: AuthzTeamMembership;
}> {
  return resolveMatchAuthz(db, userId, getRawInput, "editor", headers);
}

export async function resolveMatchStatEditorAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<{
  match: typeof matches.$inferSelect;
  teamMembership: AuthzTeamMembership;
}> {
  return resolveMatchAuthz(db, userId, getRawInput, "statEditor", headers);
}

export async function resolveMatchOwnerAuthz(
  db: Db,
  userId: string,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<{
  match: typeof matches.$inferSelect;
  teamMembership: AuthzTeamMembership;
}> {
  return resolveMatchAuthz(db, userId, getRawInput, "owner", headers);
}

export async function resolveMatchStatsReaderAuthz(
  db: Db,
  session: Session | null,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<{
  match: typeof matches.$inferSelect;
  teamMembership: AuthzTeamMembership | null;
}> {
  const raw = await getRawInput();
  parseTeamIdFromRaw(raw);

  return resolveMatchReaderAuthz(db, session, () => Promise.resolve(raw), headers);
}

export async function resolveTeamPlayersReaderAuthz(
  db: Db,
  session: Session | null,
  getRawInput: () => Promise<unknown>,
  headers?: Headers,
): Promise<{ teamMembership: AuthzTeamMembership | null }> {
  const raw = await getRawInput();
  const matchId = parseOptionalMatchIdFromRaw(raw);

  if (matchId !== undefined) {
    const { teamMembership } = await resolveMatchReaderAuthz(
      db,
      session,
      () => Promise.resolve(raw),
      headers,
    );

    return { teamMembership };
  }

  if (!session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const teamMembership = await resolveTeamMemberAuthz(
    db,
    session.user.id,
    () => Promise.resolve(raw),
    headers,
  );

  return { teamMembership };
}
