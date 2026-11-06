import { DocumentPage } from '@/components/DocumentPage'

export function Cookies() {
  return (
    <DocumentPage title="Cookie Policy">
      <p className="legal-updated">Last updated: 29 October 2026</p>
      <div className="legal-copy">
      <p>
        Cookies are small files a website can store on your device. This page explains what this website
        (anviq.net) does, which is very little.
      </p>

      <h2>1. Does this Site use cookies?</h2>
      <p>
        <strong>This Site sets no cookies at all, and it does not track you across other sites.</strong> Because
        nothing is stored on your device, there is no cookie banner to click.
      </p>

      <h2>2. Third-party requests</h2>
      <p>
        The Site loads its fonts, icons, and code from itself, not from a third party. The one exception is the
        hosting and content delivery provider below, which does not track you for advertising.
      </p>
      <table className="mb-4 w-full border-collapse text-[14px]">
        <thead>
          <tr>
            <th className="border border-ash bg-chalk p-3 text-left font-semibold text-black">Provider</th>
            <th className="border border-ash bg-chalk p-3 text-left font-semibold text-black">Why it loads</th>
            <th className="border border-ash bg-chalk p-3 text-left font-semibold text-black">What it can involve</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-ash p-3 align-top">Hosting / CDN</td>
            <td className="border border-ash p-3 align-top">Serving and securing the Site</td>
            <td className="border border-ash p-3 align-top">
              Standard server logs and, in some cases, an essential security cookie set by the provider.
            </td>
          </tr>
        </tbody>
      </table>
      <p>We run no analytics and no advertising cookies of any kind on this Site.</p>

      <h2>3. How to control cookies</h2>
      <p>
        You can block or delete cookies through your browser settings, and most browsers let you refuse
        third-party cookies. Doing so will not break this Site. For help, see your browser's documentation or{' '}
        <a href="https://www.aboutcookies.org" target="_blank" rel="noopener">
          aboutcookies.org
        </a>
        .
      </p>

      <h2>4. Changes</h2>
      <p>We will update this page if our use of cookies changes. The date at the top shows the latest version.</p>

      <h2>5. Contact</h2>
      <p>
        Questions about cookies: <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>. Anviq LLC,
        30 N Gould St 69062, Sheridan, WY 82801, USA. See also our{' '}
        <a href="/explore/privacy">Privacy Policy</a>.
      </p>
      </div>
    </DocumentPage>
  )
}
