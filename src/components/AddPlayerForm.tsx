"use client";

import { useState } from "react";
import { z } from "zod";
import ResponsiveDialog from "./ui/responsive-dialog";
import { Button } from "./ui/button";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  PlusIcon,
  ShirtIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { api } from "~/trpc/react";
import { useDebounce } from "~/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { positions } from "~/lib/constants";
import { Input } from "./ui/input";
import { useTeamContext } from "./TeamContext";

export const formSchema = z.object({
  playerId: z
    .string({ required_error: "Wybierz zawodnika." })
    .min(1, "Wybierz zawodnika."),
  position: z
    .string({ required_error: "Pozycja jest wymagana." })
    .min(1, "Pozycja jest wymagana."),
  shirtNumber: z.string().optional(),
});

export default function AddPlayerForm() {
  const { teamId } = useTeamContext();
  const [formOpened, setFormOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useDebounce(() => setDebouncedQuery(query), 300, [query]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      shirtNumber: "",
    },
  });

  const utils = api.useUtils();
  const playersByQuery = api.user.byQueryNotInTeam.useQuery(
    { q: debouncedQuery, teamId },
    { enabled: Boolean(debouncedQuery) },
  );

  const addPlayer = api.team.addPlayer.useMutation({
    onSuccess: async () => {
      await utils.team.players.invalidate();
      setFormOpened(false);
      form.reset();
      setQuery("");
    },
  });

  function onSubmit({ shirtNumber, ...values }: z.infer<typeof formSchema>) {
    addPlayer.mutate({
      ...values,
      teamId,
      shirtNumber: shirtNumber ? parseInt(shirtNumber) : undefined,
    });
  }

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button size="sm">
          <span>Dodaj zawodnika</span>
          <PlusIcon className="ml-1 h-4 w-4" />
        </Button>
      }
      title="Dodaj zawodnika"
      description="Nowy transfer? Ale czad!"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="playerId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Zawodnik</FormLabel>
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
                                form.setValue("playerId", player.id);
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
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pozycja</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz pozycję" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shirtNumber"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-4">
                  <div className="grow space-y-2">
                    <FormLabel>Numer koszulki (opcjonalne)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={99} {...field} />
                    </FormControl>
                  </div>
                  <div className="relative">
                    <ShirtIcon className="h-12 w-12 fill-current" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-primary-foreground">
                      {field.value ? field.value?.slice(0, 2) : "?"}
                    </span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="self-end"
            loading={addPlayer.isPending}
          >
            Dodaj
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
