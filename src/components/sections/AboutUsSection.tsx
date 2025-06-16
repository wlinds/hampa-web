import React from 'react';
import { Users } from 'lucide-react';

const AboutUsSection: React.FC = () => {
  const teamMembers = [
    {
      name: 'Calle',
      role: 'Biodlare & Tidigare Hampabonde',
      description: 'Stor entusiast med djup kunskap om hampa och dess roll i ekosystemet.',
      image: '/images/team-calle.jpg'
    },
    {
      name: 'Robin',
      role: 'Trädgårdsmästare',
      description: 'Vidareutbildad inom grön urban utveckling och biologisk mångfald.',
      image: '/images/team-robin.jpg'
    },
    {
      name: 'Akilles',
      role: 'Webbutvecklare & Data Scientist',
      description: 'Ansvarig för digitala lösningar, teknisk utveckling och dataanalys.',
      image: '/images/team-akilles.jpg'
    }
  ];

  
  return (
    <section id="about-us" className="py-20 bg-gradient-to-b from-white to-hemp-50">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Users className="w-8 h-8 text-hemp-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-hemp-900">
              Om Oss
            </h2>
          </div>
        </div>

        {/* Introduction */}
        <div className="max-w-8xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-hemp-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none text-hemp-700 leading-relaxed">
              <p className="text-xl mb-6">
                Välkommen till <strong className="text-hemp-800">Hampaoasen</strong>, där vi brinner för att sprida kunskap om hampans fantastiska egenskaper och dess roll som ekosystemtjänstgröda.
              </p>
              
              <p className="mb-6">
                Vi som är Hampaoasen är alla stora entusiaster. Calle som är biodlare och tidigare hampabonde, Robin som är trädgårdsmästare och vidareutbildad inom grön urban utveckling, samt Akilles som är systemutvecklare.
              </p>

              <p className="mb-6">
                Hampaoasen erbjuder gratis utbildning och föredrag för att öka medvetenheten om hampans betydelse för biologisk mångfald och klimatet. Vi erbjuder även kostnadsfri offert.
              </p>

              <p className="mb-6">
                Vårt mål är att hjälpa privata och kommunala hyresvärdar, bostadsrättsföreningar och kommuner med rådgivning kring biologisk mångfald samt att etablera hampaarealer för att dra nytta av dess positiva effekter.
              </p>

              <p className="mb-6">
                Genom att erbjuda rådgivning kring biologisk mångfald hjälper vi er att uppfylla miljömål, stärka ekosystemtjänster samt utveckla robusta och hållbara livsmiljöer i enlighet med gällande lagstiftning och mål.
              </p>

              <p className="mb-6">
                Vid etablering av hampaareal, tar vi hand om hela processen – från etablering till skörd. Vi gör det enkelt att integrera hampa runt stadsmiljöer, på grönytor och jordbruksmark.
              </p>

              <p className="text-lg font-medium text-hemp-800">
                Tillsammans kan vi skapa en grönare och mer hållbar framtid med mer biologisk mångfald och återigen inkludera hampa som en naturlig del av ekosystemet.
              </p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-hemp-900 text-center mb-12">
            Vårt Team
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl lg border border-hemp-100 overflow-hidden"
              >
                <div className="aspect-w-1 aspect-h-1 relative">
                  <img
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23dcf2dc'/%3E%3Ccircle cx='150' cy='120' r='40' fill='%233b9b3b'/%3E%3Cpath d='M110 180 Q150 160 190 180 L190 220 Q150 200 110 220 Z' fill='%233b9b3b'/%3E%3Ctext x='50%25' y='85%25' text-anchor='middle' font-size='16' fill='%232d7d2d'%3E${encodeURIComponent(member.name)}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-hemp-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-hemp-900 mb-2">
                    {member.name}
                  </h4>
                  <p className="text-hemp-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-hemp-700 leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;