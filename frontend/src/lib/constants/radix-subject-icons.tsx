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
  GearIcon,
  LayersIcon,
  BarChartIcon,
  CalendarIcon,
  ClockIcon,
  CameraIcon,
  VideoIcon,
  MobileIcon,
  DesktopIcon,
  ChatBubbleIcon,
  LightningBoltIcon,
  ShuffleIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  InfoCircledIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircledIcon,
  PlusIcon,
  MinusIcon,
  UpdateIcon,
  DownloadIcon,
  UploadIcon,
  Share1Icon,
  Link1Icon,
  ExternalLinkIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  LockClosedIcon,
  LockOpen1Icon,
  HeartIcon,
  HeartFilledIcon,
  FaceIcon,
  AvatarIcon,
  BadgeIcon,
  TokensIcon,
  CrumpledPaperIcon,
  PaperPlaneIcon,
  ScissorsIcon,
  SewingPinIcon,
  ThickArrowUpIcon,
  ThickArrowDownIcon,
  ThickArrowLeftIcon,
  ThickArrowRightIcon,
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

// Функция автоматического определения иконки на основе названия предмета
export function getAutoSubjectIcon(subjectName: string): ReactNode {
  const name = subjectName.toLowerCase();

  // Программирование и IT
  if (
    name.includes("программ") ||
    name.includes("код") ||
    name.includes("разработ")
  ) {
    return <CodeIcon className="h-5 w-5" />;
  }
  if (name.includes("веб") || name.includes("web") || name.includes("сайт")) {
    return <GlobeIcon className="h-5 w-5" />;
  }
  if (
    name.includes("база данн") ||
    name.includes("бд") ||
    name.includes("database")
  ) {
    return <ArchiveIcon className="h-5 w-5" />;
  }
  if (
    name.includes("компьютер") ||
    name.includes("пк") ||
    name.includes("computer")
  ) {
    return <LaptopIcon className="h-5 w-5" />;
  }
  if (
    name.includes("мобильн") ||
    name.includes("android") ||
    name.includes("ios")
  ) {
    return <MobileIcon className="h-5 w-5" />;
  }
  if (
    name.includes("сеть") ||
    name.includes("интернет") ||
    name.includes("network")
  ) {
    return <Share1Icon className="h-5 w-5" />;
  }
  if (
    name.includes("безопасн") ||
    name.includes("защит") ||
    name.includes("security")
  ) {
    return <LockClosedIcon className="h-5 w-5" />;
  }
  if (
    name.includes("админ") ||
    name.includes("систем") ||
    name.includes("server")
  ) {
    return <GearIcon className="h-5 w-5" />;
  }
  if (
    name.includes("искусственн") ||
    name.includes("ии") ||
    name.includes("ai") ||
    name.includes("машинн")
  ) {
    return <RocketIcon className="h-5 w-5" />;
  }

  // Математика и точные науки
  if (
    name.includes("математ") ||
    name.includes("алгебр") ||
    name.includes("геометр")
  ) {
    return <MixerHorizontalIcon className="h-5 w-5" />;
  }
  if (
    name.includes("статист") ||
    name.includes("анализ") ||
    name.includes("данн")
  ) {
    return <BarChartIcon className="h-5 w-5" />;
  }
  if (name.includes("физик")) {
    return <LightningBoltIcon className="h-5 w-5" />;
  }
  if (name.includes("хими")) {
    return <Component1Icon className="h-5 w-5" />;
  }
  if (name.includes("биолог") || name.includes("экология")) {
    return <PersonIcon className="h-5 w-5" />;
  }

  // Гуманитарные науки
  if (name.includes("истор")) {
    return <ClockIcon className="h-5 w-5" />;
  }
  if (
    name.includes("литерат") ||
    name.includes("язык") ||
    name.includes("лингв")
  ) {
    return <ReaderIcon className="h-5 w-5" />;
  }
  if (name.includes("философ")) {
    return <QuestionMarkCircledIcon className="h-5 w-5" />;
  }
  if (name.includes("психолог")) {
    return <FaceIcon className="h-5 w-5" />;
  }
  if (name.includes("социолог") || name.includes("общество")) {
    return <ChatBubbleIcon className="h-5 w-5" />;
  }

  // Искусство и творчество
  if (name.includes("музык") || name.includes("звук")) {
    return <SpeakerModerateIcon className="h-5 w-5" />;
  }
  if (
    name.includes("дизайн") ||
    name.includes("график") ||
    name.includes("рисован")
  ) {
    return <Component2Icon className="h-5 w-5" />;
  }
  if (name.includes("фото") || name.includes("изображ")) {
    return <CameraIcon className="h-5 w-5" />;
  }
  if (
    name.includes("видео") ||
    name.includes("кино") ||
    name.includes("монтаж")
  ) {
    return <VideoIcon className="h-5 w-5" />;
  }

  // Экономика и бизнес
  if (
    name.includes("экономик") ||
    name.includes("финанс") ||
    name.includes("бухгалт")
  ) {
    return <IdCardIcon className="h-5 w-5" />;
  }
  if (name.includes("маркетинг") || name.includes("реклам")) {
    return <MagnifyingGlassIcon className="h-5 w-5" />;
  }
  if (name.includes("менеджмент") || name.includes("управлен")) {
    return <BadgeIcon className="h-5 w-5" />;
  }

  // Образование и тестирование
  if (
    name.includes("тест") ||
    name.includes("экзамен") ||
    name.includes("контрол")
  ) {
    return <CheckCircledIcon className="h-5 w-5" />;
  }
  if (name.includes("образован") || name.includes("педагог")) {
    return <BookmarkIcon className="h-5 w-5" />;
  }

  // По умолчанию
  return <FileTextIcon className="h-5 w-5" />;
}

export function getRadixSubjectIcon(subjectKey: string): ReactNode {
  const Icon = RADIX_SUBJECT_ICONS[subjectKey?.toLowerCase()] || FileTextIcon;
  return <Icon className="h-5 w-5" />;
}
