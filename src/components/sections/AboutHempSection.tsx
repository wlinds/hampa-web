import React from 'react';
import { Calendar, Leaf, Shield, AlertCircle } from 'lucide-react';

const AboutHempSection: React.FC = () => {
  const timeline = [
    {
      period: 'Bronsåldern - 1966',
      title: 'Traditionell odling i Sverige',
      description: 'Hampa har varit en del av svensk jordbrukshistoria i över 3000 år.'
    },
    {
      period: '1966 - 1995',
      title: 'Odlingsförbud',
      description: 'Hampakultivering förbjöds i Sverige under denna period.'
    },
    {
      period: '1995 - Idag',
      title: 'Återstart genom EU-inträde',
      description: 'Laglig industrihampakultivering började igen när Sverige gick med i EU.'
    }
  ];

  const facts = [
    {
      icon: Leaf,
      title: 'Cannabis Sativa',
      description: 'Samma art som marijuana, men olika sort - industrihampa',
      highlight: 'Ger INGET rus'
    },
    {
      icon: Shield,
      title: 'Laglig odling',
      description: 'Godkända sorter med låg THC-halt (<0.2%)',
      highlight: 'SAM-ansökan krävs'
    },
    {
      icon: Calendar,
      title: 'Snabb tillväxt',
      description: 'Växer från frö till 3-4 meter på en säsong',
      highlight: '120 dagar cykel'
    }
  ];

  return (
    <section id="about-hemp" className="py-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-hemp-900 mb-6">
                Om Industrihampa
              </h2>
              <p className="text-xl text-hemp-700 leading-relaxed mb-8">
                Hampa har odlats i Sverige sedan bronsåldern fram till 1966. I och med Sveriges EU-inträde började kultiveringen återigen. Hampa bidrar med väldigt höga värden av ekosystemtjänster och ökad hälsa hos pollinatörspopulationer.
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-hemp-800 mb-4">
                Hampans historia i Sverige
              </h3>
              {timeline.map((item, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-hemp-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-hemp-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-hemp-600 mb-1">
                      {item.period}
                    </div>
                    <h4 className="text-lg font-semibold text-hemp-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-hemp-700">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Facts Cards */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-400 p-6 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">
                    Viktigt att veta
                  </h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    Hampan är av samma art som Cannabis Sativa, MEN av annan sort - så kallad industrihampa. 
                    Hampan ger inget rus och är INTE en drog.
                  </p>
                </div>
              </div>
            </div>

            {facts.map((fact, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-hemp-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-hemp-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <fact.icon className="w-6 h-6 text-hemp-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-hemp-900 mb-2">
                      {fact.title}
                    </h4>
                    <p className="text-hemp-700 mb-3">
                      {fact.description}
                    </p>
                    <div className="inline-flex items-center bg-hemp-100 text-hemp-700 px-3 py-1 rounded-full text-sm font-medium">
                      {fact.highlight}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 p-6 rounded-xl text-white">
              <h3 className="text-lg font-semibold mb-2">
                Kostnadsfri utbildning ingår
              </h3>
              <p className="text-hemp-100 mb-4">
                Vid etablering av hampaareal ingår kostnadsfri utbildning och föredrag om hampa som ekosystemtjänstgröda.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center bg-white text-hemp-700 font-medium px-4 py-2 rounded-lg hover:bg-hemp-50 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Läs mer
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHempSection;