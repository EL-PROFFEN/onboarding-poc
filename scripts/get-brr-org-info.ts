import { z } from "zod";
import { InsertAddress } from "~/drizzle/schema";

// Reusable types
type Link = {
  href: string;
};

type Links = {
  self: Link;
  [key: string]: Link; // This allows for other dynamic properties
};

type Organisasjonsform = {
  kode: string;
  beskrivelse: string;
  _links: Links;
};

type Naeringskode = {
  kode: string;
  beskrivelse: string;
};

// Specific types
type EnhetResponse = {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: Organisasjonsform;
  postadresse: BRREGAddress;
  registreringsdatoEnhetsregisteret: string;
  registrertIMvaregisteret: boolean;
  naeringskode1: Naeringskode;
  antallAnsatte: number;
  forretningsadresse: BRREGAddress;
  stiftelsesdato: string;
  registrertIForetaksregisteret: boolean;
  registrertIStiftelsesregisteret: boolean;
  registrertIFrivillighetsregisteret: boolean;
  konkurs: boolean;
  underAvvikling: boolean;
  underTvangsavviklingEllerTvangsopplosning: boolean;
  maalform: string;
  _links: Links;
};

type UnderenhetResponse = {
  organisasjonsnummer: string;
  navn: string;
  organisasjonsform: Organisasjonsform;
  postadresse: BRREGAddress;
  registreringsdatoEnhetsregisteret: string;
  registrertIMvaregisteret: boolean;
  naeringskode1: Naeringskode;
  antallAnsatte: number;
  overordnetEnhet: string;
  beliggenhetsadresse: BRREGAddress;
  nedleggelsesdato: string;
  _links: Links & {
    overordnetEnhet: Link;
  };
};

export type OrgDetails = {
  orgName: string;
  orgAddress: InsertAddress;
  parentOrgNr?: number;
};

const addressSchema = z.object({
  land: z.string(),
  landkode: z.string(),
  postnummer: z.string(),
  poststed: z.string(),
  adresse: z.array(z.string().nullable()),
  kommune: z.string(),
  kommunenummer: z.string(),
});

export type BRREGAddress = z.infer<typeof addressSchema>;

const enhetResponseSchema = z.object({
  navn: z.string().min(1),
  forretningsadresse: addressSchema,
});

const underenhetResponseSchema = z.object({
  navn: z.string().min(1),
  beliggenhetsadresse: addressSchema,
  overordnetEnhet: z.string().min(1),
});

const buildAddress = (orgNr: number, address: BRREGAddress): InsertAddress => ({
  orgNr,
  street: address.adresse.filter(Boolean).join(", "),
  city: address.poststed,
  country: address.land,
  postalNr: address.postnummer,
  municipality: address.kommune,
  municipalityNr: Number(address.kommunenummer),
});

// request the details for an organization from brreg
export const getParentOrgDetails = async (orgNr: number) => {
  const url = `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNr}`;
  const response = await fetch(url);
  const data = await response.json();
  const { navn, forretningsadresse } = enhetResponseSchema.parse(data);

  return {
    orgName: navn,
    orgAddress: buildAddress(orgNr, forretningsadresse),
  } satisfies OrgDetails;
};

// request the details for a sub-organization from brreg
export const getSubOrgDetails = async (orgNr: number) => {
  const url = `https://data.brreg.no/enhetsregisteret/api/underenheter/${orgNr}`;
  const response = await fetch(url);

  const data = await response.json();
  const { navn, beliggenhetsadresse, overordnetEnhet } =
    underenhetResponseSchema.parse(data);

  return {
    orgName: navn,
    orgAddress: buildAddress(orgNr, beliggenhetsadresse),
    parentOrgNr: Number(overordnetEnhet),
  } satisfies OrgDetails;
};
