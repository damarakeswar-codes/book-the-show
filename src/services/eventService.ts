import { collection, addDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchAndSeedEvents = async (location: string = 'US') => {
  try {
    // Using TVMaze API for free event/show data
    const response = await fetch(`https://api.tvmaze.com/schedule?country=${location}`);
    const data = await response.json();
    
    // Check if we already have events to avoid duplicates
    const existingEvents = await getDocs(collection(db, 'events'));
    if (existingEvents.size > 10) return; // Already have enough

    console.log(`Fetched ${data.length} events from TVMaze`);

    for (const item of data.slice(0, 10)) {
      const show = item.show;
      const eventData = {
        title: show.name,
        venue: show.network?.name || show.webChannel?.name || "Global Arena",
        date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        image: show.image?.original || show.image?.medium || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
        category: show.type === "Scripted" ? "Movie" : "Concert",
        price: Math.floor(Math.random() * 1000) + 300,
        description: show.summary?.replace(/<[^>]*>?/gm, '') || "A spectacular show you don't want to miss."
      };

      const eventRef = await addDoc(collection(db, 'events'), eventData);
      
      // Add seats (Rows A-H, Cols 1-12)
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      for (let i = 0; i < rows.length; i++) {
        for (let j = 1; j <= 12; j++) {
          const seatId = `${rows[i]}${j}`;
          const seatRef = doc(db, `events/${eventRef.id}/seats`, seatId);
          await setDoc(seatRef, {
            seatId,
            eventId: eventRef.id,
            type: i < 1 ? 'VIP' : 'Regular',
            status: 'available',
            price: i < 1 ? eventData.price * 1.5 : eventData.price
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};
