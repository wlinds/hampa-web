import React, { useEffect, useState } from 'react';
import { AlertCircle, Calculator, MapPin, Leaf, TreePine, Bug, Search, Trash2, Eye, HelpCircle } from 'lucide-react';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    calculatorMap: any;
    calculatorGeocoder: any;
    calculatorDrawingManager: any;
    calculatorDrawnShapes: any[];
  }
}

const HempCalculatorPage: React.FC = () => {
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [totalArea, setTotalArea] = useState(0);
  const [areaHectares, setAreaHectares] = useState(0);
  const [co2Binding, setCo2Binding] = useState({ min: 0, max: 0, avg: 0 });
  const [hempSeeds, setHempSeeds] = useState({ min: 0, max: 0, avg: 0 });
  const [showInstructions, setShowInstructions] = useState(false);

  const formatSwedishNumber = (num: number, decimals: number = 0): string => {
    return num.toLocaleString('sv-SE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeCalculator();
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setMapError('Google Maps API-nyckel saknas. Kontakta oss för mer information.');
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,drawing&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Global callback function
    window.initMap = initializeCalculator;

    script.onerror = () => {
      setMapError('Kunde inte ladda Google Maps. Kontrollera din internetanslutning.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      if ((window as any).initMap) {
        (window as any).initMap = undefined;
      }
    };
  }, []);

  const initializeCalculator = () => {
    try {
      if (!window.google?.maps) {
        setMapError('Google Maps kunde inte initieras.');
        return;
      }

      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: 57.7089, lng: 11.9746 }, // Gothenburg
        mapTypeId: 'satellite',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
      });

      const geocoder = new window.google.maps.Geocoder();
      const drawnShapes: any[] = [];

      const drawingManager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#5d7c47',
          fillOpacity: 0.3,
          strokeColor: '#2d5016',
          strokeWeight: 2,
          clickable: true,
          editable: true,
          zIndex: 1
        }
      });

      drawingManager.setMap(map);

      // Store references for global access
      window.calculatorMap = map;
      window.calculatorGeocoder = geocoder;
      window.calculatorDrawingManager = drawingManager;
      window.calculatorDrawnShapes = drawnShapes;

      // Listen for polygon completion
      window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
        drawnShapes.push(polygon);
        calculateArea();
        drawingManager.setDrawingMode(null);

        // Add listeners for polygon changes
        window.google.maps.event.addListener(polygon.getPath(), 'set_at', calculateArea);
        window.google.maps.event.addListener(polygon.getPath(), 'insert_at', calculateArea);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Ett fel uppstod vid initiering av kartan.');
    }
  };

  const calculateArea = () => {
    if (!window.calculatorDrawnShapes || !window.google?.maps?.geometry) return;

    let totalAreaMeters = 0;
    window.calculatorDrawnShapes.forEach((polygon: any) => {
      const path = polygon.getPath();
      const area = window.google.maps.geometry.spherical.computeArea(path);
      totalAreaMeters += area;
    });

    const hectares = totalAreaMeters / 10000;
    
    const co2Min = hectares * 9;
    const co2Max = hectares * 15;
    const co2Avg = hectares * 12;
    
    const seedsMin = Math.round(hectares * 500);
    const seedsMax = Math.round(hectares * 1200);
    const seedsAvg = Math.round(hectares * 850);

    setTotalArea(totalAreaMeters);
    setAreaHectares(hectares);
    setCo2Binding({ min: co2Min, max: co2Max, avg: co2Avg });
    setHempSeeds({ min: seedsMin, max: seedsMax, avg: seedsAvg });
  };

  const searchAddress = () => {
    if (!window.calculatorGeocoder || !searchValue.trim()) return;

    window.calculatorGeocoder.geocode({
      'address': searchValue + ', Sweden',
      'region': 'SE'
    }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        window.calculatorMap.setCenter(results[0].geometry.location);
        window.calculatorMap.setZoom(16);

        new window.google.maps.Marker({
          map: window.calculatorMap,
          position: results[0].geometry.location,
          title: searchValue,
          animation: window.google.maps.Animation.DROP
        });
      } else {
        alert('Adress kunde inte hittas. Försök med en mer specifik adress.');
      }
    });
  };

  const startDrawing = () => {
    if (window.calculatorDrawingManager) {
      window.calculatorDrawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const clearDrawings = () => {
    if (window.calculatorDrawnShapes) {
      window.calculatorDrawnShapes.forEach((shape: any) => shape.setMap(null));
      window.calculatorDrawnShapes.length = 0;
      setTotalArea(0);
      setAreaHectares(0);
      setCo2Binding({ min: 0, max: 0, avg: 0 });
      setHempSeeds({ min: 0, max: 0, avg: 0 });
    }
  };

  const toggleMapType = () => {
    if (window.calculatorMap) {
      const currentType = window.calculatorMap.getMapTypeId();
      window.calculatorMap.setMapTypeId(currentType === 'satellite' ? 'hybrid' : 'satellite');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAddress();
    }
  };

  const benefits = [
    {
      icon: TreePine,
      title: 'Kolbindning',
      description: '9-15 ton CO₂ per hektar - lika mycket som en ung skog på bara en säsong'
    },
    {
      icon: Bug,
      title: 'Pollination',
      description: 'Stor mängd pollen som främjar vitalitet hos pollinatörer'
    },
    {
      icon: Leaf,
      title: 'Snabb tillväxt',
      description: '120 dagar från frö till skörd - en av de snabbaste växande grödorna'
    }
  ];

  const sendContactEmail = () => {
    const subject = 'Intresserad av hampakultivering - Arealkalkylator';
    const body = `Hej!

Jag har använt er arealkalkylator på hampaoasen.se och är intresserad av att etablera hampaareal.

Mina beräkningar:
- Total area: ${formatSwedishNumber(Math.round(totalArea))} m²
- Area i hektar: ${formatSwedishNumber(areaHectares, 2)}
- Uppskattad CO₂ bindning: ${formatSwedishNumber(co2Binding.min, 1)}-${formatSwedishNumber(co2Binding.max, 1)} ton per säsong
- Uppskattad hampfrön: ${formatSwedishNumber(hempSeeds.min)}-${formatSwedishNumber(hempSeeds.max)} kg per säsong

Jag skulle gärna få en kostnadsfri offert och mer information om era tjänster.

Med vänliga hälsningar`;

    window.open(`mailto:hampaoasen@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="pt-16 pb-8 bg-gradient-to-b from-hemp-50 to-white min-h-screen">
      <div className="container mx-auto px-4 lg:px-6">
        {/* SEO Header - Hidden but accessible */}
        <div className="sr-only">
          <h1>Hampaareal Kalkylator - Beräkna CO₂-bindning och Avkastning</h1>
          <p>Professionell arealberäkning för hampakultivering i Sverige. Beräkna kolbindning, fröskörd och miljöfördelar med satellitbilder. Kostnadsfri offert från Hampaoasen - specialister på laglig hamparodling och biodiversitet.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-hemp-100 p-4 md:p-8 mb-8 mt-8">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
            <div>
              <label htmlFor="address-input" className="block text-sm font-medium text-hemp-900 mb-2">
                Sök efter din fastighet
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  id="address-input" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ange adress (t.ex. 'Göteborg' eller 'Varekil, Orust')"
                  className="w-full sm:flex-1 px-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200 h-12 text-sm"
                />
                <button 
                  onClick={searchAddress}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-hemp-600 text-white rounded-lg hover:bg-hemp-700 transition-colors font-medium flex items-center justify-center space-x-2 h-12"
                >
                  <Search className="w-4 h-4" />
                  <span>Sök</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-hemp-900 mb-2">
                Ritverktyg
              </label>
              <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-3 lg:flex-nowrap">
                <button 
                  onClick={startDrawing}
                  className="px-2 md:px-3 py-3 bg-hemp-600 text-white rounded-lg hover:bg-hemp-700 transition-colors font-medium flex items-center justify-center space-x-1 md:space-x-2 h-12 text-xs md:text-sm min-w-0 flex-1 md:flex-initial"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Rita Area</span>
                </button>
                <button 
                  onClick={clearDrawings}
                  className="px-2 md:px-3 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-1 md:space-x-2 h-12 text-xs md:text-sm min-w-0 flex-1 md:flex-initial"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Rensa</span>
                </button>
                <button 
                  onClick={toggleMapType}
                  className="px-2 md:px-3 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-1 md:space-x-2 h-12 text-xs md:text-sm min-w-0 flex-1 md:flex-initial"
                >
                  <Eye className="w-4 h-4" />
                  <span>Växla Vy</span>
                </button>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="px-2 md:px-3 py-3 bg-hemp-500 text-white rounded-lg hover:bg-hemp-600 transition-colors font-medium flex items-center justify-center space-x-1 md:space-x-2 h-12 text-xs md:text-sm min-w-0 flex-1 md:flex-initial"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Instruktioner</span>
                </button>
              </div>
            </div>
          </div>

          {showInstructions && (
            <div className="bg-hemp-50 rounded-lg border border-hemp-100 p-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-hemp-900 mb-4">Så här använder du kalkylatorn</h3>
              <ol className="list-decimal list-inside space-y-2 text-hemp-700">
                <li>Sök efter din fastighet i sökrutan ovan</li>
                <li>Klicka på "Rita Area" och rita runt området där du vill odla hampa</li>
                <li>Se direkta beräkningar av area och miljöfördelar i panelen</li>
                <li>Kontakta oss för kostnadsfri offert baserat på dina beräkningar</li>
              </ol>
            </div>
          )}
        </div>

        {/* Map and Calculations Side by Side */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-hemp-100 overflow-hidden">
              {mapError ? (
                <div className="h-96 flex items-center justify-center bg-gray-50">
                  <div className="text-center p-6">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kunde inte ladda karta</h3>
                    <p className="text-gray-600 text-sm mb-3">{mapError}</p>
                    <p className="text-xs text-gray-500">
                      Kontakta oss på{' '}
                      <a href="mailto:hampaoasen@gmail.com" className="text-hemp-600 underline">
                        hampaoasen@gmail.com
                      </a>
                      {' '}för hjälp.
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  id="map" 
                  className="h-[640px] w-full"
                  style={{ minHeight: '640px' }}
                />
              )}
            </div>
          </div>

          {/* Calculations Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-hemp-100 p-4">
              <h3 className="text-lg font-semibold text-hemp-900 mb-4">Beräkningar</h3>
              
              {totalArea === 0 ? (
                <div className="text-center py-6">
                  <Calculator className="w-12 h-12 text-hemp-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-hemp-700 mb-2">Redo att börja?</h4>
                  <p className="text-sm text-hemp-600 mb-4">
                    Rita runt området för att se beräkningar.
                  </p>
                  <button 
                    onClick={startDrawing}
                    className="px-4 py-2 bg-hemp-600 text-white rounded-lg hover:bg-hemp-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2 mx-auto"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Rita area</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Area Cards */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-hemp-100 via-hemp-50 to-white p-4 shadow-sm">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-hemp-200/20 rounded-full -mr-8 -mt-8"></div>
                    <div className="relative">
                      <div className="text-xs font-semibold text-hemp-700 mb-1 uppercase tracking-wide">Total Area</div>
                      <div className="text-2xl font-bold text-hemp-900 mb-1">{formatSwedishNumber(Math.round(totalArea))}</div>
                      <div className="text-xs text-hemp-600 font-medium">kvadratmeter</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-hemp-200 via-hemp-100 to-hemp-50 p-4 shadow-sm">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-hemp-300/15 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative">
                      <div className="text-xs font-semibold text-hemp-800 mb-1 uppercase tracking-wide">Hektar</div>
                      <div className="text-2xl font-bold text-hemp-900 mb-1">{formatSwedishNumber(areaHectares, 2)}</div>
                      <div className="text-xs text-hemp-700 font-medium">hektar odlingsarea</div>
                    </div>
                  </div>

                  {/* Environmental Impact Cards */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-green-50 to-white p-4 shadow-sm">
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-200/10 rounded-full -ml-12 -mb-12"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
                    <div className="relative">
                      <div className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">CO₂-Bindning</div>
                      <div className="text-lg font-bold text-green-900 mb-1">
                        {formatSwedishNumber(co2Binding.min, 1)} - {formatSwedishNumber(co2Binding.max, 1)}
                      </div>
                      <div className="text-xs text-green-600 font-medium mb-1">ton per säsong</div>
                      <div className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full inline-block">
                        Snittvärde {formatSwedishNumber(co2Binding.avg, 1)} ton
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-50 to-white p-4 shadow-sm">
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-amber-200/10 rounded-full -mr-10 -mb-10"></div>
                    <div className="absolute top-2 left-2 w-2 h-2 bg-amber-400 rounded-full shadow-lg"></div>
                    <div className="absolute top-3 left-5 w-1 h-1 bg-amber-300 rounded-full"></div>
                    <div className="relative">
                      <div className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">Hampafrön</div>
                      <div className="text-lg font-bold text-amber-900 mb-1">
                        {formatSwedishNumber(hempSeeds.min)} - {formatSwedishNumber(hempSeeds.max)}
                      </div>
                      <div className="text-xs text-amber-600 font-medium mb-1">kg per säsong</div>
                      <div className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-full inline-block">
                        Snittvärde {formatSwedishNumber(hempSeeds.avg)} kg
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {totalArea > 0 && (
                <button
                  onClick={sendContactEmail}
                  className="w-full mt-4 px-4 py-2 bg-hemp-600 text-white rounded-lg hover:bg-hemp-700 transition-colors text-sm font-medium"
                >
                  Kontakta oss för offert
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-hemp-600 to-hemp-700 rounded-2xl p-6 text-white mb-8">
          <h3 className="text-xl font-bold mb-6">Miljöfördelar med hampa</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-hemp-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-hemp-100 mb-1">{benefit.title}</div>
                  <div className="text-sm text-hemp-200">{benefit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Calculation Methodology */}
          <div className="bg-hemp-50 border border-hemp-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-hemp-900 mb-4 flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>Så räknar vi</span>
            </h4>
            <div className="space-y-4 text-sm text-hemp-700">
              <div>
                <div className="font-semibold text-green-700 mb-1">CO₂ Bindning (9-15 ton/hektar)</div>
                <p>Baserat på hampans snabba tillväxt och höga biomassa. Varierar med jordtyp, väderförhållanden och skötselmetoder.</p>
              </div>
              <div>
                <div className="font-semibold text-amber-700 mb-1">Fröskörd (500-1200 kg/hektar)</div>
                <p>Beror på hampasort, odlingsförhållanden och skötsel. Industrihampa av sort Finola ger typiskt 600-1000 kg/hektar.</p>
              </div>
              <div>
                <div className="font-semibold text-hemp-700 mb-1">Odlingstid</div>
                <p>120 dagar från sådd till skörd (maj-augusti). En av världens snabbast växande grödor.</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-2">Viktigt att veta:</div>
                <p>Detta är uppskattningar baserade på genomsnittsvärden. Faktisk avkastning beror på jordtyp, klimat och skötsel. SAM-ansökan krävs för laglig odling av hampa i Sverige.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-hemp-600 to-hemp-700 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-3">Intresserad av att etablera hampaareal?</h3>
          <p className="text-hemp-100 mb-4 max-w-2xl mx-auto">
            Vi sköter allt från SAM-ansökan till skörd. Kostnadsfri offert och rådgivning ingår alltid.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={sendContactEmail}
              className="bg-white text-hemp-700 font-semibold px-6 py-2 rounded-lg hover:bg-hemp-50 transition-colors shadow-lg"
            >
              Kontakta oss för offert
            </button>
            <a
              href="/#services"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/#services';
              }}
              className="text-hemp-100 hover:text-white transition-colors underline text-sm"
            >
              Läs mer om våra tjänster
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HempCalculatorPage;