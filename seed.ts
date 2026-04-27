import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const seedData = async () => {
  console.log("Seeding data...");
  
  const events = [
    {
      title: "Interstellar: 10th Anniversary",
      venue: "PVR Director's Cut",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      category: "Movie",
      price: 450,
      description: "Experience Christopher Nolan's masterpiece on the big screen once again."
    },
    {
      title: "Coldplay: Music of the Spheres",
      venue: "DY Patil Stadium",
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&w=800&q=80",
      category: "Concert",
      price: 2500,
      description: "The biggest concert of the year is here. Don't miss out!"
    },
    {
      title: "The Lion King: Broadway",
      venue: "Minskoff Theatre",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      image: "https://images.unsplash.com/photo-1503095396549-807039045349?auto=format&fit=crop&w=800&q=80",
      category: "Theater",
      price: 1800,
      description: "The award-winning musical comes to life."
    }
  ];

  for (const event of events) {
    const eventRef = await addDoc(collection(db, 'events'), event);
    console.log(`Added event: ${event.title}`);
    
    // Add 96 seats for each event (Rows A-H, Cols 1-12)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= 12; j++) {
        const seatId = `${rows[i]}${j}`;
        const seatRef = doc(db, `events/${eventRef.id}/seats`, seatId);
        await setDoc(seatRef, {
          seatId,
          eventId: eventRef.id,
          type: i < 2 ? 'VIP' : 'Regular',
          status: 'available',
          price: i < 2 ? event.price * 1.5 : event.price
        });
      }
    }
  }
  
  console.log("Seeding complete!");
  process.exit(0);
};

seedData().catch(console.error);
