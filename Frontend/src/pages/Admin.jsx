import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Flex,
  Stack,
  Divider,
  Badge,
  useToast,
} from "@chakra-ui/react";
import api from "../api/api";

// --- helpers ---------------------------------------------------------

const toLocalInputValue = (isoStr) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const emptyEvent = {
  name: "",
  description: "",
  imageUrl: "",
  date: "",
  venueName: "",
  venueLocation: "",
  status: "On Sale",
};

const emptyTicketType = { name: "", price: "", quantityTotal: "", quantityAvailable: "" };

// --- Login gate --------------------------------------------------------

const AdminLogin = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(
        "/admin/login",
        {},
        { headers: { "X-Admin-Password": password } }
      );
      onSuccess(password);
    } catch (err) {
      setError(err.response?.data?.detail || "Incorrect passcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex justify="center" py={20} px={4}>
      <Box as="form" onSubmit={handleSubmit} w="100%" maxW="360px">
        <Heading fontSize="xl" mb={4}>
          Admin Access
        </Heading>
        <Input
          type="password"
          placeholder="Admin passcode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb={3}
        />
        {error && (
          <Text color="red.500" fontSize="sm" mb={3}>
            {error}
          </Text>
        )}
        <Button type="submit" colorScheme="blue" w="100%" isLoading={loading}>
          Enter
        </Button>
      </Box>
    </Flex>
  );
};

// --- Ticket type row + form ---------------------------------------------

const TicketTypeRow = ({ ticketType, passcode, onChanged }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(ticketType);
  const toast = useToast();

  const save = async () => {
    try {
      await api.put(
        `/admin/ticket-types/${ticketType.id}`,
        {
          ...form,
          price: Number(form.price),
          quantityTotal: Number(form.quantityTotal),
          quantityAvailable: Number(form.quantityAvailable),
        },
        { headers: { "X-Admin-Password": passcode } }
      );
      setEditing(false);
      onChanged();
      toast({ status: "success", title: "Ticket type updated" });
    } catch (err) {
      toast({
        status: "error",
        title: err.response?.data?.detail || "Update failed",
      });
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/admin/ticket-types/${ticketType.id}`, {
        headers: { "X-Admin-Password": passcode },
      });
      onChanged();
      toast({ status: "success", title: "Ticket type deleted" });
    } catch (err) {
      toast({
        status: "error",
        title: err.response?.data?.detail || "Delete failed",
      });
    }
  };

  if (editing) {
    return (
      <Stack direction={{ base: "column", sm: "row" }} spacing={2} py={2}>
        <Input
          size="sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
        />
        <Input
          size="sm"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Price"
        />
        <Input
          size="sm"
          type="number"
          value={form.quantityTotal}
          onChange={(e) => setForm({ ...form, quantityTotal: e.target.value })}
          placeholder="Total qty"
        />
        <Input
          size="sm"
          type="number"
          value={form.quantityAvailable}
          onChange={(e) =>
            setForm({ ...form, quantityAvailable: e.target.value })
          }
          placeholder="Available"
        />
        <Button size="sm" colorScheme="blue" onClick={save}>
          Save
        </Button>
        <Button size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </Stack>
    );
  }

  return (
    <Flex justify="space-between" align="center" py={2} fontSize="sm">
      <Text>
        {ticketType.name} — ${Number(ticketType.price).toFixed(2)} (
        {ticketType.quantityAvailable}/{ticketType.quantityTotal} available)
      </Text>
      <Flex gap={2}>
        <Button size="xs" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button size="xs" colorScheme="red" variant="outline" onClick={remove}>
          Delete
        </Button>
      </Flex>
    </Flex>
  );
};

const AddTicketType = ({ eventId, passcode, onAdded }) => {
  const [form, setForm] = useState(emptyTicketType);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/admin/events/${eventId}/ticket-types`,
        {
          eventId,
          name: form.name,
          price: Number(form.price),
          quantityTotal: Number(form.quantityTotal),
          quantityAvailable: Number(form.quantityAvailable || form.quantityTotal),
        },
        { headers: { "X-Admin-Password": passcode } }
      );
      setForm(emptyTicketType);
      onAdded();
      toast({ status: "success", title: "Ticket type added" });
    } catch (err) {
      toast({
        status: "error",
        title: err.response?.data?.detail || "Could not add ticket type",
      });
    }
  };

  return (
    <Stack
      as="form"
      onSubmit={submit}
      direction={{ base: "column", sm: "row" }}
      spacing={2}
      py={2}
      borderTop="1px dashed"
      borderColor="gray.200"
      mt={2}
    >
      <Input
        size="sm"
        placeholder="Name (e.g. VIP)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <Input
        size="sm"
        type="number"
        placeholder="Price"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />
      <Input
        size="sm"
        type="number"
        placeholder="Quantity"
        value={form.quantityTotal}
        onChange={(e) => setForm({ ...form, quantityTotal: e.target.value })}
        required
      />
      <Button size="sm" type="submit" colorScheme="blue" variant="outline">
        + Add ticket type
      </Button>
    </Stack>
  );
};

// --- Event card (edit/delete + nested ticket types) ----------------------

const EventCard = ({ event, passcode, onChanged }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...event, date: toLocalInputValue(event.date) });
  const toast = useToast();

  const save = async () => {
    try {
      await api.put(
        `/admin/events/${event.id}`,
        { ...form, date: new Date(form.date).toISOString() },
        { headers: { "X-Admin-Password": passcode } }
      );
      setEditing(false);
      onChanged();
      toast({ status: "success", title: "Event updated" });
    } catch (err) {
      toast({
        status: "error",
        title: err.response?.data?.detail || "Update failed",
      });
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${event.name}"? This can't be undone.`)) return;
    try {
      await api.delete(`/admin/events/${event.id}`, {
        headers: { "X-Admin-Password": passcode },
      });
      onChanged();
      toast({ status: "success", title: "Event deleted" });
    } catch (err) {
      toast({
        status: "error",
        title: err.response?.data?.detail || "Delete failed",
      });
    }
  };

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="8px" p={4} mb={4}>
      {editing ? (
        <Stack spacing={2}>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Event name"
          />
          <Textarea
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            size="sm"
          />
          <Input
            value={form.imageUrl || ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="Image URL"
          />
          <Input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Flex gap={2}>
            <Input
              value={form.venueName || ""}
              onChange={(e) => setForm({ ...form, venueName: e.target.value })}
              placeholder="Venue name"
            />
            <Input
              value={form.venueLocation || ""}
              onChange={(e) => setForm({ ...form, venueLocation: e.target.value })}
              placeholder="Venue location"
            />
          </Flex>
          <Input
            value={form.status || ""}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            placeholder="Status (e.g. On Sale, Sold Out)"
          />
          <Flex gap={2}>
            <Button size="sm" colorScheme="blue" onClick={save}>
              Save
            </Button>
            <Button size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </Flex>
        </Stack>
      ) : (
        <>
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap={2}>
            <Box>
              <Text fontWeight="bold">{event.name}</Text>
              <Text fontSize="sm" color="gray.500">
                {new Date(event.date).toLocaleString()} ·{" "}
                {event.venueName} {event.venueLocation ? `— ${event.venueLocation}` : ""}
              </Text>
            </Box>
            <Flex gap={2} align="center">
              <Badge colorScheme="blue">{event.status}</Badge>
              <Button size="xs" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button size="xs" colorScheme="red" variant="outline" onClick={remove}>
                Delete
              </Button>
            </Flex>
          </Flex>
        </>
      )}

      <Divider my={3} />
      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
        Ticket types
      </Text>
      {(event.ticketTypes || []).map((tt) => (
        <TicketTypeRow
          key={tt.id}
          ticketType={tt}
          passcode={passcode}
          onChanged={onChanged}
        />
      ))}
      <AddTicketType eventId={event.id} passcode={passcode} onAdded={onChanged} />
    </Box>
  );
};

// --- Add new event form ---------------------------------------------------

const AddEventForm = ({ passcode, onAdded }) => {
  const [form, setForm] = useState(emptyEvent);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/admin/events",
        { ...form, date: new Date(form.date).toISOString() },
        { headers: { "X-Admin-Password": passcode } }
      );
      setForm(emptyEvent);
      onAdded();
      toast({ status: "success", title: "Event created" });
    } catch (err) {
      toast({
        status: "error",
        title: err.response?.data?.detail || "Could not create event",
      });
    }
  };

  return (
    <Box
      as="form"
      onSubmit={submit}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="8px"
      p={4}
      mb={6}
      bg="gray.50"
    >
      <Text fontWeight="bold" mb={3}>
        Add a new event
      </Text>
      <Stack spacing={2}>
        <Input
          placeholder="Event name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Textarea
          placeholder="Description"
          size="sm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <Input
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <Flex gap={2}>
          <Input
            placeholder="Venue name"
            value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })}
          />
          <Input
            placeholder="Venue location"
            value={form.venueLocation}
            onChange={(e) => setForm({ ...form, venueLocation: e.target.value })}
          />
        </Flex>
        <Button type="submit" colorScheme="blue">
          Create event
        </Button>
      </Stack>
    </Box>
  );
};

// --- Main admin page --------------------------------------------------

const Admin = () => {
  const [passcode, setPasscode] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = (pw) => {
    setLoading(true);
    api
      .get("/admin/events", { headers: { "X-Admin-Password": pw || passcode } })
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (passcode) fetchEvents(passcode);
  }, [passcode]);

  if (!passcode) {
    return (
      <AdminLogin
        onSuccess={(pw) => {
          setPasscode(pw);
        }}
      />
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={{ base: 4, md: 8 }}>
      <Heading fontSize="2xl" mb={6}>
        Admin — Manage Events & Tickets
      </Heading>

      <AddEventForm passcode={passcode} onAdded={() => fetchEvents()} />

      {loading && <Text color="gray.500">Loading...</Text>}

      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          passcode={passcode}
          onChanged={() => fetchEvents()}
        />
      ))}
    </Box>
  );
};

export default Admin;
