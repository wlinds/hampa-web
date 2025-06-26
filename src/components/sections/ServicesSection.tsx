import React from 'react';
import { Sprout, Users, BookOpen, MapPin, Clock, Shield } from 'lucide-react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: Sprout,
      title: 'Etablering av hampaareal',
      description: 'Vi sköter allt hela vägen från det juridiska, sådd, skötsel till skörd. Kostnadsfri offert ingår.',
      features: ['Inför etablering görs SAM-ansökan och inskickning av godkänd sort etikett tillsammans med kund.', 'Hampaarealen blir därmed godkänd enligt lag.'],
      color: 'hemp'
    },
    {
      icon: MapPin,
      title: 'Etablering av äng genom hampametoden',
      description: 'En process som tar några säsonger för att laka ur jorden på näring för att sedan använda hampan tillsammans med ängsfrön för en effektivt etablering.',
      features: ['Hampan bidrar med väldigt höga värden av ekosystemtjänster under processen.'],
      color: 'earth'
    },
    {
      icon: Users,
      title: 'Rådgivning kring biologisk mångfald',
      description: 'Personlig rådgivning för att öka biologisk mångfald på era ytor. Kostnadsfri offert.',
      features: ['Besök på plats', 'Åtgärdsförslag', 'Skötselplan', 'Skiss med placeringar'],
      color: 'hemp'
    },
    {
      icon: BookOpen,
      title: 'Grönyteskötsel utifrån biologisk mångfald',
      description: 'Genom ekologisk grönyteskötselmetod och främjandet av diversiteten kring inhemska arter ökar vi den biologiska mångfalden på er yta samtidigt som vi tar hänsyn till en vacker estetik.',
      features: ['Vi förvandlar eftersatta grönytor.'],
      color: 'earth'
    }
  ];

  const consultationOptions = [
    {
      size: '<50m²',
      duration: '30 min',
      includes: ['Besök på plats', 'Lista på åtgärdsförslag'],
      icon: Clock
    },
    {
      size: '>50m²',
      duration: '~90 min',
      includes: ['Besök på plats', 'Lista på åtgärdsförslag', 'Skötselplan', 'Skiss med placering'],
      icon: MapPin
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-hemp-900 mb-6">
            Våra Tjänster
          </h2>
          <p className="text-xl text-hemp-700 leading-relaxed">
            Med specialiserade tjänster för hållbar utveckling vänder vi oss till privata & kommunala hyresvärdar, bostadsrättföreningar och kommuner.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-hemp-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-hemp-100 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${service.color === 'hemp' ? 'bg-hemp-100' : 'bg-earth-100'} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className={`w-6 h-6 ${service.color === 'hemp' ? 'text-hemp-600' : 'text-earth-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-hemp-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-hemp-700 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-hemp-600">
                        <div className={`w-1.5 h-1.5 ${service.color === 'hemp' ? 'bg-hemp-400' : 'bg-earth-400'} rounded-full mr-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Transparency & Information Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-hemp-700 to-hemp-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid lg:grid-cols-2 items-center">
              {/* Content */}
              <div className="p-8 lg:p-12 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Transparens & Allmän Information
                </h3>

                <p className="text-hemp-100 mb-6">
                  Vi tror på öppenhet och utbildning. Därför placerar vi alltid informationsskyltar vid våra hampafält som förklarar vad industrihampa är, dess fördelar för miljön, och att det inte är en drog.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-hemp-300 rounded-full"></div>
                    <span className="text-hemp-100">Utbildar allmänheten om industrihampa</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-hemp-300 rounded-full"></div>
                    <span className="text-hemp-100">Förebygger missförstånd och oro</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-hemp-300 rounded-full"></div>
                    <span className="text-hemp-100">Visar miljöfördelar och ekosystemtjänster</span>
                  </div>
                </div>
              </div>

              {/* Image with Sign Overlay */}
              <div className="relative h-80 lg:h-96">
                <img
                  src="/images/hemp-field-1.jpeg"
                  alt="Hampafält med informationsskylt"
                  className="w-full h-full object-cover"
                />
                
                {/* Information Sign Overlay */}
                <div className="absolute -top-1 left-0"> 
                  <div className="max-w-xs">
                    <img
                      src="/images/infoskylt.jpg"
                      alt="Informationsskylt för hampafält"
                      className="w-full h-auto block"
                    />
                  </div>
                </div>

                {/* Gradient Overlay */}
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Options */}
        <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">
              Rådgivning biologisk mångfald
            </h3>
            <p className="text-hemp-100 text-lg">
              Välj det alternativ som passar er yta bäst - kostnadsfri offert ingår alltid
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {consultationOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <option.icon className="w-6 h-6 text-hemp-200" />
                  <div>
                    <h4 className="text-lg font-semibold">{option.size}</h4>
                    <p className="text-hemp-200">Besök ({option.duration})</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {option.includes.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-hemp-100">
                      <Shield className="w-4 h-4 mr-2 text-hemp-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="#contact"
              className="inline-flex items-center bg-white text-hemp-700 font-semibold px-8 py-3 rounded-lg hover:bg-hemp-50 transition-colors duration-200 shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Boka Rådgivning
              <MapPin className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;