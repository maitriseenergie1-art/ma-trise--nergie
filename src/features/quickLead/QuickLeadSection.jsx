import { Container, Section } from '../../components/ui';
import { QuickLeadForm } from './QuickLeadForm';

// Full-width band embedding a contextual quick form. Drop it on any page.
export function QuickLeadSection({ variant = 'generic', context = {}, heading, text, tone = 'muted', aside }) {
  return (
    <Section className="quick-lead-section" tone={tone}>
      <Container>
        <div className="quick-lead-grid">
          <div className="quick-lead-aside">
            {aside || (
              <>
                <h2>Un projet, une question, un doute&nbsp;?</h2>
                <p>
                  Quelques informations suffisent pour lancer l’échange. Réponse rapide, sans engagement,
                  et vos données restent confidentielles.
                </p>
              </>
            )}
          </div>
          <QuickLeadForm variant={variant} context={context} heading={heading} text={text} />
        </div>
      </Container>
    </Section>
  );
}
