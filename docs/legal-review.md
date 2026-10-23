# Legal publication review

Status: **release checklist, not a legal opinion**. The public imprint and privacy pages were revised in October 2026 and no longer show a draft banner. German remains authoritative. Unchecked items below are still open.

## Scope and evidence

`src/content/legal.mjs` supplies German and English app privacy, marketing-website privacy and provider information. It exports `legal` with the agreed string-only content shape. No renderer, hosting configuration, deployment or store listing is changed by this content audit. The surrounding implementation is validated separately below.

The source inspection was read-only, using `git show origin/main:<path>` in `C:/Users/Jsiem/Documents/Siems-Software/OfflineHandwerk`. The parent task identifies its freshly fetched baseline as `ed9ef522e2701b2b38dad901e962a5064e26fb7b`. Inspected sources:

- `packages/handwerkoffline/src/privacy.ts`: runtime platform/access-adapter split.
- `packages/handwerkoffline/src/legal.ts`: Jan Siems, Hintergasse 28, 67308 Bubenheim, info@offlinehandwerk.de.
- `packages/localization/src/locales/de.json` and `en.json`: legal and support strings.
- `packages/handwerkoffline/docs/privacy.md`: expressly incomplete draft, variant A licensing, processing boundaries and unresolved provider facts.
- `packages/handwerkoffline/docs/imprint.md`: owner-confirmed provider information and previously reported absence of other applicable details.

The parent implementation retrieved the primary GitHub Pages documentation at https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages and verified its statement that visitor IP addresses are logged and stored for security purposes. This verifies that narrow disclosure, not contracts, exact retention, provider roles or production behavior. No exact GitHub legal entity/address, retention period, controller/processor classification or transfer mechanism is asserted. In particular, the proposed GitHub, Inc. street address is deliberately omitted until supported by a primary source and applicability to this service is established.

The app sources describe a separate web-local app with SQLite/OPFS and a different hosting context. Those facts do not describe this marketing website. The website privacy text must not be reused as a web-app policy, and the mobile policy must not be reused for a future server-backed target.

## Blocking gates before public release

The operational/provider and legal gates below remain unresolved unless explicitly marked. Local rendering checks are recorded in `docs/validation.md`; they do not verify production hosting. Close a gate only when evidence has been recorded, any necessary operational changes completed, and both language versions updated consistently. A warning about missing facts does not itself make publication lawful or authorize release. Keep production launch and use as a final store privacy notice blocked pending approval.

### 1. GitHub Pages provider and processing

- [ ] Identify the actual GitHub Pages contracting/service provider and its legal address from primary documents applicable to this account/service. Record the document URL, relevant passage, version/date and reviewer. Do not infer the entity from a generic US address or corporate contact page alone.
- [ ] Verify and record the primary GitHub Pages statement about visitor IP-address logging for security. Confirm which other connection/log fields are processed, for what purposes, and what is known or explicitly undisclosed. Do not present possible User-Agent/referrer fields as proven stored fields.
- [ ] Establish GitHub's role for each relevant purpose: delivery on the operator's behalf, security, and any independent processing. Determine whether Article 28 GDPR applies and whether an applicable processing agreement exists. Do not state either that GitHub is necessarily a processor or that no agreement is required without that assessment.
- [ ] Establish actual processing/storage locations, recipients and any relevant subprocessors. Determine international transfer applicability and the current, applicable Article 44 et seq. safeguards. If relying on SCCs or another mechanism, verify applicability and required supplementary measures; do not assume EU-only hosting or DPF certification.
- [ ] Obtain a documented log deletion period or concrete retention criteria applicable to GitHub Pages security and connection data. If GitHub does not disclose them, escalate the resulting information gap for legal assessment; do not invent a period or borrow retention from unrelated GitHub products.
- [ ] Review the proposed Article 6(1)(f) basis for the operator's hosting purpose, document the legitimate interest and balancing assessment, and distinguish any independent GitHub purposes/bases. Incorporate the reviewed result in German and English.

### 2. Mailbox and support processing — website and app

- [ ] Identify the provider operating `info@offlinehandwerk.de`, its legal entity/address, role, hosting/storage locations, relevant subprocessors and any applicable Article 28 agreement.
- [ ] Assess mailbox international transfers and establish applicable safeguards and how information/copies can actually be supplied to data subjects.
- [ ] Confirm received support data, any attachments, access permissions, backups and technical mail metadata. Verify that the app's draft includes app version, build, OS, device model, plan and description, but no automatic customer/calculation attachment or store identifier. Separately verify that a website mail link adds no app/device data and sends nothing automatically.
- [ ] Adopt a concrete post-resolution deletion period or defined, operational retention criteria for correspondence, mailbox copies/backups and any retained support attachments. Identify genuinely applicable statutory exceptions with their durations/criteria. Local database deletion must not be used as the support retention rule.
- [ ] Review Article 6(1)(b) for necessary contract-related requests and Article 6(1)(f) for other requests. Document necessity and legitimate interests where applicable. Do not treat sending an email as automatic GDPR consent.

### 3. Production mobile licensing and purchase providers

- [ ] Confirm production Android/iOS configurations and that RevenueCat is only active with the mobile store adapter, not on the marketing website or a web-local/no-store runtime.
- [ ] Verify variant A in actual SDK configuration and flows: no operator/email sign-in, no login counter, no email-to-license server mapping, no custom App User ID or email attribute, no usage/advertising profiles, and no calculation/customer/business contents sent to RevenueCat. Use purchase, restoration, startup and Free-user checks; a source string alone does not validate runtime processing.
- [ ] Establish the specific Apple/Google recipients, their roles and applicable store privacy terms for production distribution. Assess purchase-provider purposes and legal bases separately from license delivery.
- [ ] Confirm all RevenueCat SDK data categories, required technical data, destinations, processing locations and relevant SDK/device storage or access. Keep the App User ID described as pseudonymous, not legally guaranteed anonymous.
- [ ] Confirm the RevenueCat agreement actually in force for this account, including the DPA, Article 28 applicability, scope and current subprocessor list. A published DPA alone is not evidence that it is effectively agreed for the account.
- [ ] Verify the applicable SCC provisions for relevant restricted transfers, any necessary transfer assessment/supplementary measures and a real process for providing safeguard information/copies. Do not substitute an unverified EU-US Data Privacy Framework claim.
- **RevenueCat DPF registry check (2026-10-23):** Searched `RevenueCat` on the official [Data Privacy Framework participant list](https://www.dataprivacyframework.gov/list) in both Active Participants and Inactive Participants. Both searches returned “Query returned no results.” No RevenueCat listing or DPF certification was verified; the DPF clause is therefore omitted from the website notice. This search does not rule out a listing under another legal name. RevenueCat's [Data Processing Addendum](https://www.revenuecat.com/dpa/) (effective August 2026; checked 2026-10-23) makes the EU Standard Contractual Clauses available for restricted transfers but makes no DPF-certification claim. Whether the DPA is in force for this account remains unconfirmed.
- [ ] Adopt a concrete RevenueCat end-user purchase/entitlement retention and deletion rule, including restoration needs, account/identifier deletion, retained backups and applicable statutory exceptions. Do not copy retention for RevenueCat's own marketing or customer contacts.
- [ ] Review Article 6(1)(b) only to the extent license processing is necessary to deliver purchased features; separately identify any other processing purposes and applicable bases. Verify and explain which features cannot be unlocked without necessary processing.
- [ ] Complete the independent section 25 TDDDG assessment for local device storage and SDK access. If relying on section 25(2)(2), establish strict necessity for the explicitly requested service; Local First and contract necessity under GDPR are not substitutes for this test.

### 4. Local app data and historical services

- [ ] Verify the current local-only content boundary, absence of automatic analytics/crash reporting/synchronization, local PDF generation, user-directed sharing and backup behavior against the release build.
- [ ] Verify deletion descriptions on Android/iOS: archiving is not erasure; reset/uninstallation affects local records, not recipient copies, device backups, support correspondence or store/RevenueCat records. Confirm the export's unencrypted JSON format and user-facing safety wording.
- [ ] Determine whether historical records remain in the former server-backed Service. If they exist, identify the responsible processing, recipients, legal bases, retention/deletion duties and required data-subject information. Removing a code path or resetting the current local app proves no historical server deletion.
- [ ] Keep the statement that the operator is neither controller nor processor strictly limited to inaccessible local customer/employee records entered by the user's business. Review the responsibility split without extending it to support, licensing or website hosting.

### 5. Provider information and legal review

- [ ] Reconfirm owner identity/address/email against the current business and production store/provider accounts. Verify reachability of the contact address.
- [ ] Reassess section 5 DDG for this marketing website. Confirm whether register details, VAT/business identification numbers, supervisory/professional information or another means of direct contact are applicable. The earlier owner confirmation is evidence, not a new legal determination of sufficiency.
- [ ] Determine whether additional website-specific provider duties apply, including any relevant editorial responsibility under section 18 MStV and consumer dispute-resolution disclosures. Include only applicable obligations, not invented numbers, regulator details or obsolete platform links.
- [x] The privacy notice states that no data protection officer is appointed because there is no statutory duty to appoint one (§ 38 BDSG).
- [ ] Have a qualified reviewer check completeness and clarity under Articles 12 and 13 GDPR for each actual purpose: controller, purposes, legal bases/interests, recipients, transfers/safeguards, retention, rights/complaint route, required provision/consequences and any automated decisions. Review the named Rhineland-Palatinate complaint route and rights wording.
- [ ] Obtain explicit legal signoff for app privacy, website privacy and imprint. Review and approve the German-authoritative designation and the complete English translation. Record approver, date, reviewed revision, any conditions and actual publication authorization. Neither content generation nor technical tests provide legal validity.

### 6. Rendering, deployment and public disclosures

- [x] Render the German-authoritative note and the October 2026 date on each German and English legal page. The former draft banner is no longer rendered. Visibility of the earlier banner was checked on the production export in an isolated Mullvad Browser.
- [x] Verify complete German and English rendering, headings and paragraphs, correct language attributes, readable mobile layout, navigation links and the distinction between mobile app and website privacy. There must be no German-only body text in the English legal pages.
- [ ] Inspect the final GitHub Pages build and real production requests in the required Mullvad Browser: no cookies/localStorage/app database, tracking/analytics/crash services, externally embedded fonts/CDNs/media, contact form/newsletter, RevenueCat, prefetch or unsolicited requests to linked store sites. Verify hosting responses and any third-party redirect/domain configuration too. Amend the content and legal assessment if reality differs from the intended static design.
- [ ] Verify the actual public HTTPS app privacy, website privacy, imprint and contact links in both languages after an explicitly authorized deployment. No public URL is established by creating these files.
- [ ] Update app-bundled legal copies, Android/iOS store privacy URLs and store data disclosures consistently with approved processing after separate release authorization. Do not use marketing-website privacy as the mobile store policy or describe source/build validation as successful store publication.

## Primary sources to verify, not independently fetched here

These URLs identify review targets. They are not evidence of current account agreement or of production behavior:

- GitHub Pages overview and privacy information: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub general privacy statement: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- RevenueCat DPA: https://www.revenuecat.com/dpa
- RevenueCat identifiers: https://www.revenuecat.com/docs/customers/identifying-customers
- RevenueCat purchase and restore flows: https://www.revenuecat.com/docs/getting-started/making-purchases and https://www.revenuecat.com/docs/getting-started/restoring-purchases
- RevenueCat Google Play disclosures: https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety
- RevenueCat privacy policy: https://www.revenuecat.com/privacy-policy
- GDPR: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Section 25 TDDDG: https://www.gesetze-im-internet.de/ttdsg/__25.html
- Section 5 DDG: https://www.gesetze-im-internet.de/ddg/__5.html

## Handoff limits

The content audit did not change the source app, production SDK/account configuration or store listings. The bilingual text is a structured draft, not a publication-ready legal policy. Local website rendering and technical verification are covered separately in `validation.md`; production behavior, provider agreements, retention rules, legal signoff and public release remain pending.
