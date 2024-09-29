"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ResponsiveDialog from "./ui/responsive-dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { api } from "~/trpc/react";
import { acceptedImageTypes } from "~/lib/uploadthing";
import { useImageUpload } from "~/hooks/useImageUpload";
import { ShirtIcon, UploadIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { positions } from "~/lib/constants";

export const formSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  profilePicture: z
    .custom<File | null>()
    .optional()
    .refine(
      (file) => file === null || (file && file.size < 2000000),
      "Plik przewyższa 2MB.",
    )
    .refine(
      (file) =>
        file === null || (file && acceptedImageTypes.includes(file.type)),
      "Tylko pliki .jpg, .jpeg, .png i .webp są wspierane.",
    ),
  position: z
    .string({ required_error: "Pozycja jest wymagana." })
    .min(1, "Pozycja jest wymagana."),
  shirtNumber: z.string().optional(),
});

export default function NewTeamForm() {
  const [formOpened, setFormOpened] = useState(false);
  const { uploadImage, isImageUploading } = useImageUpload();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      profilePicture: null,
      position: "",
      shirtNumber: "",
    },
  });

  const utils = api.useUtils();
  const createTeam = api.team.create.useMutation({
    onSuccess: async () => {
      await utils.team.ofPlayerOwner.invalidate();
      form.reset();
      setFormOpened(false);
    },
  });

  async function onSubmit({
    shirtNumber,
    ...values
  }: z.infer<typeof formSchema>) {
    let profilePicture: string | undefined;

    if (values.profilePicture) {
      await uploadImage(values.profilePicture, ({ url }) => {
        profilePicture = url;
      });
    }

    createTeam.mutate({
      ...values,
      profilePicture,
      shirtNumber: shirtNumber ? parseInt(shirtNumber) : undefined,
    });
  }

  return (
    <ResponsiveDialog
      open={formOpened}
      onOpenChange={setFormOpened}
      trigger={<Button>Nowa drużyna</Button>}
      title="Utwórz drużynę"
      description="Wypełnij dane i kliknij utwórz, kiedy będziesz gotowy."
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa drużyny</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo drużyny (opcjonalne)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    id="file-input"
                    className="hidden"
                    accept={acceptedImageTypes.join(", ")}
                    onChange={(e) =>
                      field.onChange(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </FormControl>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="file-input"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold transition hover:bg-accent"
                  >
                    <UploadIcon className="h-4 w-4" />
                    <span>Prześlij logo</span>
                  </label>
                  <span className="text-sm text-primary">
                    {field.value && field.value.size > 0
                      ? field.value.name
                      : "Nie wybrano pliku."}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Twoja pozycja</FormLabel>
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
                    <FormLabel>Twój numer koszulki (opcjonalne)</FormLabel>
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
            loading={isImageUploading || createTeam.isPending}
          >
            Utwórz
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
