# GpexLog — Web Prototype

Web prototype for photo-based proof of delivery with GPS, timestamps, product catalog, Google Maps address/ETA, heatmaps, driver routes, and delivery-time analytics. Built for the U.S. market (English UI, USD pricing).

## Run locally

Requires Node.js 20+. With nvm:

```bash
nvm use 22
npm install
npm run dev
```

Optional — enable live Google autocomplete and traffic-aware ETA:

```bash
cp .env.example .env
# set VITE_GOOGLE_MAPS_API_KEY=your_key
```

## Included

- **Products** catalog (name, SKU, price, weight)
- **Shipments** with QR/barcode pickup + delivery photo flow
- **Maps**: heatmap, driver routes, live monitoring
- **Analytics**: ETA vs actual delivery time
- **Proofs**: pickup and drop-off photo gallery
- Free / Pro / Pro Max billing (USD)

## Delivery proof flow

1. Create shipment from a catalog product
2. At warehouse: scan QR/barcode + take pickup photo
3. En route: ETA / GPS monitoring on Maps
4. At address: take delivery photo → shipment marked delivered

In the prototype, open a shipment and use **Simulate QR scan + pickup photo** / **Simulate delivery photo**.

## Suggested demo path

1. Sign in → **Products**
2. **Shipments** → open `DLV-1042` to see both photos
3. Open a pending shipment and simulate the scan → delivery flow
4. **Maps** → Heatmap / Driver routes / Live monitoring
5. **Analytics** → delivery time distribution and ETA vs actual
