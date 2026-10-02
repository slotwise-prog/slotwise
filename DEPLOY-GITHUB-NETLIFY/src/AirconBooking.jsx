import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Snowflake, Wrench, Sparkles, MessageSquare, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { airconCategories, airconCategory, airconServiceOptions } from './aircon-config.mjs';
import './aircon.css';

const categoryIcons = [Wrench, Sparkles, ShieldCheck, MessageSquare];
const steps = ['Service', 'Details', 'Schedule', 'Location', 'Your Details', 'Review'];
const unitTypes = ['Split Type', 'Window Type', 'Window Type Inverter', 'U-Shape / Compact', 'Floor Mounted', 'Ceiling Suspended', 'Ceiling Cassette', 'Other / Not sure'];
const emptyForm = { units: '1', unitType: '', capacity: '', brand: '', unitCondition: 'Existing unit', concern: '', currentLocation: '', propertyType: 'Residential', areaSize: '', budget: '', serviceArea: '', address: '', landmark: '', customer: '', contact: '', email: '', notes: '', date: '', time: '' };

export default function AirconBooking({ business, onBack, onSaveBooking, helpers }) {
  const { calculateBookingTotal, formatPeso, formatDashboardPeso, getTodayDateValue, formatBookingDate, timeInputToDisplay, displayTimeToInput, isPastPreferredSchedule, isBusinessOpen24Hours, getPackageCapabilities, isDemoExpired } = helpers;
  const formatAirconPeso = formatDashboardPeso || formatPeso;
  const isKoolmate = business.slug === 'koolmate-aircon-services';
  const startsWithInquiry = isKoolmate && new URLSearchParams(window.location.search).get('mode') === 'inquiry';
  const [mode, setMode] = useState(startsWithInquiry ? 'quote' : 'service');
  const [category, setCategory] = useState(startsWithInquiry ? 'Aircon Sales / Quote' : '');
  const [serviceId, setServiceId] = useState('');
  const [installation, setInstallation] = useState('');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const pending = useRef(false);
  const panel = useRef(null);
  const flags = business.featureFlags || {};
  const capabilities = getPackageCapabilities(business.package, flags);
  const services = (business.serviceDetails || []).filter(service => service.status !== 'Inactive');
  const service = services.find(item => item.id === serviceId);
  const options = airconServiceOptions(business, service);
  const quote = mode === 'quote' || category === 'Aircon Sales / Quote';
  const units = Number(form.units);
  const calculation = calculateBookingTotal(service ? [service] : [], { units, perUnit: options.perUnit === true, allowQuoteWithoutPrice: true });
  const assessment = quote || !service || service.price == null || (units > 1 && !options.perUnit);
  const total = assessment ? null : calculation.estimatedTotal;
  const pricingLabel = total == null ? 'For Quotation' : formatAirconPeso(total);
  const available = business.availability || {};
  const configuredSlots = (available.slots || []).filter(Boolean);
  const anytime = isBusinessOpen24Hours(available);
  const hasSchedule = Boolean(anytime || configuredSlots.length);
  const blocked = capabilities.blockedDates && (available.blockedDates || []).some(item => item.blocked_date === form.date && item.active !== false);
  const allowedSlots = configuredSlots.filter(slot => !isPastPreferredSchedule(form.date, slot));
  const brand = flags.airconBrandName || business.business;
  const areas = flags.airconServiceAreas || ['Within service area', 'Nearby / Other Area'];
  const active = business.status === 'ACTIVE' || (business.status === 'DEMO' && !isDemoExpired(business));
  const patch = (field, value) => setForm(current => ({ ...current, [field]: value }));
  const move = next => { setStep(next); setError(''); panel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  const chooseMode = next => {
    setMode(next); setCategory(next === 'quote' ? 'Aircon Sales / Quote' : ''); setServiceId(''); setInstallation(''); setStep(0); setError('');
  };
  const chooseCategory = value => {
    setCategory(value); setMode(value === 'Aircon Sales / Quote' ? 'quote' : 'service'); setServiceId(''); setInstallation('');
  };
  const chooseService = item => {
    const config = airconServiceOptions(business, item);
    setServiceId(item.id);
    setForm(current => ({ ...current, unitType: config.unitType || '', capacity: config.capacity || '', concern: '', currentLocation: '' }));
  };
  const validate = index => {
    if (index === 0 && !service) return 'Choose a service or inquiry option.';
    if (index === 1) {
      if (!Number.isSafeInteger(units) || units < 1 || units > 100) return 'Enter a whole number of units from 1 to 100.';
      if (!form.unitType) return 'Select the aircon / unit type.';
      if (category === 'Repair & Maintenance' && !form.concern.trim()) return 'Describe the problem or concern.';
      if (options.relocation && !form.currentLocation.trim()) return 'Enter the current location of the unit.';
    }
    if (index === 2) {
      if (form.date && form.date < getTodayDateValue()) return 'Choose today or a future date.';
      if (blocked) return 'This date is unavailable. Please choose another date.';
      if (!quote && hasSchedule && (!form.date || !form.time)) return 'Choose your preferred date and time.';
      if (form.time && !form.date) return 'Choose a date for your preferred time.';
      if (form.date && form.time && isPastPreferredSchedule(form.date, form.time)) return 'Choose a future date and time.';
      if (!anytime && configuredSlots.length && form.time && !configuredSlots.includes(form.time)) return 'Choose a configured available time.';
    }
    if (index === 3 && (!form.serviceArea || form.address.trim().length < 5)) return 'Select the service area and enter your complete service address.';
    if (index === 4) {
      if (form.customer.trim().length < 2 || form.contact.replace(/\D/g, '').length < 10) return 'Enter your full name and a valid contact number.';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address or leave it blank.';
    }
    return '';
  };
  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    for (let i = 0; i <= step; i++) {
      const message = validate(i);
      if (message) { setStep(i); setError(message); return; }
    }
    if (step < 5) { move(step + 1); return; }
    if (!active || flags.localDemoOnly) { setError('This business is not accepting live requests yet. Please contact the business.'); return; }
    pending.current = true; setBusy(true); setError('');
    const details = {
      service_category: category, installation_option: options.installation || '', unit_type: form.unitType,
      capacity: form.capacity, number_of_units: units, brand_model: form.brand, unit_condition: form.unitCondition,
      issue_concern: category === 'Repair & Maintenance' ? form.concern : '',
      current_location: options.relocation ? form.currentLocation : '', property_type: form.propertyType,
      room_area: quote ? form.areaSize : '', budget_range: quote ? form.budget : '',
      service_area: form.serviceArea, service_location: form.address, landmark: form.landmark,
    };
    const basis = `${service.name}${options.perUnit ? ` / ${formatAirconPeso(service.price)} x ${units} unit${units > 1 ? 's' : ''}` : ` / ${units} unit${units > 1 ? 's' : ''}`}`;
    const lineItems = calculation.lineItems.map(item => ({ ...item, quantity: units, lineTotal: total, pricingType: 'FIXED' }));
    try {
      const result = await onSaveBooking({
        business: business.business, businessSlug: business.slug, business_slug: business.slug,
        customer: form.customer.trim(), contact: form.contact.trim(), service: service.name,
        booking_date: form.date || null, slot: form.time || 'Schedule to be coordinated',
        note: form.notes.trim(), status: 'PENDING', estimated_total: total,
        metadata: {
          booking_template: 'AIRCON_SERVICES', source: 'online', request_type: quote ? 'inquiry' : 'booking_request',
          customer_email: form.email.trim(), customer_address: form.address.trim(),
          estimated_total: total, calculated_price: total, pricing_status: assessment ? 'Assessment Required' : 'Calculated',
          pricing_basis: basis, line_items: lineItems, aircon_details: details,
          service_area: form.serviceArea, service_location: form.address,
          demo_booking: business.status === 'DEMO' || undefined, test_booking: business.status === 'DEMO' || undefined,
        }, bookingItems: lineItems,
      });
      if (!result?.id) throw new Error('The request was not confirmed by the database.');
      setSaved({ ...result, displayTotal: pricingLabel });
    } catch (failure) { setError(failure.message || 'Unable to save your request. Please try again.'); }
    finally { pending.current = false; setBusy(false); }
  };
  const input = (label, field, config = {}) => <label className="acField">{label}<input {...config} value={form[field]} onChange={event => patch(field, event.target.value)} /></label>;
  const select = (label, field, values, fixed = false) => <label className="acField">{label}<select value={form[field]} disabled={fixed} onChange={event => patch(field, event.target.value)}><option value="">Select an option</option>{values.map(value => <option key={value}>{value}</option>)}</select></label>;
  return <main className="acPage" style={{ '--ac-brand': business.primaryColor, '--ac-accent': business.accentColor }}>
    <header className="acTop">{isKoolmate ? <a href="https://koolmate.netlify.app/"><ArrowLeft size={16} /> Back to KOOLMATE Website</a> : <button onClick={onBack} type="button"><ArrowLeft size={16} /> Slotwise</button>}<a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}><Phone size={15} /> {business.phone}</a></header>
    <div className="acLayout">
      <aside className="acHero">
        {business.cover && <img className="acHeroImage" src={business.cover} alt="" />}
        <div className="acHeroShade" />
        <div className="acHeroContent">
          {business.logo && <img className="acLogo" src={business.logo} alt={`${brand} logo`} />}
          <p className="acEyebrow">AIR-CONDITIONING SERVICES &amp; MAINTENANCE</p>
          <h1>{brand}</h1><p className="acTagline">{flags.airconTagline || 'Comfort starts with reliable aircon care.'}</p>
          {flags.airconBrandLine && <strong className="acBrandLine">{flags.airconBrandLine}</strong>}
          <p className="acHeroIntro">{business.description}</p>
          <div className="acHeroActions"><a href="#aircon-request" onClick={() => chooseMode('service')}>Book a Service <ArrowRight size={16} /></a><a href="#aircon-request" onClick={() => chooseMode('quote')}>Request a Quote</a></div>
          <div className="acHighlights"><span>Residential &amp; Commercial</span><span>{areas.filter(area => !/other|nearby/i.test(area)).join(' / ')}</span><span>Installation / Cleaning / Repair / Maintenance</span></div>
          <div className="acContacts"><a href={`mailto:${business.primaryEmail}`}><Mail size={16} /> {business.primaryEmail}</a>{business.messengerLink && <a href={business.messengerLink} target="_blank" rel="noopener noreferrer"><MessageSquare size={16} /> Message {brand}</a>}<p><MapPin size={16} /> {business.address}</p></div>
        </div>
      </aside>
      <section className="acRequest" id="aircon-request" ref={panel}>
        {business.status === 'DEMO' && <p className="acNote">DEMO PREVIEW / Test submissions only.</p>}
        {saved ? <div className="acConfirmation" role="status"><Check size={40} /><p className="acEyebrow">REQUEST RECEIVED</p><h2>Thank you, {saved.customer}.</h2><p>{brand} will review and confirm your request.</p><dl><dt>Reference Number</dt><dd>{saved.id}</dd><dt>Selected Service</dt><dd>{saved.service}</dd><dt>Estimated Total</dt><dd>{saved.displayTotal}</dd><dt>Preferred Schedule</dt><dd>{saved.booking_date ? formatBookingDate(saved.booking_date) : 'To be coordinated'} {saved.slot}</dd></dl><button type="button" onClick={() => { setSaved(null); setForm(emptyForm); chooseMode('service'); }}>New Request</button></div> : <>
          <p className="acEyebrow">SERVICE REQUEST</p><h2>Let's get you comfortable.</h2><p className="acSubtitle">Choose a service or tell us about your aircon requirements.</p>
          <div className="acRequestContacts"><a href={`mailto:${business.primaryEmail}`}><Mail size={13} />{business.primaryEmail}</a>{business.messengerLink && <a href={business.messengerLink} target="_blank" rel="noopener noreferrer"><MessageSquare size={13} />Messenger</a>}</div>
          <div className="acMode" aria-label="Request type"><button type="button" aria-pressed={!quote} onClick={() => chooseMode('service')}><Wrench size={17} /> Book a Service</button><button type="button" aria-pressed={quote} onClick={() => chooseMode('quote')}><MessageSquare size={17} /> Request a Quote / Inquiry</button></div>
          <nav className="acProgress" aria-label="Booking progress">{steps.map((label, index) => <button key={label} type="button" disabled={index > step} onClick={() => move(index)} aria-current={step === index ? 'step' : undefined}><span>{index < step ? <Check size={13} /> : index + 1}</span>{label}</button>)}</nav>
          <form onSubmit={submit} noValidate>
            <div className="acStep"><p className="acEyebrow">STEP {step + 1}</p><h3>{['What can we help with?', 'Your aircon details', 'Preferred schedule', 'Where do you need us?', 'Your contact details', 'Review your request'][step]}</h3>
              {step === 0 && <>
                {!quote && <div className="acCategories">{airconCategories.map((name, index) => { const Icon = categoryIcons[index]; return <button type="button" key={name} className={category === name ? 'selected' : ''} onClick={() => chooseCategory(name)}><Icon size={23} /><strong>{name}</strong><ArrowRight size={16} /></button>; })}</div>}
                {category === 'Installation' && <label className="acField">Installation Option<select value={installation} onChange={event => { setInstallation(event.target.value); setServiceId(''); }}><option value="">Select installation option</option><option>Labor Only</option><option>Labor + Materials</option></select></label>}
                {category && (category !== 'Installation' || installation) && <div className="acServiceOptions" role="group" aria-label="Service options">{services.filter(item => airconCategory(item) === category && (category !== 'Installation' || !airconServiceOptions(business, item).installation || airconServiceOptions(business, item).installation === installation)).map(item => <button type="button" key={item.id} className={serviceId === item.id ? 'selected' : ''} onClick={() => chooseService(item)}><span><strong>{item.name}</strong>{item.description && <small>{item.description}</small>}</span><b>{item.price == null ? 'For Quotation' : formatAirconPeso(item.price)}</b>{serviceId === item.id && <Check size={17} />}</button>)}</div>}
                {quote && <p className="acNote">Pricing and availability are subject to current stock and final quotation.</p>}
              </>}
              {step === 1 && <div className="acFields">
                {select(quote ? 'Preferred Aircon Type' : 'Aircon / Unit Type *', 'unitType', [...new Set([...unitTypes, ...(form.unitType ? [form.unitType] : [])])], Boolean(options.unitType))}
                {input('Number of Units *', 'units', { type: 'number', min: 1, max: 100, step: 1 })}
                {category !== 'Cleaning' && input('HP / Capacity (if known)', 'capacity', { readOnly: Boolean(options.capacity) })}
                {input('Brand / Model (optional)', 'brand')}
                {category === 'Installation' && select('Unit', 'unitCondition', ['Existing unit', 'New unit'])}
                {quote && <>{select('Property Type', 'propertyType', ['Residential', 'Commercial'])}{input('Room / Area Size (sqm)', 'areaSize', { type: 'number', min: 1 })}{input('Budget Range (optional)', 'budget')}</>}
                {category === 'Repair & Maintenance' && <label className="acField acWide">Problem / Concern *<textarea rows="3" value={form.concern} onChange={event => patch('concern', event.target.value)} /></label>}
                {options.relocation && input('Current Location *', 'currentLocation')}
                {!options.perUnit && units > 1 && <p className="acNote acWide">The listed rate is a reference for the selected service. A quotation for {units} units will be confirmed by the business.</p>}
              </div>}
              {step === 2 && <>
                {!hasSchedule && <p className="acNote">Scheduling is by coordination. Share a preferred date and time if you have one; the team will confirm availability.</p>}
                {available.hours && <p className="acNote">{available.days} / {available.hours}</p>}
                <div className="acFields">{input('Preferred Date', 'date', { type: 'date', min: getTodayDateValue() })}
                  {anytime || !hasSchedule ? <label className="acField">Preferred Time<input type="time" value={displayTimeToInput(form.time)} onChange={event => patch('time', timeInputToDisplay(event.target.value))} /></label> : <label className="acField">Available Time<select value={form.time} onChange={event => patch('time', event.target.value)} disabled={!form.date || blocked}><option value="">Select time</option>{allowedSlots.map(slot => <option key={slot}>{slot}</option>)}</select></label>}
                </div>{blocked && <p role="alert" className="acError">This date is unavailable.</p>}<p className="acHint">Your requested schedule is subject to availability and confirmation.</p>
              </>}
              {step === 3 && <div className="acFields">{select('Service Area *', 'serviceArea', areas)}{select('Property Type', 'propertyType', ['Residential', 'Commercial'])}{input(options.relocation ? 'New Installation Address *' : 'Complete Service Address *', 'address')}{input('Landmark / Location Notes', 'landmark')}{/Nearby|Other/i.test(form.serviceArea) && <p className="acNote acWide">Service availability for your location is subject to confirmation.</p>}</div>}
              {step === 4 && <div className="acFields">{input('Full Name *', 'customer', { autoComplete: 'name' })}{input('Contact Number *', 'contact', { type: 'tel', autoComplete: 'tel' })}{input('Email (optional)', 'email', { type: 'email', autoComplete: 'email' })}<label className="acField acWide">{quote ? 'Message / Requirements' : 'Additional Notes'}<textarea rows="3" value={form.notes} onChange={event => patch('notes', event.target.value)} /></label></div>}
              {step === 5 && <dl className="acReview"><dt>Service</dt><dd>{service?.name}</dd><dt>Service Details</dt><dd>{[options.installation, form.unitType, form.capacity, form.brand, form.concern].filter(Boolean).join(' / ')}</dd><dt>Number of Units</dt><dd>{units}</dd><dt>Preferred Schedule</dt><dd>{form.date ? formatBookingDate(form.date) : 'To be coordinated'} {form.time}</dd><dt>Service Location</dt><dd>{form.serviceArea}<br />{form.address} {form.landmark}</dd><dt>Customer</dt><dd>{form.customer}<br />{form.contact}<br />{form.email}</dd>{form.notes && <><dt>Notes</dt><dd>{form.notes}</dd></>}</dl>}
            </div>
            {service && <section className="acPrice" aria-label="Estimated service total"><div><span>ESTIMATED SERVICE TOTAL</span><strong>{service.name}</strong><small>{options.perUnit ? `${formatAirconPeso(service.price)} x ${units} unit${units > 1 ? 's' : ''}` : `${units} unit${units > 1 ? 's' : ''}`}</small></div><b>{pricingLabel}</b><p>Final service total is subject to confirmation based on actual site/unit conditions.</p></section>}
            {error && <p className="acError" role="alert">{error}</p>}
            <footer className="acFormActions">{step > 0 && <button type="button" disabled={busy} onClick={() => move(step - 1)}><ArrowLeft size={17} /> Back</button>}<button className="acPrimary" disabled={busy} type="submit">{busy ? 'Submitting...' : step === 5 ? quote ? 'Submit Inquiry' : 'Submit Booking Request' : 'Continue'}<ArrowRight size={17} /></button></footer>
          </form>
        </>}
      </section>
    </div>
  </main>;
}
