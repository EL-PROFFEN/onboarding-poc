"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon, GearIcon } from "@radix-ui/react-icons";

import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "./ui/button";
import {
  OrganizationProfile,
  useOrganization,
  useOrganizationList,
} from "@clerk/nextjs";
import { organization } from "~/drizzle/schema";
import { OrgProfile } from "./org-profile";

const groups = [
  {
    label: "Personal Account",
    teams: [
      {
        label: "Alicia Koch",
        value: "personal",
      },
    ],
  },
  {
    label: "Teams",
    teams: [
      {
        label: "Acme Inc.",
        value: "acme-inc",
      },
      {
        label: "Monsters Inc.",
        value: "monsters",
      },
    ],
  },
];

type Team = (typeof groups)[number]["teams"][number];

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function OrgSwitcher({ className }: TeamSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  // const [selectedTeam, setSelectedTeam] = React.useState<Team>(
  //   groups[0].teams[0]
  // );

  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: true,
  });
  const { organization, membership } = useOrganization();

  if (!setActive) return null;

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn("w-[200px] justify-between", className)}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={organization?.imageUrl}
                alt={organization?.name}
              />
              {/* <AvatarFallback>SC</AvatarFallback> */}
            </Avatar>
            {organization?.name}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Søk organisasjon..." />
              <CommandEmpty>Fant ingen organisasjoner</CommandEmpty>
              {userMemberships?.data?.map((org) => (
                <CommandItem
                  key={org.organization?.id}
                  onSelect={() => {
                    setActive({
                      organization: org.organization.id,
                    });
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage
                      src={org.organization.imageUrl}
                      alt={org.organization.name}
                      className="grayscale"
                    />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  {org.organization.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      organization?.id === org.organization.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
            {membership?.role === "admin" && (
              <>
                <CommandSeparator />

                <CommandGroup>
                  <DialogTrigger asChild>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setShowNewTeamDialog(true);
                      }}
                    >
                      <GearIcon className="mr-2 h-5 w-5" />
                      Administrer
                    </CommandItem>
                  </DialogTrigger>
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent className="h-screen w-screen">
        <OrganizationProfile />
      </DialogContent>
    </Dialog>
  );
}
