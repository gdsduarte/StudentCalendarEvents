import React, { useState } from "react";
import EventModal from "./EventModal";
import "../assets/css/calendar.css";

// Subject list with styles for each subject (color and background color) 
export const Subjects = [
  { name: "UX/UI", style: { color: "#0084FF", backgroundColor: "#E6F3FF" } },
  { name: "Operating Systems", style: { color: "#FF00F5", backgroundColor: "#FFCDFD" } },
  { name: "DevOps", style: { color: "#E92C2C", backgroundColor: "#FFEBEB" } },
  { name: "MobileApps", style: { color: "#FF9F2D", backgroundColor: "#FFF5E8" } },
  { name: "Networking", style: { color: "#a1a30d", backgroundColor: "#FDFFAB" } },
  { name: "OOP", style: { color: "#00BA34", backgroundColor: "#E6F8EB" } },
  { name: "Notes", style: { color: "#848383", backgroundColor: "#E8E8E8" } },
];

// Get the style for a subject 
export const getSubjectStyle = (subjectName) => {
  const subject = Subjects.find((subj) => subj.name === subjectName);
  return subject ? subject.style : {};
};

// Count the number of overlapping events 
export const countOverlappingEvents = (events, start, end) => {
  if (!start || !end || !events) {
    return 0;
  }

  const overlappingEvents = events.filter((event) =>
    (start >= event.start && start < event.end) ||
    (end > event.start && end <= event.end) ||
    (start < event.start && end > event.end)
  );

  return overlappingEvents.length;
};

// Check if an event can be added to the calendar 
export const canAddEvent = (events, start, end) => {
  const selectedRangeStart = new Date(start);
  const selectedRangeEnd = new Date(end || start);
  const overlappingEvents = events.filter(event => {
    return selectedRangeStart < event.end && selectedRangeEnd > event.start;
  });

  return countOverlappingEvents(overlappingEvents, selectedRangeStart, selectedRangeEnd) < 2;
};

// Event bar component 
export const EventBar = ({ events, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Handle click on an event in the sidebar
  const handleClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Render an event in the sidebar 
  const renderSidebarEvent = (event) => {
    const endDay = event.end.toLocaleString("default", { weekday: "long" });
    const endDate = event.end.toLocaleString("default", { Date: "long" });
    const isDue = new Date() > event.end;
    const subjectStyle = getSubjectStyle(event.subject);

    return (
      <li
        key={event.id}
        className={`event-item ${isDue ? "passed-events" : ""}`}
        data-color={subjectStyle.color}
        onClick={() => handleClick(event)}
      >
        <span>{endDay}</span>
        <br />
        <span>{endDate}</span>
        <br />
        <strong style={{ color: subjectStyle.color }}>{event.subject}</strong>
        <br />
        {event.title}
      </li>
    );
  };

  // Sort events by date and filter by subject
  const sortedEvents = events
    .filter((event) => event.subject === "Notes" ? event.createdByUserId === user.uid : true)
    .sort((a, b) => new Date(a.end) - new Date(b.end));

  // Split events into passed and upcoming
  const dueEvents = sortedEvents.filter((event) => new Date() > event.end);
  const upcomingEvents = sortedEvents.filter((event) => new Date() <= event.end);

  return (
    <div>
      <h3 className="event-subtile">Passed Events</h3>
      <ul>{dueEvents.map(renderSidebarEvent)}</ul>
      <h3 className="event-subtile">Upcoming Events</h3>
      <ul>{upcomingEvents.map(renderSidebarEvent)}</ul>
      {showModal && (
        <EventModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          events={events}
        />
      )}
    </div>
  );
};

// Deadline bar component
export const DeadlineBar = ({ events, subjectFilter, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Handle click on an event in the sidebar
  const handleClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  
  // Filter events by subject
  const filteredEvents =
    subjectFilter === "All"
      ? events
      : events.filter((event) => event.subject === subjectFilter);

  // Filter out notes created by other users 
  const eventsToShow = filteredEvents.filter(
    (event) =>
      !(event.subject === "Notes" && event.createdByUserId !== user.uid)
  );

  // Group events by subject 
  const groupedEvents = eventsToShow.reduce((acc, event) => {
    if (!acc[event.subject]) {
      acc[event.subject] = [];
    }
    acc[event.subject].push(event);
    return acc;
  }, {});

  // Render an event in the sidebar 
  const renderDeadlineEvent = (event) => {
    const daysLeft = Math.ceil(
      (event.end - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <li key={event.id}
      onClick={() => handleClick(event)}
      >
        <strong>{event.title}</strong>
        <br />
        {daysLeft === 0 ? (
          <span></span>
        ) : daysLeft === 1 ? (
          <span></span>
        ) : (
          <span>{daysLeft} days left</span>
        )}
      </li>
    );
  };

  // Sort events by date 
  const sortedEvents = eventsToShow.sort((a, b) => {
    return a.end - b.end;
  });

  return (
    <div>
      {subjectFilter === "All" ? (
        Object.keys(groupedEvents).map((subject) => (
          <React.Fragment key={subject}>
            <h3
              className="deadline-subtitle"
              style={getSubjectStyle(subject)}
            >
              {subject}
            </h3>
            <ul>{groupedEvents[subject].map(renderDeadlineEvent)}</ul>
          </React.Fragment>
        ))
      ) : (
        <React.Fragment>
          <h3
            className="deadline-subtitle"
            style={getSubjectStyle(subjectFilter)}
          >
            {subjectFilter}
          </h3>
          <ul>{sortedEvents.map(renderDeadlineEvent)}</ul>
        </React.Fragment>
      )}
      {showModal && (
        <EventModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          events={events}
        />
      )}
    </div>
  );
};

// Notes bar component
export const NotesBar = ({ events, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Handle click on an event in the sidebar
  const handleClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  // Render an event in the sidebar
  const renderNotesEvent = (event) => {
    const endDate = event.end.toLocaleString("default", { Date: "long" });
    const subjectStyle = getSubjectStyle(event.subject);

    return (
      <li key={event.id}
      onClick={() => handleClick(event)}
      >
        <span>{endDate}</span>
        <br />
        <strong style={{ color: subjectStyle.color }}>{event.title}</strong>
      </li>
      
    );
  };

  // Sort events by date and filter by subject 
  const sortedEvents = events
    .filter((event) => event.subject === "Notes" && event.createdByUserId === user.uid)
    .sort((a, b) => new Date(a.end) - new Date(b.end));

  return (
    <div>
      <ul>{sortedEvents.map(renderNotesEvent)}</ul>
      {showModal && (
        <EventModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          events={events}
        />
      )}
    </div>
  );
};
