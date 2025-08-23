import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addDays,
  subDays,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks
} from 'date-fns';

export interface CalendarEvent {
  id: string;
  type: 'job' | 'shift';
  title: string;
  start: Date;
  end: Date;
  pickup?: string;
  dropoff?: string;
  amount?: number;
  status?: string;
  timeSlot?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
  isRecurringInstance?: boolean;
}

export interface CalendarConflict {
  event1: string;
  event2: string;
  overlap: {
    start: Date;
    end: Date;
  };
}

export interface CalendarDateRange {
  start: Date;
  end: Date;
  view: 'month' | 'week' | 'day';
}

export const getCalendarDays = (date: Date, view: 'month' | 'week' | 'day') => {
  let start: Date;
  let end: Date;

  switch (view) {
    case 'week':
      start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      end = endOfWeek(date, { weekStartsOn: 1 });
      break;
    case 'day':
      start = date;
      end = date;
      break;
    default: // month
      start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
      end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  }

  return eachDayOfInterval({ start, end });
};

export const getEventsForDay = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Check if the event overlaps with the given date
    return eventStart <= addDays(date, 1) && eventEnd >= date;
  });
};

export const getEventsForTimeSlot = (events: CalendarEvent[], date: Date, hour: number): CalendarEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Check if event is on the same day and overlaps with the hour
    if (!isSameDay(eventStart, date)) return false;
    
    const eventStartHour = eventStart.getHours();
    const eventEndHour = eventEnd.getHours();
    
    return eventStartHour <= hour && eventEndHour > hour;
  });
};

export const detectConflicts = (events: CalendarEvent[]): CalendarConflict[] => {
  const conflicts: CalendarConflict[] = [];
  
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i];
      const event2 = events[j];
      
      const start1 = new Date(event1.start);
      const end1 = new Date(event1.end);
      const start2 = new Date(event2.start);
      const end2 = new Date(event2.end);
      
      // Check for overlap
      if (start1 < end2 && start2 < end1) {
        conflicts.push({
          event1: event1.title,
          event2: event2.title,
          overlap: {
            start: new Date(Math.max(start1.getTime(), start2.getTime())),
            end: new Date(Math.min(end1.getTime(), end2.getTime()))
          }
        });
      }
    }
  }
  
  return conflicts;
};

export const formatEventTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatEventDate = (date: Date): string => {
  return format(date, 'EEE, MMM d');
};

export const formatEventDateTime = (date: Date): string => {
  return format(date, 'EEE, MMM d, HH:mm');
};

export const getEventColor = (event: CalendarEvent): string => {
  switch (event.type) {
    case 'job':
      return event.status === 'accepted' ? 'blue.500' : 'green.500';
    case 'shift':
      return event.isRecurring ? 'purple.500' : 'orange.500';
    default:
      return 'gray.500';
  }
};

export const getEventIcon = (event: CalendarEvent): string => {
  switch (event.type) {
    case 'job':
      return '🚚';
    case 'shift':
      return '⏰';
    default:
      return '📅';
  }
};

export const navigateCalendar = (currentDate: Date, direction: 'prev' | 'next', view: 'month' | 'week' | 'day'): Date => {
  switch (view) {
    case 'month':
      return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    case 'week':
      return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
    case 'day':
      return direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
    default:
      return currentDate;
  }
};

export const getViewTitle = (date: Date, view: 'month' | 'week' | 'day'): string => {
  switch (view) {
    case 'month':
      return format(date, 'MMMM yyyy');
    case 'week':
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    case 'day':
      return format(date, 'EEEE, MMMM d, yyyy');
    default:
      return format(date, 'MMMM yyyy');
  }
};

export const groupEventsByDay = (events: CalendarEvent[], days: Date[]): Record<string, CalendarEvent[]> => {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  days.forEach(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    grouped[dayKey] = getEventsForDay(events, day);
  });
  
  return grouped;
};

export const getTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(format(new Date().setHours(hour, 0, 0, 0), 'HH:mm'));
  }
  return slots;
};
