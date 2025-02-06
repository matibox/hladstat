"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { CalendarIcon, ChartNoAxesCombinedIcon, PlusIcon } from "lucide-react";
import ResponsiveDialog from "./ui/responsive-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";
import { Calendar } from "./ui/calendar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useTeamContext } from "./TeamContext";

export const formSchema = z
  .object({
    opponent: z.string().min(1, "Przeciwnik jest wymagany."),
    date: z.date({ required_error: "Data meczu jest wymagana." }),
    score: z
      .string({ required_error: "Wynik meczu jest wymagany." })
      .min(2, "Wpisz poprawny wynik meczu."),
    allowTwoSetMatches: z.boolean().default(false),
  })
  .superRefine(({ score, allowTwoSetMatches }, ctx) => {
    if (allowTwoSetMatches) return;

    const scores = (score.split("") as [string, string]).map(Number);
    const scoreNotBetween0And3 = scores
      .map((score) => score >= 0 && score <= 3)
      .some((v) => !v);

    const sum = scores.reduce((a, b) => a + b, 0);
    const isSumBetween3And5 = sum >= 3 && sum <= 5;

    if (scoreNotBetween0And3 || !isSumBetween3And5) {
      ctx.addIssue({
        code: "custom",
        fatal: true,
        message: "Wpisz poprawny wynik meczu.",
        path: ["score"],
      });
    }
  });

export default function NewMatchForm() {
  const { teamId, isPlayerOrOwner } = useTeamContext();
  const [formOpened, setFormOpened] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: "",
      score: "",
    },
  });

  const [matchSettings] = api.team.matchSettings.useSuspenseQuery({ teamId });

  const createMatch = api.match.create.useMutation({
    onSuccess: ({ matchId }) => {
      form.reset();
      router.push(`/dashboard/${teamId}/${matchId}`);
    },
  });

  function onSubmit({ score, ...values }: z.infer<typeof formSchema>) {
    const formattedScore = `${score.charAt(0)}:${score.charAt(1)}`;

    createMatch.mutate({
      teamId,
      score: formattedScore,
      ...values,
    });
  }

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button size="sm" disabled={!isPlayerOrOwner}>
          <span>Nowy mecz</span>
          <PlusIcon className="ml-1 h-4 w-4" />
        </Button>
      }
      title="Nowy mecz"
      description="Wypełnij podstawowe dane, a następnie rozpocznij analizę."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="allowTwoSetMatches"
            render={() => <></>}
            defaultValue={matchSettings.allowTwoSetMatches ?? false}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data meczu</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          dayjs(field.value).format("MMMM DD, YYYY")
                        ) : (
                          <span>Wybierz datę</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="opponent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Przeciwnik</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wynik meczu</FormLabel>
                <FormControl>
                  <InputOTP maxLength={2} min={0} max={3} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                    </InputOTPGroup>
                    :
                    <InputOTPGroup>
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Wynik przeciwnika po prawej stronie.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="self-end"
            loading={createMatch.isPending}
          >
            <span>Rozpocznij analizę</span>
            <ChartNoAxesCombinedIcon className="ml-1.5 h-4 w-4" />
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
