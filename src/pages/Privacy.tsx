import { DocumentPage } from '@/components/DocumentPage'

export function Privacy() {
  return (
    <DocumentPage title="Privacy Policy">
      <p className="legal-updated">Last updated: 13 November 2026</p>
      <div className="legal-copy">
      <p>
        This Privacy Policy explains how we handle personal data in connection with this website (the
        "Site") at anviq.net. It covers the marketing website only. Any client engagement is governed by
        a separate agreement and data processing terms provided directly to that client.
      </p>
      <p>
        We have written this to be clear and honest about a small business website. If you have any question,
        contact us at <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>.
      </p>

      <h2>1. Who we are (the data controller)</h2>
      <p>The controller responsible for your personal data in relation to the Site is:</p>
      <ul>
        <li>
          <strong>Anviq LLC</strong>
        </li>
        <li>
          Email: <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>
        </li>
        <li>30 N Gould St 69062, Sheridan, WY 82801, USA</li>
      </ul>

      <h2>2. What this Site does and does not collect</h2>
      <p>
        This is an informational website. We have kept data collection to the minimum. We do not run
        advertising trackers, and we do not build profiles of visitors.
      </p>
      <h3>Information you choose to give us</h3>
      <ul>
        <li>
          <strong>When you email us</strong> (for example, by clicking an email link to start a conversation): your
          email address, your name if you provide it, and whatever you write to us.
        </li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Server and security logs.</strong> Our hosting and content delivery provider automatically
          processes limited technical data such as your IP address, browser type, referring page, and the date and
          time of your request. This is standard for any website and is used to deliver the pages and keep the Site
          secure.
        </li>
      </ul>
      <h3>Sherlock, the guide on this Site</h3>
      <p>
        Sherlock answers questions from text that we wrote. Most of what it does happens in your browser and sends
        nothing: the quick answers, the fit check, and the Show me spotlight. Two things are different:
      </p>
      <ul>
        <li>
          <strong>Questions you type that Sherlock cannot match.</strong> If you type a question of three or more
          words and it matches none of our written answers, the text of your question (up to 280 characters) is sent
          to our server. The server asks Cloudflare Workers AI, a service run by our hosting provider Cloudflare, to
          rank which of our written answers is closest. The model only ranks our own answers. It does not write the
          reply you see. We do not log or store your question. Cloudflare processes it as our service provider under
          its own terms. Please do not type personal or confidential information into this box.
        </li>
        <li>
          <strong>Email my answers.</strong> This opens your own email app with a message already written. Nothing is
          sent to us until you press send in your email app.
        </li>
      </ul>
      <p>
        Sherlock also keeps a few small notes in your browser so it can offer to continue where you left off. They
        stay on your device and are not sent to us. See our <a href="/explore/cookies">Cookie Policy</a> for the list.
      </p>
      <h3>Pages that contact other services</h3>
      <ul>
        <li>
          <strong>Public activity page.</strong> When you open it, your browser requests our public GitHub activity
          from GitHub (api.github.com) and from a third-party contributions service
          (github-contributions-api.jogruber.de), and loads repository owner pictures from github.com and avatars.githubusercontent.com. Those services
          receive your IP address and browser details, as any website you visit would.
        </li>
        <li>
          <strong>Emoji reactions.</strong> The emoji images are served from this Site. A reaction is shown on your own
          screen only. It is not sent to us or stored.
        </li>
      </ul>
      <p>
        The Site uses your device's built-in system fonts and loads no fonts, scripts, or other resources from
        Google or any other third-party font provider.
      </p>
      <p>We set no cookies and run no analytics on this Site. See our <a href="/explore/cookies">Cookie Policy</a> for detail.</p>

      <h2>3. Why we use your data, and our legal bases (UK and EU GDPR)</h2>
      <ul>
        <li>
          <strong>To respond to your enquiry.</strong> Legal basis: taking steps at your request before entering
          into a contract, and our legitimate interest in responding to business enquiries.
        </li>
        <li>
          <strong>To operate, secure, and maintain the Site.</strong> Legal basis: our legitimate interest in
          running a safe, functioning website.
        </li>
        <li>
          <strong>To comply with legal obligations</strong> where they apply. Legal basis: compliance with a legal
          obligation.
        </li>
      </ul>
      <p>
        We do not currently rely on consent for anything, because the Site sets no cookies. If we ever add a
        technology that needs consent, we will ask for it first.
      </p>

      <h2>4. Who we share data with</h2>
      <p>
        We do not sell your personal data. We share it only with service providers who help us run the Site and
        respond to you, acting as our processors or independent controllers:
      </p>
      <ul>
        <li>
          <strong>Hosting / CDN:</strong> serving the Site and security logging.
        </li>
        <li>
          <strong>Cloudflare Workers AI:</strong> ranking our written answers against a question you type into
          Sherlock, only when the question is not matched locally.
        </li>
        <li>
          <strong>GitHub and a GitHub contributions service:</strong> supplying the public activity shown on the
          Public activity page, only if you open it.
        </li>
        <li>
          <strong>Email</strong> (our email provider): receiving and replying to your messages.
        </li>
      </ul>
      <p>We may also disclose data if required by law, or to establish, exercise, or defend legal claims.</p>

      <h2>5. International data transfers</h2>
      <p>
        Some of the providers above may process data outside the UK and EEA. Where personal data is transferred
        internationally, we rely on appropriate safeguards such as the UK and EU Standard Contractual Clauses and,
        where applicable, the EU-US and UK-US Data Privacy Framework. You can ask us for more detail using the
        contact details above.
      </p>

      <h2>6. How long we keep your data</h2>
      <p>
        We keep enquiry correspondence only as long as needed to deal with your request and for a reasonable period
        afterwards for our records and to comply with legal obligations, then we delete it. Server and security logs
        are kept for a short period by our hosting provider according to its policies. We do not keep the questions
        you type to Sherlock. The notes Sherlock keeps in your browser stay there until you clear your site data.
      </p>

      <h2>7. Your rights (UK and EU)</h2>
      <p>If you are in the UK or EEA, you have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>ask us to correct inaccurate data;</li>
        <li>ask us to erase your data;</li>
        <li>restrict or object to our processing;</li>
        <li>data portability;</li>
        <li>withdraw consent at any time, where we rely on consent.</li>
      </ul>
      <p>
        To exercise any of these, email <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>. You also have the
        right to complain to your data protection authority. In the UK that is the Information Commissioner's
        Office (<a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>); in the EU it is the
        supervisory authority in your country.
      </p>

      <h2>8. Your rights (United States)</h2>
      <p>
        Depending on your state of residence, you may have the right to know what personal information we collect,
        to access or delete it, to correct it, and to opt out of its "sale" or "sharing" for
        targeted advertising.
      </p>
      <p>
        <strong>We do not sell or share your personal information,</strong> and we do not use it for cross-context
        behavioural advertising. The categories of personal information we may collect are identifiers (such as
        name, email, and IP address) and internet activity (such as basic server log data), as described above. We
        will not discriminate against you for exercising any of these rights. To make a request, email{' '}
        <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>; we may need to verify your identity before responding.
      </p>

      <h2>9. Children</h2>
      <p>
        This Site is aimed at businesses and is not directed to children. We do not knowingly collect personal data
        from anyone under 18.
      </p>

      <h2>10. Security</h2>
      <p>
        We use a reputable hosting provider and serve the Site over HTTPS. No website can be guaranteed perfectly
        secure, but we take reasonable measures to protect the limited data the Site handles.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The "last updated" date at the top shows when it
        last changed. Material changes will be reflected here.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions or requests about privacy: <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>.
      </p>
      </div>
    </DocumentPage>
  )
}
