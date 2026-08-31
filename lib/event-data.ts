export const eventConfig = {
  name: "Robotics Workshop",
  shortDescription:
    "A hands-on robotics workshop focused on building and testing practical robotic systems through guided experimentation.",
  partner: "Techfest, IIT Bombay × KBTCOE",
  programName: "Technorion 2026–27",
  description:
    "An interactive robotics seminar focused on learning autonomous systems through practical demonstrations and real-world applications.",
  workshopFocus: [
    "Line Following Robot",
    "Pick & Place Robot",
  ],
  isFree: true,
  date: "11 September",
  venue: "KBTCOE",
  registrationDeadline: "10 September",
  capacity: "TBD",
  footerNote: "Registration for this workshop is free.",
};

export const eventDetails = [
  { label: "Date", value: eventConfig.date },
  { label: "Venue", value: eventConfig.venue },
  { label: "Program", value: eventConfig.programName },
  { label: "Registration", value: eventConfig.isFree ? "Free" : "Paid" },
  { label: "Deadline", value: eventConfig.registrationDeadline },
];

export const branchOptions = [
  "Computer Science",
  "Information Technology",
  "Electronics & Telecommunication",
  "Mechanical",
  "Civil",
  "Electrical",
  "Robotics",
  "Instrumentation",
  "Other",
];

export const yearOptions = [
  "First Year",
  "Second Year",
  "Third Year",
  "Final Year",
  "PG",
  "Faculty",
];
