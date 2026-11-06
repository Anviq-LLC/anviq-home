import { DocumentPage } from '@/components/DocumentPage'

export function Terms() {
  return (
    <DocumentPage title="Terms & Disclaimer">
      <p className="legal-updated">Last updated: 29 October 2026</p>
      <div className="legal-copy">
      <p>
        These terms apply to your use of this website (the "Site") at anviq.net. By using the Site you
        agree to them. If you do not agree, please do not use the Site. The Site is operated by{' '}
        <strong>Anviq LLC</strong> ("Anviq", "we", "us").
      </p>

      <h2>1. What this Site is</h2>
      <p>
        The Site is an informational and marketing website describing Anviq, an IT consulting and
        software company. It is not a product or a client deliverable. Any engagement is provided separately
        under a written agreement.
      </p>

      <h2>2. No guaranteed outcome</h2>
      <div className="my-5 rounded-lg border border-[var(--line)] bg-[var(--sidebar)] p-5">
        <p className="m-0">
          <strong>
            Nothing on this Site is a guarantee, forecast, or promise of a specific result, timeline, or cost
            saving.
          </strong>{' '}
          Descriptions of past work are illustrative of the kind of engineering delivered, not a commitment that any
          future engagement will produce the same outcome. The scope, cost, and result of any engagement are set out
          in a separate written agreement.
        </p>
      </div>
      <p>Any decision to engage Anviq is made on your own responsibility and, where appropriate, with your own professional advice.</p>

      <h2>3. Selected work</h2>
      <p>
        The selected work described on the Site reflects products built and, in some cases, operated by Anviq. It
        is shown to illustrate engineering approach and does not imply an ongoing relationship, endorsement, or
        responsibility beyond what is separately agreed with each party named.
      </p>

      <h2>4. No reliance</h2>
      <p>
        We try to keep the Site accurate and up to date, but we make no warranty that it is complete, current, or
        error-free. The Site is provided "as is". You should not rely on it as the sole basis for any
        business decision; speak to us directly for current details.
      </p>

      <h2>5. Eligibility</h2>
      <p>
        The Site is intended for businesses, not consumers, and is not directed at any person in a jurisdiction
        where its content would be unlawful.
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The Site and its content, including text, design, graphics, and the Anviq name and mark, are owned by us or
        our licensors and are protected by intellectual property laws. You may view and share links to the Site, but
        you may not copy, reproduce, or reuse its content for commercial purposes without our permission.
      </p>

      <h2>7. Third-party links</h2>
      <p>
        The Site links to third-party sites, including work built for or with other parties. We are not responsible
        for the content, policies, or practices of those third parties. Visiting them is at your own risk and
        subject to their terms.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we will not be liable for any loss or damage arising from your use
        of, or inability to use, the Site, or from reliance on its content, including any indirect or consequential
        loss, loss of profit, or loss of opportunity. Nothing in these terms excludes liability that cannot be
        excluded by law, such as for death or personal injury caused by negligence, or for fraud.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The "last updated" date shows the current version.
        Continued use of the Site means you accept the updated terms.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws applicable at Anviq's place of establishment, and the courts of
        that place have non-exclusive jurisdiction, without affecting any mandatory consumer or local-law rights you
        may have.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:lvoss@anviq.net">lvoss@anviq.net</a>. Anviq LLC,
        30 N Gould St 69062, Sheridan, WY 82801, USA. See also our{' '}
        <a href="/explore/privacy">Privacy Policy</a> and <a href="/explore/cookies">Cookie Policy</a>.
      </p>
      </div>
    </DocumentPage>
  )
}
