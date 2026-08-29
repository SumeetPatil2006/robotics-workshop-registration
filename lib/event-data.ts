export const eventConfig = {
  name: "Robotics Workshop",
  shortDescription:
    "A hands-on robotics workshop focused on building and testing practical robotic systems through guided experimentation.",
  partner: "Techfest, IIT Bombay × KBTCOE",
  programName: "Technorion 2026–27",
  description:
    "This workshop is a practical robotics session where students learn through construction and experimentation with autonomous systems.",
  workshopFocus: [
    "Line Following Robot",
    "Pick & Place Robot",
  ],
  isFree: true,
  date: "TBD",
  time: "TBD",
  venue: "TBD",
  registrationDeadline: "TBD",
  capacity: "TBD",
  footerNote: "Registration for this workshop is free.",
};

export const eventDetails = [
  { label: "Date", value: eventConfig.date },
  { label: "Time", value: eventConfig.time },
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
