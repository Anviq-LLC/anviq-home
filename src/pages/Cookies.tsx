import { DocumentPage } from '@/components/DocumentPage'

export function Cookies() {
  return (
    <DocumentPage title="Cookie Policy">
      <p className="legal-updated">Last updated: 13 November 2026</p>
      <div className="legal-copy">
      <p>
        Cookies are small files a website can store on your device. This page explains what this website
        (anviq.net) does, which is very little.
      </p>

      <h2>1. Does this Site use cookies?</h2>
      <p>
        <strong>This Site sets no cookies at all, and it does not track you across other sites.</strong> Because
        we set no cookies, there is no cookie banner to click. The Site does keep a few small notes in your
        browser's storage, which are not cookies. They are listed in section 3.
      </p>

      <h2>2. Third-party requests</h2>
      <p>
        The Site loads its fonts, icons, images, emoji, and code from itself. A few features contact other
        services, listed below. None of them is used for advertising.
      </p>
      <table className="legal-table mb-4 w-full border-collapse text-[14px]">
        <thead>
          <tr>
            <th className="border border-ash bg-chalk p-3 text-left font-semibold text-black">Provider</th>
            <th className="border border-ash bg-chalk p-3 text-left font-semibold text-black">Why it loads</th>
            <th className="border border-ash bg-chalk p-3 text-left font-semibold text-black">What it can involve</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Provider" className="border border-ash p-3 align-top">Hosting / CDN</td>
            <td data-label="Why it loads" className="border border-ash p-3 align-top">Serving and securing the Site</td>
            <td data-label="What it can involve" className="border border-ash p-3 align-top">
              Standard server logs and, in some cases, an essential security cookie set by the provider.
            </td>
          </tr>
          <tr>
            <td data-label="Provider" className="border border-ash p-3 align-top">Cloudflare Workers AI</td>
            <td data-label="Why it loads" className="border border-ash p-3 align-top">Matching a question you type into Sherlock to one of our written answers</td>
            <td data-label="What it can involve" className="border border-ash p-3 align-top">
              Only when the question is not matched in your browser. The question text is processed to rank our own
              answers. We do not store it.
            </td>
          </tr>
          <tr>
            <td data-label="Provider" className="border border-ash p-3 align-top">GitHub (api.github.com) and a contributions service (github-contributions-api.jogruber.de)</td>
            <td data-label="Why it loads" className="border border-ash p-3 align-top">Showing public activity on the Public activity page</td>
            <td data-label="What it can involve" className="border border-ash p-3 align-top">
              Only if you open that page, including repository owner pictures from github.com and avatars.githubusercontent.com. Your IP address and browser details reach those services.
            </td>
          </tr>
        </tbody>
      </table>
      <p>We run no analytics and no advertising cookies of any kind on this Site.</p>

      <h2>3. Notes kept in your browser</h2>
      <p>
        Sherlock, the guide on this Site, keeps a few small notes in your browser's local and session storage. They
        are not cookies, they stay on your device, and they are not sent to us.
      </p>
      <ul>
        <li>
          <strong>Guide notes (local storage):</strong> which pages you have visited, which tips you have already
          seen, and when you last visited, so Sherlock can offer to continue where you left off and not repeat itself.
        </li>
        <li>
          <strong>Question history (local storage):</strong> up to your last 50 questions typed to Sherlock.
        </li>
        <li>
          <strong>Visit notes (session storage):</strong> your page trail for this visit and whether Sherlock has
          already made a suggestion. These are cleared when you close the tab.
        </li>
      </ul>
      <p>You can clear all of them at any time by clearing your site data in your browser settings.</p>

      <h2>4. How to control cookies</h2>
      <p>
        You can block or delete cookies through your browser settings, and most browsers let you refuse
        third-party cookies. Doing so will not break this Site. For help, see your browser's documentation or{' '}
        <a href="https://www.aboutcookies.org" target="_blank" rel="noopener">
          aboutcookies.org
        </a>
        .
      </p>

      <h2>5. Changes</h2>
      <p>We will update this page if our use of cookies changes. The date at the top shows the latest version.</p>

      <h2>6. Contact</h2>
      <p>
        Questions about cookies: <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>. Anviq LLC,
        30 N Gould St 69062, Sheridan, WY 82801, USA. See also our{' '}
        <a href="/explore/privacy">Privacy Policy</a>.
      </p>
      </div>
    </DocumentPage>
  )
}
