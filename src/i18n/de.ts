type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { [K in keyof T]: Widen<T[K]> }
          : T;

export const de = {
  language: 'Deutsch',
  metaTitle: 'OfflineHandwerk – Dein Handwerk. Deine Preise. Deine Daten.',
  metaDescription:
    'Kalkulationen für deinen Handwerksbetrieb. Lokal gespeicherte Daten, klare Preise und PDFs für deine Kunden. Ohne Werbung und ohne Tracking deiner Arbeit.',
  skip: 'Zum Inhalt',
  navLabel: 'Hauptnavigation',
  navConcept: 'Konzept',
  navFeatures: 'Funktionen',
  navPlans: 'Pakete',
  navManual: 'Anleitung',
  navDownload: 'Zur App',
  switchLabel: 'Sprache: Deutsch – zu Englisch wechseln',
  themeToggle: 'Hell/Dunkel umschalten',
  heroEyebrow: 'Für deinen nächsten Auftrag',
  heroTitle: 'Dein Handwerk.',
  heroAccent: 'Deine Preise.',
  heroEnd: 'Deine Daten.',
  heroBody:
    'Kalkuliere Arbeit und Material. Erstelle ein PDF für deine Kunden. Und behalte deine Betriebsdaten dort, wo sie hingehören: bei dir.',
  screenshotAlt:
    'OfflineHandwerk: Startansicht mit Stammdaten, Kalkulationen und Einstellungen in der dunklen Ansicht',
  screenshotSecondAlt:
    'Kalkulationsübersicht in OfflineHandwerk mit dem integrierten Beispiel Bad modernisieren für Musterkunde',
  conceptEyebrow: 'Local First',
  conceptTitle: 'Dein Betrieb. Nicht unsere Datenbank.',
  conceptBody:
    'Kalkulationen, Kunden, Betriebsdaten und dein Logo bleiben lokal auf deinem Gerät. Wir erhalten diese Inhalte nicht und speichern sie nicht auf unseren Servern.',
  conceptItems: [
    {
      title: 'Lokal arbeiten',
      body: 'Deine erfassten Inhalte liegen in der lokalen Datenbank der Anwendung. Deine Arbeit wird nicht an OfflineHandwerk übertragen.',
    },
    {
      title: 'Ohne Werbung',
      body: 'Keine Werbebanner, keine Analyse deiner Arbeit, keine Nutzungsprofile. Du konzentrierst dich auf deinen Auftrag.',
    },
    {
      title: 'Du behältst die Verantwortung',
      body: 'Geht das Gerät verloren oder werden die lokalen App-Daten gelöscht, können wir sie nicht wiederherstellen. Sichere deine Daten und verwahre Exporte selbst.',
    },
  ],
  featuresEyebrow: 'Vom Auftrag zum PDF',
  featuresTitle: 'Weniger Umwege. Mehr Überblick.',
  featureSteps: [
    {
      title: 'Bausteine bereithalten',
      body: 'Pflege Kunden, Mitarbeiter, Materialien und Leistungen. Hinterlege deine Preise, Steuersätze und Zuschläge.',
    },
    {
      title: 'Sauber kalkulieren',
      body: 'Stelle Arbeitszeit und Material für deinen Auftrag zusammen. Behalte Netto, Steuer und Gesamtsumme im Blick.',
    },
    {
      title: 'Ergebnis weitergeben',
      body: 'Sieh dir das Kunden-PDF an. Mit Premium exportierst du ohne Wasserzeichen und teilst, sendest oder druckst die Datei über die Funktionen deines Geräts.',
    },
  ],
  plansEyebrow: 'Free & Premium',
  plansTitle: 'Starte klein. Erweitere, wenn es passt.',
  plansBody:
    'Free zum Einstieg. Premium für den täglichen Einsatz. Deine Inhalte bleiben bei jedem Paket lokal.',
  freeName: 'Free',
  premiumName: 'Premium',
  freePrice: 'Kostenlos',
  freeDescription: 'Die Grundlagen zum Kennenlernen.',
  premiumDescription:
    'Premium für deine Kalkulationen und PDFs, plus Backup und Wiederherstellung.',
  premiumMonthly: '9,99 € / Monat',
  premiumYearly: '109,99 € / Jahr (1 Monat gratis)',
  tableCaption: 'Funktionen und Grenzen der mobilen App im Vergleich',
  tableFeature: 'Funktion',
  included: 'Enthalten',
  notIncluded: 'Nicht enthalten',
  unlimited: 'Unbegrenzt',
  limited: 'Bis zu {count}',
  features: {
    calculations: 'Gespeicherte Kalkulationen',
    customers: 'Kunden',
    employees: 'Mitarbeiter',
    materials: 'Materialien',
    services: 'Leistungen',
    taxes: 'Steuersätze',
    surcharges: 'Zuschläge',
    canPreviewPdf: 'Kunden-PDF ansehen',
    canExportWithoutWatermark: 'PDF ohne Wasserzeichen exportieren',
    canUseLogo: 'Eigenes Logo im PDF',
    canUseTemplates: 'Positionsvorlagen',
    canCreateInternalPdf: 'Internes PDF',
    canSendOfficeEmail: 'PDF ans Büro senden',
    canBackupRestore: 'Backup & Wiederherstellung',
  },
  footnoteUnlimited: '*1 ∞ = Unbegrenzt',
  footnoteBackup:
    '*2 Ohne die Backup-Funktion kannst du keine vollständige lokale Datenbanksicherung in der App erstellen. Ein PDF-Export ersetzt kein Backup deiner Datenbank.',
  downloadEyebrow: 'Android & iOS',
  downloadTitle: 'Dein nächster Auftrag wartet.',
  downloadComingSoon: 'Fragen oder Interesse? Schreib mir: info@offlinehandwerk.de',
  downloadBody:
    'Die Store-Veröffentlichung wird vorbereitet. Sobald die App verfügbar ist, findest du hier die direkten Download-Links.',
  googlePlay: 'Google Play',
  appStore: 'App Store',
  storePending: 'Noch nicht verfügbar · Platzhalter',
  downloadNote: 'Keine aktiven Store-Links und keine QR-Codes mit Platzhalter-Zielen.',
  footerClaim: 'Hier zählt dein Handwerk, deine Preise und deine Daten.',
  footerLegal: 'Rechtliches',
  privacy: 'Datenschutz',
  imprint: 'Impressum',
  terms: 'AGB',
  contact: 'Kontakt',
  footerBefore: 'Mit ❤️ in',
  footerAfter: 'hergestellt',
  footerFlag: 'Deutschland',
  manualTitle: 'Anleitung',
  manualLead: 'OfflineHandwerk läuft auf deinem Gerät. Deine Arbeitsdaten bleiben dort.',
  manualSections: [
    {
      title: 'Erste Schritte',
      steps: [
        'Beim ersten Start erklärt die App, dass deine Daten lokal bleiben und dass sie deine Arbeit nicht auswertet. Die Paketübersicht kannst du überspringen.',
        'Hinterlege den Firmennamen unter Stammdaten, Firma. Ohne Firmennamen lässt sich kein PDF exportieren.',
        'Über die Startseite erreichst du Stammdaten, Kalkulationen und Einstellungen.',
      ],
    },
    {
      title: 'Kunden, Materialien und Leistungen',
      steps: [
        'Unter Stammdaten pflegst du Kunden sowie Bausteine für Material, Leistungen, Mitarbeiter, Steuersätze und Zuschläge.',
        'Beim Kunden ist der Name oder die Firma erforderlich. Alle weiteren Angaben sind optional.',
        'Ohne Premium gelten die Grenzen der Produktseite: bis zu 5 Kunden, 5 Mitarbeiter, 25 Materialien, 25 Leistungen, 3 Steuersätze und 3 Zuschläge. Archivierte Kunden und Kalkulationen zählen mit. Bestehende Einträge bleiben bearbeitbar.',
      ],
    },
    {
      title: 'Kalkulation erstellen',
      steps: [
        'Tippe auf „Jetzt kalkulieren“ unter Kalkulationen, oder starte direkt bei einem Kunden.',
        'Wähle einen Kunden oder erfasse einen neuen. Ergänze Leistungen, Material, Mitarbeiter, Zuschläge, Rabatt und Steuern.',
        'Prüfe Netto, Steuer und Gesamtsumme und speichere die Kalkulation.',
        'Gespeicherte Kalkulationen kannst du suchen, bearbeiten und archivieren. Ohne Premium sind es bis zu 5, einschließlich archivierter.',
      ],
    },
    {
      title: 'PDF exportieren und teilen',
      steps: [
        'Öffne „PDF Kunde“ in der Kalkulation und prüfe die Vorschau. In Free trägt sie ein Wasserzeichen.',
        'Mit Premium exportierst du ohne Wasserzeichen, setzt ein eigenes Logo, nutzt Positionsvorlagen und kannst ein internes PDF erstellen oder an das Büro senden.',
        'Teilen, Drucken oder E-Mail übergibt die Datei an das Programm, das du auswählst. Wir erhalten sie nicht.',
      ],
    },
    {
      title: 'Backup und Wiederherstellung',
      steps: [
        'Backup und Wiederherstellung ist in Premium enthalten. Ohne diese Funktion kannst du keine vollständige lokale Datenbanksicherung erstellen. Ein PDF-Export ersetzt kein Backup.',
        'Der Export erzeugt eine unverschlüsselte JSON-Datei. Im Teilen-Menü wählst du den Speicherort. Wir laden die Datei nicht hoch.',
        'Beim Import kannst du zusammenführen oder die lokalen Daten ersetzen. Ersetzen löscht die aktuellen lokalen Kalkulationen, Bausteine und Einstellungen und fragt vorher nach.',
        'Geht das Gerät verloren oder löschst du die App-Daten, können wir sie nicht wiederherstellen.',
      ],
    },
    {
      title: 'Premium freischalten',
      steps: [
        'Premium hebt die Free-Grenzen auf und schaltet die PDF- und Sicherungsfunktionen frei, die oben genannt sind.',
        'Auf der Produktseite stehen 9,99 € / Monat und 109,99 € / Jahr (1 Monat gratis).',
        'Der Kauf läuft in der App über den Apple App Store oder Google Play, nicht auf dieser Website. „Premium ansehen“ öffnet die Pakete. Abrechnung und Kündigung liegen beim Store.',
        'Apple oder Google verarbeiten die Zahlung. Zur Freischaltung verarbeitet RevenueCat eine pseudonyme Kennung und Kaufdaten, nicht deine Kalkulationen oder Kundendaten.',
      ],
    },
  ],
  notFoundTitle: 'Diese Seite gibt es nicht.',
  notFoundBody: 'Wähle die deutsche oder englische Produktseite.',
} as const;

export type Dictionary = Widen<typeof de>;
