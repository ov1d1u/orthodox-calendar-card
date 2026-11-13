const STRINGS = {
  en: {
    loading: "Loading…",
    entity_missing: "Entity not found",
    no_events: "No events",
    error: "Could not load calendar events",
    today: "Today",
    entity: "Calendar (all days)",
    feasts_entity: "Feasts calendar",
    title: "Title",
    days_to_show: "Days to show",
    show_description: "Show descriptions",
    feast_color: "Feast & Sunday color",
    feast_bold: "Bold feasts & Sundays",
    highlight_today: "Highlight today",
    show_fasting_icons: "Show fasting icons",
    fish_icon: "Fish day icon",
    fasting_icon: "Fasting day icon",
  },
  ro: {
    loading: "Se încarcă…",
    entity_missing: "Entitatea nu a fost găsită",
    no_events: "Niciun eveniment",
    error: "Evenimentele nu au putut fi încărcate",
    today: "Azi",
    entity: "Calendar (toate zilele)",
    feasts_entity: "Calendar sărbători",
    title: "Titlu",
    days_to_show: "Zile afișate",
    show_description: "Afișează descrierile",
    feast_color: "Culoare sărbători și duminici",
    feast_bold: "Sărbători și duminici îngroșate",
    highlight_today: "Evidențiază ziua curentă",
    show_fasting_icons: "Afișează iconițe pentru post",
    fish_icon: "Iconiță zile cu dezlegare la pește",
    fasting_icon: "Iconiță zile de post",
  },
};

export type StringKey = keyof (typeof STRINGS)["en"];

export function localize(key: StringKey, language = "en"): string {
  const lang = language.split("-")[0] as keyof typeof STRINGS;
  return (STRINGS[lang] ?? STRINGS.en)[key] ?? STRINGS.en[key];
}
