import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EventForm from '../components/EventForm';
import Icon from '../components/Icon';
import { Spinner } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { getEvent, updateEvent } from '../services/eventService';
import { errorMessage } from '../services/api';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvent(id)
      .then((e) => (e.canManage ? setEvent(e) : setError('You can only edit events of your own club')))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  if (error) return <div className="alert alert-error" role="alert"><Icon name="alert" size={18} /> {error} <Link to="/events" className="text-link">Back to events</Link></div>;
  if (!event) return <Spinner label="Loading event…" />;

  return (
    <div className="narrow">
      <Link to={`/events/${id}`} className="back"><Icon name="arrowLeft" size={16} /> Back to event</Link>
      <div className="page-head">
        <div>
          <span className="eyebrow">Edit event</span>
          <h1>{event.eventName}</h1>
        </div>
      </div>
      <EventForm
        initial={event}
        submitLabel="Save changes"
        onSubmit={async (data) => {
          await updateEvent(id, data);
          toast.success('Changes saved');
          navigate(`/events/${id}`);
        }}
      />
    </div>
  );
}
