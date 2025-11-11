
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heart, DollarSign } from "lucide-react"; // Added DollarSign import
import { createPageUrl } from '@/utils';

const faqItems = [
    {
        id: "faq-1",
        question: "What's the difference between Johnny and Dylan?",
        answer: (
            <div className="luxury-body text-base md:text-lg space-y-4">
                <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-600 flex flex-col md:flex-row items-center gap-4">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/46b19b9e7_JOHNNYWU11.jpg" 
                      alt="Johnny Wu performing magic" 
                      className="w-32 h-32 md:w-40 md:h-40 object-cover object-top rounded-full border-2 border-amber-400 flex-shrink-0" 
                    />
                    <div>
                        <h4 className="luxury-serif font-bold text-lg md:text-xl text-amber-400 mb-2">Johnny Wu</h4>
                        <ul className="space-y-2 text-sm md:text-base text-slate-100 list-disc list-inside">
                            <li><span className="font-semibold text-white">Experience:</span> 22 years.</li>
                            <li><span className="font-semibold text-white">Specialty:</span> Wide variety — mentalism, hypnosis, psychological illusions, predictions, and interactive routines.</li>
                            <li><span className="font-semibold text-white">Clients:</span> Celebrities, Fortune 100 companies, luxury events.</li>
                            <li><span className="font-semibold text-white">Positioning:</span> The premier choice for high-end entertainment, combining unmatched variety with deep experience.</li>
                            <li><span className="font-semibold text-white">Reputation:</span> Known as celebrities' favorite performer, trusted by elite brands.</li>
                            <li><span className="font-semibold text-white">Energy:</span> Polished, dynamic, versatile — can scale to any audience or environment.</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center text-slate-400 font-serif text-2xl">~</div>
                <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-600 flex flex-col md:flex-row items-center gap-4">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68b9fdb80e10eb3dae94dfbf/4dd49ef69_profile.jpg" 
                      alt="Dylan George performing mentalism" 
                      className="w-32 h-32 md:w-40 md:h-40 object-cover object-top rounded-full border-2 border-amber-400 flex-shrink-0" 
                    />
                    <div>
                        <h4 className="luxury-serif font-bold text-lg md:text-xl text-amber-400 mb-2">Dylan George</h4>
                        <ul className="space-y-2 text-sm md:text-base text-slate-100 list-disc list-inside">
                            <li><span className="font-semibold text-white">Experience:</span> 7 years.</li>
                            <li><span className="font-semibold text-white">Specialty:</span> Primarily mentalism and hypnosis — similar in tone to Johnny's mind-focused material, but less variety overall.</li>
                            <li><span className="font-semibold text-white">Clients:</span> Corporate events, weddings, private functions.</li>
                            <li><span className="font-semibold text-white">Positioning:</span> Delivers the Omni Magic feel in a streamlined format, focusing strongly on the mind-reading/hypnosis side.</li>
                            <li><span className="font-semibold text-white">Reputation:</span> Rising star of the brand, offering a style very close to Johnny's but with a narrower focus.</li>
                            <li><span className="font-semibold text-white">Energy:</span> Engaging, approachable, psychological — guests feel like their thoughts are being read.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "faq-2",
        question: "What happens when I select multiple performers?",
        answer: (
            <div className="luxury-body text-base md:text-lg text-white">
                <p className="mb-3">When you book multiple performers for your event:</p>
                <ul className="space-y-2 list-disc list-inside text-sm md:text-base">
                    <li><span className="font-semibold text-white">First performer:</span> Your selected lead performer (Johnny Wu or Dylan George)</li>
                    <li><span className="font-semibold text-white">Second performer:</span> Dylan George will join (if Johnny is the first performer) or another professional from our team</li>
                    <li><span className="font-semibold text-white">Third performer:</span> Talented artists we frequently collaborate with who match our quality standards</li>
                </ul>
                <p className="mt-3 text-slate-200 text-sm md:text-base">All additional performers are carefully selected to maintain the same level of professionalism and entertainment quality you expect from Omni Magic Entertainment.</p>
            </div>
        )
    },
    {
        id: "faq-3",
        question: "Why do people love the personalized impossible souvenir add-on?",
        answer: "It turns a peak moment into something permanent your guests can hold. They'll relive your event every time they see it."
    },
    {
        id: "faq-4",
        question: "Are we allowed to record the performance?",
        answer: "Yes, please do — and tag us when you share. Guests love rewatching the moments."
    },
    {
        id: "faq-5",
        question: "Can the show be customized?",
        answer: "Yes. We weave your brand, people, and story into the magic for a one-of-a-kind experience."
    },
    {
        id: "faq-6",
        question: "What's the difference between Johnny and other premium performers?",
        answer: (
            <div className="luxury-body text-base md:text-lg text-white">
                <p className="mb-3">Johnny Wu is Omni Magic's founder and lead performer, with over two decades of experience captivating audiences worldwide. While all performers we recommend are top-tier professionals, Johnny's unique value lies in:</p>
                <ul className="space-y-2 list-disc list-inside text-sm md:text-base">
                    <li><span className="font-semibold text-white">Unmatched Versatility:</span> From grand illusions to intimate mentalism, his repertoire is broader and deeper.</li>
                    <li><span className="font-semibold text-white">Global Experience:</span> Performed for celebrities, heads of state, and Fortune 100 companies in countless international settings.</li>
                    <li><span className="font-semibold text-white">Signature Routines:</span> Many of his most unique and impactful pieces are exclusive to his performances.</li>
                    <li><span className="font-semibold text-white">Personalized Craft:</span> Known for weaving deeply personal and branded elements into every show with unparalleled finesse.</li>
                </ul>
                <p className="mt-3 text-slate-200 text-sm md:text-base">Booking Johnny ensures you're receiving the highest level of bespoke magical entertainment available, often setting the tone for multi-performer events.</p>
            </div>
        )
    },
    {
        id: "faq-7",
        question: "What are your rates?",
        answer: (
            <div className="luxury-body text-base md:text-lg text-white">
                <p className="mb-3">Our pricing is tailored to the specific needs of your event, ensuring you receive the perfect entertainment package. Here's a general guide:</p>
                <ul className="space-y-2 list-disc list-inside text-sm md:text-base">
                    <li><span className="font-semibold text-white">Johnny Wu:</span> Starting from $1,500 for local events (within 50 miles of Los Angeles).</li>
                    <li><span className="font-semibold text-white">Dylan George:</span> Starting from $850 for local events (within 50 miles of Los Angeles).</li>
                    <li><span className="font-semibold text-white">Additional Performers:</span> Available at special rates when booked with a lead performer.</li>
                    <li><span className="font-semibold text-white">Add-ons:</span> Personalized impossible souvenirs, custom effects, and extended performances are quoted separately.</li>
                </ul>
                <p className="mt-3 text-slate-200 text-sm md:text-base">
                    Pricing varies based on factors such as event type (corporate, private, wedding), duration, audience size, customization requests, and travel requirements.
                    For a precise quote, please reach out with your event details.
                </p>
            </div>
        )
    },
    {
        id: "faq-8",
        question: "Do you accept gratuity?",
        answer: (
            <div className="luxury-body text-base md:text-lg text-white">
                <p className="mb-3">
                    Yes! We greatly appreciate gratuities for exceptional service. If you'd like to show your appreciation for your performer, you can easily leave a gratuity online.
                </p>
                <a 
                    href={createPageUrl('GratuityPage')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-6 py-3 rounded-lg transition-all hover:scale-105"
                >
                    <Heart className="w-5 h-5" />
                    Leave a Gratuity
                </a>
                <p className="mt-3 text-slate-300 text-sm italic">
                    100% of your gratuity goes directly to your performer. Thank you for your generosity!
                </p>
            </div>
        )
    },
    {
        id: "faq-9",
        question: "How do I pay a custom deposit?",
        answer: (
            <div className="luxury-body text-base md:text-lg text-white">
                <p className="mb-3">
                    If you've been provided with a custom deposit amount, you can securely pay online through our dedicated payment page.
                </p>
                <a 
                    href={createPageUrl('DepositPaymentPage')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-all hover:scale-105"
                >
                    <DollarSign className="w-5 h-5" />
                    Pay Deposit
                </a>
                <p className="mt-3 text-slate-300 text-sm italic">
                    Contact us if you need a custom payment link for your specific event.
                </p>
            </div>
        )
    }
];

export default function FAQ() {
  return (
    <div className="mt-8 md:mt-12 lg:mt-16 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
        
        .luxury-serif {
          font-family: 'Oswald', sans-serif;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        
        .luxury-body {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          line-height: 1.8;
          font-size: 1.125rem;
        }
      `}</style>

      <div className="text-center mb-6 md:mb-8">
        <h3 className="luxury-serif text-xl md:text-3xl lg:text-4xl font-bold text-white">Frequently Asked Questions</h3>
      </div>
      <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto space-y-4">
        {faqItems.map((item) => (
          <AccordionItem value={item.id} key={item.id} className="bg-slate-900/80 backdrop-blur-sm border border-slate-600 rounded-lg shadow-lg">
            <AccordionTrigger className="text-left luxury-serif text-sm md:text-base lg:text-xl font-semibold text-white hover:no-underline p-4 md:p-6 hover:text-amber-400 transition-colors">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="p-4 md:p-6 pt-0">
              <div className="border-t border-slate-600 pt-4 luxury-body text-sm md:text-base lg:text-lg text-white">
                {item.answer}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
