import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const events = {
  'evt-001': {
    id: 'evt-001',
    name: 'Annual Tech Innovation Expo',
    date: 'Oct 15, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Main University Auditorium',
    organizer: 'Faculty of Computing',
    description: 'The biggest technology showcase of the year featuring student startups, industry leaders, and interactive tech demonstrations. Join us for a day of networking, learning, and exploring the future of technology.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'
  },
  'evt-002': {
    id: 'evt-002',
    name: 'Spring Career Fair 2026',
    date: 'Nov 02, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Sports Complex',
    organizer: 'Career Guidance Unit',
    description: 'Connect with top employers and alumni. Perfect for final year students looking for internships and job opportunities.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200'
  },
  'evt-003': {
    id: 'evt-003',
    name: 'International Food Festival',
    date: 'Dec 10, 2026',
    time: '12:00 PM - 08:00 PM',
    location: 'Campus Green',
    organizer: 'International Students Association',
    description: 'Experience culinary delights from around the world. Featuring food stalls, cultural performances, and music.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200'
  }
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const evt = events[eventId];

  if (!evt) return <div className="max-w-4xl mx-auto py-16 px-4">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-semibold text-primary bg-white hover:bg-muted transition-colors shadow-sm"
        >
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-semibold text-primary tracking-tight">Event Details</h1>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100 mb-10">
        <div className="relative h-72 md:h-80 lg:h-96">
          <img
            src={evt.image}
            alt={evt.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold uppercase tracking-widest shadow-lg">
              Upcoming
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-bold uppercase tracking-widest text-white">
              {evt.date} • {evt.time}
            </span>
          </div>
          <div className="absolute bottom-8 left-6 right-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight mb-2 drop-shadow-md">
              {evt.name}
            </h2>
            <p className="text-sm md:text-base text-slate-100/90 font-medium flex flex-wrap items-center gap-2">
              <span>Organized by <span className="font-semibold">{evt.organizer}</span></span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span className="flex items-center gap-1">📍 {evt.location}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-8 items-start">
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-border p-6 md:p-8">
          <h3 className="mb-4 text-xl font-semibold text-primary tracking-tight">About This Event</h3>
          <p className="leading-relaxed text-base mb-8 text-muted-foreground font-medium">
            {evt.description}
          </p>

          <h3 className="mb-4 text-lg font-bold text-primary tracking-tight">Schedule &amp; Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-muted rounded-2xl border border-border">
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Date</div>
              <div className="font-semibold text-primary">{evt.date}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Time</div>
              <div className="font-semibold text-primary">{evt.time}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Location</div>
              <div className="font-semibold text-primary">{evt.location}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary rounded-3xl text-primary-foreground p-6 md:p-7 shadow-2xl border border-slate-900/40 sticky top-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/70 mb-2">Stall Booking Overview</h3>
            <p className="text-sm text-primary-foreground/80 mb-6 leading-relaxed">
              Open the interactive campus map to inspect stall locations, live availability and FCFS booking flow for this event.
            </p>
            <Link
              to="/vendor/stalls/layout"
              className="inline-flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-xl shadow-lg shadow-accent/30 hover:bg-accent/90 hover:-translate-y-0.5 transition-all text-sm"
            >
              📍 View Stall Map &amp; Book
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-border p-5 shadow-sm">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Booking Flow</h4>
            <ol className="space-y-2 text-sm text-muted-foreground font-medium">
              <li>1. Open stall map and select a highlighted available stall.</li>
              <li>2. Submit booking request with your vendor profile.</li>
              <li>3. Await organizer approval and advance payment confirmation.</li>
              <li>4. Receive final booking pass once the stall is locked.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
