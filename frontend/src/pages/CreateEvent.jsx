import { Link, useNavigate } from 'react-router-dom';
import EventForm from '../components/EventForm';
import Icon from '../components/Icon';
import { useToast } from '../context/ToastContext';
import { createEvent } from '../services/eventService';

export default function CreateEvent() {
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <div className="narrow">
      <Link to="/my-events" className="back"><Icon name="arrowLeft" size={16} /> Back</Link>
      <div className="page-head">
        <div>
          <span className="eyebrow">New event</span>
          <h1>Create an event</h1>
          <p className="muted">Share the details students need — you can edit them any time.</p>
        </div>
      </div>
      <EventForm
        submitLabel="Publish event"
        onSubmit={async (data) => {
          const event = await createEvent(data);
          toast.success(`"${event.eventName}" is now live`);
          navigate(`/events/${event._id}`);
        }}
      />
    </div>
  );
}
