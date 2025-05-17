import React, { ReactNode } from "react";
import {
  LaptopIcon,
  CodeIcon,
  GlobeIcon,
  FileTextIcon,
  RocketIcon,
  MixerHorizontalIcon,
  BoxIcon,
  ArchiveIcon,
  DashboardIcon,
  ReaderIcon,
  CubeIcon,
  Component1Icon,
  Component2Icon,
  PersonIcon,
  IdCardIcon,
  DrawingPinIcon,
  DrawingPinFilledIcon,
  BackpackIcon,
  StarIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  EnvelopeClosedIcon,
  EnvelopeOpenIcon,
  SpeakerModerateIcon,
  HomeIcon,
} from "@radix-ui/react-icons";

export const RADIX_SUBJECT_ICONS: Record<string, any> = {
  // Программирование и IT
  programming: LaptopIcon,
  "computer-science": CodeIcon,
  "web-development": GlobeIcon,
  databases: ArchiveIcon,
  "artificial-intelligence": RocketIcon,

  // Математика
  mathematics: MixerHorizontalIcon,
  algebra: BoxIcon,
  geometry: BoxIcon,
  calculus: DashboardIcon,
  statistics: DashboardIcon,

  // Естественные науки
  physics: CubeIcon,
  chemistry: Component1Icon,
  biology: PersonIcon,
  astronomy: StarIcon,
  geography: GlobeIcon,

  // Языки
  english: EnvelopeOpenIcon,
  russian: EnvelopeClosedIcon,
  german: EnvelopeOpenIcon,
  french: EnvelopeOpenIcon,
  spanish: EnvelopeOpenIcon,
  chinese: EnvelopeOpenIcon,

  // Гуманитарные науки
  history: ReaderIcon,
  literature: BookmarkIcon,
  philosophy: PersonIcon,
  psychology: PersonIcon,
  sociology: PersonIcon,

  // Искусство
  music: SpeakerModerateIcon,
  art: Component2Icon,
  dance: PersonIcon,
  theater: PersonIcon,
  cinema: PersonIcon,

  // Бизнес и экономика
  economics: IdCardIcon,
  business: IdCardIcon,
  marketing: MagnifyingGlassIcon,
  management: IdCardIcon,
  finance: IdCardIcon,

  // Другое
  other: DrawingPinIcon,
  general: DrawingPinFilledIcon,
  test: FileTextIcon,
  quiz: FileTextIcon,
  exam: FileTextIcon,
};

export function getRadixSubjectIcon(subjectKey: string): ReactNode {
  const Icon = RADIX_SUBJECT_ICONS[subjectKey?.toLowerCase()] || FileTextIcon;
  return <Icon className="h-5 w-5" />;
}
