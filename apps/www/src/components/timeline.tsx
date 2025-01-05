import { formatDate } from 'date-fns';
import { motion, useScroll, useTransform } from 'framer-motion';

import React, { useEffect, useRef, useState } from 'react';

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 50%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white font-sans md:px-10 dark:bg-neutral-950"
      ref={containerRef}
    >
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 lg:px-10">
        <h2 className="mb-4 max-w-4xl text-lg text-black md:text-4xl dark:text-white">
          Changelog from my journey
        </h2>
        <p className="max-w-sm text-sm text-neutral-700 md:text-base dark:text-neutral-300">
          I&apos;ve been working on Aceternity for the past 2 years. Here&apos;s
          a timeline of my journey.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white md:left-3 dark:bg-black">
                <div className="h-4 w-4 rounded-full border border-neutral-300 bg-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800" />
              </div>
              <h3 className="hidden text-xl font-bold text-neutral-500 md:block md:pl-20 md:text-5xl dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <h3 className="mb-4 block text-left text-2xl font-bold text-neutral-500 md:hidden dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{' '}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + 'px',
          }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8 dark:via-neutral-700"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-purple-500 from-[0%] via-blue-500 via-[10%] to-transparent"
          />
        </div>
      </div>
    </div>
  );
};

const entries = [
  {
    date: '2023-08-15T09:20:00.000Z',
    title: 'Developed a Responsive Web Application for TechCorp',
    description:
      'Led the front-end team to build a responsive web app using React and Tailwind CSS. The application enhanced user engagement by 45% within the first month of launch.',
  },
  {
    date: '2023-07-10T11:15:00.000Z',
    title: 'Optimized Database Performance for GlobalBank',
    description:
      'Implemented indexing and query optimization strategies in PostgreSQL, reducing query response times by 60%. This significantly improved transaction processing efficiency.',
  },
  {
    date: '2023-06-05T14:00:00.000Z',
    title: 'Launched Mobile App for FitnessPro',
    description:
      'Developed and deployed a cross-platform mobile app using Flutter. The app reached 10,000 downloads in the first week, receiving positive feedback for its user-friendly interface.',
  },
  {
    date: '2023-05-22T16:30:00.000Z',
    title: 'Redesigned User Interface for EduLearn Platform',
    description:
      'Overhauled the UI/UX design to create a more intuitive learning experience. The redesign led to a 25% increase in user retention and won an industry award for innovation.',
  },
  {
    date: '2023-04-18T10:45:00.000Z',
    title: 'Integrated Payment Gateway for ShopEase',
    description:
      "Implemented secure payment processing using Stripe API, enabling seamless transactions. This addition boosted the company's revenue by streamlining the checkout process.",
  },
  {
    date: '2023-03-12T13:20:00.000Z',
    title: 'Automated Testing Suite for HealthTrack',
    description:
      'Developed an automated testing framework with Jest and Cypress, increasing test coverage by 80%. This ensured higher reliability and faster deployment cycles.',
  },
  {
    date: '2023-02-08T15:50:00.000Z',
    title: 'Migrated Legacy Systems to Cloud Infrastructure',
    description:
      'Led the migration of on-premise servers to AWS, enhancing scalability and reducing costs by 30%. The project minimized downtime during the transition.',
  },
  {
    date: '2023-01-05T08:25:00.000Z',
    title: 'Implemented CI/CD Pipeline for DevOpsFlow',
    description:
      'Set up a continuous integration and deployment pipeline using Jenkins and Docker. This automation accelerated the release cycle and improved code quality.',
  },
  {
    date: '2022-12-20T12:40:00.000Z',
    title: 'Enhanced Security Protocols for SecureNet',
    description:
      'Conducted security audits and implemented encryption standards, bolstering data protection. These measures reduced security incidents by 50%.',
  },
  {
    date: '2022-11-15T17:35:00.000Z',
    title: 'Developed Chatbot for Customer Support',
    description:
      'Created an AI-powered chatbot using Natural Language Processing, improving customer response time. The chatbot handled 70% of inquiries without human intervention.',
  },
  {
    date: '2022-10-10T09:10:00.000Z',
    title: 'Optimized SEO for MarketingGuru',
    description:
      'Improved website SEO through keyword optimization and backlink strategies. Organic traffic increased by 40%, leading to higher conversion rates.',
  },
  {
    date: '2022-09-05T11:55:00.000Z',
    title: 'Conducted Data Analysis for Market Trends',
    description:
      'Analyzed large datasets to identify emerging market trends, providing insights that informed strategic decisions. This resulted in a successful product launch.',
  },
  {
    date: '2022-08-01T14:45:00.000Z',
    title: 'Created Interactive Dashboard for Sales Team',
    description:
      'Developed a real-time analytics dashboard using D3.js, enhancing visibility into sales metrics. The tool improved decision-making and increased sales efficiency.',
  },
  {
    date: '2022-07-28T16:15:00.000Z',
    title: 'Led Training Workshop on Agile Methodologies',
    description:
      'Conducted a company-wide workshop on Agile and Scrum practices. This initiative improved team collaboration and project delivery timelines.',
  },
  {
    date: '2022-06-22T10:05:00.000Z',
    title: 'Deployed Machine Learning Model for Predictive Analytics',
    description:
      'Implemented a machine learning model using Python and scikit-learn to forecast customer behavior. The model increased prediction accuracy by 85%.',
  },
  {
    date: '2022-05-18T13:30:00.000Z',
    title: 'Streamlined Supply Chain Management System',
    description:
      'Revamped the supply chain processes by integrating an ERP system, reducing delays by 25%. The improvement enhanced overall operational efficiency.',
  },
  {
    date: '2022-04-12T15:20:00.000Z',
    title: 'Conducted Penetration Testing for SecureApp',
    description:
      "Performed comprehensive penetration testing to identify vulnerabilities. Provided actionable recommendations that fortified the application's security posture.",
  },
  {
    date: '2022-03-08T09:50:00.000Z',
    title: 'Improved Accessibility Compliance',
    description:
      'Updated website to meet WCAG 2.1 standards, ensuring inclusivity for all users. This effort expanded the user base and received commendations from accessibility advocates.',
  },
  {
    date: '2022-02-03T12:15:00.000Z',
    title: 'Optimized Mobile App Performance',
    description:
      'Enhanced app loading times by optimizing assets and code, resulting in a 50% speed improvement. User satisfaction scores increased significantly post-optimization.',
  },
  {
    date: '2022-01-01T14:55:00.000Z',
    title: 'Implemented Internationalization for Global Reach',
    description:
      'Added multilingual support to the platform, expanding accessibility to non-English speaking users. This move increased global user engagement by 35%.',
  },
  {
    date: '2021-12-20T08:40:00.000Z',
    title: 'Automated Email Marketing Campaigns',
    description:
      'Set up automated workflows using Mailchimp, personalizing user outreach. The campaigns improved open rates by 20% and click-through rates by 15%.',
  },
  {
    date: '2021-11-15T11:25:00.000Z',
    title: 'Redesigned Logo and Brand Identity',
    description:
      'Collaborated with the design team to refresh the company’s brand image. The new branding resonated with audiences and strengthened market presence.',
  },
  {
    date: '2021-10-10T13:05:00.000Z',
    title: 'Launched Online Learning Platform Features',
    description:
      'Added interactive quizzes and progress tracking, enhancing the e-learning experience. User engagement metrics showed a positive uptick post-launch.',
  },
  {
    date: '2021-09-05T15:35:00.000Z',
    title: 'Integrated Social Media Login Options',
    description:
      'Implemented OAuth for seamless user authentication via social platforms. This reduced signup friction and increased new user registrations.',
  },
  {
    date: '2021-08-01T10:15:00.000Z',
    title: 'Developed API Endpoints for Third-Party Integration',
    description:
      'Created robust RESTful APIs, enabling partners to integrate services efficiently. This expanded the ecosystem and opened new revenue streams.',
  },
  {
    date: '2021-07-28T12:50:00.000Z',
    title: 'Improved Email Deliverability Rates',
    description:
      'Optimized email server configurations and content to reduce spam flags. Deliverability rates improved by 25%, enhancing communication with clients.',
  },
  {
    date: '2021-06-22T16:10:00.000Z',
    title: 'Set Up Disaster Recovery Protocols',
    description:
      'Established backup systems and recovery plans to safeguard data integrity. These measures ensured business continuity in case of unforeseen events.',
  },
  {
    date: '2021-05-18T09:30:00.000Z',
    title: 'Conducted Market Research for New Product Launch',
    description:
      'Gathered and analyzed consumer data to inform product features. The insights led to a successful launch that exceeded sales projections.',
  },
  {
    date: '2021-04-12T11:45:00.000Z',
    title: 'Implemented Microservices Architecture',
    description:
      'Transitioned from a monolithic application to microservices, enhancing scalability. This architecture improved deployment times and system resilience.',
  },
  {
    date: '2021-03-08T14:25:00.000Z',
    title: 'Enhanced Customer Support with Live Chat',
    description:
      'Integrated a live chat feature, providing real-time assistance to users. Customer satisfaction ratings improved due to faster response times.',
  },
  {
    date: '2021-02-03T16:05:00.000Z',
    title: 'Optimized Image Assets for Web Performance',
    description:
      'Compressed and optimized images, reducing page load times by 40%. This enhancement led to better SEO rankings and user experience.',
  },
  {
    date: '2021-01-01T08:55:00.000Z',
    title: 'Deployed Content Delivery Network (CDN)',
    description:
      'Implemented a CDN to distribute content globally, improving access speeds for international users. The site’s performance scores improved markedly.',
  },
  {
    date: '2020-12-20T12:35:00.000Z',
    title: 'Launched Beta Testing Program',
    description:
      'Coordinated a beta release to gather user feedback, refining features before the official launch. This proactive approach reduced post-launch issues.',
  },
  {
    date: '2020-11-15T15:20:00.000Z',
    title: 'Integrated CRM System for Sales Team',
    description:
      'Implemented Salesforce CRM to streamline sales processes and customer interactions. The integration improved lead conversion rates significantly.',
  },
  {
    date: '2020-10-10T09:15:00.000Z',
    title: 'Conducted Code Refactoring for Legacy Systems',
    description:
      'Refactored outdated codebases to improve maintainability and performance. The effort reduced technical debt and facilitated future enhancements.',
  },
  {
    date: '2020-09-05T11:00:00.000Z',
    title: 'Enhanced Security with Two-Factor Authentication',
    description:
      'Implemented 2FA to add an extra layer of security for user accounts. This measure increased user trust and reduced unauthorized access incidents.',
  },
  {
    date: '2020-08-01T13:40:00.000Z',
    title: 'Optimized Server Infrastructure',
    description:
      'Upgraded server hardware and optimized configurations, improving uptime and reliability. This resulted in a more stable platform for users.',
  },
  {
    date: '2020-07-28T15:25:00.000Z',
    title: 'Launched Employee Wellness Program',
    description:
      'Introduced initiatives to promote health and well-being among staff. The program boosted morale and productivity across departments.',
  },
  {
    date: '2020-06-22T10:05:00.000Z',
    title: 'Developed Interactive Prototypes for User Testing',
    description:
      'Created high-fidelity prototypes to gather user feedback early in the design process. This approach refined the product’s usability and appeal.',
  },
  {
    date: '2020-05-18T12:50:00.000Z',
    title: 'Established Partnerships with Industry Leaders',
    description:
      'Negotiated strategic alliances that expanded the company’s market reach. These partnerships opened up new opportunities for growth and collaboration.',
  },
  {
    date: '2020-04-12T16:15:00.000Z',
    title: 'Hosted Virtual Conference on Innovation',
    description:
      'Organized an online event featuring expert speakers, attracting over 5,000 attendees. The conference positioned the company as a thought leader.',
  },
  {
    date: '2020-03-08T09:45:00.000Z',
    title: 'Implemented Gamification Features',
    description:
      'Added gamified elements to increase user engagement and retention. The new features led to higher activity levels and customer satisfaction.',
  },
  {
    date: '2020-02-03T12:30:00.000Z',
    title: 'Optimized Ad Campaigns with A/B Testing',
    description:
      'Conducted A/B tests to refine advertising strategies, improving click-through rates. The optimization efforts enhanced ROI on marketing spend.',
  },
  {
    date: '2020-01-01T14:55:00.000Z',
    title: 'Launched Sustainability Initiative',
    description:
      'Introduced eco-friendly practices within the company, reducing carbon footprint. The initiative received positive recognition from the community.',
  },
  {
    date: '2019-12-20T08:40:00.000Z',
    title: 'Expanded Customer Support Hours',
    description:
      'Extended support availability to 24/7, providing assistance across different time zones. This improved customer satisfaction and loyalty.',
  },
  {
    date: '2019-11-15T11:25:00.000Z',
    title: 'Implemented Advanced Analytics Tools',
    description:
      'Integrated tools like Google Analytics and Mixpanel for deeper insights. The data-driven approach informed strategic business decisions.',
  },
  {
    date: '2019-10-10T13:05:00.000Z',
    title: 'Redesigned Onboarding Process',
    description:
      'Simplified the user onboarding experience, reducing drop-off rates by 30%. The streamlined process encouraged users to engage more fully with the platform.',
  },
  {
    date: '2019-09-05T15:35:00.000Z',
    title: 'Introduced Subscription-Based Model',
    description:
      'Shifted from a one-time purchase to a subscription model, increasing recurring revenue. The new model provided better value and flexibility for customers.',
  },
  {
    date: '2019-08-01T10:15:00.000Z',
    title: 'Optimized Backend Services for Scalability',
    description:
      'Refactored backend services to handle increased traffic, ensuring seamless performance. The optimization prepared the platform for future growth.',
  },
  {
    date: '2019-07-28T12:50:00.000Z',
    title: 'Enhanced User Privacy Controls',
    description:
      'Implemented new privacy settings, giving users more control over their data. This initiative aligned with global data protection regulations.',
  },
  {
    date: '2019-06-22T16:10:00.000Z',
    title: 'Launched Affiliate Marketing Program',
    description:
      'Established an affiliate network to broaden reach and drive sales. The program incentivized partners and contributed to revenue growth.',
  },
  {
    date: '2019-05-18T09:30:00.000Z',
    title: 'Conducted Competitive Analysis',
    description:
      'Analyzed competitor offerings to identify market gaps and opportunities. The insights guided product development and positioning strategies.',
  },
];

export function TimelineDemo() {
  const data = entries.map((entry) => ({
    title: formatDate(entry.date, 'dd MMM yyyy'),
    content: (
      <div className="prose">
        <h3>{entry.title}</h3>
        <p className="max-w-sm text-sm text-neutral-700 md:text-base dark:text-neutral-300">
          {entry.description}
        </p>
      </div>
    ),
  }));
  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
}
