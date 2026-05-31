import { TRPCError } from "@trpc/server";

export function getTrpcErrorCode(error: unknown): TRPCError["code"] | undefined {
  if (error instanceof TRPCError) {
    return error.code;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: TRPCError["code"] }).code;
  }

  return undefined;
}
