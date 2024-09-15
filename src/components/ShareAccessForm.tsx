"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDebounce } from "~/hooks/useDebounce";
import { api } from "~/trpc/react";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  Share2Icon,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useTeamContext } from "./TeamContext";

export const formSchema = z.object({
  userId: z
    .string({ required_error: "Wybierz użytkownika." })
    .min(1, "Wybierz użytkownika."),
});

export default function ShareAccessForm() {
  const { teamId } = useTeamContext();
  const [formOpened, setFormOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useDebounce(() => setDebouncedQuery(query), 300, [query]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const playersByQuery = api.user.byQueryNotSharedFromTeam.useQuery(
    { q: debouncedQuery, teamId },
    { enabled: Boolean(debouncedQuery) },
  );

  const utils = api.useUtils();
  const share = api.team.shareTo.useMutation({
    onSuccess: async () => {
      await utils.team.shared.invalidate();
      setFormOpened(false);
      form.reset();
      setQuery("");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    share.mutate({
      ...values,
      teamId,
    });
  }

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button className="self-start" size="sm">
          <span>Dodaj osoby</span>
          <Share2Icon className="ml-1.5 h-4 w-4" />
        </Button>
      }
      title="Udostępnij dostęp"
      description="Wybierz użytkownika i udostępnij mu dostęp do statystyk twojej drużyny."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Użytkownik</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? (() => {
                              const foundPlayer = playersByQuery.data?.find(
                                (player) => player.id === field.value,
                              );

                              return `${foundPlayer?.firstName} ${foundPlayer?.lastName}`;
                            })()
                          : "Wybierz zawodnika"}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Wyszukaj..."
                      />
                      <CommandList>
                        <CommandEmpty>
                          {playersByQuery.isLoading ? (
                            <div className="mx-auto flex justify-center">
                              <Loader2Icon className="h-4 w-4 animate-spin" />
                            </div>
                          ) : (
                            "Nie znaleziono zawodników."
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {playersByQuery.data?.map((player) => (
                            <CommandItem
                              key={player.id}
                              value={`${player.firstName} ${player.lastName}`}
                              onSelect={() => {
                                form.setValue("userId", player.id);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  player.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {player.firstName} {player.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="self-end" loading={share.isPending}>
            Udostępnij
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
