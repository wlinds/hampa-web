import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Send, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

// Global grecaptcha for v3
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    area: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    
    if (!siteKey || siteKey === 'undefined' || siteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
      console.warn('reCAPTCHA site key not configured or using test key');
      setRecaptchaLoaded(false);
      return;
    }

    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      window.grecaptcha.ready(() => {
        setRecaptchaLoaded(true);
      });
    };
    
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="recaptcha"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let recaptchaToken = '';
      
      // Get reCAPTCHA token if available
      if (recaptchaLoaded && window.grecaptcha) {
        const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
        if (siteKey && siteKey !== 'undefined' && siteKey !== '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
          try {
            recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'submit_contact' });
            console.log('reCAPTCHA token obtained');
          } catch (recaptchaError) {
            console.warn('reCAPTCHA failed:', recaptchaError);
          }
        }
      }

      // Send form data to backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Ett fel uppstod när meddelandet skulle skickas.';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If it's not JSON, handle common HTTP errors
          if (response.status === 404) {
            errorMessage = 'API-endpoint hittades inte. Kontakta oss direkt på hampaoasen@gmail.com';
          } else if (response.status === 500) {
            errorMessage = 'Serverfel: E-posttjänsten är temporärt otillgänglig. Försök igen senare.';
          } else {
            errorMessage = `HTTP ${response.status}: ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Success response
      const result = await response.json();
      console.log('Form submitted successfully:', result);

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        area: '',
        message: ''
      });
      
      setTimeout(() => setIsSubmitted(false), 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Ett fel uppstod när meddelandet skulle skickas. Försök igen eller kontakta oss direkt på hampaoasen@gmail.com');
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const services = [
    'Etablering av hampaareal',
    'Etablering av äng genom hampametoden',
    'Rådgivning biologisk mångfald',
    'Grönyteskötsel',
    'Utbildning och föredrag',
    'Annat'
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'E-post',
      value: 'hampaoasen@gmail.com',
      link: 'mailto:hampaoasen@gmail.com'
    },
    {
      icon: MapPin,
      title: 'Verksamhetsområde',
      value: 'Regionalt med utgångspunkt Göteborg',
      description: 'Västra Götaland, Bohuslän, Halland'
    },
    {
      icon: CheckCircle,
      title: 'Kostnadsfri offert',
      value: 'Alltid',
      description: 'Ingen kostnad för offert och rådgivning'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-hemp-900 mb-6">
            Kontakta oss!
          </h2>
          <p className="text-xl text-hemp-700 leading-relaxed">
            Tveka inte att ta kontakt med oss vid intresse av rådgivning kring biologisk mångfald eller etablering av hampaareal. Kostnadsfri offert ingår alltid.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-hemp-900 mb-6">
                Kontaktinformation
              </h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-hemp-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-hemp-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-hemp-900 mb-1">
                        {info.title}
                      </h4>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-hemp-700 hover:text-hemp-900 transition-colors duration-200"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <div className="text-hemp-700">{info.value}</div>
                      )}
                      {info.description && (
                        <p className="text-sm text-hemp-600 mt-1">
                          {info.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-hemp-600 to-hemp-700 p-6 rounded-xl text-white">
              <h4 className="text-lg font-semibold mb-4">
                Vad ingår i vår service?
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-hemp-300" />
                  <span className="text-hemp-100">Kostnadsfri offert</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-hemp-300" />
                  <span className="text-hemp-100">Personlig rådgivning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-hemp-300" />
                  <span className="text-hemp-100">Komplett juridisk hantering</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-hemp-300" />
                  <span className="text-hemp-100">Utbildning</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-hemp-100">
              <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="w-6 h-6 text-hemp-600" />
                <h3 className="text-xl font-semibold text-hemp-900">
                  Skicka meddelande
                </h3>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-green-700 mb-2">
                    Tack för ditt meddelande!
                  </h4>
                  <p className="text-green-600">
                    Vi återkommer till dig inom 24 timmar.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-red-700 text-sm">
                        <p>{error}</p>
                        <p className="mt-2 font-medium">
                          Du kan alltid kontakta oss direkt på:{' '}
                          <a href="mailto:hampaoasen@gmail.com" className="underline">
                            hampaoasen@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-hemp-900 mb-2">
                        Namn *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ditt namn"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-hemp-900 mb-2">
                        E-post *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                        placeholder="din@email.se"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-hemp-900 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                        placeholder="070-123 45 67"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-hemp-900 mb-2">
                        Organisation/Företag
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                        placeholder="Företag/Organisation"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-hemp-900 mb-2">
                        Intresserad av
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Välj tjänst</option>
                        {services.map((service, index) => (
                          <option key={index} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-hemp-900 mb-2">
                        Ytans storlek
                      </label>
                      <input
                        type="text"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                        placeholder="t.ex. 100 kvm, 2 hektar"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-hemp-900 mb-2">
                      Meddelande *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200 resize-vertical"
                      placeholder="Beskriv ert projekt och era behov..."
                    ></textarea>
                  </div>

                  {/* reCAPTCHA Info */}
                  {recaptchaLoaded && (
                    <div className="text-xs text-hemp-600 text-center">
                      Detta formulär är skyddad av reCAPTCHA och Googles{' '}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                        integritetspolicy
                      </a>{' '}
                      och{' '}
                      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
                        användarvillkor
                      </a>{' '}
                      gäller.
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-hemp-600">
                      * Obligatoriska fält
                    </p>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Skickar...' : 'Skicka meddelande'}
                      <Send className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;