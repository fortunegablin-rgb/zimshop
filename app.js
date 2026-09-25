// ZimShop analytics engine
// This demo logs analytics events to the browser console and localStorage.
// It is deliberately simple so students can see exactly what is being collected.

const SESSION_KEY="zimshop_session";
const USER_KEY="zimshop_user";
const EVENT_KEY="zimshop_events";

if(!sessionStorage.getItem(SESSION_KEY)){
  sessionStorage.setItem(SESSION_KEY,"S"+Date.now());
}
if(!localStorage.getItem(USER_KEY)){
  localStorage.setItem(USER_KEY,"U"+Math.random().toString(36).slice(2,10));
}

function trackEvent(eventName, properties={}){
  const event={
    event:eventName,
    timestamp:new Date().toISOString(),
    user_id:localStorage.getItem(USER_KEY),
    session_id:sessionStorage.getItem(SESSION_KEY),
    page:location.pathname,
    device_width:window.innerWidth,
    ...properties
  };
  const events=JSON.parse(localStorage.getItem(EVENT_KEY)||"[]");
  events.push(event);
  localStorage.setItem(EVENT_KEY,JSON.stringify(events));
  console.log("ANALYTICS EVENT:",event);

  // ---- Send the same event to Google Analytics 4 -------------------------
  // gtag() and GA_MEASUREMENT_ID come from the snippet in the <head> of each
  // page. Until you replace G-XXXXXXXXXX with your real Measurement ID, this
  // block stays switched off.
  if(gaIsLive() && typeof gtag === "function"){
    // GA4 already records page_view by itself (gtag('config') plus Enhanced
    // Measurement), so forwarding ours would double-count it.
    if(eventName !== "page_view"){
      const gaProps = Object.assign({}, properties, {
        page_location: location.href,
        page_path: location.pathname,
        demo_user_id: event.user_id,
        demo_session_id: event.session_id
      });
      // GA4 needs value + currency together to report revenue.
      if(typeof gaProps.value === "number") gaProps.currency = "USD";
      gtag("event", eventName, gaProps);
    }
  }

  // OPTIONAL WOOPRA INTEGRATION:
  // Once Woopra is installed, this can be changed to:
  // if(window.woopra) woopra.track(eventName, properties);
}

// True only once a real Measurement ID replaces the placeholder.
function gaIsLive(){
  try{
    return typeof GA_MEASUREMENT_ID === "string"
      && /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID)
      && GA_MEASUREMENT_ID.indexOf("XXXX") === -1;
  }catch(e){
    return false;   // snippet not present on this page
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  trackEvent("page_view",{title:document.title});
  updateCartCount();
});

function getCart(){
  return JSON.parse(localStorage.getItem("cart")||"[]");
}

function addToCart(product,quantity){
  const cart=getCart();
  const existing=cart.find(x=>x.id===product.id);
  if(existing) existing.quantity+=quantity;
  else cart.push({...product,quantity});
  localStorage.setItem("cart",JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){
  const el=document.getElementById("cartCount");
  if(el) el.textContent=getCart().reduce((s,x)=>s+x.quantity,0);
}

// Useful for the lecturer/student during practicals:
// Open browser DevTools → Console and run:
// JSON.parse(localStorage.getItem("zimshop_events"))
function getAnalyticsEvents(){
  return JSON.parse(localStorage.getItem(EVENT_KEY)||"[]");
}
