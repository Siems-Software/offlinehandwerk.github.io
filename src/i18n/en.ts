import type { Dictionary } from './de';

export const en = {
  language: 'English',
  metaTitle: 'OfflineHandwerk – Your craft. Your prices. Your data.',
  metaDescription:
    'Job calculations for your trade business. Locally stored data, clear pricing and PDFs for customers. No advertising or tracking of your work.',
  skip: 'Skip to content',
  navLabel: 'Main navigation',
  navConcept: 'Concept',
  navFeatures: 'Features',
  navPlans: 'Plans',
  navManual: 'Manual',
  navDownload: 'Get the app',
  switchLabel: 'Language: English – switch to German',
  themeToggle: 'Toggle light/dark',
  heroEyebrow: 'For your next job',
  heroTitle: 'Your craft.',
  heroAccent: 'Your prices.',
  heroEnd: 'Your data.',
  heroBody:
    'Calculate labour and materials. Create a PDF for your customers. And keep your business data where it belongs: with you.',
  screenshotAlt:
    'OfflineHandwerk: home screen with master data, calculations and settings in the dark theme',
  screenshotSecondAlt:
    'OfflineHandwerk calculation list with the built-in bathroom renovation example for sample customer Musterkunde',
  conceptEyebrow: 'Local First',
  conceptTitle: 'Your business. Not our database.',
  conceptBody:
    'Calculations, customer records, business details and your logo stay locally on your device. We do not receive these contents or store them on our servers.',
  conceptItems: [
    {
      title: 'Work locally',
      body: "Your records live in the application's local database. Your work is not uploaded to OfflineHandwerk.",
    },
    {
      title: 'No advertising',
      body: 'No ad banners, no analysis of your work, no usage profiles. Focus on the job in front of you.',
    },
    {
      title: 'You stay responsible',
      body: 'If your device is lost or local app data is deleted, we cannot recover it. Back up your data and keep your own exports safe.',
    },
  ],
  featuresEyebrow: 'From job to PDF',
  featuresTitle: 'Fewer detours. A clearer picture.',
  featureSteps: [
    {
      title: 'Keep building blocks ready',
      body: 'Manage customers, employees, materials and services. Set your prices, tax rates and surcharges.',
    },
    {
      title: 'Calculate clearly',
      body: 'Put together labour and materials for your job. Keep track of the net amount, tax and total.',
    },
    {
      title: 'Share the result',
      body: "Preview the customer PDF. With Premium, export without a watermark and share, email or print the file using your device's features.",
    },
  ],
  plansEyebrow: 'Free & Premium',
  plansTitle: 'Start small. Expand when it fits.',
  plansBody:
    'Free to get started. Premium for everyday use. Your contents stay local with every plan.',
  freeName: 'Free',
  premiumName: 'Premium',
  freePrice: 'Free of charge',
  freeDescription: 'The essentials to try it out.',
  premiumDescription: 'Premium for your calculations and PDFs, plus backup and restore.',
  premiumMonthly: '€9.99 / month',
  premiumYearly: '€109.99 / year (1 month free)',
  tableCaption: 'Mobile app features and limits compared',
  tableFeature: 'Feature',
  included: 'Included',
  notIncluded: 'Not included',
  unlimited: 'Unlimited',
  limited: 'Up to {count}',
  features: {
    calculations: 'Saved calculations',
    customers: 'Customers',
    employees: 'Employees',
    materials: 'Materials',
    services: 'Services',
    taxes: 'Tax rates',
    surcharges: 'Surcharges',
    canPreviewPdf: 'Preview customer PDF',
    canExportWithoutWatermark: 'Export PDF without watermark',
    canUseLogo: 'Your logo in the PDF',
    canUseTemplates: 'Reusable line-item templates',
    canCreateInternalPdf: 'Internal PDF',
    canSendOfficeEmail: 'Send PDF to the office',
    canBackupRestore: 'Backup & restore',
  },
  footnoteUnlimited: '*1 ∞ = Unlimited',
  footnoteBackup:
    '*2 Without the backup feature you cannot create a full local database backup in the app. A PDF export does not replace a backup of your database.',
  downloadEyebrow: 'Android & iOS',
  downloadTitle: 'Your next job is waiting.',
  downloadComingSoon: 'Questions or interested? Email me: info@offlinehandwerk.de',
  downloadBody:
    'The store release is being prepared. Direct download links will appear here once the app is available.',
  googlePlay: 'Google Play',
  appStore: 'App Store',
  storePending: 'Not yet available · Placeholder',
  downloadNote: 'No active store links or QR codes with placeholder destinations.',
  footerClaim: 'Your craft, your prices and your data come first.',
  footerLegal: 'Legal',
  privacy: 'Privacy',
  imprint: 'Imprint',
  terms: 'Terms',
  contact: 'Contact',
  footerBefore: 'Made with ❤️ in',
  footerAfter: '',
  footerFlag: 'Germany',
  manualTitle: 'Manual',
  manualLead: 'OfflineHandwerk runs on your device. Your work data stays there.',
  manualSections: [
    {
      title: 'First steps',
      steps: [
        'On first launch the app explains that your data stays local and that it does not track your work. You can skip the plan overview.',
        'Add your business name under Business details, Company. A PDF cannot be exported without a business name.',
        'The home screen opens Business details, Calculations and Settings.',
      ],
    },
    {
      title: 'Customers, materials and services',
      steps: [
        'Under Business details you keep customers and reusable blocks for materials, services, employees, tax rates and surcharges.',
        'A customer needs a name or company. Every other field is optional.',
        'Without Premium the limits on the product page apply: up to 5 customers, 5 employees, 25 materials, 25 services, 3 tax rates and 3 surcharges. Archived customers and calculations count. Existing entries stay editable.',
      ],
    },
    {
      title: 'Create a calculation',
      steps: [
        'Choose Calculate a job under Calculations, or start from a customer.',
        'Select a customer or enter a new one. Add services, materials, employees, surcharges, a discount and taxes.',
        'Check the net amount, tax and total, then save the calculation.',
        'You can search, edit and archive saved calculations. Without Premium you can keep up to 5, including archived ones.',
      ],
    },
    {
      title: 'Export and share a PDF',
      steps: [
        'Open Customer PDF in the calculation and check the preview. On Free it carries a watermark.',
        'With Premium you export without a watermark, add your own logo, use reusable line-item templates, and can create an internal PDF or send it to the office.',
        'Share, print or email hands the file to the app you choose. We do not receive it.',
      ],
    },
    {
      title: 'Backup and restore',
      steps: [
        'Backup and restore is included in Premium. Without it you cannot create a full local database backup. A PDF export does not replace a backup.',
        'Export creates an unencrypted JSON file. Choose where to keep it in the share sheet. We do not upload the file.',
        'On import you can merge or replace local data. Replace deletes the current local calculations, blocks and settings, and asks first.',
        'If the device is lost or you delete the app data, we cannot restore it.',
      ],
    },
    {
      title: 'Unlock Premium',
      steps: [
        'Premium removes the Free limits and unlocks the PDF and backup features named above.',
        'The product page lists €9.99 / month and €109.99 / year (1 month free).',
        'You buy it in the app through the Apple App Store or Google Play, not on this website. Explore Premium opens the plans. The store bills you and handles cancellation.',
        'Apple or Google process the payment. To unlock the purchase, RevenueCat processes a pseudonymous identifier and purchase data, not your calculations or customer records.',
      ],
    },
  ],
  notFoundTitle: 'This page does not exist.',
  notFoundBody: 'Choose the German or English product page.',
} satisfies Dictionary;
