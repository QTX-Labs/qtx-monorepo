import * as React from 'react';
import { BriefcaseBusinessIcon, Users2Icon, ZapIcon } from 'lucide-react';

import { APP_NAME } from '@workspace/common/app';

import { GridSection } from '~/components/fragments/grid-section';
import { SiteHeading } from '~/components/fragments/site-heading';

const DATA = [
  {
    icon: <ZapIcon className="size-5 shrink-0" />,
    title: 'AI Payroll Pioneers',
    description:
      'Be part of the team automating Mexico\'s entire payroll industry with cutting-edge AI technology.'
  },
  {
    icon: <Users2Icon className="size-5 shrink-0" />,
    title: 'Work with the Best',
    description:
      'Collaborate with ex-OpenAI, Stripe, LinkedIn and CONTPAQi talent. Backed by Y Combinator.'
  },
  {
    icon: <BriefcaseBusinessIcon className="size-5 shrink-0" />,
    title: 'Equity + SF Salaries',
    description:
      'Silicon Valley competitive compensation, generous equity, and the opportunity to build Mexico\'s first AI unicorn.'
  }
];

export function CareersBenefits(): React.JSX.Element {
  return (
    <GridSection>
      <div className="space-y-20 pt-20">
        <div className="container">
          <SiteHeading
            badge="Careers"
            title="Join our team"
            description={`Work remotely from wherever you want and help us build the future of ${APP_NAME}`}
          />
        </div>
        <div className="grid divide-y border-t border-dashed md:grid-cols-3 md:divide-x md:divide-y-0">
          {DATA.map((benefit, index) => (
            <div
              key={index}
              className="border-dashed px-8 py-12"
            >
              <div className="mb-7 flex size-12 items-center justify-center rounded-2xl border bg-background shadow">
                {benefit.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </GridSection>
  );
}
