import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Leaf, Shield, Clock } from 'lucide-react';

const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      category: 'Om Hampa',
      icon: Leaf,
      questions: [
        {
          question: 'Är industrihampa lagligt att odla i Sverige?',
          answer: (
            <>
              Ja, detta kontrolleras genom en SAM-ansökan via Jordbruksverket samt att man skickar in en godkänd sortetikett till länsstyrelsen. SAM-ansökan sköts tillsammans med kund. Mer detaljerad information finner du på {' '}
              <a 
                href="https://jordbruksverket.se/stod/jordbruk-tradgard-och-rennaring/jordbruksmark/gardsstod/odla-hampa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-hemp-600 hover:text-hemp-800 underline font-medium"
              >
                Jordbruksverkets webbplats
              </a>
              .
            </>
          )
        },
        {
          question: 'Vad är skillnaden mellan industrihampa och marijuana?',
          answer: 'Industrihampa och marijuana är samma art (Cannabis Sativa) men olika sorter. Industrihampa innehåller mycket låga halter THC (<0.3%) och ger inget rus. Den odlas för fiber, frön och ekosystemtjänster, inte för berusning.'
        },
        {
          question: 'När sår man hampan?',
          answer: 'Vanligtvis mellan maj och juni.'
        },
        {
          question: 'När skördas hampan?',
          answer: 'Septempber/oktober beroende på sort'
        },
        {
          question: 'Hur snabbt växer hampa?',
          answer: 'Hampa växer extremt snabbt - från frö till 3-4 meter höjd på bara 120 dagar (en säsong). Det är en av världens snabbast växande växter, vilket gör den idealisk för kolbindning och biomassaproduktion.'
        },
        {
          question: 'Varför ska vi främja hampa?',
          answer: (
            <>
              Hampan bidrar till <b>samtliga ekosystemtjänster</b>, kräver minimal bevattning och binder <b>9-15 ton koldioxid per hektar</b> på bara en säsong, lika mycket som en ung skog.<br /><br />
              Hampa bidrar som unik gröda till att öka hälsan hos pollinatörspopulationer och markorganismer, den bidrar till den biologiska mångfalden, jordförbättring och motverkar jorderosion. <br /><br />
              Att främja odling och användning av industrihampa ger betydande ekosystemtjänster och konkreta fördelar för hållbar samhällsutveckling ur många aspekter, särskilt vad gäller mångsidig användning.
            </>
          )
        },
        {
          question: 'Varför ska vi främja biologisk mångfald?',
          answer: (
            <>
            Vi ska främja biologisk mångfald eftersom det är avgörande för fungerande ekosystem som ger oss rena resurser såsom luft, vatten, mat och råvaror. Biologisk mångfald stärker också naturens motståndskraft mot kriser och bidrar till en hållbar och hanterbar framtid.            </>
          )
        }
      ]
    },
    {
      category: 'Våra Tjänster',
      icon: Shield,
      questions: [
        {
          question: 'Vad ingår i etablering av hampaareal?',
          answer: 'Vi sköter hela processen: SAM-ansökan, inköp av godkända frön, sådd, skötsel under säsongen, skörd, och uppsättning av informationsskylt. Kostnadsfri offert och utbildning ingår alltid.'
        },
        {
          question: 'Hur fungerar hampametoden för ängsestablering?',
          answer: 'Hampametoden är en flerårig process där vi först använder hampa för att laka ur näringsämnen från jorden. Sedan kombinerar vi hampa med ängsfrön för att skapa naturliga ängsytor. Processen tar några säsonger men ger fantastiska resultat.'
        },
        {
          question: 'Vad kostar era tjänster?',
          answer: 'Vi erbjuder alltid kostnadsfri offert och rådgivning. Priset beror på projektets storlek, plats och komplexitet. Kontakta oss för en personlig genomgång av era behov och en skräddarsydd offert.'
        },
        {
          question: 'Arbetar ni över hela Sverige?',
          answer: 'Vi är verksamma i Västra Götaland, Bohuslän och Halland.'
        }
      ]
    },
    {
      category: 'Praktiska Frågor',
      icon: Clock,
      questions: [
        {
          question: 'När på året etableras hampaareal?',
          answer: 'Hampa sås vanligtvis i maj när frostrisken är över och jorden är uppvärmd. Skörden sker i september-oktober. Vi planerar projektet efter optimala väderförhållanden för er region.'
        },
        {
          question: 'Krävs särskild mark för hampodling?',
          answer: 'Hampa är mycket anpassningsbar och trivs på de flesta jordtyper. Den föredrar väldränerad jord men klarar både lera och sandiga jordar. Vi gör alltid en markanalys innan etablering.'
        },
        {
          question: 'Vad händer med hampan efter skörd?',
          answer: 'Hampan har många användningsområden: fibrerna används för textil, papper och byggmaterial, fröna är näringsrika och kan användas som mat, och hela växten kan komposteras för att förbättra jorden.'
        },
        {
          question: 'Behöver vi speciella tillstånd från kommunen?',
          answer: 'SAM-ansökan till Jordbruksverket är det viktigaste tillståndet, vilket vi hjälper er med. Beroende på kommun kan det finnas lokala bestämmelser. Vi hjälper er navigera alla regelverk.'
        },
        {
          question: 'Kan grannar klaga på hampodlingen?',
          answer: 'Industrihampa är en laglig jordbruksgröda precis som vete eller majs. Vi sätter upp informationsskyltar som förklarar att det är industrihampa. Utbildning och öppenhet löser vanligtvis alla frågor.'
        }
      ]
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <HelpCircle className="w-8 h-8 text-hemp-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-hemp-900">
              Frågor & Svar
            </h2>
          </div>
          <p className="text-xl text-hemp-700 leading-relaxed">
            Här hittar du svar på de vanligaste frågorna om hampakultivering, våra tjänster och hur vi kan hjälpa er.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg border border-hemp-100 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <category.icon className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">{category.category}</h3>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-hemp-100">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex; // Unique index across categories
                  const isOpen = openItems.includes(globalIndex);

                  return (
                    <div key={faqIndex} className="transition-all duration-200">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-5 text-left hover:bg-hemp-50 transition-colors duration-200 focus:outline-none focus:bg-hemp-50"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-hemp-900 pr-4">
                            {faq.question}
                          </h4>
                          <div className="flex-shrink-0">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-hemp-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-hemp-600" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-5 animate-slide-up">
                          <div className="pt-2 border-t border-hemp-100">
                            <div className="text-hemp-700 leading-relaxed">
                              {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-hemp-600 to-hemp-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Hittar du inte svar på din fråga?
          </h3>
          <p className="text-hemp-100 mb-6 max-w-2xl mx-auto">
            Vi svarar gärna på alla frågor om hampakultivering och våra tjänster. 
            Kontakta oss för personlig rådgivning - kostnadsfritt!
          </p>
          <a
            href="#contact"
            className="inline-flex items-center bg-white text-hemp-700 font-semibold px-6 py-3 rounded-lg hover:bg-hemp-50 transition-colors duration-200 shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Kontakta oss
            <HelpCircle className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;