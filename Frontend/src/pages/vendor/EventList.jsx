import React from 'react';
import { Link } from 'react-router-dom';

const events = [
  {
    id: 'evt-001',
    name: 'Annual Tech Innovation Expo',
    date: 'Oct 15, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Main University Auditorium',
    organizer: 'Faculty of Computing',
    description: 'The biggest technology showcase of the year featuring student startups, industry leaders, and interactive tech demonstrations.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'evt-002',
    name: 'Spring Career Fair 2026',
    date: 'Nov 02, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Sports Complex',
    organizer: 'Career Guidance Unit',
    description: 'Connect with top employers and alumni. Perfect for final year students looking for internships and job opportunities.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'evt-003',
    name: 'International Food Festival',
    date: 'Dec 10, 2026',
    time: '12:00 PM - 08:00 PM',
    location: 'Campus Green',
    organizer: 'International Students Association',
    description: 'Experience culinary delights from around the world. Featuring food stalls, cultural performances, and music.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
  }
];

const EventList = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-bold uppercase tracking-widest mb-3">
            Events Gallery
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-primary tracking-tight">Campus Event Lineup</h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">
            Browse all university events managed through EventAura and prepare your next stall presence.
          </p>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={evt.image}
                alt={evt.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 text-primary text-sm font-semibold uppercase tracking-widest shadow-sm">
                  {evt.date}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-semibold text-white leading-tight drop-shadow-sm">{evt.name}</h3>
                <p className="text-sm text-slate-100/80 mt-1 font-medium flex items-center gap-1">
                  📍 {evt.location}
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6">
              <p className="text-sm text-muted-foreground mb-6 flex-1 leading-relaxed">
                {evt.description.substring(0, 110)}...
              </p>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  Organizer{' '}
                  <span className="text-primary font-bold">
                    {evt.organizer}
                  </span>
                </div>
                <Link
                  to={`/events/${evt.id}`}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold tracking-wide shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
