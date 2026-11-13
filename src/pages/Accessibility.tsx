import { DocumentPage } from '@/components/DocumentPage'

export function Accessibility() {
  return (
    <DocumentPage title="Accessibility statement">
      <p className="legal-updated">Last updated: 6 November 2026</p>
      <div className="legal-copy">
      <p>
        Anviq LLC wants everyone to be able to use this website (anviq.net), including people who use screen
        readers, keyboards, voice control, magnification or high contrast settings.
      </p>

      <h2>1. Standard we work to</h2>
      <p>
        We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. This is the standard behind
        EN 301 549 in Europe and the Israeli Standard 5568, and what regulators and courts in the United States, the
        United Kingdom, Canada and Australia look to under the ADA, the Equality Act 2010, the Accessible Canada Act
        and the Disability Discrimination Act 1992.
      </p>

      <h2>2. Where we are</h2>
      <p>
        We test every page with automated tools, with a keyboard alone, at 320 pixel width (the same as 400 percent
        zoom), in light and dark mode and with reduced motion switched on. We have not yet had an independent audit,
        and we do not claim full conformance. Treat this as a self-assessment.
      </p>

      <h2>3. What we built in</h2>
      <ul>
        <li>Every page works with a keyboard, with a visible focus outline and a skip link to the main content.</li>
        <li>Text meets AA contrast in light, dark and high contrast modes.</li>
        <li>Pages reflow to a single column without sideways scrolling, and text can be enlarged without losing content.</li>
        <li>Motion stops when your device is set to reduce motion. Nothing flashes, and no video or audio plays automatically.</li>
        <li>Pages have one main heading, landmarks, a distinct page title and text alternatives for images.</li>
      </ul>

      <h2>4. Known limits</h2>
      <ul>
        <li>Sherlock, the guide character, is an extra. Its second cursor and its follow-my-cursor movement can be stopped with any click or key press, and following can be turned off in its panel. Every page works without it. If it is hard to use with your assistive technology, email us and we will help another way.</li>
        <li>Screenshots show other products and may contain small text. The text next to each screenshot describes what it shows.</li>
      </ul>

      <h2>5. Tell us about a problem</h2>
      <p>
        If something on this website is hard or impossible for you to use, or you need information in another
        format, contact our accessibility coordinator, Leonardo Voss, at{' '}
        <a href="mailto:lvoss@anviq.net?subject=Accessibility%20feedback">lvoss@anviq.net</a>. Please say which page you
        were on, what you were trying to do and what assistive technology you use, if any. We aim to reply within five
        working days and to fix confirmed barriers promptly.
      </p>

      <h2>6. If you are not satisfied</h2>
      <p>
        You can also contact the body that enforces accessibility rules where you live, for example the Equality
        Advisory and Support Service or the Equality and Human Rights Commission in the UK, the national market
        surveillance authority in your EU country, or the Australian Human Rights Commission.
      </p>
      </div>
    </DocumentPage>
  )
}
