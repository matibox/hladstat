import { describe, expect, test } from "vitest";

import type { TeamMembership } from "./queries";
import {
  canEditMatch,
  canEditTeam,
  canEditTeamContent,
  canManageTeam,
  canReadMatch,
  canReadTeam,
} from "./permissions";

const owner: TeamMembership = { role: "owner", teamArchived: false };
const player: TeamMembership = { role: "player", teamArchived: false };
const shared: TeamMembership = { role: "shared", teamArchived: false };
const archivedOwner: TeamMembership = { role: "owner", teamArchived: true };

describe("canReadTeam", () => {
  test("allows owner, player, and shared", () => {
    expect(canReadTeam("owner")).toBe(true);
    expect(canReadTeam("player")).toBe(true);
    expect(canReadTeam("shared")).toBe(true);
  });
});

describe("canEditTeam", () => {
  test("allows owner and player only", () => {
    expect(canEditTeam("owner")).toBe(true);
    expect(canEditTeam("player")).toBe(true);
    expect(canEditTeam("shared")).toBe(false);
  });
});

describe("canManageTeam", () => {
  test("allows owner only", () => {
    expect(canManageTeam("owner")).toBe(true);
    expect(canManageTeam("player")).toBe(false);
  });
});

describe("canEditTeamContent", () => {
  test("blocks archived teams for editors", () => {
    expect(canEditTeamContent(owner)).toBe(true);
    expect(canEditTeamContent(player)).toBe(true);
    expect(canEditTeamContent(archivedOwner)).toBe(false);
    expect(canEditTeamContent(shared)).toBe(false);
    expect(canEditTeamContent(null)).toBe(false);
  });
});

describe("canReadMatch", () => {
  test("allows team members", () => {
    expect(
      canReadMatch({
        membership: player,
        matchShared: false,
      }),
    ).toBe(true);
  });

  test("allows public readers on shared matches", () => {
    expect(
      canReadMatch({
        membership: null,
        matchShared: true,
      }),
    ).toBe(true);
  });

  test("denies public readers on unshared matches", () => {
    expect(
      canReadMatch({
        membership: null,
        matchShared: false,
      }),
    ).toBe(false);
  });
});

describe("canEditMatch", () => {
  test("allows editors when not archived or locked", () => {
    expect(
      canEditMatch({ membership: player, matchLocked: false }),
    ).toBe(true);
  });

  test("blocks locked matches", () => {
    expect(canEditMatch({ membership: player, matchLocked: true })).toBe(
      false,
    );
  });

  test("blocks archived teams", () => {
    expect(
      canEditMatch({ membership: archivedOwner, matchLocked: false }),
    ).toBe(false);
  });
});
