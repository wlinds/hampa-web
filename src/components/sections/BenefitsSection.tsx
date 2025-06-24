import React from 'react';
import { TreePine, Wheat, Shirt, Home, Zap, Bug } from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: TreePine,
      title: 'Kolbindning',
      value: '9-15 ton CO₂',
      description: 'per hektar - lika mycket som en ung skog på bara en säsong',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Bug,
      title: 'Pollination',
      value: 'Stor mängd',
      description: 'pollen som främjar vitalitet hos pollinatörer',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Wheat,
      title: 'Näringsrik mat',
      value: 'Hampfrön',
      description: 'innehåller alla essentiella aminosyror och omega-fettsyror',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Shirt,
      title: 'Hållbara material',
      value: 'Fibrer för',
      description: 'textil, papper, bioplast och byggnadsämnen',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Home,
      title: 'Hampbetong',
      value: 'Byggmaterial',
      description: 'lätt, isolerande och koldioxidnegativ byggnadsmaterial',
      color: 'from-gray-500 to-gray-600'
    },
    {
      icon: Zap,
      title: 'Snabb tillväxt',
      value: '120 dagar',
      description: 'från frö till skörd - en av de snabbaste växande grödorna',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const ecosystemServices = [
    'Jordförbättring genom djupa rötter',
    'Naturlig ogräsbekämpning',
    'Minskar behov av bekämpningsmedel',
    'Förbättrar markstruktur',
    'Återställer näringsämnen i jorden',
    'Stödjer lokala ekosystem'
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-hemp-50">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-hemp-900 mb-6">
            Hampans Fördelar
          </h2>
          <p className="text-xl text-hemp-700 leading-relaxed">
            Hampa är en mirakelgröda som bidrar till en hållbar framtid genom sina unika egenskaper och mångsidiga användningsområden.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-hemp-100 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-hemp-900 mb-2">
                {benefit.title}
              </h3>
              <div className="text-2xl font-bold text-hemp-700 mb-2">
                {benefit.value}
              </div>
              <p className="text-hemp-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Ecosystem Services */}
        <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 text-white">
           <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
             <div>
               <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 break-words hyphens-auto">
                 Ekosystemtjänster
               </h3>
               <p className="text-hemp-100 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                 Hampa bidrar med väldigt höga värden av ekosystemtjänster och ökad hälsa hos pollinatörspopulationer. Biologisk mångfald är avgörande för fungerande ekosystem.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                 {ecosystemServices.map((service, index) => (
                   <div key={index} className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-hemp-300 rounded-full flex-shrink-0"></div>
                     <span className="text-hemp-100 text-sm sm:text-base break-words">{service}</span>
                   </div>
                 ))}
               </div>
             </div>

             <div className="relative">
               <div className="bg-white/10 backdrop-blur rounded-xl p-4 sm:p-6 border border-white/20">
                 <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 break-words">
                   Varför biologisk mångfald?
                 </h4>
                 <p className="text-hemp-100 text-sm sm:text-base leading-relaxed">
                   Biologisk mångfald är avgörande för fungerande ekosystem som ger oss rena resurser såsom luft, vatten och mat. Den stärker också naturens motståndskraft mot kriser och bidrar till en hållbar och hanterbar framtid.
                 </p>
               </div>
               
               {/* Decorative elements */}
               <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 sm:w-20 h-16 sm:h-20 bg-hemp-400 rounded-full opacity-20 animate-float"></div>
               <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-12 sm:w-16 h-12 sm:h-16 bg-hemp-300 rounded-full opacity-30 animate-float animation-delay-400"></div>
             </div>
           </div>
         </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-hemp-900 mb-4">
            Redo att bidra till en hållbar framtid?
          </h3>
          <p className="text-hemp-700 mb-8 max-w-2xl mx-auto">
            Kontakta oss för en kostnadsfri konsultation och upptäck hur hampa kan förvandla era grönytor till en oas av biologisk mångfald.
          </p>
          <a
            href="#contact"
            className="btn-primary inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Kontakta oss idag
          </a>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;