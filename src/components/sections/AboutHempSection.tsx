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
      period: '1966 - 2003',
      title: 'Odlingsförbud',
      description: '1966 drogs det statliga bidraget till Sveriges hampabönder in.'
    },
    {
      period: '2003 - Idag',
      title: 'Återstart genom EU-inträde',
      description: '2003 vann Sveriges hampabönder i rättsfall med stöd av EU-lagstiftning kring hampa.'
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
      description: 'Godkända sorter med låg THC-halt (<0.3%)',
      highlight: 'SAM-ansökan krävs'
    },
    {
      icon: Calendar,
      title: 'Hög koldioxidbindning',
      description: 'Mellan 9 och 15 ton CO₂',
      highlight: 'Kolbindning per säsong'
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

            {/* Image */}
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img
                src="/images/hemp-field-2.jpeg"
                alt="Hampafält med täta hampaplantor"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23dcf2dc'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16' fill='%233b9b3b'%3EHampafält%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-hemp-900/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-medium">Industrihampa i Sverige</p>
              </div>
            </div>
          </div>

          {/* Facts Cards */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-red-400 p-6 rounded-lg">
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