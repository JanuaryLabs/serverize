import { motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { cn } from './utils';

export interface FAQItemProps {
  question: string;
  answer: ReactNode;
  category: string;
}

function CategoryButton({
  name,
  isActive,
  onClick,
}: {
  name: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-left rounded-lg transition-all w-full',
        'hover:bg-gray-100 dark:hover:bg-black/10',
        isActive &&
          'bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/15 dark:hover:bg-primary/25',
      )}
    >
      {name}
    </button>
  );
}

const FAQS: FAQItemProps[] = [
  // --- OVERVIEW (5) ---
  {
    question: 'What is Serverize?',
    answer: `Serverize is a deployment utility that packages your application into a Docker image, spins it up on a remote environment, and gives you a URL. It's built to streamline development, testing, and preview environments without heavy DevOps overhead.`,
    category: 'Overview',
  },
  {
    question: 'Why should I use Serverize?',
    answer:
      'Serverize provides a quick path to show off your work in a real environment. With minimal steps, you get a live URL for any new feature or project, making it easy to share, gather feedback, and iterate.',
    category: 'Overview',
  },
  {
    question: 'What types of applications can be deployed on Serverize?',
    answer:
      'Static websites, API projects, and full-stack applications. Essentially, as long as your app can run in a Docker container and expose an HTTP port, it can be deployed on Serverize.',
    category: 'Overview',
  },
  {
    question: 'How does Serverize handle deployment?',
    answer:
      'It builds a Docker image on your device and pushes it to Serverize servers, which run it and expose it to the internet.',
    category: 'Overview',
  },
  {
    question: 'What happens after deployment?',
    answer:
      'You receive a link that you can share with others for testing and feedback—no manual server setup required.',
    category: 'Overview',
  },

  // --- USAGE (5) ---
  {
    question: 'Do I need any special skills to use Serverize?',
    answer:
      'Familiarity with Docker helps, but `npx serverize` can automatically create a Dockerfile based on your framework. It’s designed to be as implicit as possible.',
    category: 'Usage',
  },
  {
    question: 'How do I handle environment variables or secrets?',
    answer:
      'Serverize provides a “secrets” system. You can set them through the CLI or an .env file, and they’ll be available in your app at runtime.',
    category: 'Usage',
  },
  {
    question: 'Is there a quick start guide for new users?',
    answer:
      'Run `npx serverize` in your project directory, and follow the prompts. It will guide you through the setup and deployment process.',
    category: 'Usage',
  },
  {
    question: 'Can I have multiple channels or releases for the same project?',
    answer:
      'Absolutely. Channels (e.g. dev, preview) let you separate environments, and each channel can have multiple named releases for different builds.',
    category: 'Usage',
  },
  {
    question: 'How do I update or redeploy my app?',
    answer:
      'Just run the deploy command again (e.g. `npx serverize deploy`). You can override an existing release or create a new one for additional testing.',
    category: 'Usage',
  },

  // --- TECHNICAL (5) ---
  {
    question: 'Does Serverize handle logs or debugging?',
    answer:
      'Yes, you can fetch logs via the CLI. For in-depth monitoring, integrate with your preferred logging solutions.',
    category: 'Technical',
  },
  {
    question: 'Can multiple developers share the same project link?',
    answer:
      'Definitely. Everyone pushing to that project can spin up their own release or update existing ones, making collaboration seamless.',
    category: 'Technical',
  },
  {
    question: 'What about scaling or auto-scaling?',
    answer:
      'Currently, Serverize focuses on rapid deployments for small-to-medium workloads. Advanced scaling might require manual adjustments.',
    category: 'Technical',
  },
  {
    question: 'Is Serverize secure?',
    answer:
      'Each environment is containerized, and secrets are encrypted. It follows best practices, but avoid storing highly sensitive production keys.',
    category: 'Technical',
  },
  {
    question: 'How do I integrate Serverize with CI/CD pipelines?',
    answer: (
      <p>
        Check out the{' '}
        <a className="underline" href="/docs/deploy/ci-cd">
          CI/CD documentation
        </a>{' '}
      </p>
    ),

    category: 'Technical',
  },

  // --- PRICING & ENTERPRISE (5) ---
  {
    question: 'Are there enterprise solutions available?',
    answer:
      'Yes, personalized demos and advanced integrations are available if you need more robust features or custom setups.',
    category: 'Pricing & Enterprise',
  },
  {
    question: "How does Serverize's pricing work?",
    answer: `You can have up to 3 projects, with each project supporting 4 releases across its channels for free while in beta.`,
    category: 'Pricing & Enterprise',
  },
  {
    question: 'Is there a free usage limit or tier?',
    answer:
      'During beta, yes. You can run multiple small projects without cost. Once official pricing is set, details will be posted.',
    category: 'Pricing & Enterprise',
  },
  {
    question: 'Can I self-host Serverize?',
    answer:
      'Self-hosted options are being considered, though the current focus is on the managed cloud service.',
    category: 'Pricing & Enterprise',
  },
  {
    question: 'Who do I contact for advanced features or demos?',
    answer: (
      <p>
        Reach out through{' '}
        <a className="underline" href="https://discord.gg/aj9bRtrmNt">
          Discord community
        </a>{' '}
        Or{' '}
        <a className="underline" href="https://cal.com/january-sh/30min">
          Request a demo
        </a>
      </p>
    ),
    category: 'Pricing & Enterprise',
  },
];

export function CategoryFaq() {
  const [activeCategory, setActiveCategory] = useState<string>('Overview');

  const categories = Array.from(new Set(FAQS.map((faq) => faq.category)));
  const filteredFaqs = FAQS.filter((faq) => faq.category === activeCategory);

  return (
    <section className="py-8 w-full rounded-xl">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Everything you need to know
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <div className="bg-white dark:bg-black/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800/60 h-fit">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-4">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <CategoryButton
                  key={category}
                  name={category}
                  isActive={category === activeCategory}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-black/5 p-6 rounded-xl border border-gray-100 dark:border-gray-800/60">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`${index}`}
                  className="border border-gray-100 dark:border-gray-800/60 rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <span className="text-left font-medium text-gray-900 dark:text-gray-200 hover:text-primary">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
