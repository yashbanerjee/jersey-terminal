export default function ShippingPage() {
  return (
    <div className="jt-page jt-container w-full max-w-4xl">
      <h1 className="jt-display text-5xl tracking-wide">
        Shipping &amp; customs
      </h1>
      <div className="prose prose-invert mt-8 max-w-none text-sm text-jt-muted">
        <p>
          UAE deliveries are handled primarily via Aramex. International express
          uses DHL where your courier account supports the destination.
        </p>
        <h2>Zones</h2>
        <ol>
          <li>UAE — all seven emirates</li>
          <li>GCC</li>
          <li>UK &amp; Europe</li>
          <li>USA &amp; Canada</li>
          <li>Asia-Pacific</li>
          <li>Rest of world</li>
        </ol>
        <h2>Duties</h2>
        <p>
          Customs arrangement (DAP or DDP) is configured in WordPress admin under
          WooCommerce → JT Sports. Unless DDP is enabled for your account,
          destination duties and taxes may be payable by the customer (DAP).
        </p>
        <h2>Payment</h2>
        <p>All orders are prepaid securely online via Stripe card payment.</p>
      </div>
    </div>
  );
}
