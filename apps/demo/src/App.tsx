import { useEffect, useState } from 'react';
import { useTracker, usePageStay, useExposure, TrackedButton, TrackedPage, TrackedForm } from 'sdk-sample';
import { setMockLogCallback } from './mock/mock-adapter';

// interface MockLog removed (unused)

// --- Sub-components for Demo ---

// A component that tracks how long it stays visible (Exposure)
const PromotionBanner = () => {
  const ref = useExposure('promo-banner-001', 'Winter Sale Banner');
  
  return (
    <div ref={ref} style={{ 
      padding: '40px', 
      background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)', 
      borderRadius: '8px',
      color: 'white',
      textAlign: 'center',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      <h3>🔥 Hot Deal: 50% OFF!</h3>
      <p>Scroll past this to trigger Exposure event (on exit or unmount)</p>
    </div>
  );
};

// A component that tracks page stay duration
const ProductPage = ({ onClose }: { onClose: () => void }) => {
  usePageStay(); // Start timer on mount, send event on unmount
  
  return (
    <TrackedPage pageTitle="Product: Wireless Headphones">
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Product: Wireless Headphones</h3>
            <button onClick={onClose} style={{ padding: '5px 10px' }}>Close Page</button>
        </div>
        <p>Viewing this component tracks "Page Stay". Mounting it tracked "Page View".</p>
        <div style={{ height: '200px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [Product Image Placeholder]
        </div>
        </div>
    </TrackedPage>
  );
};

// Mock Remote Config (JSON)
const REMOTE_CONFIG: any = {
  version: '1.1.0',
  events: {
    dynamic_promo_click: {
        priority: 'high',
        params: { promoId: { type: 'string' }, location: { type: 'string' } }
    }
  }
};

// --- Main App ---

function App() {
  const tracker = useTracker();
  const [logs, setLogs] = useState<any[]>([]);
  const [showProduct, setShowProduct] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Subscribe to mock API logs
    setMockLogCallback((log) => {
      setLogs((prev) => [log, ...prev]);
    });
  }, []);

  const handlePurchase = () => {
    // Level 3: Business Conversion
    // This is defined as priority: 'high' in Schema, so it will be immediate even if we don't pass 'true'
    // But we can still force it if we want.
    tracker.trackEvent('purchase', {
        orderId: `ORD-${Date.now()}`,
        amount: 99.99,
        currency: 'USD',
        items: ['wireless-headphones']
    });
    alert('Purchase Event Sent (Priority High = Immediate)');
  };

  const handleInvalidEvent = () => {
      // @ts-ignore - TS will error during compile, but we simulate runtime call for Safe Mode demo
      tracker.trackEvent('unknownEvent', { foo: 'bar' });
      alert('Check Console! If debug=true, it throws. If debug=false, it warns safely.');
  };

  const handleLoadConfig = () => {
      tracker.loadSchema(REMOTE_CONFIG);
      setConfigLoaded(true);
      alert('Remote Schema Loaded! "dynamic_promo_click" is now a valid event.');
  };

  const handleDynamicEvent = () => {
      // This event is NOT in the default schema.
      // It will fail validation until handleLoadConfig is called.
      try {
        tracker.trackEvent('dynamic_promo_click', {
            promoId: 'SUMMER_2025',
            location: 'header_banner'
        });
        if (configLoaded) {
            alert('Dynamic Event Sent Successfully!');
        } else {
            alert('Event Sent (Check logs - if strict mode is on, this might have failed silently or warned)');
        }
      } catch (e) {
          alert('Event Failed: ' + e);
      }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '20px', height: '100vh', overflow: 'hidden' }}>
      
      {/* Left Panel: Content (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Tracking SDK Demo (Safe Mode & Dynamic Config)</h1>
        
        {/* Level 1: Page Data */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#007bff' }}>Level 1: Page & Exposure</h2>
          <p>Tracks PV (auto), Stay Duration, and Component Exposure.</p>
          
          <div style={{ marginBottom: '15px' }}>
             <button onClick={() => setShowProduct(!showProduct)}>
                {showProduct ? 'Close Product Page' : 'Open Product Page'}
             </button>
          </div>

          {showProduct && <ProductPage onClose={() => setShowProduct(false)} />}
          
          <div style={{ marginTop: '20px', padding: '10px', background: '#e9ecef', borderRadius: '4px' }}>
             <strong>Scroll down to see the Exposure Demo 👇</strong>
          </div>
        </div>

        {/* Level 2: User Behavior */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#28a745' }}>Level 2: User Behavior</h2>
          <p>Tracks interactions like Clicks and Operation Paths.</p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <TrackedButton 
                buttonName="Add to Cart"
                eventId="btn-add-cart" 
                extraParams={{ sku: 'WH-1000XM4', price: 299 }}
                style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Add to Cart
            </TrackedButton>

            <TrackedButton 
                buttonName="Share Product"
                eventId="btn-share"
                extraParams={{ platform: 'twitter' }}
                style={{ padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Share Product
            </TrackedButton>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4>Tracked Form Demo</h4>
            <TrackedForm 
                formId="subscribe-form" 
                style={{ display: 'flex', gap: '10px' }}
                onSubmit={() => alert('Form Submitted & Tracked!')}
            >
                <input name="email" type="email" placeholder="Enter email" required style={{ padding: '8px' }} />
                <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Subscribe</button>
            </TrackedForm>
          </div>
        </div>

        {/* Level 3: Business Conversion */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#dc3545' }}>Level 3: Business Conversion</h2>
          <p>Tracks key results like Payment and Purchase.</p>
          
          <div style={{ padding: '20px', border: '2px dashed #dc3545', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Total: $99.99</p>
            <button 
                onClick={handlePurchase}
                style={{ padding: '12px 24px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em' }}
            >
                Confirm Purchase
            </button>
            <p style={{fontSize: '0.8em', color: '#666', marginTop: '10px'}}>
                (Defined as 'High Priority' in Schema, auto-triggers immediate send)
            </p>
          </div>
        </div>

        {/* Dynamic Config Demo */}
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #6610f2', borderRadius: '8px' }}>
            <h2 style={{ color: '#6610f2' }}>Dynamic Config (No SDK Release)</h2>
            <p>1. Try to trigger a dynamic event (will fail/warn initially).</p>
            <p>2. Load Remote Schema (simulates fetching JSON).</p>
            <p>3. Trigger again (will succeed).</p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={handleLoadConfig}
                    disabled={configLoaded}
                    style={{ padding: '10px 20px', background: configLoaded ? '#ccc' : '#6610f2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {configLoaded ? 'Schema Loaded' : 'Load Remote Schema'}
                </button>

                <button 
                    onClick={handleDynamicEvent}
                    style={{ padding: '10px 20px', background: '#fff', color: '#6610f2', border: '1px solid #6610f2', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Trigger "dynamic_promo_click"
                </button>
            </div>
        </div>

        {/* Robustness Test */}
        <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #f0ad4e', borderRadius: '8px' }}>
            <h2 style={{ color: '#f0ad4e' }}>Robustness Test (Safe Mode)</h2>
            <p>Try to send an invalid event that violates the Schema.</p>
            <button 
                onClick={handleInvalidEvent}
                style={{ padding: '10px 20px', background: '#f0ad4e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Trigger Invalid Event
            </button>
        </div>

        {/* Spacer for Scrolling */}
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
            Scroll down for more content...
        </div>

        {/* Exposure Demo */}
        <PromotionBanner />
        
        <div style={{ height: '200px' }}></div>
      </div>

      {/* Right Panel: Logs (Fixed) */}
      <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2>Mock Server Logs</h2>
        <div style={{ flex: 1, background: '#1e1e1e', color: '#d4d4d4', padding: '15px', overflowY: 'auto', borderRadius: '8px', fontFamily: 'Consolas, monospace' }}>
            {logs.length === 0 && <p style={{ color: '#888' }}>Waiting for events...</p>}
            {logs.map((log, index) => {
                let color = '#d4d4d4';
                const eventName = log.payload?.eventName || (Array.isArray(log.payload) ? 'Batch' : 'Unknown');
                
                // Color coding by Level
                if (['pageView', 'pageStay', 'exposure'].includes(eventName)) color = '#61dafb'; // Level 1 (Blue)
                else if (['buttonClick', 'formSubmit'].includes(eventName)) color = '#98c379'; // Level 2 (Green)
                else if (['purchase'].includes(eventName)) color = '#e06c75'; // Level 3 (Red)
                else if (['dynamic_promo_click'].includes(eventName)) color = '#6610f2'; // Dynamic (Purple)

                return (
                    <div key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold', color: '#c678dd' }}>[{log.type}]</span>
                            <span>{log.timestamp.split('T')[1].split('.')[0]}</span>
                        </div>
                        <div style={{ color: color, fontWeight: 'bold', marginBottom: '5px' }}>
                            Event: {eventName}
                        </div>
                        <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap', color: '#abb2bf' }}>
                            {JSON.stringify(log.payload, null, 2)}
                        </pre>
                    </div>
                );
            })}
        </div>
        <div style={{ marginTop: '10px' }}>
            <button onClick={() => setLogs([])} style={{ padding: '5px 10px', cursor: 'pointer' }}>Clear Logs</button>
        </div>
      </div>
    </div>
  );
}

export default App;
