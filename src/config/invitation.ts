/** All personalized invitation details live here. */
export const invitation = {
  title: "Nikah Invitation",
  couple: { first: "Abdul Hameed", second: "Heeba" },
  qualifications: { first: "B.Tech", second: "M.Com" },
  // An explicit offset keeps every guest's countdown on the same instant.
  eventDate: "2027-01-03T10:00:00+05:30",
  displayDate: "03.01.27",
  fullDate: "03 January 2027",
  weekday: "Sunday",
  rsvpDeadline: null,
  introduction: "Dear Friends and Family",
  welcome:
    "The families warmly invite everyone to attend the wedding ceremony and bless the bride and groom as they begin their married life.",
  venue: {
    name: "Beach Street Masjid",
    address: "Adirampattinam",
    mapUrl: "https://maps.app.goo.gl/Mk8seWyREf6UM9Pz5",
    coordinates: "10.3342879,79.3842445",
  },
  walimaVenue: {
    name: "Beach Street Madrasah",
    address: "Adirampattinam",
    mapUrl: "https://maps.app.goo.gl/oMeu7teEoNNC65MV6",
    coordinates: "10.334380,79.384682",
  },
  receptionVenue: {
    name: "Groom’s House",
    address: "Adirampattinam",
    mapUrl: "https://maps.app.goo.gl/ZVoiusj1sgxoyBT29",
    coordinates: "10.343721,79.379002",
  },
  familyMessage: "Groom’s Family | Bride’s Family",
  hometown: "Adirampattinam",
  schedule: [
    { time: "9:00 AM", label: "Reception", venueKey: "receptionVenue" },
    { time: "10:00 AM", label: "Nikah", venueKey: "venue" },
    { time: "1:00 PM", label: "Walima", venueKey: "walimaVenue" },
  ],
  rsvp: {
    enabled: false,
    title: "Confirm Your Attendance",
    description:
      "To help us prepare for a joyful celebration, kindly confirm your attendance.",
    maxGuests: 20,
  },
} as const;

/** Each event owns its venue, so new events cannot shift another event's map. */
export const eventVenues = invitation.schedule.map((event) => ({
  label: event.label,
  time: event.time,
  ...invitation[event.venueKey],
}));
