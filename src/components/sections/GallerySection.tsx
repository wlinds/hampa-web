import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const GallerySection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    {
      src: '/images/hemp-field-3.jpeg',
      alt: 'Stort hampafält med frisk grön vegetation under blå himmel',
      title: 'Etablerat hampafält',
      description: 'Ett exempel på vårt arbete med storskalig hampakultivering'
    },
    {
      src: '/images/hemp-field-1.jpeg',
      alt: 'Närbild av hampaplanta med karakteristisk bladform',
      title: 'Industrihampa i detalj',
      description: 'Cannabis Sativa som industrihampa'
    },
    {
      src: '/images/hemp-field-2.jpeg',
      alt: 'Hampafält sett från låg vinkel mot himlen',
      title: 'Hampans bindningskraft',
      description: 'Hampan binder 9-15 ton koldioxid på bara en säsong, lika mycket som en ung skog.'
    },
    {
      src: '/images/garden-strawberries.jpg',
      alt: 'Jordgubbsplantor i blomning med vita blommor',
      title: 'Biologisk mångfald',
      description: 'Främjande av inhemska växter och pollinatörer'
    },
    {
      src: '/images/garden-flowers.jpg',
      alt: 'Lila blommor i trädgårdsmiljö',
      title: 'Grönyteskötsel',
      description: 'Estetisk och ekologisk trädgårdsdesign'
    },
    {
      src: '/images/garden-mixed.jpg',
      alt: 'Blandad trädgård med olika växter och blommor',
      title: 'Hållbar odling',
      description: 'Ekologiska metoder för diversifierade grönytor'
    }
  ];

  const openModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-white to-hemp-50">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-hemp-900 mb-6">
            Vårt arbete i bilder
          </h2>
          <p className="text-l text-hemp-700 leading-relaxed">
            Se exempel på våra hampafält, biologisk mångfald och grönyteskötsel från verkliga projekt.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => openModal(index)}
            >
              <div className="aspect-w-4 aspect-h-3 relative">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23dcf2dc'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16' fill='%233b9b3b'%3E${encodeURIComponent(image.title)}%3C/text%3E%3C/svg%3E`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-200">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative">
                <img
                  src={images[selectedImage].src}
                  alt={images[selectedImage].alt}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 rounded-b-lg">
                  <h3 className="text-xl font-semibold mb-2">
                    {images[selectedImage].title}
                  </h3>
                  <p className="text-gray-200">
                    {images[selectedImage].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;