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

export const formSchema = z.object({
  playerId: z.string().min(1, "Wybierz zawodnika."),
  position: z.string().min(1, "Pozycja jest wymagana."),
  shirtNumber: z.number().optional(),
});

export default function AddPlayerForm() {
  const [formOpened, setFormOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useDebounce(() => setDebouncedQuery(query), 300, [query]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
    },
  });

  const playersByQuery = api.user.byQuery.useQuery(
    { q: debouncedQuery },
    { enabled: Boolean(debouncedQuery) },
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  console.log(form.getValues("playerId"));

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={
        <Button size="sm" variant="secondary">
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
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
