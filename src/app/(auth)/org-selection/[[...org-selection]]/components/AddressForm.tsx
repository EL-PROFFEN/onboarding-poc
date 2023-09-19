"use client";
import { usePlacesWidget } from "react-google-autocomplete";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { InsertAddress, insertAddressSchema } from "~/drizzle/schema";

export function AddressForm() {
  const form = useForm<InsertAddress>({
    resolver: zodResolver(insertAddressSchema),
  });

  const { register, handleSubmit, setValue } = form;

  const { ref } = usePlacesWidget<HTMLInputElement>({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      if (!place?.formatted_address) return;

      console.log(place);
      // setValue("address", place.formatted_address);
      // setValue("latitude", place.geometry.location.lat());
      // setValue("longitude", place.geometry.location.lng());
    },
    // search only for locations in Norway
    options: {
      types: ["address"],
      componentRestrictions: { country: "no" },
    },
  });

  function onSubmit(values: InsertAddress) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full flex-1 text-center">
      <h1 className="text-3xl font-bold">Legg til addresse</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="container max-w-lg space-y-8"
        >
          <FormItem>
            <FormLabel hidden>Addresse</FormLabel>
            <FormControl>
              <Input ref={ref} placeholder="Addresse" />
            </FormControl>
            <FormDescription>Skriv inn en adressen.</FormDescription>
            <FormMessage />
          </FormItem>
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land</FormLabel>
                <FormControl>
                  <Input placeholder="land" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>By</FormLabel>
                <FormControl>
                  <Input placeholder="by" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <Button type="submit">Lagre</Button>
        </form>
      </Form>
    </div>
  );
}

// mapping from google.maps.places.PlaceResult
// to our own address object ""
const buildAddress = (place: google.maps.places.PlaceResult) => {};

const getAddressComponent = (
  place: google.maps.places.PlaceResult,
  type: string
) =>
  place.address_components?.find((component) => component.types.includes(type))
    ?.long_name;
